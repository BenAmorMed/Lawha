import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AdminService } from './admin.service';
import { Order, OrderStatus } from '../orders/order.entity';
import { Review } from '../reviews/review.entity';
import { Repository } from 'typeorm';

describe('AdminService', () => {
  let service: AdminService;
  let orderRepository: Repository<Order>;
  let reviewRepository: Repository<Review>;

  const mockOrderRepository = {
    count: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockReviewRepository = {
    findOne: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(),
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
    it('should return correct analytics data', async () => {
      const mockStatusStats = [
        { status: 'pending', count: '5', sum: '250.00' },
        { status: 'shipped', count: '10', sum: '500.00' },
        { status: 'delivered', count: '15', sum: '750.50' },
      ];
      const mockOrdersByDay = [
        { date: '2023-05-01', count: '10' },
        { date: '2023-05-02', count: '10' },
      ];

      const createQueryBuilderMock = (data: any) => ({
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue(data),
      });

      mockOrderRepository.createQueryBuilder
        .mockReturnValueOnce(createQueryBuilderMock(mockStatusStats)) // statsByStatus
        .mockReturnValueOnce(createQueryBuilderMock(mockOrdersByDay)); // ordersByDay

      const result = await service.getOrderAnalytics();

      expect(result.summary.total_orders).toBe(30);
      expect(result.summary.revenue).toBe(1250.50); // shipped (500) + delivered (750.50)
      expect(result.summary.average_order_value).toBeCloseTo(1500.50 / 30, 2);
      expect(result.summary.orders_last_7_days).toBe(20);
      expect(result.status_breakdown).toEqual({
        pending: 5,
        shipped: 10,
        delivered: 15,
      });
      expect(result.orders_by_day).toHaveLength(2);
      expect(result.orders_by_day[0]).toEqual({ date: '2023-05-01', count: 10 });
    });
  });
});
