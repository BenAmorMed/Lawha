import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AdminService } from './admin.service';
import { Order } from '../orders/order.entity';
import { Review } from '../reviews/review.entity';
import { Repository } from 'typeorm';

describe('AdminService', () => {
  let service: AdminService;
  let ordersRepository: Repository<Order>;

  const mockQueryBuilder = {
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getRawMany: jest.fn(),
    getRawOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: getRepositoryToken(Order),
          useValue: {
            count: jest.fn(),
            createQueryBuilder: jest.fn(() => mockQueryBuilder),
            find: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Review),
          useValue: {
            createQueryBuilder: jest.fn(),
            findOne: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
    ordersRepository = module.get<Repository<Order>>(getRepositoryToken(Order));
  });

  describe('getOrderAnalytics', () => {
    it('should correctly aggregate metrics from consolidated queries', async () => {
      const mockStatusStats = [
        { status: 'pending_payment', count: '5', total_sum: '100.00' },
        { status: 'shipped', count: '10', total_sum: '500.00' },
        { status: 'delivered', count: '5', total_sum: '400.00' },
      ];

      const mockDailyOrders = [
        { date: '2023-01-01', count: '3' },
        { date: '2023-01-02', count: '7' },
      ];

      mockQueryBuilder.getRawMany
        .mockResolvedValueOnce(mockStatusStats) // First call for status stats
        .mockResolvedValueOnce(mockDailyOrders); // Second call for daily orders

      const result = await service.getOrderAnalytics();

      expect(result.summary.total_orders).toBe(20); // 5 + 10 + 5
      expect(result.summary.revenue).toBe(900); // 500 + 400
      expect(result.summary.average_order_value).toBe(50); // 1000 / 20
      expect(result.summary.orders_last_7_days).toBe(10); // 3 + 7
      expect(result.status_breakdown).toEqual({
        pending_payment: 5,
        shipped: 10,
        delivered: 5,
      });
      expect(result.orders_by_day).toHaveLength(2);
      expect(result.orders_by_day[0]).toEqual({ date: '2023-01-01', count: 3 });
    });

    it('should handle empty results gracefully', async () => {
      mockQueryBuilder.getRawMany.mockResolvedValue([]);

      const result = await service.getOrderAnalytics();

      expect(result.summary.total_orders).toBe(0);
      expect(result.summary.revenue).toBe(0);
      expect(result.summary.average_order_value).toBe(0);
      expect(result.summary.orders_last_7_days).toBe(0);
    });
  });
});
