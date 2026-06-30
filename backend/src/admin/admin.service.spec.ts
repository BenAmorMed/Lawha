import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AdminService } from './admin.service';
import { Order, OrderStatus } from '../orders/order.entity';
import { Review } from '../reviews/review.entity';
import { Repository } from 'typeorm';

describe('AdminService', () => {
  let service: AdminService;
  let ordersRepository: Repository<Order>;

  const createMockQueryBuilder = () => {
    const queryBuilder = {
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      setParameter: jest.fn().mockReturnThis(),
      getRawMany: jest.fn(),
      getRawOne: jest.fn(),
      getCount: jest.fn(),
    };
    return queryBuilder;
  };

  const mockOrdersRepository = {
    count: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockReviewsRepository = {
    createQueryBuilder: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: getRepositoryToken(Order),
          useValue: mockOrdersRepository,
        },
        {
          provide: getRepositoryToken(Review),
          useValue: mockReviewsRepository,
        },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
    ordersRepository = module.get<Repository<Order>>(getRepositoryToken(Order));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getOrderAnalytics', () => {
    it('should return aggregated order analytics', async () => {
      const statusStats = [
        { status: 'shipped', count: '5', total_revenue: '250.25', recent_count: '2' },
        { status: 'delivered', count: '3', total_revenue: '150.15', recent_count: '1' },
        { status: 'pending', count: '2', total_revenue: '100.10', recent_count: '1' },
      ];
      const dailyStats = [
        { date: '2023-05-01', count: '2' },
        { date: '2023-05-02', count: '2' },
      ];

      const qbStatus = createMockQueryBuilder();
      qbStatus.getRawMany.mockResolvedValue(statusStats);

      const qbDaily = createMockQueryBuilder();
      qbDaily.getRawMany.mockResolvedValue(dailyStats);

      (ordersRepository.createQueryBuilder as jest.Mock)
        .mockReturnValueOnce(qbStatus)
        .mockReturnValueOnce(qbDaily);

      const result = await service.getOrderAnalytics();

      // totalOrders = 5 + 3 + 2 = 10
      // totalRevenue = 250.25 + 150.15 = 400.40 (shipped + delivered)
      // totalPoints = 250.25 + 150.15 + 100.10 = 500.50
      // avgValue = 500.50 / 10 = 50.05
      // ordersLast7Days = 2 + 1 + 1 = 4

      expect(result).toEqual({
        summary: {
          total_orders: 10,
          revenue: 400.40,
          average_order_value: 50.05,
          orders_last_7_days: 4,
        },
        status_breakdown: {
          shipped: 5,
          delivered: 3,
          pending: 2,
        },
        orders_by_day: [
          { date: '2023-05-01', count: 2 },
          { date: '2023-05-02', count: 2 },
        ],
      });

      expect(ordersRepository.createQueryBuilder).toHaveBeenCalledTimes(2);
    });

    it('should handle empty results gracefully', async () => {
      const qb = createMockQueryBuilder();
      qb.getRawMany.mockResolvedValue([]);

      (ordersRepository.createQueryBuilder as jest.Mock).mockReturnValue(qb);

      const result = await service.getOrderAnalytics();

      expect(result.summary.total_orders).toBe(0);
      expect(result.summary.revenue).toBe(0);
      expect(result.summary.average_order_value).toBe(0);
      expect(result.status_breakdown).toEqual({});
      expect(result.orders_by_day).toEqual([]);
    });
  });
});
