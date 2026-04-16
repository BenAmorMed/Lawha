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
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
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

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getOrderAnalytics', () => {
    it('should consolidate status-based and date-based queries', async () => {
      const mockStatusStats = [
        { status: OrderStatus.PENDING_PAYMENT, count: '5', sum: '100.00' },
        { status: OrderStatus.SHIPPED, count: '2', sum: '50.00' },
        { status: OrderStatus.DELIVERED, count: '3', sum: '150.00' },
      ];

      const mockOrdersByDay = [
        { date: '2023-01-01', count: '2' },
        { date: '2023-01-02', count: '3' },
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

      expect(result.summary.total_orders).toBe(10);
      expect(result.summary.revenue).toBe(200.00); // 50 + 150
      expect(result.summary.average_order_value).toBe(30); // 300 / 10
      expect(result.summary.orders_last_7_days).toBe(5);
      expect(result.status_breakdown[OrderStatus.SHIPPED]).toBe(2);
      expect(result.orders_by_day).toHaveLength(2);
    });
  });

  describe('getAllOrders', () => {
    it('should use getManyAndCount for pagination', async () => {
      const mockOrders = [{ id: '1' }, { id: '2' }];
      const mockTotal = 2;

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

      expect(result.pagination.total).toBe(2);
      expect(result.data).toHaveLength(2);
      expect(mockQueryBuilder.getManyAndCount).toHaveBeenCalled();
    });
  });
});
