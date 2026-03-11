import { Test, TestingModule } from '@nestjs/testing';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { OrdersService } from '../orders/orders.service';
import { User } from '../auth/entities/user.entity';

describe('PaymentController (Security)', () => {
  let controller: PaymentController;
  let paymentService: PaymentService;
  let ordersService: OrdersService;

  const mockUser: User = {
    id: 'user-uuid',
    email: 'test@example.com',
    role: 'customer',
  } as any;

  const mockOrder = {
    id: 'order-uuid',
    userId: 'user-uuid',
    total: 99.99,
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
              amount: 9999,
              currency: 'usd',
            }),
          },
        },
        {
          provide: OrdersService,
          useValue: {
            getOrderById: jest.fn().mockResolvedValue({ order: mockOrder }),
          },
        },
      ],
    }).compile();

    controller = module.get<PaymentController>(PaymentController);
    paymentService = module.get<PaymentService>(PaymentService);
    ordersService = module.get<OrdersService>(OrdersService);
  });

  it('should use order total from database and ignore amount from request', async () => {
    const orderId = 'order-uuid';
    const manipulatedAmount = 1.00; // Maliciously low amount

    await controller.createPaymentIntent(orderId, mockUser);

    // Verify getOrderById was called with correct ID and userId
    expect(ordersService.getOrderById).toHaveBeenCalledWith(orderId, mockUser.id);

    // Verify createPaymentIntent was called with the database amount (99.99), not manipulated amount (1.00)
    expect(paymentService.createPaymentIntent).toHaveBeenCalledWith(
      mockOrder.total,
      orderId,
      'usd'
    );
  });
});
