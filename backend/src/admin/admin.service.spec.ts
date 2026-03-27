import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AdminService } from './admin.service';
import { Order } from '../orders/order.entity';
import { Review } from '../reviews/review.entity';
import { Repository } from 'typeorm';

describe('AdminService', () => {
  let service: AdminService;
  let ordersRepository: Repository<Order>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: getRepositoryToken(Order),
          useValue: {
            count: jest.fn(),
            createQueryBuilder: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Review),
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
    ordersRepository = module.get<Repository<Order>>(getRepositoryToken(Order));
  });

  describe('getOrderAnalytics', () => {
    it('should return correct analytics summary with optimized queries', async () => {
      // 1. Optimized status stats (consolidated)
      const mockStatusStats = [
        { status: 'shipped', count: '5', sum_total: '750.00', avg_total: '150.00' },
        { status: 'delivered', count: '3', sum_total: '450.00', avg_total: '150.00' },
        { status: 'pending', count: '2', sum_total: '300.50', avg_total: '150.25' },
      ];

      // 2. Optimized daily stats (consolidated)
      const mockDailyStats = [
        { date: '2023-01-01', count: '2' },
        { date: '2023-01-02', count: '2' },
      ];

      const queryBuilder: any = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn(),
      };

      jest.spyOn(ordersRepository, 'createQueryBuilder').mockReturnValue(queryBuilder);

      queryBuilder.getRawMany
        .mockResolvedValueOnce(mockStatusStats) // First call: status aggregation
        .mockResolvedValueOnce(mockDailyStats); // Second call: daily aggregation

      const result = await service.getOrderAnalytics();

      // totalOrders = 5 + 3 + 2 = 10
      // revenue = 750 + 450 = 1200
      // totalSum = 750 + 450 + 300.50 = 1500.50
      // AOV = 1500.50 / 10 = 150.05
      // ordersLast7Days = 2 + 2 = 4

      expect(result.summary.total_orders).toBe(10);
      expect(result.summary.revenue).toBe(1200);
      expect(result.summary.average_order_value).toBe(150.05);
      expect(result.summary.orders_last_7_days).toBe(4);
      expect(result.status_breakdown).toEqual({
        shipped: 5,
        delivered: 3,
        pending: 2,
      });
      expect(result.orders_by_day).toHaveLength(2);
      expect(result.orders_by_day[0]).toEqual({ date: '2023-01-01', count: 2 });
    });
  });
});
