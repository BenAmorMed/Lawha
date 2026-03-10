import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { OrdersService } from '../orders/orders.service';

describe('PaymentController Price Manipulation', () => {
  let controller: PaymentController;
  let paymentService: PaymentService;
  let ordersService: OrdersService;

  const mockUser = { id: 'user-1', email: 'test@example.com' };
  const mockOrder = {
    id: 'order-1',
    userId: 'user-1',
    total: 100.00, // $100.00
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentController],
      providers: [
        {
          provide: PaymentService,
          useValue: {
            createPaymentIntent: jest.fn().mockResolvedValue({
              client_secret: 'secret',
              amount: 10000,
              currency: 'usd',
            }),
            confirmPaymentIntent: jest.fn(),
            sendPaymentSuccessEmail: jest.fn(),
          },
        },
        {
          provide: OrdersService,
          useValue: {
            getOrderById: jest.fn().mockResolvedValue({ order: mockOrder }),
            updateOrderStatus: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<PaymentController>(PaymentController);
    paymentService = module.get<PaymentService>(PaymentService);
    ordersService = module.get<OrdersService>(OrdersService);
  });

  it('SECURE: createPaymentIntent ignores the amount from request body and uses order total', async () => {
    const maliciousAmount = 1; // Attempt to pay only $0.01

    await controller.createPaymentIntent('order-1', maliciousAmount, mockUser as any);

    // The amount passed to createPaymentIntent should be the order total (100.00), not maliciousAmount
    expect(paymentService.createPaymentIntent).toHaveBeenCalledWith(
      mockOrder.total,
      'order-1',
      'usd'
    );
  });

  it('SECURE: confirmPayment throws BadRequestException if amount mismatch', async () => {
    const paymentIntentId = 'pi-1';
    const orderId = 'order-1';

    // Mock Stripe returning a different amount (e.g. 5000 cents = $50.00)
    (paymentService.confirmPaymentIntent as jest.Mock).mockResolvedValue({
      id: paymentIntentId,
      amount: 5000,
      status: 'succeeded',
    });

    await expect(controller.confirmPayment(paymentIntentId, orderId, mockUser as any))
      .rejects.toThrow(BadRequestException);

    expect(ordersService.updateOrderStatus).not.toHaveBeenCalled();
  });

  it('SECURE: confirmPayment works for guest users (null user)', async () => {
    const paymentIntentId = 'pi-1';
    const orderId = 'order-guest';
    const mockGuestOrder = { id: orderId, userId: null, total: 100.00 };

    (ordersService.getOrderById as jest.Mock).mockResolvedValue({ order: mockGuestOrder });

    (paymentService.confirmPaymentIntent as jest.Mock).mockResolvedValue({
      id: paymentIntentId,
      amount: 10000,
      status: 'succeeded',
    });

    const result = await controller.confirmPayment(paymentIntentId, orderId, null);

    expect(result.success).toBe(true);
    expect(ordersService.updateOrderStatus).toHaveBeenCalledWith(orderId, { status: 'processing' });
  });

  it('SECURE: createPaymentIntent blocks unauthorized users from paying others orders', async () => {
    const maliciousUser = { id: 'user-malicious', email: 'malicious@example.com' };

    // ordersService.getOrderById will return mockOrder which belongs to user-1
    // but we'll simulate it by having it NOT throw NotFound (it found the order)
    // but then the controller should check ownership.

    await expect(controller.createPaymentIntent('order-1', 100.00, maliciousUser as any))
      .rejects.toThrow(BadRequestException);
  });
});
