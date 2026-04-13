import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AdminService } from './admin.service';
import { Order, OrderStatus } from '../orders/order.entity';
import { Review } from '../reviews/review.entity';
import { Repository } from 'typeorm';

describe('AdminService', () => {
  let service: AdminService;
  let ordersRepository: Repository<Order>;
  let reviewsRepository: Repository<Review>;

  const mockOrdersRepository = {
    createQueryBuilder: jest.fn(),
    count: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
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

  describe('getAllOrders', () => {
    it('should return paginated orders with total count', async () => {
      const mockOrders = [
        { id: '1', status: OrderStatus.PENDING_PAYMENT, total: 100, items: [] },
        { id: '2', status: OrderStatus.SHIPPED, total: 200, items: [] },
      ];
      const mockTotal = 2;

      const queryBuilder: any = {
        where: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([mockOrders, mockTotal]),
      };

      mockOrdersRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      const result = await service.getAllOrders({ limit: 10, offset: 0 });

      expect(result.data).toHaveLength(2);
      expect(result.pagination.total).toBe(2);
      expect(mockOrdersRepository.createQueryBuilder).toHaveBeenCalledWith('order');
    });
  });

  describe('getOrderAnalytics', () => {
    it('should return correctly calculated analytics', async () => {
      mockOrdersRepository.count.mockResolvedValue(10);

      const statusBreakdown = [
        { status: 'pending_payment', count: '5', sum: '250.25' },
        { status: 'shipped', count: '3', sum: '150.15' },
        { status: 'delivered', count: '2', sum: '100.10' },
      ];

      const dailyOrders = [
        { date: '2023-01-01', count: '2' },
        { date: '2023-01-02', count: '2' },
      ];

      const queryBuilder: any = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValueOnce(statusBreakdown).mockResolvedValueOnce(dailyOrders),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
      };

      mockOrdersRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      const result = await service.getOrderAnalytics();

      expect(result.summary.total_orders).toBe(10);
      expect(result.summary.revenue).toBe(250.25);
      expect(result.summary.average_order_value).toBe(50.05);
      expect(result.summary.orders_last_7_days).toBe(4);
      expect((result.status_breakdown as any).shipped).toBe(3);
      expect(result.orders_by_day).toHaveLength(2);
    });
  });
});
