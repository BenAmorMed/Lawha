import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
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
    getCount: jest.fn().mockResolvedValue(0),
    getMany: jest.fn().mockResolvedValue([]),
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    getRawMany: jest.fn().mockResolvedValue([]),
    getRawOne: jest.fn().mockResolvedValue({}),
  };

  beforeEach(async () => {
    ordersRepository = {
      createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
      findOne: jest.fn(),
      save: jest.fn(),
      count: jest.fn(),
      find: jest.fn(),
    };

    reviewsRepository = {
      createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
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
    jest.clearAllMocks();
  });

  describe('getAllOrders', () => {
    it('should use whitelisted sortBy and sortOrder', async () => {
      await service.getAllOrders({
        sortBy: 'total',
        sortOrder: 'ASC',
      });

      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('order.total', 'ASC');
    });

    it('should fallback to default if sortBy is not allowed', async () => {
      await service.getAllOrders({
        sortBy: 'invalid_field' as any,
        sortOrder: 'DESC',
      });

      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('order.createdAt', 'DESC');
    });

    it('should fallback to DESC if sortOrder is invalid', async () => {
      await service.getAllOrders({
        sortBy: 'status',
        sortOrder: 'INVALID' as any,
      });

      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('order.status', 'DESC');
    });
  });

  describe('updateOrderStatus', () => {
    it('should update status for valid status', async () => {
      const mockOrder = { id: 'order-1', status: 'pending' };
      ordersRepository.findOne.mockResolvedValue(mockOrder);

      await service.updateOrderStatus('order-1', 'shipped');

      expect(mockOrder.status).toBe('shipped');
      expect(ordersRepository.save).toHaveBeenCalledWith(mockOrder);
    });

    it('should throw BadRequestException for invalid status', async () => {
      const mockOrder = { id: 'order-1', status: 'pending' };
      ordersRepository.findOne.mockResolvedValue(mockOrder);

      await expect(service.updateOrderStatus('order-1', 'invalid_status'))
        .rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if order not found', async () => {
      ordersRepository.findOne.mockResolvedValue(null);

      await expect(service.updateOrderStatus('order-non-existent', 'shipped'))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('bulkUpdateStatus', () => {
    it('should update multiple orders for valid status', async () => {
      const mockOrders = [
        { id: 'order-1', status: 'pending' },
        { id: 'order-2', status: 'pending' },
      ];
      ordersRepository.find.mockResolvedValue(mockOrders);

      await service.bulkUpdateStatus(['order-1', 'order-2'], 'printing');

      expect(mockOrders[0].status).toBe('printing');
      expect(mockOrders[1].status).toBe('printing');
      expect(ordersRepository.save).toHaveBeenCalledWith(mockOrders);
    });

    it('should throw BadRequestException for invalid status in bulk update', async () => {
      ordersRepository.find.mockResolvedValue([{ id: 'order-1' }]);

      await expect(service.bulkUpdateStatus(['order-1'], 'invalid_status'))
        .rejects.toThrow(BadRequestException);
    });
  });
});
