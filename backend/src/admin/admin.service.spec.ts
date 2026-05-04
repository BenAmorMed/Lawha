import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { AdminService } from './admin.service';
import { Order, OrderStatus } from '../orders/order.entity';
import { Review } from '../reviews/review.entity';
import { NotFoundException } from '@nestjs/common';

describe('AdminService', () => {
  let service: AdminService;
  let ordersRepository: Repository<Order>;
  let reviewsRepository: Repository<Review>;

  const mockOrderRepository = {
    createQueryBuilder: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    count: jest.fn(),
  };

  const mockReviewRepository = {
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
          useValue: mockOrderRepository,
        },
        {
          provide: getRepositoryToken(Review),
          useValue: mockReviewRepository,
        },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
    ordersRepository = module.get<Repository<Order>>(getRepositoryToken(Order));
    reviewsRepository = module.get<Repository<Review>>(getRepositoryToken(Review));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getOrderAnalytics', () => {
    it('should return consolidated analytics correctly', async () => {
      const mockStatusStats = [
        { status: 'pending', count: '5', sum: '500' },
        { status: 'shipped', count: '10', sum: '1000' },
        { status: 'delivered', count: '5', sum: '500' },
      ];

      const mockDailyStats = [
        { date: '2023-10-01', count: '10' },
        { date: '2023-10-02', count: '10' },
      ];

      const mockStatusQueryBuilder: any = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue(mockStatusStats),
      };

      const mockDailyQueryBuilder: any = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue(mockDailyStats),
      };

      mockOrderRepository.createQueryBuilder
        .mockReturnValueOnce(mockStatusQueryBuilder)
        .mockReturnValueOnce(mockDailyQueryBuilder);

      const result = await service.getOrderAnalytics();

      expect(result.summary.total_orders).toBe(20);
      expect(result.summary.revenue).toBe(1500); // shipped + delivered
      expect(result.summary.average_order_value).toBe(100); // 2000 / 20
      expect(result.summary.orders_last_7_days).toBe(20);
      expect(result.status_breakdown['pending']).toBe(5);
      expect(result.orders_by_day).toHaveLength(2);
      expect(result.orders_by_day[0].count).toBe(10);
    });

    it('should handle zero orders correctly', async () => {
      mockOrderRepository.createQueryBuilder
        .mockReturnValueOnce({
          select: jest.fn().mockReturnThis(),
          addSelect: jest.fn().mockReturnThis(),
          groupBy: jest.fn().mockReturnThis(),
          getRawMany: jest.fn().mockResolvedValue([]),
        })
        .mockReturnValueOnce({
          select: jest.fn().mockReturnThis(),
          addSelect: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          groupBy: jest.fn().mockReturnThis(),
          orderBy: jest.fn().mockReturnThis(),
          getRawMany: jest.fn().mockResolvedValue([]),
        });

      const result = await service.getOrderAnalytics();

      expect(result.summary.total_orders).toBe(0);
      expect(result.summary.revenue).toBe(0);
      expect(result.summary.average_order_value).toBe(0);
      expect(result.summary.orders_last_7_days).toBe(0);
    });
  });

  describe('updateOrderStatus', () => {
    it('should update order status correctly', async () => {
      const mockOrder = { id: 'order-1', status: 'pending' };
      mockOrderRepository.findOne.mockResolvedValue(mockOrder);
      mockOrderRepository.save.mockResolvedValue({ ...mockOrder, status: 'shipped' });

      const result = await service.updateOrderStatus('order-1', 'shipped');

      expect(result.status).toBe('shipped');
      expect(mockOrderRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if order not found', async () => {
      mockOrderRepository.findOne.mockResolvedValue(null);
      await expect(service.updateOrderStatus('none', 'shipped')).rejects.toThrow(NotFoundException);
    });

    it('should throw error for invalid status', async () => {
      mockOrderRepository.findOne.mockResolvedValue({ id: '1' });
      await expect(service.updateOrderStatus('1', 'invalid')).rejects.toThrow();
    });
  });
});
