import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AdminService } from './admin.service';
import { Order } from '../orders/order.entity';
import { Review } from '../reviews/review.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('AdminService', () => {
  let service: AdminService;
  let ordersRepository: any;
  let reviewsRepository: any;
  let mockQueryBuilder: any;

  beforeEach(async () => {
    mockQueryBuilder = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getCount: jest.fn().mockResolvedValue(0),
      getMany: jest.fn().mockResolvedValue([]),
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
    ordersRepository = module.get(getRepositoryToken(Order));
    reviewsRepository = module.get(getRepositoryToken(Review));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAllOrders SQL Injection Protection', () => {
    it('should use default sortBy if an invalid one is provided', async () => {
      await service.getAllOrders({ sortBy: 'invalid_column' as any });
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('order.createdAt', 'DESC');
    });

    it('should use provided sortBy if it is whitelisted', async () => {
      await service.getAllOrders({ sortBy: 'total' });
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('order.total', 'DESC');
    });

    it('should validate sortOrder and default to DESC if invalid', async () => {
      await service.getAllOrders({ sortOrder: 'INVALID' as any });
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('order.createdAt', 'DESC');
    });

    it('should use provided sortOrder if valid', async () => {
      await service.getAllOrders({ sortOrder: 'ASC' });
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('order.createdAt', 'ASC');
    });
  });

  describe('updateOrderStatus error handling', () => {
    it('should throw BadRequestException for invalid status', async () => {
      ordersRepository.findOne.mockResolvedValue({ id: '1', status: 'pending' });
      await expect(service.updateOrderStatus('1', 'invalid_status')).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if order does not exist', async () => {
      ordersRepository.findOne.mockResolvedValue(null);
      await expect(service.updateOrderStatus('999', 'shipped')).rejects.toThrow(NotFoundException);
    });
  });

  describe('bulkUpdateStatus error handling', () => {
    it('should throw BadRequestException for invalid status in bulk update', async () => {
      ordersRepository.find.mockResolvedValue([{ id: '1' }, { id: '2' }]);
      await expect(service.bulkUpdateStatus(['1', '2'], 'invalid_status')).rejects.toThrow(BadRequestException);
    });
  });

  describe('getAllReviews SQL Injection Protection', () => {
    it('should use default sortBy for reviews if invalid one provided', async () => {
      await service.getAllReviews({ sortBy: 'malicious_code; DROP TABLE reviews; --' as any });
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('review.createdAt', 'DESC');
    });

    it('should use whitelisted sortBy for reviews', async () => {
      await service.getAllReviews({ sortBy: 'rating' });
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('review.rating', 'DESC');
    });
  });
});
