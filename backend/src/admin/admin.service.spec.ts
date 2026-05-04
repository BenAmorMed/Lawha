import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AdminService } from './admin.service';
import { Order } from '../orders/order.entity';
import { Review } from '../reviews/review.entity';
import { BadRequestException } from '@nestjs/common';

describe('AdminService', () => {
  let service: AdminService;
  let ordersRepository: any;

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
            count: jest.fn(),
            find: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Review),
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
    ordersRepository = module.get(getRepositoryToken(Order));
  });

  describe('getAllOrders SQL Injection protection', () => {
    it('should use safe sortBy and sortOrder', async () => {
      const queryBuilder: any = {
        where: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(0),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };
      ordersRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      await service.getAllOrders({
        sortBy: 'id; DROP TABLE orders; --' as any,
        sortOrder: 'INVALID' as any,
      });

      expect(queryBuilder.orderBy).toHaveBeenCalledWith('order.createdAt', 'DESC');
    });

    it('should allow valid sortBy and sortOrder', async () => {
      const queryBuilder: any = {
        where: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(0),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };
      ordersRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      await service.getAllOrders({
        sortBy: 'total',
        sortOrder: 'ASC',
      });

      expect(queryBuilder.orderBy).toHaveBeenCalledWith('order.total', 'ASC');
    });
  });

  describe('updateOrderStatus validation', () => {
    it('should throw BadRequestException for invalid status', async () => {
      ordersRepository.findOne.mockResolvedValue({ id: '1' });
      await expect(service.updateOrderStatus('1', 'invalid_status')).rejects.toThrow(BadRequestException);
    });
  });

  describe('bulkUpdateStatus validation', () => {
    it('should throw BadRequestException for invalid status', async () => {
      ordersRepository.find.mockResolvedValue([{ id: '1' }]);
      await expect(service.bulkUpdateStatus(['1'], 'invalid_status')).rejects.toThrow(BadRequestException);
    });
  });
});
