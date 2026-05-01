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
          useValue: {
            createQueryBuilder: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
    ordersRepository = module.get<Repository<Order>>(getRepositoryToken(Order));
  });

  describe('getOrderAnalytics', () => {
    it('should correctly calculate summary metrics from consolidated queries', async () => {
      const mockStatusStats = [
        { status: 'shipped', count: '2', sum: '100.00' },
        { status: 'delivered', count: '1', sum: '50.00' },
        { status: 'processing', count: '1', sum: '30.00' },
      ];

      const mockOrdersByDay = [
        { date: '2025-05-10', count: '2' },
        { date: '2025-05-11', count: '2' },
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
        getRawMany: jest.fn().mockResolvedValue(mockOrdersByDay),
      };

      jest.spyOn(ordersRepository, 'createQueryBuilder')
        .mockReturnValueOnce(queryBuilderStatus)
        .mockReturnValueOnce(queryBuilderDay);

      const result = await service.getOrderAnalytics();

      expect(result.summary.total_orders).toBe(4); // 2 + 1 + 1
      expect(result.summary.revenue).toBe(150.00); // 100 + 50 (shipped + delivered)
      expect(result.summary.average_order_value).toBe(180.00 / 4); // (100 + 50 + 30) / 4 = 45
      expect(result.summary.orders_last_7_days).toBe(4); // 2 + 2 from mockOrdersByDay
      expect(result.status_breakdown).toEqual({
        shipped: 2,
        delivered: 1,
        processing: 1,
      });
      expect(result.orders_by_day).toEqual([
        { date: '2025-05-10', count: 2 },
        { date: '2025-05-11', count: 2 },
      ]);
    });

    it('should handle zero orders gracefully', async () => {
      const queryBuilderStatus: any = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([]),
      };

      const queryBuilderDay: any = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([]),
      };

      jest.spyOn(ordersRepository, 'createQueryBuilder')
        .mockReturnValueOnce(queryBuilderStatus)
        .mockReturnValueOnce(queryBuilderDay);

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
