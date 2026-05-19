import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminService } from './admin.service';
import { Order } from '../orders/order.entity';
import { Review } from '../reviews/review.entity';
import { NotFoundException } from '@nestjs/common';

describe('AdminService', () => {
  let service: AdminService;
  let ordersRepository: Repository<Order>;
  let reviewsRepository: Repository<Review>;

  const mockQueryBuilder = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockResolvedValue([]),
    getRawMany: jest.fn().mockResolvedValue([]),
    getRawOne: jest.fn().mockResolvedValue({}),
    getCount: jest.fn().mockResolvedValue(0),
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
  };

  const mockOrdersRepository = {
    createQueryBuilder: jest.fn(() => mockQueryBuilder),
    findOne: jest.fn(),
    save: jest.fn(),
    count: jest.fn(),
    find: jest.fn(),
    delete: jest.fn(),
  };

  const mockReviewsRepository = {
    createQueryBuilder: jest.fn(() => mockQueryBuilder),
    findOne: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
    getManyAndCount: jest.fn(),
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
    reviewsRepository = module.get<Repository<Review>>(getRepositoryToken(Review));

    jest.clearAllMocks();
  });

  describe('getAllOrders', () => {
    it('should use valid sortBy and sortOrder', async () => {
      await service.getAllOrders({
        sortBy: 'total',
        sortOrder: 'ASC',
      });

      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('order.total', 'ASC');
    });

    it('should default to createdAt if invalid sortBy is provided', async () => {
      await service.getAllOrders({
        sortBy: 'invalid_column' as any,
      });

      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('order.createdAt', 'DESC');
    });

    it('should default to DESC if invalid sortOrder is provided', async () => {
      await service.getAllOrders({
        sortOrder: 'INVALID' as any,
      });

      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('order.createdAt', 'DESC');
    });

    it('should handle missing filters with defaults', async () => {
      await service.getAllOrders({});

      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('order.createdAt', 'DESC');
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(20);
    });
  });
});
