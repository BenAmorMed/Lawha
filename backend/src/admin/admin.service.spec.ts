import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AdminService } from './admin.service';
import { Order } from '../orders/order.entity';
import { Review } from '../reviews/review.entity';

describe('AdminService (Performance Optimization)', () => {
  let service: AdminService;
  let orderRepository;

  beforeEach(async () => {
    orderRepository = {
      createQueryBuilder: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: getRepositoryToken(Order),
          useValue: orderRepository,
        },
        {
          provide: getRepositoryToken(Review),
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
  });

  describe('getOrderAnalytics', () => {
    it('should correctly aggregate metrics with reduced queries', async () => {
      const mockStatsByStatus = [
        { status: 'pending_payment', count: '5', total: '500.00' },
        { status: 'shipped', count: '10', total: '1500.00' },
        { status: 'delivered', count: '15', total: '2250.00' },
      ];

      const mockOrdersByDay = [
        { date: '2025-05-14', count: '10' },
        { date: '2025-05-13', count: '20' },
      ];

      const queryBuilder1 = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue(mockStatsByStatus),
      };

      const queryBuilder2 = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue(mockOrdersByDay),
      };

      orderRepository.createQueryBuilder
        .mockReturnValueOnce(queryBuilder1)
        .mockReturnValueOnce(queryBuilder2);

      const result = await service.getOrderAnalytics();

      expect(orderRepository.createQueryBuilder).toHaveBeenCalledTimes(2);
      expect(result.summary.total_orders).toBe(30);
      expect(result.summary.revenue).toBe(3750);
      expect(result.summary.average_order_value).toBe(141.67);
      expect(result.summary.orders_last_7_days).toBe(30);
      expect(result.status_breakdown['shipped']).toBe(10);
      expect(result.orders_by_day).toHaveLength(2);
    });
  });
});
