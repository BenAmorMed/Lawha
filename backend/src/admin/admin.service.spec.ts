import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminService } from './admin.service';
import { Order } from '../orders/order.entity';
import { Review } from '../reviews/review.entity';

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
    it('should correctly aggregate analytics from consolidated queries', async () => {
      const mockStats = [
        { status: 'shipped', count: '5', totalAmount: '500', averageAmount: '100' },
        { status: 'delivered', count: '10', totalAmount: '1500', averageAmount: '150' },
        { status: 'pending', count: '2', totalAmount: '100', averageAmount: '50' },
      ];

      const mockOrdersByDay = [
        { date: '2025-01-01', count: '3' },
        { date: '2025-01-02', count: '4' },
      ];

      const mockQueryBuilder: any = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn(),
      };

      jest.spyOn(ordersRepository, 'createQueryBuilder').mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.getRawMany
        .mockResolvedValueOnce(mockStats)
        .mockResolvedValueOnce(mockOrdersByDay);

      const result = await service.getOrderAnalytics();

      expect(result.summary.total_orders).toBe(17);
      expect(result.summary.revenue).toBe(2000);
      expect(result.summary.average_order_value).toBe(2100 / 17);
      expect(result.summary.orders_last_7_days).toBe(7);
      expect((result.status_breakdown as any).shipped).toBe(5);
      expect((result.status_breakdown as any).delivered).toBe(10);
      expect((result.status_breakdown as any).pending).toBe(2);
      expect(result.orders_by_day).toHaveLength(2);
      expect(result.orders_by_day[0].count).toBe(3);
    });

    it('should handle empty states correctly', async () => {
      const mockQueryBuilder: any = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([]),
      };

      jest.spyOn(ordersRepository, 'createQueryBuilder').mockReturnValue(mockQueryBuilder);

      const result = await service.getOrderAnalytics();

      expect(result.summary.total_orders).toBe(0);
      expect(result.summary.revenue).toBe(0);
      expect(result.summary.average_order_value).toBe(0);
      expect(result.summary.orders_last_7_days).toBe(0);
    });
  });

  describe('getAllOrders', () => {
    it('should use getManyAndCount and itemsCount virtual property', async () => {
      const mockOrders = [
        { id: '1', total: 100, itemsCount: 3, user: { email: 'test@example.com' } },
        { id: '2', total: 200, itemsCount: 1, user: { email: 'test2@example.com' } },
      ];

      const mockQueryBuilder: any = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        loadRelationCountAndMap: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([mockOrders, 2]),
      };

      jest.spyOn(ordersRepository, 'createQueryBuilder').mockReturnValue(mockQueryBuilder);

      const result = await service.getAllOrders({});

      expect(result.data).toHaveLength(2);
      expect(result.data[0].itemsCount).toBe(3);
      expect(result.pagination.total).toBe(2);
      expect(mockQueryBuilder.loadRelationCountAndMap).toHaveBeenCalledWith('order.itemsCount', 'order.items');
    });
  });
});
