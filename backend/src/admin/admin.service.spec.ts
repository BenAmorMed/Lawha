import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AdminService } from './admin.service';
import { Order } from '../orders/order.entity';
import { Review } from '../reviews/review.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

describe('AdminService', () => {
  let service: AdminService;
  let orderRepository: Repository<Order>;
  let reviewRepository: Repository<Review>;

  const mockOrderRepository = {
    createQueryBuilder: jest.fn().mockReturnValue({
      where: jest.fn().mockReturnThis(),
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      loadRelationCountAndMap: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      getMany: jest.fn().mockResolvedValue([]),
      getCount: jest.fn().mockResolvedValue(0),
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      getRawMany: jest.fn().mockResolvedValue([]),
      getRawOne: jest.fn().mockResolvedValue({}),
    }),
    findOne: jest.fn(),
    save: jest.fn(),
    count: jest.fn(),
    find: jest.fn(),
  };

  const mockReviewRepository = {
    createQueryBuilder: jest.fn().mockReturnValue({
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      getMany: jest.fn().mockResolvedValue([]),
      getCount: jest.fn().mockResolvedValue(0),
    }),
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
    orderRepository = module.get<Repository<Order>>(getRepositoryToken(Order));
    reviewRepository = module.get<Repository<Review>>(getRepositoryToken(Review));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAllOrders', () => {
    it('should return paginated orders', async () => {
      const result = await service.getAllOrders({});
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('pagination');
    });
  });

  describe('getOrderById', () => {
    it('should return an order if found', async () => {
      const mockOrder = { id: '1', user: { email: 'test@example.com' } };
      mockOrderRepository.findOne.mockResolvedValue(mockOrder);
      const result = await service.getOrderById('1');
      expect(result.id).toBe('1');
    });

    it('should throw NotFoundException if order not found', async () => {
      mockOrderRepository.findOne.mockResolvedValue(null);
      await expect(service.getOrderById('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getOrderAnalytics', () => {
    it('should return analytics data', async () => {
      // In the optimized version, total_orders is calculated from statusBreakdown raw result
      mockOrderRepository.createQueryBuilder().getRawMany.mockResolvedValueOnce([
        { status: 'pending', count: '10' }
      ]);
      mockOrderRepository.createQueryBuilder().getRawOne.mockResolvedValueOnce({
        revenue: '1000',
        avgValue: '100'
      });
      mockOrderRepository.createQueryBuilder().getRawMany.mockResolvedValueOnce([]); // ordersByDay

      const result = await service.getOrderAnalytics();
      expect(result).toHaveProperty('summary');
      expect(result.summary.total_orders).toBe(10);
      expect(result.summary.revenue).toBe(1000);
    });
  });
});
