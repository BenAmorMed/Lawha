import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AdminService } from './admin.service';
import { Order } from '../orders/order.entity';
import { Review } from '../reviews/review.entity';
import { BadRequestException } from '@nestjs/common';

describe('AdminService (Security)', () => {
  let service: AdminService;
  let orderRepository: any;

  const mockQueryBuilder = {
    where: jest.fn().mockReturnThis(),
    getCount: jest.fn().mockResolvedValue(1),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockResolvedValue([]),
  };

  beforeEach(async () => {
    orderRepository = {
      createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
      findOne: jest.fn(),
      count: jest.fn(),
      find: jest.fn(),
      save: jest.fn(),
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
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
    jest.clearAllMocks();
  });

  describe('getAllOrders security', () => {
    it('should use default sortBy when an invalid field is provided', async () => {
      await service.getAllOrders({
        sortBy: 'invalid_field' as any,
        sortOrder: 'DESC',
      });

      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
        'order.createdAt',
        'DESC',
      );
    });

    it('should use default sortOrder when an invalid order is provided', async () => {
      await service.getAllOrders({
        sortBy: 'total',
        sortOrder: 'INVALID' as any,
      });

      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
        'order.total',
        'DESC',
      );
    });

    it('should prevent SQL injection in sortBy', async () => {
      const malicious = "createdAt; DROP TABLE orders; --" as any;
      await service.getAllOrders({
        sortBy: malicious,
        sortOrder: 'ASC',
      });

      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
        'order.createdAt',
        'ASC',
      );
    });
  });

  describe('status validation security', () => {
    it('updateOrderStatus should throw BadRequestException for invalid status', async () => {
      orderRepository.findOne.mockResolvedValue({ id: '1' });
      await expect(service.updateOrderStatus('1', 'MALICIOUS_STATUS'))
        .rejects.toThrow(BadRequestException);
    });

    it('bulkUpdateStatus should throw BadRequestException for invalid status', async () => {
      orderRepository.find.mockResolvedValue([{ id: '1' }]);
      await expect(service.bulkUpdateStatus(['1'], 'MALICIOUS_STATUS'))
        .rejects.toThrow(BadRequestException);
    });
  });
});
