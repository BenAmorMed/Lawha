import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AdminService } from './admin.service';
import { Order } from '../orders/order.entity';
import { Review } from '../reviews/review.entity';
import { Repository } from 'typeorm';

describe('AdminService', () => {
  let service: AdminService;
  let orderRepository: Repository<Order>;
  let reviewRepository: Repository<Review>;

  const mockOrderRepository = {
    createQueryBuilder: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    save: jest.fn(),
    count: jest.fn(),
    delete: jest.fn(),
  };

  const mockReviewRepository = {
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
    reviewRepository = module.get<Repository<Review>>(getRepositoryToken(Review));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getOrderAnalytics', () => {
    it('should correctly aggregate metrics from consolidated queries', async () => {
      const mockStatusMetrics = [
        { status: 'pending', count: '5', sum: '500.00' },
        { status: 'shipped', count: '2', sum: '300.00' },
        { status: 'delivered', count: '3', sum: '450.00' },
      ];

      const mockOrdersByDay = [
        { date: '2026-04-20', count: '3' },
        { date: '2026-04-21', count: '7' },
      ];

      const queryBuilder: any = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn()
          .mockResolvedValueOnce(mockStatusMetrics)
          .mockResolvedValueOnce(mockOrdersByDay),
      };

      mockOrderRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      const result = await service.getOrderAnalytics();

      expect(result.summary.total_orders).toBe(10); // 5 + 2 + 3
      expect(result.summary.revenue).toBe(750); // 300 + 450 (shipped + delivered)
      expect(result.summary.average_order_value).toBe(125); // (500 + 300 + 450) / 10
      expect(result.summary.orders_last_7_days).toBe(10); // 3 + 7
      expect(result.status_breakdown).toEqual({
        pending: 5,
        shipped: 2,
        delivered: 3,
      });
      expect(result.orders_by_day).toHaveLength(2);
      expect(result.orders_by_day[0]).toEqual({ date: '2026-04-20', count: 3 });
    });

    it('should handle empty results gracefully', async () => {
      const queryBuilder: any = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([]),
      };

      mockOrderRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      const result = await service.getOrderAnalytics();

      expect(result.summary.total_orders).toBe(0);
      expect(result.summary.revenue).toBe(0);
      expect(result.summary.average_order_value).toBe(0);
      expect(result.summary.orders_last_7_days).toBe(0);
      expect(result.status_breakdown).toEqual({});
      expect(result.orders_by_day).toEqual([]);
    });
  });

  describe('getAllOrders', () => {
    it('should use getManyAndCount and return paginated data', async () => {
      const mockOrders = [
        { id: '1', total: 100, status: 'pending', user: { email: 'test@example.com' }, items: [] },
      ];
      const mockTotal = 1;

      const queryBuilder: any = {
        where: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([mockOrders, mockTotal]),
      };

      mockOrderRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      const result = await service.getAllOrders({ limit: 10, offset: 0 });

      expect(queryBuilder.getManyAndCount).toHaveBeenCalled();
      expect(result.data).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
      expect(result.data[0].userEmail).toBe('test@example.com');
    });
  });

  describe('getAllReviews', () => {
    it('should use getManyAndCount and whitelist sort fields', async () => {
      const mockReviews = [{ id: 'r1', rating: 5 }];
      const mockTotal = 1;

      const queryBuilder: any = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([mockReviews, mockTotal]),
      };

      mockReviewRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      const result = await service.getAllReviews({ sortBy: 'rating', sortOrder: 'ASC' });

      expect(queryBuilder.getManyAndCount).toHaveBeenCalled();
      expect(queryBuilder.orderBy).toHaveBeenCalledWith('review.rating', 'ASC');
      expect(result.data).toHaveLength(1);
    });

    it('should fall back to default sort if invalid sortBy is provided', async () => {
        const queryBuilder: any = {
          leftJoinAndSelect: jest.fn().mockReturnThis(),
          orderBy: jest.fn().mockReturnThis(),
          skip: jest.fn().mockReturnThis(),
          take: jest.fn().mockReturnThis(),
          getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
        };

        mockReviewRepository.createQueryBuilder.mockReturnValue(queryBuilder);

        await service.getAllReviews({ sortBy: 'invalid' as any });

        expect(queryBuilder.orderBy).toHaveBeenCalledWith('review.createdAt', 'DESC');
      });
  });
});
