import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from './admin.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Order } from '../orders/order.entity';
import { Review } from '../reviews/review.entity';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('AdminService', () => {
  let service: AdminService;
  let orderRepository: any;
  let reviewRepository: any;

  const mockOrder = {
    id: 'order-1',
    userId: 'user-1',
    status: 'pending',
    total: 100,
    items: [],
    user: { email: 'test@example.com' },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockQueryBuilder = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getCount: jest.fn().mockResolvedValue(1),
    getMany: jest.fn().mockResolvedValue([mockOrder]),
    getManyAndCount: jest.fn().mockResolvedValue([[mockOrder], 1]),
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    getRawMany: jest.fn().mockResolvedValue([]),
    getRawOne: jest.fn().mockResolvedValue({}),
    loadRelationCountAndMap: jest.fn().mockReturnThis(),
  };

  beforeEach(async () => {
    orderRepository = {
      createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
      findOne: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      count: jest.fn(),
    };

    reviewRepository = {
      createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
      findOne: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: getRepositoryToken(Order),
          useValue: orderRepository,
        },
        {
          provide: getRepositoryToken(Review),
          useValue: reviewRepository,
        },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
    jest.clearAllMocks();
  });

  describe('getAllOrders', () => {
    it('should call orderBy with whitelisted values', async () => {
      const filters = {
        sortBy: 'total' as any,
        sortOrder: 'ASC' as any,
      };

      await service.getAllOrders(filters);

      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('order.total', 'ASC');
    });

    it('should use default values if sortBy is malicious (SQL Injection protection)', async () => {
      const maliciousSortBy = 'total; DROP TABLE orders; --' as any;
      await service.getAllOrders({ sortBy: maliciousSortBy });

      // Should fall back to 'createdAt' and 'DESC' (default)
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('order.createdAt', 'DESC');
    });

    it('should use default values if sortOrder is malicious', async () => {
      const maliciousSortOrder = 'DESC; DROP TABLE orders; --' as any;
      await service.getAllOrders({ sortOrder: maliciousSortOrder });

      // Should fall back to 'DESC'
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('order.createdAt', 'DESC');
    });
  });

  describe('updateOrderStatus', () => {
    it('should throw NotFoundException if order not found', async () => {
      orderRepository.findOne.mockResolvedValue(null);
      await expect(service.updateOrderStatus('invalid', 'shipped')).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for invalid status', async () => {
      orderRepository.findOne.mockResolvedValue(mockOrder);
      await expect(service.updateOrderStatus('order-1', 'invalid-status')).rejects.toThrow(BadRequestException);
    });
  });

  describe('bulkUpdateStatus', () => {
    it('should throw NotFoundException if no orders found', async () => {
      orderRepository.find.mockResolvedValue([]);
      await expect(service.bulkUpdateStatus(['invalid'], 'shipped')).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for invalid status', async () => {
      orderRepository.find.mockResolvedValue([mockOrder]);
      await expect(service.bulkUpdateStatus(['order-1'], 'invalid-status')).rejects.toThrow(BadRequestException);
    });
  });
});
