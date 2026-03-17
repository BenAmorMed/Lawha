import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminService } from './admin.service';
import { Order } from '../orders/order.entity';
import { Review } from '../reviews/review.entity';

describe('AdminService', () => {
  let service: AdminService;
  let orderRepository: Repository<Order>;

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
    orderRepository = module.get<Repository<Order>>(getRepositoryToken(Order));
  });

  describe('getOrderAnalytics', () => {
    it('should correctly calculate analytics using only 2 consolidated queries', async () => {
      const mockStatusStats = [
        { status: 'shipped', count: '5', totalSum: '500' },
        { status: 'delivered', count: '10', totalSum: '1500' },
        { status: 'pending', count: '5', totalSum: '250' },
      ];

      const mockDailyStats = [
        { date: '2025-05-10', count: '5' },
        { date: '2025-05-11', count: '7' },
      ];

      const queryBuilderStatus: any = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue(mockStatusStats),
      };

      const queryBuilderDay: any = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue(mockDailyStats),
      };

      const createQueryBuilderSpy = jest.spyOn(orderRepository, 'createQueryBuilder');
      createQueryBuilderSpy
        .mockReturnValueOnce(queryBuilderStatus)
        .mockReturnValueOnce(queryBuilderDay);

      const result = await service.getOrderAnalytics();

      // Verify Query 1 results (Summary + Breakdown)
      expect(result.summary.total_orders).toBe(20);
      expect(result.summary.revenue).toBe(2000); // 500 + 1500
      expect(result.summary.average_order_value).toBe(112.5); // (500+1500+250) / 20

      const breakdown = result.status_breakdown as Record<string, number>;
      expect(breakdown.shipped).toBe(5);
      expect(breakdown.delivered).toBe(10);
      expect(breakdown.pending).toBe(5);

      // Verify Query 2 results (Recent + Daily Trend)
      expect(result.summary.orders_last_7_days).toBe(12); // 5 + 7
      expect(result.orders_by_day).toHaveLength(2);
      expect(result.orders_by_day[0].date).toBe('2025-05-10');
      expect(result.orders_by_day[0].count).toBe(5);

      // Verify performance (only 2 DB calls)
      expect(createQueryBuilderSpy).toHaveBeenCalledTimes(2);
    });

    it('should handle empty result sets gracefully', async () => {
      const queryBuilderEmpty: any = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([]),
      };

      jest.spyOn(orderRepository, 'createQueryBuilder').mockReturnValue(queryBuilderEmpty);

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
