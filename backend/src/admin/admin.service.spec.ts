import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AdminService } from './admin.service';
import { Order, OrderStatus } from '../orders/order.entity';
import { Review } from '../reviews/review.entity';
import { NotFoundException } from '@nestjs/common';

describe('AdminService', () => {
  let service: AdminService;
  let ordersRepository;
  let reviewsRepository;

  const mockQueryBuilder = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    loadRelationCountAndMap: jest.fn().mockReturnThis(),
    getRawMany: jest.fn(),
    getManyAndCount: jest.fn(),
    getCount: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: getRepositoryToken(Order),
          useValue: {
            createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
            findOne: jest.fn(),
            save: jest.fn(),
            count: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Review),
          useValue: {
            createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
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

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getOrderAnalytics', () => {
    it('should return consolidated analytics correctly', async () => {
      const mockStatusStats = [
        { status: 'pending_payment', count: '5', sum: '500.00' },
        { status: 'shipped', count: '2', sum: '300.00' },
        { status: 'delivered', count: '3', sum: '450.00' },
      ];

      const mockOrdersByDay = [
        { date: '2023-01-01', count: '2' },
        { date: '2023-01-02', count: '3' },
      ];

      mockQueryBuilder.getRawMany
        .mockResolvedValueOnce(mockStatusStats) // First call for status stats
        .mockResolvedValueOnce(mockOrdersByDay); // Second call for daily stats

      const result = await service.getOrderAnalytics();

      expect(result.summary.total_orders).toBe(10);
      expect(result.summary.revenue).toBe(750.00); // 300 + 450
      expect(result.summary.average_order_value).toBe(125.00); // 1250 / 10
      expect(result.summary.orders_last_7_days).toBe(5);
      expect(result.status_breakdown['pending_payment']).toBe(5);
      expect(result.orders_by_day).toHaveLength(2);
      expect(result.orders_by_day[0].count).toBe(2);
    });
  });

  describe('getAllOrders', () => {
    it('should return paginated orders with itemsCount', async () => {
      const mockOrders = [
        { id: '1', status: 'shipped', total: 100, itemsCount: 2, user: { email: 'test@example.com' } },
        { id: '2', status: 'pending', total: 50, itemsCount: 1, user: { email: 'test2@example.com' } },
      ];
      mockQueryBuilder.getManyAndCount.mockResolvedValue([mockOrders, 2]);

      const result = await service.getAllOrders({ limit: 10, offset: 0 });

      expect(result.data).toHaveLength(2);
      expect(result.data[0].itemsCount).toBe(2);
      expect(result.pagination.total).toBe(2);
      expect(mockQueryBuilder.loadRelationCountAndMap).toHaveBeenCalledWith('order.itemsCount', 'order.items');
    });
  });

  describe('getAllReviews', () => {
    it('should return paginated reviews', async () => {
      const mockReviews = [
        { id: '1', rating: 5, comment: 'Great!' },
        { id: '2', rating: 4, comment: 'Good' },
      ];
      mockQueryBuilder.getManyAndCount.mockResolvedValue([mockReviews, 2]);

      const result = await service.getAllReviews({ limit: 10, offset: 0 });

      expect(result.data).toHaveLength(2);
      expect(result.pagination.total).toBe(2);
      expect(mockQueryBuilder.getManyAndCount).toHaveBeenCalled();
    });
  });
});
