import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminService } from './admin.service';
import { Order, OrderStatus } from '../orders/order.entity';
import { Review } from '../reviews/review.entity';

describe('AdminService', () => {
  let service: AdminService;
  let ordersRepository: Repository<Order>;
  let reviewsRepository: Repository<Review>;

  const mockQueryBuilder = {
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

  const mockOrdersRepository = {
    count: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
  };

  const mockReviewsRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
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
    reviewsRepository = module.get<Repository<Review>>(getRepositoryToken(Review));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getOrderAnalytics', () => {
    it('should return consolidated analytics using exactly 2 database queries', async () => {
      const mockStatusMetrics = [
        { status: 'pending', count: '5', sum: '500.00' },
        { status: 'shipped', count: '3', sum: '300.00' },
        { status: 'delivered', count: '2', sum: '250.00' },
      ];

      const mockOrdersByDay = [
        { date: '2023-10-01', count: '2' },
        { date: '2023-10-02', count: '3' },
      ];

      mockQueryBuilder.getRawMany
        .mockResolvedValueOnce(mockStatusMetrics)
        .mockResolvedValueOnce(mockOrdersByDay);

      const result = await service.getOrderAnalytics();

      expect(mockOrdersRepository.createQueryBuilder).toHaveBeenCalledTimes(2);
      expect(result.summary.total_orders).toBe(10); // 5 + 3 + 2
      expect(result.summary.revenue).toBe(550.0); // 300 + 250 (shipped + delivered)
      expect(result.summary.average_order_value).toBe(105.0); // 1050 / 10
      expect(result.summary.orders_last_7_days).toBe(5); // 2 + 3
      expect(result.status_breakdown.pending).toBe(5);
      expect(result.orders_by_day).toHaveLength(2);
    });
  });

  describe('getAllOrders', () => {
    it('should use getManyAndCount for optimized pagination', async () => {
      const mockOrders = [{ id: '1', user: { email: 'test@example.com' }, items: [] }];
      mockQueryBuilder.getManyAndCount.mockResolvedValueOnce([mockOrders, 1]);

      const result = await service.getAllOrders({});

      expect(mockQueryBuilder.getManyAndCount).toHaveBeenCalled();
      expect(result.pagination.total).toBe(1);
      expect(result.data).toHaveLength(1);
    });
  });

  describe('getAllReviews', () => {
    it('should use getManyAndCount for optimized pagination', async () => {
      const mockReviews = [{ id: '1' }];
      mockQueryBuilder.getManyAndCount.mockResolvedValueOnce([mockReviews, 1]);

      const result = await service.getAllReviews({});

      expect(mockQueryBuilder.getManyAndCount).toHaveBeenCalled();
      expect(result.pagination.total).toBe(1);
      expect(result.data).toHaveLength(1);
    });
  });
});
