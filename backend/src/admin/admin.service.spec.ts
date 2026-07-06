import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AdminService } from './admin.service';
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
      count: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      delete: jest.fn(),
    };

    reviewsRepository = {
      createQueryBuilder: jest.fn(),
      findOne: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: getRepositoryToken(Order),
          useValue: ordersRepository,
        },
        {
          provide: getRepositoryToken(Review),
          useValue: reviewsRepository,
        },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAllOrders', () => {
    it('should return orders and pagination info', async () => {
      const mockOrders = [{ id: '1', total: 100, items: [] }];
      const mockCount = 1;
      const queryBuilder: any = {
        where: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([mockOrders, mockCount]),
      };
      ordersRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      const result = await service.getAllOrders({});

      expect(result.data).toHaveLength(1);
      expect(result.pagination.total).toBe(mockCount);
      expect(queryBuilder.getManyAndCount).toHaveBeenCalled();
    });
  });

  describe('getOrderAnalytics', () => {
    it('should return analytics summary', async () => {
      const queryBuilder: any = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        setParameter: jest.fn().mockReturnThis(),
        getRawMany: jest.fn(),
        getRawOne: jest.fn(),
      };

      ordersRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      queryBuilder.getRawOne.mockResolvedValueOnce({
        totalOrders: '10',
        revenue: '500',
        average: '50',
      });

      queryBuilder.getRawMany
        .mockResolvedValueOnce([{ status: 'delivered', count: '5' }]) // ordersByStatus
        .mockResolvedValueOnce([{ date: '2026-07-06', count: '1' }]); // ordersByDay

      const result = await service.getOrderAnalytics();

      expect(result.summary.total_orders).toBe(10);
      expect(result.summary.revenue).toBe(500);
      expect(result.summary.average_order_value).toBe(50);
      expect(result.summary.orders_last_7_days).toBe(1);
      expect(result.status_breakdown.delivered).toBe(5);
      expect(result.orders_by_day).toHaveLength(1);
    });
  });
});
