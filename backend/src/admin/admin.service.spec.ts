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

  const mockOrdersRepository = {
    createQueryBuilder: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    count: jest.fn(),
    find: jest.fn(),
    delete: jest.fn(),
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
    reviewsRepository = module.get<Repository<Review>>(getRepositoryToken(Review));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getOrderAnalytics', () => {
    it('should consolidate status metrics and calculate summary correctly', async () => {
      const mockStatusMetrics = [
        { status: 'pending_payment', count: '5', sum: '500' },
        { status: 'shipped', count: '2', sum: '200' },
        { status: 'delivered', count: '3', sum: '300' },
      ];

      const mockDailyMetrics = [
        { date: '2025-05-10', count: '3' },
        { date: '2025-05-11', count: '7' },
      ];

      const queryBuilderStatus: any = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue(mockStatusMetrics),
      };

      const queryBuilderDaily: any = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue(mockDailyMetrics),
      };

      mockOrdersRepository.createQueryBuilder
        .mockReturnValueOnce(queryBuilderStatus)
        .mockReturnValueOnce(queryBuilderDaily);

      const result = await service.getOrderAnalytics();

      expect(result.summary.total_orders).toBe(10);
      expect(result.summary.revenue).toBe(500); // 200 + 300
      expect(result.summary.average_order_value).toBe(100); // 1000 / 10
      expect(result.summary.orders_last_7_days).toBe(10);
      expect(result.status_breakdown).toEqual({
        pending_payment: 5,
        shipped: 2,
        delivered: 3,
      });
      expect(result.orders_by_day).toHaveLength(2);
      expect(mockOrdersRepository.createQueryBuilder).toHaveBeenCalledTimes(2);
    });

    it('should handle empty metrics', async () => {
      const queryBuilder: any = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([]),
      };

      mockOrdersRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      const result = await service.getOrderAnalytics();

      expect(result.summary.total_orders).toBe(0);
      expect(result.summary.revenue).toBe(0);
      expect(result.summary.average_order_value).toBe(0);
    });
  });

  describe('getAllOrders', () => {
    it('should use getManyAndCount and return formatted data', async () => {
      const mockOrders = [
        { id: '1', total: 100, status: OrderStatus.SHIPPED, user: { email: 'test@example.com' }, items: [{}, {}] },
      ];
      const mockTotal = 1;

      const queryBuilder: any = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([mockOrders, mockTotal]),
      };

      mockOrdersRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      const result = await service.getAllOrders({ limit: 10, offset: 0 });

      expect(result.data[0].id).toBe('1');
      expect(result.data[0].userEmail).toBe('test@example.com');
      expect(result.data[0].itemsCount).toBe(2);
      expect(result.pagination.total).toBe(1);
      expect(queryBuilder.getManyAndCount).toHaveBeenCalled();
    });
  });
});
