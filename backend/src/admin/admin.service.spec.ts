import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AdminService } from './admin.service';
import { Order } from '../orders/order.entity';
import { Review } from '../reviews/review.entity';

describe('AdminService', () => {
  let service: AdminService;
  let mockOrderRepository: any;
  let mockReviewRepository: any;

  beforeEach(async () => {
    mockOrderRepository = {
      createQueryBuilder: jest.fn(() => ({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(0),
        getMany: jest.fn().mockResolvedValue([]),
      })),
      findOne: jest.fn(),
      save: jest.fn(),
      count: jest.fn(),
      find: jest.fn(),
    };

    mockReviewRepository = {
      createQueryBuilder: jest.fn(() => ({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(0),
        getMany: jest.fn().mockResolvedValue([]),
      })),
      findOne: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        { provide: getRepositoryToken(Order), useValue: mockOrderRepository },
        { provide: getRepositoryToken(Review), useValue: mockReviewRepository },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
  });

  describe('getAllOrders whitelisting', () => {
    it('uses default sorting when invalid sortBy is provided', async () => {
      const queryBuilder = mockOrderRepository.createQueryBuilder();
      mockOrderRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      await service.getAllOrders({ sortBy: 'invalid_column' as any });

      expect(queryBuilder.orderBy).toHaveBeenCalledWith('order.createdAt', 'DESC');
    });

    it('uses default sorting when invalid sortOrder is provided', async () => {
      const queryBuilder = mockOrderRepository.createQueryBuilder();
      mockOrderRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      await service.getAllOrders({ sortOrder: 'DROP TABLE orders' as any });

      expect(queryBuilder.orderBy).toHaveBeenCalledWith('order.createdAt', 'DESC');
    });

    it('allows valid sortBy and sortOrder', async () => {
      const queryBuilder = mockOrderRepository.createQueryBuilder();
      mockOrderRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      await service.getAllOrders({ sortBy: 'total', sortOrder: 'ASC' });

      expect(queryBuilder.orderBy).toHaveBeenCalledWith('order.total', 'ASC');
    });
  });

  describe('status validation', () => {
    it('throws BadRequestException for invalid status in updateOrderStatus', async () => {
      mockOrderRepository.findOne.mockResolvedValue({ id: '1' });
      await expect(service.updateOrderStatus('1', 'invalid_status'))
        .rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException for invalid status in bulkUpdateStatus', async () => {
      mockOrderRepository.find.mockResolvedValue([{ id: '1' }]);
      await expect(service.bulkUpdateStatus(['1'], 'invalid_status'))
        .rejects.toThrow(BadRequestException);
    });
  });
});
