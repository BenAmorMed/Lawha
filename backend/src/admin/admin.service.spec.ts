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
    it('should correctly calculate summary and breakdown from status stats', async () => {
      const mockStatusStats = [
        { status: 'delivered', count: '2', sum: '200.00' },
        { status: 'shipped', count: '1', sum: '50.00' },
        { status: 'pending_payment', count: '1', sum: '30.00' },
      ];

      const mockOrdersByDay = [
        { date: '2023-01-01', count: '2' },
        { date: '2023-01-02', count: '2' },
      ];

      const queryBuilder: any = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getRawMany: jest.fn()
          .mockResolvedValueOnce(mockStatusStats) // First call for status stats
          .mockResolvedValueOnce(mockOrdersByDay), // Second call for daily stats
      };

      jest.spyOn(ordersRepository, 'createQueryBuilder').mockReturnValue(queryBuilder);

      const result = await service.getOrderAnalytics();

      // Summary checks
      expect(result.summary.total_orders).toBe(4);
      expect(result.summary.revenue).toBe(250.00); // 200 + 50
      expect(result.summary.average_order_value).toBe(70.00); // (200 + 50 + 30) / 4 = 280 / 4 = 70
      expect(result.summary.orders_last_7_days).toBe(4); // 2 + 2

      // Breakdown checks
      expect(result.status_breakdown['delivered']).toBe(2);
      expect(result.status_breakdown['shipped']).toBe(1);
      expect(result.status_breakdown['pending_payment']).toBe(1);

      // Daily stats checks
      expect(result.orders_by_day).toHaveLength(2);
      expect(result.orders_by_day[0].count).toBe(2);
    });

    it('should handle zero orders gracefully', async () => {
      const queryBuilder: any = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([]),
      };

      jest.spyOn(ordersRepository, 'createQueryBuilder').mockReturnValue(queryBuilder);

      const result = await service.getOrderAnalytics();

      expect(result.summary.total_orders).toBe(0);
      expect(result.summary.revenue).toBe(0);
      expect(result.summary.average_order_value).toBe(0);
      expect(result.summary.orders_last_7_days).toBe(0);
      expect(result.status_breakdown).toEqual({});
      expect(result.orders_by_day).toEqual([]);
    });
  });

  describe('getAllOrders', () => {
    it('should use getManyAndCount and apply sorting', async () => {
      const mockOrders = [{ id: '1', total: 100 }];
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

      const result = await service.getAllOrders({ sortBy: 'total', sortOrder: 'ASC' });

      expect(queryBuilder.getManyAndCount).toHaveBeenCalled();
      expect(queryBuilder.orderBy).toHaveBeenCalledWith('order.total', 'ASC');
      expect(result.pagination.total).toBe(1);
      expect(result.data).toHaveLength(1);
    });

    it('should default to createdAt DESC for invalid sortBy', async () => {
      const queryBuilder: any = {
        where: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      };

      jest.spyOn(ordersRepository, 'createQueryBuilder').mockReturnValue(queryBuilder);

      // @ts-ignore
      await service.getAllOrders({ sortBy: 'invalid_field' });

      expect(queryBuilder.orderBy).toHaveBeenCalledWith('order.createdAt', 'DESC');
    });
  });
});
