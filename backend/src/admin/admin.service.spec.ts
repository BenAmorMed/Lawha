import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AdminService } from './admin.service';
import { Order } from '../orders/order.entity';
import { Review } from '../reviews/review.entity';

describe('AdminService', () => {
  let service: AdminService;
  let ordersRepository: any;
  let reviewsRepository: any;

  const mockQueryBuilder: any = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    getRawMany: jest.fn(),
    getRawOne: jest.fn(),
    getCount: jest.fn(),
    getMany: jest.fn(),
    getManyAndCount: jest.fn(),
  };

  beforeEach(async () => {
    ordersRepository = {
      count: jest.fn(),
      createQueryBuilder: jest.fn(() => mockQueryBuilder),
      findOne: jest.fn(),
      find: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };

    reviewsRepository = {
      createQueryBuilder: jest.fn(() => mockQueryBuilder),
      findOne: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: getRepositoryToken(Order),
          useValue: ordersRepository,
        },
        {
          provide: getRepositoryToken(Review),
          useValue: reviewsRepository,
        },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getOrderAnalytics', () => {
    it('should return analytics data', async () => {
      mockQueryBuilder.getRawMany
        .mockResolvedValueOnce([
          { status: 'pending', count: '10', sum: '100.00' },
          { status: 'shipped', count: '90', sum: '4500.50' },
        ]) // statusStats
        .mockResolvedValueOnce([
          { date: '2025-05-14', count: '5' },
        ]); // ordersByDay

      const result = await service.getOrderAnalytics();

      expect(result.summary.total_orders).toBe(100);
      expect(result.summary.revenue).toBe(4500.50);
      expect(result.summary.average_order_value).toBe(46.005); // (100 + 4500.5) / 100
      expect(result.summary.orders_last_7_days).toBe(5);
      expect(result.status_breakdown).toEqual({
        pending: 10,
        shipped: 90,
      });
      expect(result.orders_by_day).toEqual([
        { date: '2025-05-14', count: 5 },
      ]);
    });
  });

  describe('getAllOrders', () => {
    it('should return paginated orders', async () => {
      const mockOrders = [
        { id: '1', total: 100, status: 'pending', items: [] },
        { id: '2', total: 200, status: 'shipped', items: [] },
      ];
      mockQueryBuilder.getManyAndCount.mockResolvedValue([mockOrders, 2]);

      const result = await service.getAllOrders({});

      expect(result.data).toHaveLength(2);
      expect(result.pagination.total).toBe(2);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(20);
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0);
    });
  });
});
