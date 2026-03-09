import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { getRepositoryToken, getDataSourceToken } from '@nestjs/typeorm';
import { Order, OrderStatus } from './order.entity';
import { OrderItem } from './order-item.entity';
import { PrintJob } from './print-job.entity';
import { Product } from '../products/product.entity';
import { ProductSize } from '../products/entities/product-size.entity';
import { FrameOption } from '../products/entities/frame-option.entity';
import { DataSource } from 'typeorm';
import { EmailService } from '../email/email.service';

// ── Mocks de base ──────────────────────────────────────────────────────────
const mockSize = { id: 'size-uuid', productId: 'prod-uuid', priceDelta: 10 };
const mockProduct = { id: 'prod-uuid', basePrice: 49.90 };
const mockFrame = { id: 'frame-uuid', priceDelta: 20 };

const mockOrderId = 'order-uuid-1234';
const mockItemId = 'item-uuid-1234';

describe('OrdersService.createOrder', () => {
    let service: OrdersService;
    let mockManager: any;
    let mockDataSource: any;

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

    beforeEach(async () => {
        const mockEmailService = {
            sendOrderConfirmation: jest.fn().mockResolvedValue(undefined),
        };

        mockManager = {
            create: jest.fn((Entity: any, data: any) => ({ ...data, id: undefined })),
            save: jest.fn(async (Entity: any, entity: any) => {
                const entityName = Entity.name || (Entity.options && Entity.options.name);
                if (entityName === 'Order' || (entity && 'status' in entity && 'total' in entity)) {
                    return { ...entity, id: mockOrderId };
                }
                if (entityName === 'OrderItem') return { ...entity, id: mockItemId };
                return { ...entity, id: 'job-uuid' };
            }),
        };

        mockDataSource = {
            transaction: jest.fn(async (cb: any) => cb(mockManager)),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                OrdersService,
                { provide: getRepositoryToken(Order), useValue: {} },
                { provide: getRepositoryToken(OrderItem), useValue: {} },
                { provide: getRepositoryToken(PrintJob), useValue: {} },
                { provide: getRepositoryToken(Product), useValue: { findOneOrFail: jest.fn(async () => mockProduct) } },
                { provide: getRepositoryToken(ProductSize), useValue: { findOneOrFail: jest.fn(async () => mockSize) } },
                { provide: getRepositoryToken(FrameOption), useValue: { findOneOrFail: jest.fn(async () => mockFrame) } },
                { provide: getDataSourceToken(), useValue: mockDataSource },
                { provide: EmailService, useValue: mockEmailService },
            ],
        }).compile();

        service = module.get<OrdersService>(OrdersService);
    });

    it('crée order + orderItem + printJob en transaction', async () => {
        const result = await service.createOrder(validDto as any, undefined);

        expect(result.orderId).toBe(mockOrderId);
        expect(result.status).toBe('pending_payment');
        expect(mockDataSource.transaction).toHaveBeenCalledTimes(1);
        expect(mockManager.save).toHaveBeenCalledTimes(3);
    });

    it('recalcule le prix depuis la DB', async () => {
        // basePrice(49.90) + priceDelta(10) + priceDelta(20) = 79.90
        const result = await service.createOrder(validDto as any, undefined);
        expect(result.total).toBeCloseTo(79.90, 2);
    });

    it('rejette si designJson manque templateId', async () => {
        const badDto = {
            ...validDto,
            designJson: { layers: [] },
        };

        await expect(service.createOrder(badDto as any, undefined))
            .rejects.toThrow(BadRequestException);
    });

    it('fonctionne sans userId (guest avec email)', async () => {
        const result = await service.createOrder(validDto as any, undefined);
        expect(result.status).toBe('pending_payment');

        const orderCreateData = mockManager.create.mock.calls[0][1];
        expect(orderCreateData.userId).toBeNull();
        expect(orderCreateData.guestEmail).toBe('ahmed@email.com');
    });
});

describe('OrdersService.getOrderById Security', () => {
    let service: OrdersService;
    let mockOrderRepository: any;

    const mockOrder = {
        id: 'order-1',
        userId: 'user-1',
        items: [{ id: 'item-1' }],
    };

    const mockGuestOrder = {
        id: 'order-2',
        userId: null,
        items: [{ id: 'item-2' }],
    };

    beforeEach(async () => {
        mockOrderRepository = {
            findOne: jest.fn(async (options) => {
                const id = options.where.id;
                if (id === 'order-1') return mockOrder;
                if (id === 'order-2') return mockGuestOrder;
                return null;
            }),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                OrdersService,
                { provide: getRepositoryToken(Order), useValue: mockOrderRepository },
                { provide: getRepositoryToken(OrderItem), useValue: {} },
                { provide: getRepositoryToken(PrintJob), useValue: {} },
                { provide: getRepositoryToken(Product), useValue: {} },
                { provide: getRepositoryToken(ProductSize), useValue: {} },
                { provide: getRepositoryToken(FrameOption), useValue: {} },
                { provide: getDataSourceToken(), useValue: {} },
                { provide: EmailService, useValue: {} },
            ],
        }).compile();

        service = module.get<OrdersService>(OrdersService);
    });

    it('autorise le propriétaire à voir sa commande', async () => {
        const result = await service.getOrderById('order-1', 'user-1');
        expect(result.order.id).toBe('order-1');
    });

    it('interdit à un autre utilisateur de voir la commande (IDOR)', async () => {
        await expect(service.getOrderById('order-1', 'user-2'))
            .rejects.toThrow(NotFoundException);
    });

    it('interdit à un invité de voir une commande enregistrée (IDOR)', async () => {
        await expect(service.getOrderById('order-1', undefined))
            .rejects.toThrow(NotFoundException);
    });

    it('autorise un invité à voir sa propre commande (si non liée à un user)', async () => {
        const result = await service.getOrderById('order-2', undefined);
        expect(result.order.id).toBe('order-2');
    });

    it('autorise un utilisateur connecté à voir une commande invitée', async () => {
        // Cas possible si un utilisateur clique sur un lien de suivi après s'être connecté
        const result = await service.getOrderById('order-2', 'user-1');
        expect(result.order.id).toBe('order-2');
    });

    it('renvoie une erreur générique si la commande n existe pas', async () => {
        await expect(service.getOrderById('non-existent', 'user-1'))
            .rejects.toThrow(NotFoundException);
    });
});
