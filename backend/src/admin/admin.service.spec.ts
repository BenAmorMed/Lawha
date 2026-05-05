import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AdminService } from './admin.service';
import { Order } from '../orders/order.entity';
import { Review } from '../reviews/review.entity';
import { Repository } from 'typeorm';
import { BadRequestException } from '@nestjs/common';

describe('AdminService', () => {
  let service: AdminService;
  let ordersRepository: Repository<Order>;

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
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllOrders', () => {
    it('should use whitelisted sortBy and sortOrder', async () => {
      const mockQueryBuilder: any = {
        where: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(0),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };

      jest.spyOn(ordersRepository, 'createQueryBuilder').mockReturnValue(mockQueryBuilder);

      // Test with valid sortBy
      await service.getAllOrders({ sortBy: 'total', sortOrder: 'ASC' });
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('order.total', 'ASC');

      // Test with invalid sortBy - should fallback to createdAt
      await service.getAllOrders({ sortBy: 'invalid_field' as any, sortOrder: 'DESC' });
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('order.createdAt', 'DESC');

      // Test with invalid sortOrder - should fallback to DESC
      await service.getAllOrders({ sortBy: 'status', sortOrder: 'INVALID' as any });
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('order.status', 'DESC');
    });
  });

  describe('updateOrderStatus', () => {
    it('should throw BadRequestException for invalid status', async () => {
      mockOrderRepository.findOne.mockResolvedValue({ id: 'order-1' });

      await expect(
        service.updateOrderStatus('order-1', 'invalid-status'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should update status for valid input', async () => {
      const order = { id: 'order-1', status: 'pending' };
      mockOrderRepository.findOne.mockResolvedValue(order);
      mockOrderRepository.save.mockResolvedValue({ ...order, status: 'shipped' });

      const result = await service.updateOrderStatus('order-1', 'shipped');
      expect(result.status).toBe('shipped');
      expect(mockOrderRepository.save).toHaveBeenCalled();
    });
  });

  describe('bulkUpdateStatus', () => {
    it('should throw BadRequestException for invalid status in bulk update', async () => {
      mockOrderRepository.find.mockResolvedValue([{ id: 'order-1' }]);

      await expect(
        service.bulkUpdateStatus(['order-1'], 'invalid-status'),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
