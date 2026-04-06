import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from './admin.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Order } from '../orders/order.entity';
import { Review } from '../reviews/review.entity';

describe('AdminService (Performance Optimization)', () => {
  let service: AdminService;
  let ordersRepository: any;

  const mockStatusStats = [
    { status: 'pending', count: '5', sum: '500' },
    { status: 'shipped', count: '10', sum: '1000' },
    { status: 'delivered', count: '15', sum: '1500' },
  ];

  const mockDailyStats = [
    { date: '2023-01-01', count: '3' },
    { date: '2023-01-02', count: '7' },
  ];

  beforeEach(async () => {
    ordersRepository = {
      createQueryBuilder: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getRawMany: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        { provide: getRepositoryToken(Order), useValue: ordersRepository },
        { provide: getRepositoryToken(Review), useValue: {} },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
  });

  it('getOrderAnalytics should return correct consolidated data', async () => {
    ordersRepository.getRawMany
      .mockResolvedValueOnce(mockStatusStats) // First call for status stats
      .mockResolvedValueOnce(mockDailyStats); // Second call for daily stats

    const result = await service.getOrderAnalytics();

    // Summary verification
    // totalOrders = 5 + 10 + 15 = 30
    // totalRevenue (shipped + delivered) = 1000 + 1500 = 2500
    // totalSum = 500 + 1000 + 1500 = 3000
    // averageOrderValue = 3000 / 30 = 100
    // recentOrders = 3 + 7 = 10
    expect(result.summary.total_orders).toBe(30);
    expect(result.summary.revenue).toBe(2500);
    expect(result.summary.average_order_value).toBe(100);
    expect(result.summary.orders_last_7_days).toBe(10);

    // Status breakdown verification
    expect(result.status_breakdown).toEqual({
      pending: 5,
      shipped: 10,
      delivered: 15,
    });

    // Daily stats verification
    expect(result.orders_by_day).toHaveLength(2);
    expect(result.orders_by_day[0]).toEqual({ date: '2023-01-01', count: 3 });

    // Verify exactly 2 database roundtrips for Raw results
    expect(ordersRepository.getRawMany).toHaveBeenCalledTimes(2);
  });

  it('getOrderAnalytics should handle zero orders', async () => {
    ordersRepository.getRawMany
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
