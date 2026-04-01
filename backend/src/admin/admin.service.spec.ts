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
    it('should correctly derive metrics from status and date stats', async () => {
      const mockStatusStats = [
        { status: 'pending', count: '2', sum_total: '100.00' },
        { status: 'shipped', count: '1', sum_total: '50.00' },
        { status: 'delivered', count: '1', sum_total: '150.00' },
      ];

      const mockDailyStats = [
        { date: '2025-05-01', count: '2' },
        { date: '2025-05-02', count: '2' },
      ];

      const statusQueryBuilder: any = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue(mockStatusStats),
      };

      const dailyQueryBuilder: any = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue(mockDailyStats),
      };

      jest.spyOn(ordersRepository, 'createQueryBuilder')
        .mockReturnValueOnce(statusQueryBuilder)
        .mockReturnValueOnce(dailyQueryBuilder);

      const result = await service.getOrderAnalytics();

      // Summary checks
      expect(result.summary.total_orders).toBe(4); // 2 + 1 + 1
      expect(result.summary.revenue).toBe(200); // 50 + 150 (shipped + delivered)
      expect(result.summary.average_order_value).toBe(75); // 300 / 4
      expect(result.summary.orders_last_7_days).toBe(4); // 2 + 2

      // Breakdown checks
      expect(result.status_breakdown).toEqual({
        pending: 2,
        shipped: 1,
        delivered: 1,
      });

      // Daily checks
      expect(result.orders_by_day).toHaveLength(2);
      expect(result.orders_by_day[0]).toEqual({ date: '2025-05-01', count: 2 });
    });

    it('should handle zero orders gracefully', async () => {
      const statusQueryBuilder: any = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([]),
      };

      const dailyQueryBuilder: any = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([]),
      };

      jest.spyOn(ordersRepository, 'createQueryBuilder')
        .mockReturnValueOnce(statusQueryBuilder)
        .mockReturnValueOnce(dailyQueryBuilder);

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
