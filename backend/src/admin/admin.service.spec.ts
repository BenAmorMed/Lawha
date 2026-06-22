import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AdminService } from './admin.service';
import { Order } from '../orders/order.entity';
import { Review } from '../reviews/review.entity';
import { Repository, SelectQueryBuilder } from 'typeorm';

describe('AdminService', () => {
  let service: AdminService;
  let ordersRepository: Repository<Order>;
  let reviewsRepository: Repository<Review>;

  const mockQueryBuilder = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    setParameter: jest.fn().mockReturnThis(),
    getRawMany: jest.fn(),
    getManyAndCount: jest.fn(),
    loadRelationCountAndMap: jest.fn().mockReturnThis(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: getRepositoryToken(Order),
          useValue: {
            createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
            count: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
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
    reviewsRepository = module.get<Repository<Review>>(getRepositoryToken(Review));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getOrderAnalytics', () => {
    it('should return consolidated analytics correctly', async () => {
      const mockStatusMetrics = [
        { status: 'shipped', count: '10', totalRevenue: '1000', recentCount: '2' },
        { status: 'delivered', count: '5', totalRevenue: '500', recentCount: '1' },
        { status: 'pending_payment', count: '5', totalRevenue: '200', recentCount: '0' },
      ];

      const mockOrdersByDay = [
        { date: '2026-06-20', count: '10' },
        { date: '2026-06-21', count: '10' },
      ];

      mockQueryBuilder.getRawMany
        .mockResolvedValueOnce(mockStatusMetrics)
        .mockResolvedValueOnce(mockOrdersByDay);

      const result = await service.getOrderAnalytics();

      expect(result.summary.total_orders).toBe(20);
      expect(result.summary.revenue).toBe(1500); // 1000 + 500
      expect(result.summary.average_order_value).toBe(1700 / 20); // (1000+500+200) / 20
      expect(result.summary.orders_last_7_days).toBe(3);
      expect(result.status_breakdown['shipped']).toBe(10);
      expect(result.orders_by_day).toHaveLength(2);
      expect(mockQueryBuilder.groupBy).toHaveBeenCalledWith('order.status');
    });
  });

  describe('getAllOrders', () => {
    it('should use getManyAndCount and loadRelationCountAndMap', async () => {
      const mockOrders = [
        { id: '1', itemsCount: 2, user: { email: 'test@example.com' } },
      ];
      mockQueryBuilder.getManyAndCount.mockResolvedValue([mockOrders, 1]);

      const result = await service.getAllOrders({ limit: 10, offset: 0 });

      expect(result.data).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
      expect(mockQueryBuilder.loadRelationCountAndMap).toHaveBeenCalledWith('order.itemsCount', 'order.items');
      expect(mockQueryBuilder.getManyAndCount).toHaveBeenCalled();
    });
  });

  describe('getAllReviews', () => {
    it('should use getManyAndCount', async () => {
      const mockReviews = [{ id: '1', rating: 5 }];
      mockQueryBuilder.getManyAndCount.mockResolvedValue([mockReviews, 1]);

      const result = await service.getAllReviews({ limit: 10, offset: 0 });

      expect(result.data).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
      expect(mockQueryBuilder.getManyAndCount).toHaveBeenCalled();
    });
  });
});
