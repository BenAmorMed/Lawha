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
  const mockOrder = { id: 'order-123', userId: 'user-123', total: 100.50 };

  const mockPaymentService = {
    createPaymentIntent: jest.fn(),
  };

  const mockOrdersService = {
    getOrderById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentController],
      providers: [
        { provide: PaymentService, useValue: mockPaymentService },
        { provide: OrdersService, useValue: mockOrdersService },
      ],
    }).compile();

    controller = module.get<PaymentController>(PaymentController);
    paymentService = module.get<PaymentService>(PaymentService);
    ordersService = module.get<OrdersService>(OrdersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createPaymentIntent', () => {
    it('should use order total from database and ignore amount from request body', async () => {
      mockOrdersService.getOrderById.mockResolvedValue({ order: mockOrder });
      mockPaymentService.createPaymentIntent.mockResolvedValue({
        client_secret: 'secret',
        amount: 10050,
        currency: 'usd',
      });

      const result = await controller.createPaymentIntent('order-123', mockUser);

      expect(ordersService.getOrderById).toHaveBeenCalledWith('order-123', mockUser.id);
      expect(paymentService.createPaymentIntent).toHaveBeenCalledWith(100.50, 'order-123', 'usd');
      expect(result.amount).toBe(10050);
    });

    it('should throw NotFoundException if order does not exist', async () => {
      mockOrdersService.getOrderById.mockResolvedValue({ order: null });

      await expect(controller.createPaymentIntent('non-existent', mockUser))
        .rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if order belongs to another user', async () => {
      const orderFromAnotherUser = { ...mockOrder, userId: 'other-user' };
      mockOrdersService.getOrderById.mockResolvedValue({ order: orderFromAnotherUser });

      await expect(controller.createPaymentIntent('order-123', mockUser))
        .rejects.toThrow(BadRequestException);
    });
  });
});
