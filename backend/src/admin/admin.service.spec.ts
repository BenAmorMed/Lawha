import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AdminService } from './admin.service';
import { Order } from '../orders/order.entity';
import { Review } from '../reviews/review.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('AdminService', () => {
  let service: AdminService;
  let orderRepository;
  let reviewRepository;

  const mockOrderRepository = {
    createQueryBuilder: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    count: jest.fn(),
    find: jest.fn(),
    delete: jest.fn(),
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
    orderRepository = module.get(getRepositoryToken(Order));
    reviewRepository = module.get(getRepositoryToken(Review));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllOrders', () => {
    it('should apply whitelist for sortBy and sortOrder', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(0),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };
      orderRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await service.getAllOrders({
        sortBy: 'invalid_field' as any,
        sortOrder: 'INVALID' as any,
      });

      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('order.createdAt', 'DESC');
    });

    it('should allow valid sortBy and sortOrder', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(0),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };
      orderRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await service.getAllOrders({
        sortBy: 'total',
        sortOrder: 'ASC',
      });

      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('order.total', 'ASC');
    });
  });

  describe('updateOrderStatus', () => {
    it('should throw BadRequestException for invalid status', async () => {
      orderRepository.findOne.mockResolvedValue({ id: '1' });

      await expect(
        service.updateOrderStatus('1', 'invalid_status'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if order not found', async () => {
      orderRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateOrderStatus('1', 'processing'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('bulkUpdateStatus', () => {
    it('should throw BadRequestException for invalid status', async () => {
      orderRepository.find.mockResolvedValue([{ id: '1' }]);

      await expect(
        service.bulkUpdateStatus(['1'], 'invalid_status'),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
