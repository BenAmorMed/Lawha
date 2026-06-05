import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AdminService } from './admin.service';
import { Order } from '../orders/order.entity';
import { Review } from '../reviews/review.entity';
import { Repository } from 'typeorm';

describe('AdminService', () => {
  let service: AdminService;
  let ordersRepository: Repository<Order>;

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
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
    ordersRepository = module.get<Repository<Order>>(getRepositoryToken(Order));
  });

  describe('getOrderAnalytics', () => {
    it('should correctly aggregate metrics in-memory from consolidated query', async () => {
      const mockStatusMetrics = [
        { status: 'shipped', count: '2', revenue: '100.00', averageValue: '50.00' },
        { status: 'pending', count: '1', revenue: '30.00', averageValue: '30.00' },
      ];

      const mockDailyStats = [
        { date: '2026-06-01', count: '3' },
      ];

      const queryBuilder: any = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getRawMany: jest.fn()
          .mockResolvedValueOnce(mockStatusMetrics)
          .mockResolvedValueOnce(mockDailyStats),
      };

      jest.spyOn(ordersRepository, 'createQueryBuilder').mockReturnValue(queryBuilder);

      const result = await service.getOrderAnalytics();

      expect(result.summary.total_orders).toBe(3);
      expect(result.summary.revenue).toBe(100); // Only shipped
      expect(result.summary.average_order_value).toBe(43.33); // (100 + 30) / 3 = 43.333
      expect(result.summary.orders_last_7_days).toBe(3);
      expect(result.status_breakdown).toEqual({ shipped: 2, pending: 1 });
      expect(result.orders_by_day).toEqual([{ date: '2026-06-01', count: 3 }]);
    });
  });

  describe('getAllOrders', () => {
    it('should use getManyAndCount and itemsCount', async () => {
      const mockOrders = [
        { id: '1', status: 'shipped', total: 50, itemsCount: 2, user: { email: 'test@example.com' } },
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

      expect(result.pagination.total).toBe(1);
      expect(result.data[0].itemsCount).toBe(2);
      expect(queryBuilder.loadRelationCountAndMap).toHaveBeenCalledWith('order.itemsCount', 'order.items');
    });
  });
});
