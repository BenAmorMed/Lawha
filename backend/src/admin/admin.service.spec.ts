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
    it('should correctly calculate summary from global stats', async () => {
      const mockGlobalStats = [
        { status: 'shipped', count: '5', sum: '500' },
        { status: 'delivered', count: '10', sum: '1000' },
        { status: 'pending_payment', count: '5', sum: '500' },
      ];

      const mockOrdersByDay = [
        { date: '2023-01-01', count: '10' },
        { date: '2023-01-02', count: '10' },
      ];

      const queryBuilder: any = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn()
          .mockResolvedValueOnce(mockGlobalStats)
          .mockResolvedValueOnce(mockOrdersByDay),
      };

      jest.spyOn(ordersRepository, 'createQueryBuilder').mockReturnValue(queryBuilder);

      const result = await service.getOrderAnalytics();

      expect(result.summary.total_orders).toBe(20);
      expect(result.summary.revenue).toBe(1500);
      expect(result.summary.average_order_value).toBe(100);
      expect(result.summary.orders_last_7_days).toBe(20);
      expect(result.status_breakdown).toEqual({
        shipped: 5,
        delivered: 10,
        pending_payment: 5,
      });
    });
  });

  describe('getAllOrders', () => {
    it('should use loadRelationCountAndMap and return itemsCount', async () => {
      const mockOrders = [
        { id: '1', itemsCount: 3, user: { email: 'test@example.com' }, createdAt: new Date() },
      ];
      const mockTotal = 1;

      const queryBuilder: any = {
        where: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        loadRelationCountAndMap: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([mockOrders, mockTotal]),
      };

      jest.spyOn(ordersRepository, 'createQueryBuilder').mockReturnValue(queryBuilder);

      const result = await service.getAllOrders({});

      expect(result.data[0].itemsCount).toBe(3);
      expect(result.pagination.total).toBe(1);
      expect(queryBuilder.loadRelationCountAndMap).toHaveBeenCalledWith('order.itemsCount', 'order.items');
    });
  });
});
