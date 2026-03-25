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
            findOne: jest.fn(),
            find: jest.fn(),
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
    it('should correctly calculate analytics from consolidated queries', async () => {
      const mockStatusStats = [
        { status: 'pending', count: '10', total_sum: '100.00', average: '10.00' },
        { status: 'delivered', count: '5', total_sum: '500.00', average: '100.00' },
        { status: 'shipped', count: '5', total_sum: '400.00', average: '80.00' },
      ];

      const mockDayStats = [
        { date: '2025-05-14', count: '2' },
        { date: '2025-05-15', count: '3' },
      ];

      const statusQueryBuilder: any = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue(mockStatusStats),
      };

      const dayQueryBuilder: any = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue(mockDayStats),
      };

      const createQueryBuilderSpy = jest.spyOn(ordersRepository, 'createQueryBuilder')
        .mockReturnValueOnce(statusQueryBuilder)
        .mockReturnValueOnce(dayQueryBuilder);

      const result = await service.getOrderAnalytics();

      // Verify exactly 2 database roundtrips
      expect(createQueryBuilderSpy).toHaveBeenCalledTimes(2);

      // Verify summary metrics
      expect(result.summary.total_orders).toBe(20); // 10 + 5 + 5
      expect(result.summary.revenue).toBe(900); // 500 (delivered) + 400 (shipped)
      expect(result.summary.average_order_value).toBe(50); // (100 + 500 + 400) / 20 = 1000 / 20
      expect(result.summary.orders_last_7_days).toBe(5); // 2 + 3

      // Verify breakdown
      expect(result.status_breakdown).toEqual({
        pending: 10,
        delivered: 5,
        shipped: 5,
      });

      // Verify day breakdown
      expect(result.orders_by_day).toHaveLength(2);
      expect(result.orders_by_day[0].count).toBe(2);
    });

    it('should handle zero orders gracefully', async () => {
      const statusQueryBuilder: any = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([]),
      };

      const dayQueryBuilder: any = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([]),
      };

      jest.spyOn(ordersRepository, 'createQueryBuilder')
        .mockReturnValueOnce(statusQueryBuilder)
        .mockReturnValueOnce(dayQueryBuilder);

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
