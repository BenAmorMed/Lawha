import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AdminService } from './admin.service';
import { Order } from '../orders/order.entity';
import { Review } from '../reviews/review.entity';
import { Repository, SelectQueryBuilder } from 'typeorm';

describe('AdminService', () => {
  let service: AdminService;
  let ordersRepository: Repository<Order>;
  let reviewsRepository: Repository<Review>;

  const mockQueryBuilder = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getCount: jest.fn().mockResolvedValue(0),
    getMany: jest.fn().mockResolvedValue([]),
  } as unknown as SelectQueryBuilder<Order>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: getRepositoryToken(Order),
          useValue: {
            createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
            findOne: jest.fn(),
            save: jest.fn(),
            count: jest.fn(),
            find: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Review),
          useValue: {
            createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
            findOne: jest.fn(),
            delete: jest.fn(),
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

  describe('getAllOrders', () => {
    it('should use whitelisted sortBy and sortOrder', async () => {
      await service.getAllOrders({
        sortBy: 'total',
        sortOrder: 'ASC',
      });

      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('order.total', 'ASC');
    });

    it('should fallback to default if sortBy is not whitelisted', async () => {
      await service.getAllOrders({
        sortBy: 'id; DROP TABLE orders; --' as any,
        sortOrder: 'DESC',
      });

      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('order.createdAt', 'DESC');
    });

    it('should fallback to default if sortOrder is not whitelisted', async () => {
      await service.getAllOrders({
        sortBy: 'total',
        sortOrder: 'INVALID' as any,
      });

      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('order.total', 'DESC');
    });
  });

  describe('getAllReviews', () => {
    it('should use whitelisted sortBy and sortOrder', async () => {
      await service.getAllReviews({
        sortBy: 'rating',
        sortOrder: 'ASC',
      });

      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('review.rating', 'ASC');
    });

    it('should fallback to default if sortBy is not whitelisted', async () => {
      await service.getAllReviews({
        sortBy: 'comment' as any,
        sortOrder: 'DESC',
      });

      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('review.createdAt', 'DESC');
    });
  });
});
