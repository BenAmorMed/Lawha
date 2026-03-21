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
      // 1. statusStats (Query 1)
      const mockStatusStats = [
        { status: 'shipped', count: '5', totalAmount: '750.25' },
        { status: 'delivered', count: '3', totalAmount: '450.25' },
        { status: 'pending', count: '2', totalAmount: '300.00' },
      ];
      const statusQueryBuilder: any = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue(mockStatusStats),
      };

      // 2. ordersByDay (Query 2)
      const mockOrdersByDay = [
        { date: '2023-01-01', count: '2' },
        { date: '2023-01-02', count: '2' },
      ];
      const dailyQueryBuilder: any = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue(mockOrdersByDay),
      };

      jest.spyOn(ordersRepository, 'createQueryBuilder')
        .mockReturnValueOnce(statusQueryBuilder)
        .mockReturnValueOnce(dailyQueryBuilder);

      const result = await service.getOrderAnalytics();

      // Total orders = 5+3+2 = 10
      expect(result.summary.total_orders).toBe(10);
      // Revenue = 750.25 + 450.25 = 1200.50
      expect(result.summary.revenue).toBe(1200.50);
      // Average = (750.25 + 450.25 + 300.00) / 10 = 1500.50 / 10 = 150.05
      expect(result.summary.average_order_value).toBe(150.05);
      // Orders last 7 days = 2+2 = 4
      expect(result.summary.orders_last_7_days).toBe(4);
      expect(result.status_breakdown).toEqual({
        shipped: 5,
        delivered: 3,
        pending: 2,
      });
      expect(result.orders_by_day).toHaveLength(2);
      expect(result.orders_by_day[0]).toEqual({ date: '2023-01-01', count: 2 });

      // Verify ONLY 2 calls to createQueryBuilder and 0 to count()
      expect(ordersRepository.createQueryBuilder).toHaveBeenCalledTimes(2);
      expect(ordersRepository.count).not.toHaveBeenCalled();
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
