import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AdminService } from './admin.service';
import { Order } from '../orders/order.entity';
import { Review } from '../reviews/review.entity';

describe('AdminService', () => {
  let service: AdminService;
  let ordersRepository: any;

  beforeEach(async () => {
    const mockQueryBuilder = {
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      setParameter: jest.fn().mockReturnThis(),
      getRawMany: jest.fn(),
    };

    ordersRepository = {
      createQueryBuilder: jest.fn(() => mockQueryBuilder),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: getRepositoryToken(Order),
          useValue: ordersRepository,
        },
        {
          provide: getRepositoryToken(Review),
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
  });

  describe('getOrderAnalytics', () => {
    it('should correctly aggregate stats from raw query results', async () => {
      const mockStatusStats = [
        { status: 'pending', count: '5', sumTotal: '500.00', recentCount: '2' },
        { status: 'shipped', count: '10', sumTotal: '1000.00', recentCount: '5' },
        { status: 'delivered', count: '5', sumTotal: '500.00', recentCount: '3' },
      ];

      const mockOrdersByDay = [
        { date: '2026-07-01', count: '10' },
        { date: '2026-07-02', count: '10' },
      ];

      const qb = ordersRepository.createQueryBuilder();
      qb.getRawMany
        .mockResolvedValueOnce(mockStatusStats)
        .mockResolvedValueOnce(mockOrdersByDay);

      const result = await service.getOrderAnalytics();

      // totalOrders = 5 + 10 + 5 = 20
      // revenue = 1000 (shipped) + 500 (delivered) = 1500
      // totalAmount = 500 + 1000 + 500 = 2000
      // averageOrderValue = 2000 / 20 = 100
      // recentOrders = 2 + 5 + 3 = 10

      expect(result.summary.total_orders).toBe(20);
      expect(result.summary.revenue).toBe(1500);
      expect(result.summary.average_order_value).toBe(100);
      expect(result.summary.orders_last_7_days).toBe(10);
      expect(result.status_breakdown).toEqual({
        pending: 5,
        shipped: 10,
        delivered: 5,
      });
      expect(result.orders_by_day).toHaveLength(2);
      expect(result.orders_by_day[0]).toEqual({ date: '2026-07-01', count: 10 });
    });

    it('should handle empty results gracefully', async () => {
      const qb = ordersRepository.createQueryBuilder();
      qb.getRawMany.mockResolvedValue([]);

      const result = await service.getOrderAnalytics();

      expect(result.summary.total_orders).toBe(0);
      expect(result.summary.revenue).toBe(0);
      expect(result.summary.average_order_value).toBe(0);
      expect(result.summary.orders_last_7_days).toBe(0);
      expect(result.status_breakdown).toEqual({});
      expect(result.orders_by_day).toEqual([]);
    });
  });
});
