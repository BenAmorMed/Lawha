import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminService } from './admin.service';
import { Order } from '../orders/order.entity';
import { Review } from '../reviews/review.entity';

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
    it('should return correct analytics with exactly two database queries', async () => {
      const mockStatusStats = [
        { status: 'pending_payment', count: '10', sum: '100.00' },
        { status: 'shipped', count: '5', sum: '250.00' },
        { status: 'delivered', count: '5', sum: '250.00' },
      ];

      const mockDailyStats = [
        { date: '2025-05-10', count: '10' },
        { date: '2025-05-11', count: '10' },
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

      // Verify Query 1: All-time stats by status
      expect(statusQueryBuilder.select).toHaveBeenCalledWith('order.status', 'status');
      expect(statusQueryBuilder.addSelect).toHaveBeenCalledWith('COUNT(order.id)', 'count');
      expect(statusQueryBuilder.addSelect).toHaveBeenCalledWith('SUM(order.total)', 'sum');
      expect(statusQueryBuilder.groupBy).toHaveBeenCalledWith('order.status');

      // Verify Query 2: Daily stats
      expect(dailyQueryBuilder.select).toHaveBeenCalledWith('DATE(order.createdAt)', 'date');
      expect(dailyQueryBuilder.addSelect).toHaveBeenCalledWith('COUNT(order.id)', 'count');
      expect(dailyQueryBuilder.groupBy).toHaveBeenCalledWith('DATE(order.createdAt)');

      // Verify mathematical correctness
      expect(result.summary.total_orders).toBe(20); // 10 + 5 + 5
      expect(result.summary.revenue).toBe(500); // 250 + 250 (shipped + delivered)
      expect(result.summary.average_order_value).toBe(30); // 600 / 20
      expect(result.summary.orders_last_7_days).toBe(20); // 10 + 10

      expect(result.status_breakdown).toEqual({
        pending_payment: 10,
        shipped: 5,
        delivered: 5,
      });

      expect(result.orders_by_day).toHaveLength(2);
      expect(result.orders_by_day[0]).toEqual({ date: '2025-05-10', count: 10 });

      // Verify exactly two createQueryBuilder calls
      expect(ordersRepository.createQueryBuilder).toHaveBeenCalledTimes(2);
    });

    it('should return zeros when no orders exist', async () => {
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
