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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: getRepositoryToken(Order),
          useValue: {
            createQueryBuilder: jest.fn(),
            count: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
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
    it('should return aggregated analytics', async () => {
      const statusStats = [
        { status: 'delivered', count: '5', totalRevenue: '500.00' },
        { status: 'shipped', count: '3', totalRevenue: '300.00' },
        { status: 'pending', count: '2', totalRevenue: '200.00' },
      ];

      const dayStats = [
        { date: '2023-01-01', count: '5' }
      ];

      const queryBuilder: any = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn()
          .mockResolvedValueOnce(statusStats)
          .mockResolvedValueOnce(dayStats),
      };

      jest.spyOn(ordersRepository, 'createQueryBuilder').mockReturnValue(queryBuilder);

      const result = await service.getOrderAnalytics();

      expect(result.summary.total_orders).toBe(10);
      expect(result.summary.revenue).toBe(800); // delivered (500) + shipped (300)
      expect(result.summary.average_order_value).toBe(100); // 1000 / 10
      expect(result.status_breakdown).toEqual({
        delivered: 5,
        shipped: 3,
        pending: 2,
      });
      expect(result.summary.orders_last_7_days).toBe(5);
      expect(result.orders_by_day).toHaveLength(1);
    });
  });

  describe('getAllOrders', () => {
    it('should return paginated orders', async () => {
      const mockOrders = [{ id: '1', total: 100, status: 'pending' }];
      const mockTotal = 1;

      const queryBuilder: any = {
        where: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([mockOrders, mockTotal]),
      };

      jest.spyOn(ordersRepository, 'createQueryBuilder').mockReturnValue(queryBuilder);

      const result = await service.getAllOrders({});

      expect(result.data).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
    });
  });

  describe('getAllReviews', () => {
    it('should return paginated reviews', async () => {
      const mockReviews = [{ id: '1', rating: 5 }];
      const mockTotal = 1;

      const queryBuilder: any = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([mockReviews, mockTotal]),
      };

      jest.spyOn(reviewsRepository, 'createQueryBuilder').mockReturnValue(queryBuilder);

      const result = await service.getAllReviews({});

      expect(result.data).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
    });
  });
});
