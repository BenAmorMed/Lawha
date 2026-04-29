import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AdminService } from './admin.service';
import { Order } from '../orders/order.entity';
import { Review } from '../reviews/review.entity';

describe('AdminService', () => {
  let service: AdminService;
  let orderRepository: any;
  let reviewRepository: any;

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
    orderRepository = {
      createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
      findOne: jest.fn(),
      save: jest.fn(),
      count: jest.fn().mockResolvedValue(0),
      find: jest.fn().mockResolvedValue([]),
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
  });

  describe('getAllOrders Security', () => {
    it('should fallback to default if sortBy is invalid (Prevent SQLi)', async () => {
      const filters = {
        sortBy: "id; DROP TABLE orders; --" as any,
        sortOrder: 'DESC' as any,
      };

      await service.getAllOrders(filters);

      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
        'order.createdAt',
        'DESC',
      );
    });

    it('should use provided sortBy if valid', async () => {
      const filters = {
        sortBy: 'total' as any,
        sortOrder: 'ASC' as any,
      };

      await service.getAllOrders(filters);

      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
        'order.total',
        'ASC',
      );
    });
  });

  describe('updateOrderStatus', () => {
    it('should throw BadRequestException for invalid status', async () => {
      orderRepository.findOne.mockResolvedValue({ id: '1', status: 'pending' });

      await expect(
        service.updateOrderStatus('1', 'invalid-status'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if order not found', async () => {
      orderRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateOrderStatus('999', 'shipped'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('bulkUpdateStatus', () => {
    it('should throw BadRequestException for invalid status', async () => {
      orderRepository.find.mockResolvedValue([{ id: '1' }, { id: '2' }]);

      await expect(
        service.bulkUpdateStatus(['1', '2'], 'invalid-status'),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
