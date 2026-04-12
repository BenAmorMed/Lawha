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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: getRepositoryToken(Order),
          useValue: {
            createQueryBuilder: jest.fn(),
            count: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Review),
          useValue: {
            createQueryBuilder: jest.fn(),
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

  describe('getOrderAnalytics', () => {
    it('should return correct analytics summary', async () => {
      const mockStatusMetrics = [
        { status: 'pending_payment', count: '5', total_revenue: '250', avg_value: '50' },
        { status: 'shipped', count: '2', total_revenue: '100', avg_value: '50' },
        { status: 'delivered', count: '3', total_revenue: '150', avg_value: '50' },
      ];
      const mockOrdersByDay = [
        { date: '2024-05-14', count: '2' },
        { date: '2024-05-15', count: '1' },
      ];

      const queryBuilder: any = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn(),
      };

      jest.spyOn(ordersRepository, 'createQueryBuilder').mockReturnValue(queryBuilder);

      queryBuilder.getRawMany
        .mockResolvedValueOnce(mockStatusMetrics) // for Query 1
        .mockResolvedValueOnce(mockOrdersByDay); // for Query 2

      const result = await service.getOrderAnalytics();

      expect(result.summary.total_orders).toBe(10);
      expect(result.summary.revenue).toBe(250); // shipped (100) + delivered (150)
      expect(result.summary.average_order_value).toBe(50); // 500 total / 10 orders
      expect(result.summary.orders_last_7_days).toBe(3);
      expect(result.status_breakdown['shipped']).toBe(2);
      expect(result.orders_by_day).toHaveLength(2);
    });
  });

  describe('getAllOrders', () => {
    it('should return paginated orders', async () => {
      const mockOrders = [{ id: 'order-1', user: { email: 'user@example.com' }, items: [] }];
      const queryBuilder: any = {
        where: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([mockOrders, 1]),
      };

      jest.spyOn(ordersRepository, 'createQueryBuilder').mockReturnValue(queryBuilder);

      const result = await service.getAllOrders({});

      expect(result.data).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
      expect(queryBuilder.getManyAndCount).toHaveBeenCalled();
    });
  });

  describe('getAllReviews', () => {
    it('should return paginated reviews', async () => {
      const mockReviews = [{ id: 'review-1', user: {}, product: {} }];
      const queryBuilder: any = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([mockReviews, 1]),
      };

      jest.spyOn(reviewsRepository, 'createQueryBuilder').mockReturnValue(queryBuilder);

      const result = await service.getAllReviews({});

      expect(result.data).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
      expect(queryBuilder.getManyAndCount).toHaveBeenCalled();
    });
  });
});
