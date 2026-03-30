import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AdminService } from './admin.service';
import { Order } from '../orders/order.entity';
import { Review } from '../reviews/review.entity';

describe('AdminService', () => {
  let service: AdminService;
  let ordersRepository: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        { provide: getRepositoryToken(Order), useValue: { createQueryBuilder: jest.fn() } },
        { provide: getRepositoryToken(Review), useValue: {} },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
    ordersRepository = module.get(getRepositoryToken(Order));
  });

  it('getOrderAnalytics should consolidate metrics correctly', async () => {
    const statusStats = [
      { status: 'pending', count: '2', total_sum: '100' },
      { status: 'delivered', count: '1', total_sum: '50' },
    ];
    const dailyStats = [{ date: '2025-05-14', count: '3' }];

    const qb: any = {
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getRawMany: jest.fn(),
    };

    ordersRepository.createQueryBuilder.mockReturnValue(qb);
    qb.getRawMany.mockResolvedValueOnce(statusStats).mockResolvedValueOnce(dailyStats);

    const result = await service.getOrderAnalytics();

    expect(result.summary.total_orders).toBe(3);
    expect(result.summary.revenue).toBe(50);
    expect(result.summary.average_order_value).toBe(50);
    expect(result.summary.orders_last_7_days).toBe(3);
    expect(result.status_breakdown).toEqual({ pending: 2, delivered: 1 });
    expect(result.orders_by_day[0].count).toBe(3);
  });
});
