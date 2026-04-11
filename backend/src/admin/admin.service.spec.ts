import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AdminService } from './admin.service';
import { Order } from '../orders/order.entity';
import { Review } from '../reviews/review.entity';

describe('AdminService', () => {
  let service: AdminService;
  let ordersRepository: any;
  let reviewsRepository: any;

  const mockQueryBuilder = {
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

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: getRepositoryToken(Order),
          useValue: {
            createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
            findOne: jest.fn(),
            count: jest.fn(),
            save: jest.fn(),
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
    ordersRepository = module.get(getRepositoryToken(Order));
    reviewsRepository = module.get(getRepositoryToken(Review));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAllOrders', () => {
    it('should use default sort if sortBy is valid', async () => {
      await service.getAllOrders({ sortBy: 'createdAt', sortOrder: 'DESC' });
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('order.createdAt', 'DESC');
    });

    it('should prevent SQL injection in sortBy', async () => {
      await service.getAllOrders({ sortBy: 'createdAt; DROP TABLE orders; --' as any });
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('order.createdAt', 'DESC');
    });

    it('should prevent SQL injection in sortOrder', async () => {
      await service.getAllOrders({ sortOrder: 'DESC; DROP TABLE orders; --' as any });
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('order.createdAt', 'DESC');
    });
  });

  describe('getAllReviews', () => {
    it('should prevent SQL injection in sortBy', async () => {
      await service.getAllReviews({ sortBy: 'rating; DROP TABLE reviews; --' as any });
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('review.createdAt', 'DESC');
    });
  });

  describe('updateOrderStatus', () => {
    it('should throw BadRequestException for invalid status', async () => {
      ordersRepository.findOne.mockResolvedValue({ id: '1', status: 'pending' });

      await expect(service.updateOrderStatus('1', 'invalid-status'))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('bulkUpdateStatus', () => {
    it('should throw BadRequestException for invalid status', async () => {
      ordersRepository.find.mockResolvedValue([{ id: '1', status: 'pending' }]);

      await expect(service.bulkUpdateStatus(['1'], 'invalid-status'))
        .rejects.toThrow(BadRequestException);
    });
  });
});
