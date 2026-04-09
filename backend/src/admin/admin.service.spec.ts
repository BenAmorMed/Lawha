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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: getRepositoryToken(Order),
          useValue: {
            createQueryBuilder: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
            save: jest.fn(),
            count: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Review),
          useValue: {
            createQueryBuilder: jest.fn(),
            findOne: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
    ordersRepository = module.get<Repository<Order>>(getRepositoryToken(Order));
  });

  describe('getAllOrders', () => {
    it('should use default sort if provided with invalid sortBy', async () => {
      const mockQueryBuilder: any = {
        where: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
        getCount: jest.fn().mockResolvedValue(0),
      };

      jest.spyOn(ordersRepository, 'createQueryBuilder').mockReturnValue(mockQueryBuilder);

      // Attempt SQL injection via sortBy
      const maliciousSortBy = 'total; DROP TABLE orders; --';
      await service.getAllOrders({
        sortBy: maliciousSortBy as any,
      });

      // Should NOT contain the malicious string and should be a safe value
      const allowedSortByFields = ['createdAt', 'total', 'status'];
      const callArgs = mockQueryBuilder.orderBy.mock.calls[0];
      const receivedSortField = callArgs[0];

      expect(receivedSortField).not.toContain(';');
      expect(allowedSortByFields.some(field => receivedSortField === `order.${field}`)).toBe(true);
    });

    it('should only allow ASC or DESC for sortOrder', async () => {
      const mockQueryBuilder: any = {
        where: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
        getCount: jest.fn().mockResolvedValue(0),
      };

      jest.spyOn(ordersRepository, 'createQueryBuilder').mockReturnValue(mockQueryBuilder);

      await service.getAllOrders({
        sortOrder: 'INVALID' as any,
      });

      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
        expect.any(String),
        'DESC' // Should fall back to DESC
      );
    });
  });

  describe('updateOrderStatus', () => {
    it('should throw BadRequestException for invalid status', async () => {
      jest.spyOn(ordersRepository, 'findOne').mockResolvedValue({ id: '1' } as any);

      await expect(service.updateOrderStatus('1', 'invalid_status'))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('bulkUpdateStatus', () => {
    it('should throw BadRequestException for invalid status', async () => {
      jest.spyOn(ordersRepository, 'find').mockResolvedValue([{ id: '1' }] as any);

      await expect(service.bulkUpdateStatus(['1'], 'invalid_status'))
        .rejects.toThrow(BadRequestException);
    });
  });
});
