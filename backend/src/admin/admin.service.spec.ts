import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AdminService } from './admin.service';
import { Order } from '../orders/order.entity';
import { Review } from '../reviews/review.entity';

describe('AdminService', () => {
  let service: AdminService;
  let ordersRepository;
  let reviewsRepository;

  beforeEach(async () => {
    const mockQueryBuilder = {
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      getRawMany: jest.fn(),
      getManyAndCount: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: getRepositoryToken(Order),
          useValue: {
            createQueryBuilder: jest.fn(() => mockQueryBuilder),
            findOne: jest.fn(),
            save: jest.fn(),
            count: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Review),
          useValue: {
            createQueryBuilder: jest.fn(() => mockQueryBuilder),
            findOne: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
    ordersRepository = module.get(getRepositoryToken(Order));
    reviewsRepository = module.get(getRepositoryToken(Review));
  });

  describe('getOrderAnalytics', () => {
    it('should correctly calculate analytics from grouped database results', async () => {
      const mockStatusStats = [
        { status: 'pending', count: '5', sum: '500' },
        { status: 'shipped', count: '2', sum: '200' },
        { status: 'delivered', count: '3', sum: '300' },
      ];
      const mockOrdersByDay = [
        { date: '2023-01-01', count: '5' },
        { date: '2023-01-02', count: '5' },
      ];

      const queryBuilder = ordersRepository.createQueryBuilder();
      queryBuilder.getRawMany
        .mockResolvedValueOnce(mockStatusStats)
        .mockResolvedValueOnce(mockOrdersByDay);

      const result = await service.getOrderAnalytics();

      expect(result.summary.total_orders).toBe(10);
      expect(result.summary.revenue).toBe(500); // shipped (200) + delivered (300)
      expect(result.summary.average_order_value).toBe(100); // 1000 / 10
      expect(result.summary.orders_last_7_days).toBe(10);
      expect(result.status_breakdown['pending']).toBe(5);
      expect(result.orders_by_day).toHaveLength(2);
    });

    it('should handle empty results gracefully', async () => {
      const queryBuilder = ordersRepository.createQueryBuilder();
      queryBuilder.getRawMany.mockResolvedValue([]);

      const result = await service.getOrderAnalytics();

      expect(result.summary.total_orders).toBe(0);
      expect(result.summary.revenue).toBe(0);
      expect(result.summary.average_order_value).toBe(0);
      expect(result.summary.orders_last_7_days).toBe(0);
    });
  });

  describe('getAllOrders', () => {
    it('should use getManyAndCount for pagination', async () => {
      const mockOrders = [{ id: '1' }, { id: '2' }];
      const mockTotal = 2;

      const queryBuilder = ordersRepository.createQueryBuilder();
      queryBuilder.getManyAndCount.mockResolvedValue([mockOrders, mockTotal]);

      const result = await service.getAllOrders({ limit: 10, offset: 0 });

      expect(queryBuilder.getManyAndCount).toHaveBeenCalled();
      expect(result.data).toHaveLength(2);
      expect(result.pagination.total).toBe(2);
    });
  });

  describe('getAllReviews', () => {
    it('should use getManyAndCount for pagination', async () => {
      const mockReviews = [{ id: '1' }];
      const mockTotal = 1;

      const queryBuilder = reviewsRepository.createQueryBuilder();
      queryBuilder.getManyAndCount.mockResolvedValue([mockReviews, mockTotal]);

      const result = await service.getAllReviews({ limit: 10, offset: 0 });

      expect(queryBuilder.getManyAndCount).toHaveBeenCalled();
      expect(result.data).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
    });
  });
});
