import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminService } from './admin.service';
import { Order } from '../orders/order.entity';
import { Review } from '../reviews/review.entity';

describe('AdminService', () => {
  let service: AdminService;
  let ordersRepository: Repository<Order>;
  let reviewsRepository: Repository<Review>;

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
    reviewsRepository = module.get<Repository<Review>>(getRepositoryToken(Review));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getOrderAnalytics', () => {
    it('should gather analytics using only 2 queries and return correct data', async () => {
      const mockQueryBuilder: any = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn(),
      };

      mockOrdersRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      // Query 1: statusAggregates
      mockQueryBuilder.getRawMany.mockResolvedValueOnce([
        { status: 'shipped', count: '40', sum: '2000.00' },
        { status: 'delivered', count: '50', sum: '2500.50' },
        { status: 'pending', count: '10', sum: '500.00' },
      ]);

      // Query 2: ordersByDay
      mockQueryBuilder.getRawMany.mockResolvedValueOnce([
        { date: '2023-01-01', count: '5' },
        { date: '2023-01-02', count: '15' },
      ]);

      const result = await service.getOrderAnalytics();

      expect(result).toEqual({
        summary: {
          total_orders: 100,
          revenue: 4500.50,
          average_order_value: 50.005, // 5000.50 / 100
          orders_last_7_days: 20,
        },
        status_breakdown: {
          shipped: 40,
          delivered: 50,
          pending: 10,
        },
        orders_by_day: [
          { date: '2023-01-01', count: 5 },
          { date: '2023-01-02', count: 15 },
        ],
      });

      // Verify ONLY 2 interactions with createQueryBuilder and 0 with count()
      expect(mockOrdersRepository.count).not.toHaveBeenCalled();
      expect(mockOrdersRepository.createQueryBuilder).toHaveBeenCalledTimes(2);
    });

    it('should handle zero orders gracefully', async () => {
        const mockQueryBuilder: any = {
          select: jest.fn().mockReturnThis(),
          addSelect: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          groupBy: jest.fn().mockReturnThis(),
          orderBy: jest.fn().mockReturnThis(),
          getRawMany: jest.fn(),
        };

        mockOrdersRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

        mockQueryBuilder.getRawMany.mockResolvedValueOnce([]); // No status aggregates
        mockQueryBuilder.getRawMany.mockResolvedValueOnce([]); // No orders by day

        const result = await service.getOrderAnalytics();

        expect(result).toEqual({
          summary: {
            total_orders: 0,
            revenue: 0,
            average_order_value: 0,
            orders_last_7_days: 0,
          },
          status_breakdown: {},
          orders_by_day: [],
        });
      });
  });
});
