import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from './admin.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Order } from '../orders/order.entity';
import { Review } from '../reviews/review.entity';
import { NotFoundException } from '@nestjs/common';

describe('AdminService', () => {
  let service: AdminService;
  let ordersRepository: any;
  let reviewsRepository: any;

  beforeEach(async () => {
    ordersRepository = {
      createQueryBuilder: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      save: jest.fn(),
      count: jest.fn(),
    };

    reviewsRepository = {
      createQueryBuilder: jest.fn(),
      findOne: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        { provide: getRepositoryToken(Order), useValue: ordersRepository },
        { provide: getRepositoryToken(Review), useValue: reviewsRepository },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
  });

  describe('getAllOrders', () => {
    it('should return paginated orders with itemsCount', async () => {
      const mockOrders = [
        { id: '1', total: 100, itemsCount: 2, user: { email: 'test@example.com' } },
      ];
      const mockTotal = 1;

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        loadRelationCountAndMap: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([mockOrders, mockTotal]),
      };

      ordersRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.getAllOrders({});

      expect(result.data[0].itemsCount).toBe(2);
      expect(result.pagination.total).toBe(1);
      expect(mockQueryBuilder.loadRelationCountAndMap).toHaveBeenCalledWith('order.itemsCount', 'order.items');
      expect(mockQueryBuilder.getManyAndCount).toHaveBeenCalled();
    });
  });

  describe('getOrderAnalytics', () => {
    it('should return consolidated analytics', async () => {
      const mockStats = {
        total_orders: '10',
        revenue: '500.50',
        average_order_value: '50.05',
        orders_last_7_days: '5',
      };
      const mockOrdersByDay = [{ date: '2023-01-01', count: '5' }];
      const mockOrdersByStatus = [{ status: 'delivered', count: '10' }];

      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        setParameter: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue(mockStats),
        getRawMany: jest.fn()
          .mockResolvedValueOnce(mockOrdersByDay)
          .mockResolvedValueOnce(mockOrdersByStatus),
      };

      ordersRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.getOrderAnalytics();

      expect(result.summary.total_orders).toBe(10);
      expect(result.summary.revenue).toBe(500.50);
      expect(result.status_breakdown.delivered).toBe(10);
      expect(result.orders_by_day[0].count).toBe(5);
      expect(mockQueryBuilder.getRawOne).toHaveBeenCalled();
      expect(mockQueryBuilder.getRawMany).toHaveBeenCalledTimes(2);
    });
  });
});
