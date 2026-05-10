import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AdminService } from './admin.service';
import { Order } from '../orders/order.entity';
import { Review } from '../reviews/review.entity';
import { Repository } from 'typeorm';

describe('AdminService', () => {
  let service: AdminService;
  let ordersRepository: Repository<Order>;
  let reviewsRepository: Repository<Review>;

  let mockQueryBuilder: any;

  beforeEach(async () => {
    mockQueryBuilder = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([]),
      getCount: jest.fn().mockResolvedValue(0),
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      getRawMany: jest.fn().mockResolvedValue([]),
      getRawOne: jest.fn().mockResolvedValue({}),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: getRepositoryToken(Order),
          useValue: {
            createQueryBuilder: jest.fn(() => mockQueryBuilder),
            count: jest.fn().mockResolvedValue(0),
            findOne: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Review),
          useValue: {
            createQueryBuilder: jest.fn(() => mockQueryBuilder),
            findOne: jest.fn(),
            delete: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
    ordersRepository = module.get<Repository<Order>>(getRepositoryToken(Order));
    reviewsRepository = module.get<Repository<Review>>(getRepositoryToken(Review));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAllOrders SQL Injection Protection', () => {
    it('should use default sorting when invalid sortBy is provided', async () => {
      await service.getAllOrders({ sortBy: 'id; DROP TABLE orders; --' as any });

      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
        'order.createdAt',
        'DESC'
      );
    });

    it('should use default sorting when invalid sortOrder is provided', async () => {
      await service.getAllOrders({ sortOrder: 'INVALID' as any });

      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
        'order.createdAt',
        'DESC'
      );
    });

    it('should use provided valid sorting', async () => {
      await service.getAllOrders({ sortBy: 'total', sortOrder: 'ASC' });

      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
        'order.total',
        'ASC'
      );
    });
  });

  describe('getAllReviews SQL Injection Protection', () => {
    it('should use default sorting when invalid sortBy is provided', async () => {
      await service.getAllReviews({ sortBy: 'user.password' as any });

      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
        'review.createdAt',
        'DESC'
      );
    });

    it('should use default sorting when invalid sortOrder is provided', async () => {
      await service.getAllReviews({ sortOrder: 'DESC; --' as any });

      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
        'review.createdAt',
        'DESC'
      );
    });

    it('should use provided valid sorting', async () => {
      await service.getAllReviews({ sortBy: 'rating', sortOrder: 'ASC' });

      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
        'review.rating',
        'ASC'
      );
    });
  });
});
