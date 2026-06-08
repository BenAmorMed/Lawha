import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AdminService } from './admin.service';
import { Order } from '../orders/order.entity';
import { Review } from '../reviews/review.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('AdminService', () => {
  let service: AdminService;
  let orderRepository: any;
  let reviewRepository: any;

  const mockOrderRepository = {
    createQueryBuilder: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    save: jest.fn(),
    count: jest.fn(),
  };

  const mockReviewRepository = {
    createQueryBuilder: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
  };

  const mockQueryBuilder = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockReturnValue([]),
    getCount: jest.fn().mockReturnValue(0),
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
    orderRepository = module.get(getRepositoryToken(Order));
    reviewRepository = module.get(getRepositoryToken(Review));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllOrders', () => {
    it('should use default sortBy and sortOrder when malicious strings are provided', async () => {
      orderRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await service.getAllOrders({
        sortBy: 'id; DROP TABLE orders' as any,
        sortOrder: 'DESC; --' as any,
      });

      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('order.createdAt', 'DESC');
    });

    it('should allow valid sortBy and sortOrder', async () => {
      orderRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await service.getAllOrders({
        sortBy: 'status',
        sortOrder: 'ASC',
      });

      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('order.status', 'ASC');
    });

    it('should handle case-insensitive sortOrder', async () => {
      orderRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await service.getAllOrders({
        sortBy: 'total',
        sortOrder: 'asc' as any,
      });

      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('order.total', 'ASC');
    });
  });

  describe('updateOrderStatus', () => {
    it('should throw BadRequestException for invalid status', async () => {
      orderRepository.findOne.mockResolvedValue({ id: '1', status: 'pending' });

      await expect(service.updateOrderStatus('1', 'invalid_status'))
        .rejects
        .toThrow(BadRequestException);
    });

    it('should update status for valid status', async () => {
      const mockOrder = { id: '1', status: 'pending' };
      orderRepository.findOne.mockResolvedValue(mockOrder);
      orderRepository.save.mockResolvedValue({ ...mockOrder, status: 'shipped' });

      const result = await service.updateOrderStatus('1', 'shipped');
      expect(result.status).toBe('shipped');
      expect(orderRepository.save).toHaveBeenCalled();
    });
  });

  describe('bulkUpdateStatus', () => {
    it('should throw BadRequestException for invalid status', async () => {
      orderRepository.find.mockResolvedValue([{ id: '1' }, { id: '2' }]);

      await expect(service.bulkUpdateStatus(['1', '2'], 'invalid_status'))
        .rejects
        .toThrow(BadRequestException);
    });

    it('should bulk update for valid status', async () => {
      const mockOrders = [{ id: '1', status: 'pending' }, { id: '2', status: 'pending' }];
      orderRepository.find.mockResolvedValue(mockOrders);
      orderRepository.save.mockResolvedValue(mockOrders.map(o => ({ ...o, status: 'printing' })));

      const result = await service.bulkUpdateStatus(['1', '2'], 'printing');
      expect(result.updated_count).toBe(2);
      expect(result.status).toBe('printing');
    });
  });
});
