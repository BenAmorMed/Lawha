import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BadRequestException } from '@nestjs/common';
import { OrdersService } from './orders.service';

// ── Mocks de base ──────────────────────────────────────────────────────────
const mockSize = { id: 'size-uuid', product_id: 'prod-uuid', price_delta: 10 };
const mockProduct = { id: 'prod-uuid', base_price: 49.90 };
const mockFrame = { id: 'frame-uuid', price_delta: 20 };

const mockOrderId = 'order-uuid-1234';
const mockItemId = 'item-uuid-1234';

function buildService(overrides: Partial<{
    size: any; product: any; frame: any; transactionResult: any;
}> = {}) {
    const size = overrides.size !== undefined ? overrides.size : mockSize;
    const product = overrides.product !== undefined ? overrides.product : mockProduct;
    const frame = overrides.frame !== undefined ? overrides.frame : mockFrame;

    const savedOrder = { id: mockOrderId, total_amount: 0, status: 'pending_payment' };
    const savedItem = { id: mockItemId };

    const mockManager = {
        create: vi.fn((Entity: any, data: any) => ({ ...data, id: undefined })),
        save: vi.fn(async (Entity: any, entity: any) => {
            if (Entity.name === 'Order' || (entity && 'status' in entity && 'total_amount' in entity)) {
                return { ...entity, id: mockOrderId };
            }
            if (Entity.name === 'OrderItem') return { ...entity, id: mockItemId };
            return { ...entity, id: 'job-uuid' };
        }),
    };

    const mockDataSource = {
        transaction: vi.fn(async (cb: any) => cb(mockManager)),
    };

    const service = new OrdersService(
        {} as any, // orderRepository
        {} as any, // orderItemRepository
        {} as any, // printJobRepository
        { findOne: vi.fn(async () => product) } as any, // productRepository
        { findOne: vi.fn(async () => size) } as any,    // productSizeRepository
        { findOne: vi.fn(async () => frame) } as any,   // frameOptionRepository
        mockDataSource as any,                           // dataSource
    );

    return { service, mockManager, mockDataSource };
}

const validDto = {
    productSizeId: 'size-uuid',
    frameOptionId: 'frame-uuid',
    designJson: {
        templateId: 'template-uuid',
        size: 'size-uuid',
        dpi: 300,
        layers: [{ id: 'layer1', type: 'image', slotId: 'img1' }],
    },
    previewUrl: 'https://s3.../previews/img.jpg',
    shippingFirstName: 'Ahmed',
    shippingLastName: 'Ben Ali',
    shippingAddress: '12 Rue Habib Bourguiba',
    shippingCity: 'Sfax',
    shippingPostalCode: '3000',
    shippingPhone: '21234567',
    guestEmail: 'ahmed@email.com',
};

// ── TESTS ──────────────────────────────────────────────────────────────────

describe('OrdersService.createOrder', () => {

    it('crée order + orderItem + printJob en transaction', async () => {
        const { service, mockManager, mockDataSource } = buildService();

        const result = await service.createOrder(validDto, undefined);

        expect(result.orderId).toBe(mockOrderId);
        expect(result.status).toBe('pending_payment');
        expect(mockDataSource.transaction).toHaveBeenCalledTimes(1);

        // Check all 3 entity types were saved
        const saveCalls = mockManager.save.mock.calls.map((c: any[]) => c[0]?.name || typeof c[0]);
        expect(mockManager.save).toHaveBeenCalledTimes(3); // Order, OrderItem, PrintJob
    });

    it('recalcule le prix depuis la DB (ignore prix frontend)', async () => {
        const { service } = buildService();

        // Prix attendu : base_price(49.90) + size.price_delta(10) + frame.price_delta(20) = 79.90
        const result = await service.createOrder(validDto, undefined);
        expect(result.total).toBeCloseTo(79.90, 2);
    });

    it('rejette si designJson manque templateId', async () => {
        const { service } = buildService();

        const badDto = {
            ...validDto,
            designJson: { layers: [] }, // missing templateId
        };

        await expect(service.createOrder(badDto as any, undefined))
            .rejects.toThrow(BadRequestException);
    });

    it('fonctionne sans userId (guest avec email)', async () => {
        const { service, mockManager } = buildService();

        // No userId passed
        const result = await service.createOrder(validDto, undefined);
        expect(result.status).toBe('pending_payment');

        // Order saved with user_id: null
        const createCalls = mockManager.create.mock.calls;
        const orderCreate = createCalls[0]; // first create is Order
        expect(orderCreate[1].user_id).toBeNull();
        expect(orderCreate[1].guest_email).toBe('ahmed@email.com');
    });

});
