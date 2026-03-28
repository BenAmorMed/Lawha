import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AdminService } from './admin.service';
import { Order } from '../orders/order.entity';
import { Review } from '../reviews/review.entity';

describe('AdminService', () => {
  let service: AdminService;
  let ordersRepository: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: getRepositoryToken(Order),
          useValue: { createQueryBuilder: jest.fn() },
        },
        {
          provide: getRepositoryToken(Review),
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
    ordersRepository = module.get(getRepositoryToken(Order));
  });

  it('getOrderAnalytics should consolidate metrics correctly', async () => {
    const mockStatusStats = [
      { status: 'pending', count: '2', totalSum: '100' },
      { status: 'shipped', count: '1', totalSum: '50' },
      { status: 'delivered', count: '1', totalSum: '150' },
    ];
    const mockOrdersByDay = [
      { date: '2023-01-01', count: '3' },
      { date: '2023-01-02', count: '1' },
    ];

    const statusQB: any = {
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      getRawMany: jest.fn().mockResolvedValue(mockStatusStats),
    };

    const dateQB: any = {
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getRawMany: jest.fn().mockResolvedValue(mockOrdersByDay),
    };

    ordersRepository.createQueryBuilder
      .mockReturnValueOnce(statusQB)
      .mockReturnValueOnce(dateQB);

    const result = await service.getOrderAnalytics();

    expect(result.summary.total_orders).toBe(4);
    expect(result.summary.revenue).toBe(200); // 50 + 150
    expect(result.summary.average_order_value).toBe(75); // 300 / 4
    expect(result.summary.orders_last_7_days).toBe(4); // 3 + 1
    expect(result.status_breakdown).toEqual({ pending: 2, shipped: 1, delivered: 1 });
  });
});
