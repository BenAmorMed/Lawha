import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AdminService } from './admin.service';
import { Order, OrderStatus } from '../orders/order.entity';
import { Review } from '../reviews/review.entity';
import { Repository } from 'typeorm';

describe('AdminService', () => {
  let service: AdminService;
  let ordersRepository: Repository<Order>;

  const mockOrdersRepository = {
    createQueryBuilder: jest.fn(),
    count: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  };

  const mockReviewsRepository = {
    createQueryBuilder: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: getRepositoryToken(Order),
          useValue: mockOrdersRepository,
        },
        {
          provide: getRepositoryToken(Review),
          useValue: mockReviewsRepository,
        },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
    ordersRepository = module.get<Repository<Order>>(getRepositoryToken(Order));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getOrderAnalytics', () => {
    it('should aggregate analytics correctly from consolidated queries', async () => {
      const mockStatusStats = [
        { status: OrderStatus.SHIPPED, count: '2', total: '100.00', average: '50.00' },
        { status: OrderStatus.DELIVERED, count: '3', total: '150.00', average: '50.00' },
        { status: OrderStatus.PROCESSING, count: '1', total: '50.00', average: '50.00' },
      ];

      const mockOrdersByDay = [
        { date: '2025-05-14', count: '4' },
        { date: '2025-05-13', count: '2' },
      ];

      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn(),
      };

      mockOrdersRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.getRawMany
        .mockResolvedValueOnce(mockStatusStats) // First call: status stats
        .mockResolvedValueOnce(mockOrdersByDay); // Second call: orders by day

      const result = await service.getOrderAnalytics();

      // Verify calculations
      expect(result.summary.total_orders).toBe(6);
      expect(result.summary.revenue).toBe(250.00); // 100 + 150
      expect(result.summary.average_order_value).toBe(50.00); // 300 / 6
      expect(result.summary.orders_last_7_days).toBe(6); // 4 + 2

      expect(result.status_breakdown).toEqual({
        [OrderStatus.SHIPPED]: 2,
        [OrderStatus.DELIVERED]: 3,
        [OrderStatus.PROCESSING]: 1,
      });

      expect(result.orders_by_day).toHaveLength(2);
      expect(result.orders_by_day[0]).toEqual({ date: '2025-05-14', count: 4 });

      expect(mockOrdersRepository.createQueryBuilder).toHaveBeenCalledTimes(2);
    });

    it('should handle empty results', async () => {
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn(),
      };

      mockOrdersRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.getRawMany
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);

      const result = await service.getOrderAnalytics();

      expect(result.summary.total_orders).toBe(0);
      expect(result.summary.revenue).toBe(0);
      expect(result.summary.average_order_value).toBe(0);
      expect(result.summary.orders_last_7_days).toBe(0);
      expect(result.status_breakdown).toEqual({});
      expect(result.orders_by_day).toEqual([]);
    });
  });
});
