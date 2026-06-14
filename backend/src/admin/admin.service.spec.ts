import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AdminService } from './admin.service';
import { Order } from '../orders/order.entity';
import { Review } from '../reviews/review.entity';

describe('AdminService', () => {
  let service: AdminService;
  let ordersRepository: any;

  beforeEach(async () => {
    ordersRepository = {
      createQueryBuilder: jest.fn(),
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
    it('should correctly aggregate order statistics from consolidated queries', async () => {
      const mockStatusStats = [
        { status: 'pending', count: '5', sumTotal: '500.00' },
        { status: 'shipped', count: '3', sumTotal: '300.00' },
        { status: 'delivered', count: '2', sumTotal: '200.00' },
      ];

      const mockOrdersByDay = [
        { date: '2023-01-01', count: '4' },
        { date: '2023-01-02', count: '6' },
      ];

      const queryBuilder1 = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue(mockStatusStats),
      };

      const queryBuilder2 = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue(mockOrdersByDay),
      };

      ordersRepository.createQueryBuilder
        .mockReturnValueOnce(queryBuilder1)
        .mockReturnValueOnce(queryBuilder2);

      const result = await service.getOrderAnalytics();

      expect(result.summary.total_orders).toBe(10);
      expect(result.summary.revenue).toBe(500); // 300 (shipped) + 200 (delivered)
      expect(result.summary.average_order_value).toBe(100); // 1000 / 10
      expect(result.summary.orders_last_7_days).toBe(10); // 4 + 6
      expect(result.status_breakdown).toEqual({
        pending: 5,
        shipped: 3,
        delivered: 2,
      });
      expect(result.orders_by_day).toHaveLength(2);
      expect(result.orders_by_day[0]).toEqual({ date: '2023-01-01', count: 4 });
    });

    it('should handle zero orders correctly', async () => {
      const queryBuilder1 = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([]),
      };

      const queryBuilder2 = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([]),
      };

      ordersRepository.createQueryBuilder
        .mockReturnValueOnce(queryBuilder1)
        .mockReturnValueOnce(queryBuilder2);

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
