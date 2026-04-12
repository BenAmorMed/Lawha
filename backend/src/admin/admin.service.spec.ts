import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AdminService } from './admin.service';
import { Order } from '../orders/order.entity';
import { Review } from '../reviews/review.entity';
import { Repository } from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';

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
            save: jest.fn(),
            find: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Review),
          useValue: {
            createQueryBuilder: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
    ordersRepository = module.get<Repository<Order>>(getRepositoryToken(Order));
  });

  describe('getAllOrders SQL Injection Protection', () => {
    it('should use default values for invalid sortBy and sortOrder', async () => {
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

      await service.getAllOrders({
        sortBy: 'id; DELETE FROM orders' as any,
        sortOrder: 'DESC; --' as any,
      });

      // Should whitelist to default 'order.createdAt' 'DESC'
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('order.createdAt', 'DESC');
    });

    it('should allow valid sortBy and sortOrder values', async () => {
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

      await service.getAllOrders({
        sortBy: 'total',
        sortOrder: 'ASC',
      });

      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('order.total', 'ASC');
    });
  });

  describe('updateOrderStatus Exception Handling', () => {
    it('should throw BadRequestException for invalid status', async () => {
      jest.spyOn(ordersRepository, 'findOne').mockResolvedValue({ id: 'order-1' } as any);

      await expect(
        service.updateOrderStatus('order-1', 'invalid-status'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if order does not exist', async () => {
      jest.spyOn(ordersRepository, 'findOne').mockResolvedValue(null);

      await expect(
        service.updateOrderStatus('order-999', 'shipped'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('bulkUpdateStatus Exception Handling', () => {
    it('should throw BadRequestException for invalid status', async () => {
      jest.spyOn(ordersRepository, 'find').mockResolvedValue([{ id: 'order-1' }] as any);

      await expect(
        service.bulkUpdateStatus(['order-1'], 'invalid-status'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if no orders found', async () => {
      jest.spyOn(ordersRepository, 'find').mockResolvedValue([]);

      await expect(
        service.bulkUpdateStatus(['order-999'], 'shipped'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
