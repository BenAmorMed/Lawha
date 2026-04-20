import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AdminService } from './admin.service';
import { Order } from '../orders/order.entity';
import { Review } from '../reviews/review.entity';
import { Repository } from 'typeorm';

describe('AdminService', () => {
  let service: AdminService;
  let ordersRepository: Repository<Order>;

  const mockQueryBuilder = {
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getRawMany: jest.fn(),
    getRawOne: jest.fn(),
    getCount: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: getRepositoryToken(Order),
          useValue: {
            count: jest.fn(),
            createQueryBuilder: jest.fn(() => mockQueryBuilder),
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
    it('should return aggregated order analytics correctly with optimized 2 queries', async () => {
      // Optimized implementation makes 2 calls:
      // 1. createQueryBuilder...getRawMany() (stats by status: count and total sum)
      // 2. createQueryBuilder...getRawMany() (orders by day)

      mockQueryBuilder.getRawMany
        .mockResolvedValueOnce([
          { status: 'shipped', count: '5', total: '500' },
          { status: 'delivered', count: '2', total: '200' },
          { status: 'pending', count: '3', total: '300' },
        ]) // Stats by status
        .mockResolvedValueOnce([
          { date: '2023-10-01', count: '2' },
          { date: '2023-10-02', count: '2' },
        ]); // Orders by day

      const result = await service.getOrderAnalytics();

      // totalOrders = 5 + 2 + 3 = 10
      // totalRevenue = 500 + 200 = 700 (shipped + delivered)
      // totalAmountAll = 500 + 200 + 300 = 1000
      // averageValue = 1000 / 10 = 100
      // ordersLast7Days = 2 + 2 = 4

      expect(result.summary.total_orders).toBe(10);
      expect(result.summary.revenue).toBe(700);
      expect(result.summary.average_order_value).toBe(100);
      expect(result.summary.orders_last_7_days).toBe(4);
      expect(result.status_breakdown).toEqual({
        shipped: 5,
        delivered: 2,
        pending: 3,
      });
      expect(result.orders_by_day).toHaveLength(2);
      expect(result.orders_by_day[0]).toEqual({ date: '2023-10-01', count: 2 });
    });
  });
});
