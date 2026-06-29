import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AdminService } from './admin.service';
import { Order } from '../orders/order.entity';
import { Review } from '../reviews/review.entity';

describe('AdminService', () => {
  let service: AdminService;
  let ordersRepository: any;
  let reviewsRepository: any;

  const mockOrdersRepository = () => ({
    count: jest.fn(),
    createQueryBuilder: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    save: jest.fn(),
  });

  const mockReviewsRepository = () => ({
    createQueryBuilder: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        { provide: getRepositoryToken(Order), useFactory: mockOrdersRepository },
        { provide: getRepositoryToken(Review), useFactory: mockReviewsRepository },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
    ordersRepository = module.get(getRepositoryToken(Order));
    reviewsRepository = module.get(getRepositoryToken(Review));
  });

  describe('getOrderAnalytics', () => {
    it('should return aggregated analytics data using consolidated queries', async () => {
      // Mock for consolidated status query
      const mockStatusStats = [
        { status: 'pending', count: '10', revenue: '500.00', recent_count: '2' },
        { status: 'shipped', count: '20', revenue: '1000.00', recent_count: '5' },
        { status: 'delivered', count: '70', revenue: '3500.50', recent_count: '8' },
      ];
      const queryBuilderStatus = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        setParameter: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue(mockStatusStats),
      };

      // Mock for ordersByDay query
      const mockOrdersByDay = [
        { date: '2023-10-01', count: '5' },
        { date: '2023-10-02', count: '10' },
      ];
      const queryBuilderByDay = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue(mockOrdersByDay),
      };

      ordersRepository.createQueryBuilder
        .mockReturnValueOnce(queryBuilderStatus)
        .mockReturnValueOnce(queryBuilderByDay);

      const result = await service.getOrderAnalytics();

      // Total orders: 10 + 20 + 70 = 100
      expect(result.summary.total_orders).toBe(100);
      // Revenue (shipped + delivered): 1000 + 3500.5 = 4500.5
      expect(result.summary.revenue).toBe(4500.5);
      // Average: (500 + 1000 + 3500.5) / 100 = 50.005
      expect(result.summary.average_order_value).toBe(50.005);
      // Recent orders: 2 + 5 + 8 = 15
      expect(result.summary.orders_last_7_days).toBe(15);

      expect((result.status_breakdown as any).pending).toBe(10);
      expect((result.status_breakdown as any).shipped).toBe(20);
      expect((result.status_breakdown as any).delivered).toBe(70);

      expect(result.orders_by_day).toHaveLength(2);
      expect(result.orders_by_day[0].count).toBe(5);
    });
  });
});
