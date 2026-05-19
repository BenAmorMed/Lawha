import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AdminService } from './admin.service';
import { Order } from '../orders/order.entity';
import { Review } from '../reviews/review.entity';
import { Repository } from 'typeorm';

describe('AdminService', () => {
  let service: AdminService;
  let ordersRepository: Repository<Order>;

  const mockOrdersRepository = {
    count: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockReviewsRepository = {
    findOne: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(),
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

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getOrderAnalytics', () => {
    it('should return consolidated analytics', async () => {
      const mockStatusStats = [
        { status: 'pending', count: '5', totalSum: '250.10' },
        { status: 'shipped', count: '10', totalSum: '500.20' },
        { status: 'delivered', count: '15', totalSum: '1000.30' },
      ];

      const mockOrdersByDay = [
        { date: '2023-05-01', count: '10' },
        { date: '2023-05-02', count: '10' },
      ];

      // Mock sequence of createQueryBuilder calls
      const queryBuilder: any = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn(),
      };

      mockOrdersRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      queryBuilder.getRawMany
        .mockResolvedValueOnce(mockStatusStats) // Status stats
        .mockResolvedValueOnce(mockOrdersByDay); // Orders by day

      const result = await service.getOrderAnalytics();

      expect(result).toEqual({
        summary: {
          total_orders: 30,
          revenue: 1500.5,
          average_order_value: 58.35, // (250.10 + 500.20 + 1000.30) / 30 = 1750.6 / 30 = 58.3533...
          orders_last_7_days: 20,
        },
        status_breakdown: {
          pending: 5,
          shipped: 10,
          delivered: 15,
        },
        orders_by_day: [
          { date: '2023-05-01', count: 10 },
          { date: '2023-05-02', count: 10 },
        ],
      });

      expect(mockOrdersRepository.createQueryBuilder).toHaveBeenCalledTimes(2);
    });

    it('should handle empty results', async () => {
      const queryBuilder: any = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([]),
        getRawOne: jest.fn().mockResolvedValue(null),
        getCount: jest.fn().mockResolvedValue(0),
      };

      mockOrdersRepository.count.mockResolvedValue(0);
      mockOrdersRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      const result = await service.getOrderAnalytics();

      expect(result).toEqual({
        summary: {
          total_orders: 0,
          revenue: 0,
          average_order_value: 0,
          orders_last_7_days: 0,
        },
        status_breakdown: {},
        orders_by_day: [],
      });
    });
  });
});
