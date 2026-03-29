import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminService } from './admin.service';
import { Order } from '../orders/order.entity';
import { Review } from '../reviews/review.entity';

describe('AdminService', () => {
  let service: AdminService;
  let orderRepository: Repository<Order>;

  const mockOrderRepository = {
    createQueryBuilder: jest.fn(),
  };

  const mockReviewRepository = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: getRepositoryToken(Order),
          useValue: mockOrderRepository,
        },
        {
          provide: getRepositoryToken(Review),
          useValue: mockReviewRepository,
        },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
    orderRepository = module.get<Repository<Order>>(getRepositoryToken(Order));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getOrderAnalytics', () => {
    it('should correctly aggregate metrics from two queries', async () => {
      const mockStatusStats = [
        { status: 'pending_payment', count: '5', sum: '500.00' },
        { status: 'shipped', count: '10', sum: '1000.00' },
        { status: 'delivered', count: '5', sum: '500.00' },
      ];

      const mockDailyStats = [
        { date: '2025-05-10', count: '5' },
        { date: '2025-05-11', count: '15' },
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

      mockOrderRepository.createQueryBuilder
        .mockReturnValueOnce(statusQueryBuilder)
        .mockReturnValueOnce(dailyQueryBuilder);

      const result = await service.getOrderAnalytics();

      expect(result.summary.total_orders).toBe(20);
      expect(result.summary.revenue).toBe(1500.00);
      expect(result.summary.average_order_value).toBe(100.00);
      expect(result.summary.orders_last_7_days).toBe(20);
      expect(result.status_breakdown).toEqual({
        pending_payment: 5,
        shipped: 10,
        delivered: 5,
      });
      expect(result.orders_by_day).toHaveLength(2);
      expect(result.orders_by_day[0]).toEqual({ date: '2025-05-10', count: 5 });
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

      mockOrderRepository.createQueryBuilder
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
