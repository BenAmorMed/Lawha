import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AdminService } from './admin.service';
import { Order } from '../orders/order.entity';
import { Review } from '../reviews/review.entity';
import { Repository } from 'typeorm';

describe('AdminService', () => {
  let service: AdminService;
  let ordersRepository: Repository<Order>;
  let reviewsRepository: Repository<Review>;

  const mockQueryBuilder = {
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    getRawMany: jest.fn(),
    getManyAndCount: jest.fn(),
    getCount: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: getRepositoryToken(Order),
          useValue: {
            createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
          },
        },
        {
          provide: getRepositoryToken(Review),
          useValue: {
            createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
          },
        },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
    ordersRepository = module.get<Repository<Order>>(getRepositoryToken(Order));
    reviewsRepository = module.get<Repository<Review>>(getRepositoryToken(Review));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getOrderAnalytics', () => {
    it('should return consolidated analytics', async () => {
      const mockStatusStats = [
        { status: 'shipped', count: '5', sum: '500.00' },
        { status: 'delivered', count: '10', sum: '1000.00' },
        { status: 'pending', count: '2', sum: '100.00' },
      ];
      const mockDailyStats = [
        { date: '2023-01-01', count: '3' },
        { date: '2023-01-02', count: '4' },
      ];

      mockQueryBuilder.getRawMany
        .mockResolvedValueOnce(mockStatusStats)
        .mockResolvedValueOnce(mockDailyStats);

      const result = await service.getOrderAnalytics();

      expect(result.summary.total_orders).toBe(17);
      expect(result.summary.revenue).toBe(1500.00);
      expect(result.summary.average_order_value).toBeCloseTo(1600 / 17);
      expect(result.summary.orders_last_7_days).toBe(7);
      expect(result.status_breakdown).toEqual({
        shipped: 5,
        delivered: 10,
        pending: 2,
      });
      expect(result.orders_by_day).toHaveLength(2);
      expect(result.orders_by_day[0]).toEqual({ date: '2023-01-01', count: 3 });
    });
  });

  describe('getAllOrders', () => {
    it('should return paginated orders using getManyAndCount', async () => {
      const mockOrders = [
        { id: '1', total: 100, items: [] },
        { id: '2', total: 200, items: [] },
      ];
      const mockTotal = 2;

      mockQueryBuilder.getManyAndCount.mockResolvedValueOnce([mockOrders, mockTotal]);

      const result = await service.getAllOrders({});

      expect(result.data).toHaveLength(2);
      expect(result.pagination.total).toBe(2);
      expect(mockQueryBuilder.getManyAndCount).toHaveBeenCalled();
    });
  });
});
