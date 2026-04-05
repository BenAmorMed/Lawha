import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AdminService } from './admin.service';
import { Order } from '../orders/order.entity';
import { Review } from '../reviews/review.entity';

describe('AdminService Security', () => {
  let service: AdminService;
  let orderRepository: any;

  const mockQueryBuilder = {
    where: jest.fn().mockReturnThis(),
    getCount: jest.fn().mockResolvedValue(0),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockResolvedValue([]),
  };

  beforeEach(async () => {
    orderRepository = {
      createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
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

  describe('getAllOrders sorting security', () => {
    it('should use provided valid sortBy and sortOrder', async () => {
      await service.getAllOrders({
        sortBy: 'total',
        sortOrder: 'ASC',
      });

      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('order.total', 'ASC');
    });

    it('should fall back to safe defaults when invalid sortBy is provided', async () => {
      // In a real exploit, this could be "total; DROP TABLE orders; --"
      const maliciousSortBy = 'total; SELECT 1' as any;

      await service.getAllOrders({
        sortBy: maliciousSortBy,
      });

      // If vulnerable, it would be called with `order.total; SELECT 1`
      // We expect it to be called with `order.createdAt` (default)
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('order.createdAt', 'DESC');
    });

    it('should fall back to safe defaults when invalid sortOrder is provided', async () => {
      await service.getAllOrders({
        sortOrder: 'INVALID' as any,
      });

      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('order.createdAt', 'DESC');
    });
  });
});
