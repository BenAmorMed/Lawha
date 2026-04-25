import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AdminService } from './admin.service';
import { Order, OrderStatus } from '../orders/order.entity';
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
    it('should return correct analytics with optimized 2-query implementation', async () => {
      // Mock for Query 1: statsByStatus
      const statsByStatusQB: any = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([
          { status: 'delivered', count: '6', sum: '600.00', avg: '100.00' },
          { status: 'shipped', count: '4', sum: '400.00', avg: '100.00' },
        ]),
      };

      // Mock for Query 2: ordersByDay
      const ordersByDayQB: any = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([
          { date: '2023-01-01', count: '2' },
          { date: '2023-01-02', count: '3' },
        ]),
      };

      jest.spyOn(ordersRepository, 'createQueryBuilder')
        .mockReturnValueOnce(statsByStatusQB)
        .mockReturnValueOnce(ordersByDayQB);

      const result = await service.getOrderAnalytics();

      // Verify DB interaction (only 2 calls to createQueryBuilder, 0 to count())
      expect(ordersRepository.createQueryBuilder).toHaveBeenCalledTimes(2);
      expect(ordersRepository.count).not.toHaveBeenCalled();

      expect(result.summary.total_orders).toBe(10);
      expect(result.summary.revenue).toBe(1000.00);
      expect(result.summary.average_order_value).toBe(100.00);
      expect(result.summary.orders_last_7_days).toBe(5);
      expect(result.status_breakdown).toEqual({
        delivered: 6,
        shipped: 4,
      });
      expect(result.orders_by_day).toHaveLength(2);
      expect(result.orders_by_day[0]).toEqual({ date: '2023-01-01', count: 2 });
    });

    it('should handle zero orders gracefully', async () => {
        const statsByStatusQB: any = {
          select: jest.fn().mockReturnThis(),
          addSelect: jest.fn().mockReturnThis(),
          groupBy: jest.fn().mockReturnThis(),
          getRawMany: jest.fn().mockResolvedValue([]),
        };

        const ordersByDayQB: any = {
          select: jest.fn().mockReturnThis(),
          addSelect: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          groupBy: jest.fn().mockReturnThis(),
          orderBy: jest.fn().mockReturnThis(),
          getRawMany: jest.fn().mockResolvedValue([]),
        };

        jest.spyOn(ordersRepository, 'createQueryBuilder')
          .mockReturnValueOnce(statsByStatusQB)
          .mockReturnValueOnce(ordersByDayQB);

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
