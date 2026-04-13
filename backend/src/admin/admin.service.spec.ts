import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AdminService } from './admin.service';
import { Order } from '../orders/order.entity';
import { Review } from '../reviews/review.entity';
import { BadRequestException } from '@nestjs/common';

describe('AdminService (Security)', () => {
  let service: AdminService;
  let ordersRepository: any;

  const mockQueryBuilder = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getCount: jest.fn().mockResolvedValue(0),
    getMany: jest.fn().mockResolvedValue([]),
  };

  beforeEach(async () => {
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
  });

  describe('getAllOrders SQL Injection Protection', () => {
    it('should use default values when invalid sortBy is provided', async () => {
      await service.getAllOrders({ sortBy: 'invalid_column' as any });

      // Verification: Check if orderBy was called with whitelisted field
      // Currently it fails as it's not whitelisted
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('order.createdAt', 'DESC');
    });

    it('should use default values when invalid sortOrder is provided', async () => {
      await service.getAllOrders({ sortOrder: 'DROP TABLE orders' as any });

      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('order.createdAt', 'DESC');
    });
  });

  describe('Status Update Exception Handling', () => {
    it('updateOrderStatus should throw BadRequestException for invalid status', async () => {
      ordersRepository.findOne.mockResolvedValue({ id: '1' });

      await expect(service.updateOrderStatus('1', 'invalid_status'))
        .rejects.toThrow(BadRequestException);
    });

    it('bulkUpdateStatus should throw BadRequestException for invalid status', async () => {
      ordersRepository.find.mockResolvedValue([{ id: '1' }]);

      await expect(service.bulkUpdateStatus(['1'], 'invalid_status'))
        .rejects.toThrow(BadRequestException);
    });
  });
});
