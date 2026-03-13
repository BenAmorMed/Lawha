import { Test, TestingModule } from '@nestjs/testing';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { OrdersService } from '../orders/orders.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { User } from '../auth/entities/user.entity';

describe('PaymentController', () => {
  let controller: PaymentController;
  let paymentService: PaymentService;
  let ordersService: OrdersService;

  const mockUser = { id: 'user-123' } as User;
  const mockOrder = {
    id: 'order-123',
    userId: 'user-123',
    total: 99.99
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentController],
      providers: [
        {
          provide: PaymentService,
          useValue: {
            createPaymentIntent: jest.fn(),
            confirmPaymentIntent: jest.fn(),
            sendPaymentSuccessEmail: jest.fn(),
          },
        },
        {
          provide: OrdersService,
          useValue: {
            getOrderById: jest.fn(),
            updateOrderStatus: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<PaymentController>(PaymentController);
    paymentService = module.get<PaymentService>(PaymentService);
    ordersService = module.get<OrdersService>(OrdersService);
  });

  describe('createPaymentIntent', () => {
    it('should use order total from database and ignore body amount', async () => {
      jest.spyOn(ordersService, 'getOrderById').mockResolvedValue({ order: mockOrder } as any);
      jest.spyOn(paymentService, 'createPaymentIntent').mockResolvedValue({
        client_secret: 'secret',
        amount: 9999,
        currency: 'usd'
      } as any);

      const result = await controller.createPaymentIntent('order-123', mockUser);

      expect(ordersService.getOrderById).toHaveBeenCalledWith('order-123', mockUser.id);
      expect(paymentService.createPaymentIntent).toHaveBeenCalledWith(99.99, 'order-123', 'usd');
      expect(result.amount).toBe(9999);
    });

    it('should throw NotFoundException if order does not exist', async () => {
      jest.spyOn(ordersService, 'getOrderById').mockResolvedValue({ order: null } as any);
      await expect(controller.createPaymentIntent('order-123', mockUser)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if order belongs to another user', async () => {
      jest.spyOn(ordersService, 'getOrderById').mockResolvedValue({ order: { ...mockOrder, userId: 'other-user' } } as any);
      await expect(controller.createPaymentIntent('order-123', mockUser)).rejects.toThrow(BadRequestException);
    });
  });

  describe('confirmPayment', () => {
    it('should succeed if payment intent metadata matches orderId', async () => {
      jest.spyOn(ordersService, 'getOrderById').mockResolvedValue({ order: mockOrder } as any);
      jest.spyOn(paymentService, 'confirmPaymentIntent').mockResolvedValue({
        status: 'succeeded',
        metadata: { orderId: 'order-123' }
      } as any);
      jest.spyOn(paymentService, 'sendPaymentSuccessEmail').mockResolvedValue(undefined);

      const result = await controller.confirmPayment('pi-123', 'order-123', mockUser);

      expect(result.success).toBe(true);
      expect(ordersService.updateOrderStatus).toHaveBeenCalledWith('order-123', { status: 'processing' });
    });

    it('should throw BadRequestException if payment intent metadata does not match orderId', async () => {
      jest.spyOn(ordersService, 'getOrderById').mockResolvedValue({ order: mockOrder } as any);
      jest.spyOn(paymentService, 'confirmPaymentIntent').mockResolvedValue({
        status: 'succeeded',
        metadata: { orderId: 'wrong-order' }
      } as any);

      await expect(controller.confirmPayment('pi-123', 'order-123', mockUser)).rejects.toThrow(BadRequestException);
    });
  });
});
