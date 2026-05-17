import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminService } from './admin.service';
import { Order } from '../orders/order.entity';
import { Review } from '../reviews/review.entity';

describe('AdminService', () => {
  let service: AdminService;
  let ordersRepository: Repository<Order>;

  const mockQueryBuilder = {
    where: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    loadRelationCountAndMap: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn().mockReturnValue([[], 0]),
    getRawMany: jest.fn().mockReturnValue([]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: getRepositoryToken(Order),
          useValue: {
            createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
            findOne: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Review),
          useValue: {
            createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
            findOne: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
    ordersRepository = module.get<Repository<Order>>(getRepositoryToken(Order));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAllOrders', () => {
    it('should use optimized query methods', async () => {
      const filters = { limit: 10, offset: 0 };
      await service.getAllOrders(filters);

      expect(ordersRepository.createQueryBuilder).toHaveBeenCalledWith('order');
      expect(mockQueryBuilder.loadRelationCountAndMap).toHaveBeenCalledWith(
        'order.itemsCount',
        'order.items',
      );
      expect(mockQueryBuilder.getManyAndCount).toHaveBeenCalled();
    });
  });

  describe('getOrderAnalytics', () => {
    it('should consolidate queries and calculate metrics correctly', async () => {
      // Mock summary stats (Query 1)
      mockQueryBuilder.getRawMany
        .mockReturnValueOnce([
          { status: 'pending', count: '5', totalRevenue: '500', avgOrderValue: '100' },
          { status: 'delivered', count: '10', totalRevenue: '2000', avgOrderValue: '200' },
        ])
        // Mock recent stats (Query 2)
        .mockReturnValueOnce([
          { date: '2023-01-01', count: '3' },
          { date: '2023-01-02', count: '4' },
        ]);

      const result = await service.getOrderAnalytics();

      expect(result.summary.total_orders).toBe(15);
      expect(result.summary.revenue).toBe(2000); // Only delivered
      // (100*5 + 200*10) / 15 = 2500 / 15 = 166.67
      expect(result.summary.average_order_value).toBe(166.67);
      expect(result.summary.orders_last_7_days).toBe(7);
      expect(result.status_breakdown).toEqual({
        pending: 5,
        delivered: 10,
      });
      expect(result.orders_by_day).toHaveLength(2);
      expect(result.orders_by_day[0]).toEqual({ date: '2023-01-01', count: 3 });
    });

    it('should handle zero orders gracefully', async () => {
      mockQueryBuilder.getRawMany.mockReturnValue([]);

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
