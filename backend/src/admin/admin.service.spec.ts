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
            find: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
            count: jest.fn(),
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
    it('should correctly calculate metrics from consolidated queries', async () => {
      const mockStatusMetrics = [
        { status: 'shipped', count: '2', total_sum: '100.00' },
        { status: 'delivered', count: '1', total_sum: '50.00' },
        { status: 'pending_payment', count: '1', total_sum: '25.00' },
      ];

      const mockDailyDistribution = [
        { date: '2023-01-01', count: '2' },
        { date: '2023-01-02', count: '2' },
      ];

      const statusQueryBuilder: any = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue(mockStatusMetrics),
      };

      const dailyQueryBuilder: any = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue(mockDailyDistribution),
      };

      jest.spyOn(ordersRepository, 'createQueryBuilder')
        .mockReturnValueOnce(statusQueryBuilder)
        .mockReturnValueOnce(dailyQueryBuilder);

      const result = await service.getOrderAnalytics();

      expect(result.summary.total_orders).toBe(4);
      expect(result.summary.revenue).toBe(150.00);
      expect(result.summary.average_order_value).toBe(175 / 4);
      expect(result.summary.orders_last_7_days).toBe(4);
      expect(result.status_breakdown).toEqual({
        shipped: 2,
        delivered: 1,
        pending_payment: 1,
      });
    });
  });

  describe('getAllOrders', () => {
    it('should use getManyAndCount', async () => {
      const mockOrders = [{ id: '1' }];
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

      expect(result.pagination.total).toBe(1);
      expect(result.data).toHaveLength(1);
      expect(queryBuilder.getManyAndCount).toHaveBeenCalled();
    });
  });

  describe('getAllReviews', () => {
    it('should use getManyAndCount', async () => {
      const mockReviews = [{ id: '1' }];
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

      expect(result.pagination.total).toBe(1);
      expect(result.data).toHaveLength(1);
      expect(queryBuilder.getManyAndCount).toHaveBeenCalled();
    });
  });
});
