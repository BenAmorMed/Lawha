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

  const mockOrdersRepository = {
    createQueryBuilder: jest.fn(),
  };

  const mockReviewsRepository = {
    createQueryBuilder: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
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

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAllOrders', () => {
    it('should return paginated orders and total count in one query', async () => {
      const mockOrders = [{ id: '1', total: 100 }];
      const mockTotal = 1;

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([mockOrders, mockTotal]),
      };

      mockOrdersRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.getAllOrders({});

      expect(result.data).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
      expect(mockQueryBuilder.getManyAndCount).toHaveBeenCalled();
    });
  });

  describe('getOrderAnalytics', () => {
    it('should return consolidated analytics using two queries', async () => {
      const mockStatusStats = [
        { status: 'pending_payment', count: '5', sum: '500' },
        { status: 'delivered', count: '10', sum: '1000' },
      ];

      const mockOrdersByDay = [
        { date: '2023-01-01', count: '3' },
        { date: '2023-01-02', count: '12' },
      ];

      const mockQueryBuilderStatus = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue(mockStatusStats),
      };

      const mockQueryBuilderDay = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue(mockOrdersByDay),
      };

      mockOrdersRepository.createQueryBuilder
        .mockReturnValueOnce(mockQueryBuilderStatus)
        .mockReturnValueOnce(mockQueryBuilderDay);

      const result = await service.getOrderAnalytics();

      expect(result.summary.total_orders).toBe(15);
      expect(result.summary.revenue).toBe(1000);
      expect(result.summary.average_order_value).toBe(100);
      expect(result.summary.orders_last_7_days).toBe(15);
      expect((result.status_breakdown as any).delivered).toBe(10);
      expect(result.orders_by_day).toHaveLength(2);

      expect(mockOrdersRepository.createQueryBuilder).toHaveBeenCalledTimes(2);
    });
  });
});
