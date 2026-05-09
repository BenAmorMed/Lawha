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
          },
        },
        {
          provide: getRepositoryToken(Review),
          useValue: {
            createQueryBuilder: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
    ordersRepository = module.get<Repository<Order>>(getRepositoryToken(Order));
    reviewsRepository = module.get<Repository<Review>>(getRepositoryToken(Review));
  });

  describe('getOrderAnalytics', () => {
    it('should correctly calculate analytics from 2 queries', async () => {
      const mockStatusStats = [
        { status: 'pending_payment', count: '5', statusSum: '500' },
        { status: 'shipped', count: '2', statusSum: '200' },
        { status: 'delivered', count: '3', statusSum: '300' },
      ];

      const mockDayStats = [
        { date: '2023-01-01', count: '10' },
      ];

      const statusQueryBuilder: any = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue(mockStatusStats),
      };

      const dayQueryBuilder: any = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue(mockDayStats),
      };

      jest.spyOn(ordersRepository, 'createQueryBuilder')
        .mockReturnValueOnce(statusQueryBuilder)
        .mockReturnValueOnce(dayQueryBuilder);

      const result = await service.getOrderAnalytics();

      expect(result.summary.total_orders).toBe(10);
      expect(result.summary.revenue).toBe(500); // 200 + 300
      expect(result.summary.average_order_value).toBe(100); // 1000 / 10
      expect(result.summary.orders_last_7_days).toBe(10);
      expect(result.status_breakdown).toEqual({
        'pending_payment': 5,
        'shipped': 2,
        'delivered': 3,
      });
      expect(result.orders_by_day[0].count).toBe(10);

      // Verify exactly 2 queries were made
      expect(ordersRepository.createQueryBuilder).toHaveBeenCalledTimes(2);
    });
  });

  describe('getAllOrders', () => {
    it('should use getManyAndCount and loadRelationCountAndMap', async () => {
      const mockOrders = [{ id: '1', itemsCount: 2 }];
      const mockTotal = 1;

      const queryBuilder: any = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        loadRelationCountAndMap: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([mockOrders, mockTotal]),
      };

      jest.spyOn(ordersRepository, 'createQueryBuilder').mockReturnValue(queryBuilder);

      const result = await service.getAllOrders({});

      expect(queryBuilder.loadRelationCountAndMap).toHaveBeenCalledWith('order.itemsCount', 'order.items');
      expect(queryBuilder.getManyAndCount).toHaveBeenCalled();
      expect(result.data[0].itemsCount).toBe(2);
      expect(result.pagination.total).toBe(1);
    });
  });
});
