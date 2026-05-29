import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AdminService } from './admin.service';
import { Order } from '../orders/order.entity';
import { Review } from '../reviews/review.entity';
import { Repository } from 'typeorm';

describe('AdminService', () => {
  let service: AdminService;
  let ordersRepository: Repository<Order>;

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
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: getRepositoryToken(Order),
          useValue: {
            createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
          },
        },
        {
          provide: getRepositoryToken(Review),
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
    ordersRepository = module.get<Repository<Order>>(getRepositoryToken(Order));
  });

  describe('getAllOrders', () => {
    it('should use default sorting if not provided', async () => {
      await service.getAllOrders({});
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('order.createdAt', 'DESC');
    });

    it('should use provided sorting', async () => {
      await service.getAllOrders({ sortBy: 'total', sortOrder: 'ASC' });
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('order.total', 'ASC');
    });

    it('should not be vulnerable to SQL injection in sortBy', async () => {
      const maliciousSortBy = 'createdAt; DROP TABLE orders; --' as any;
      await service.getAllOrders({ sortBy: maliciousSortBy });

      // Should fallback to default 'createdAt' because malicious input is not whitelisted
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
        'order.createdAt',
        'DESC',
      );
    });

    it('should not be vulnerable to SQL injection in sortOrder', async () => {
      const maliciousSortOrder = 'DESC; DROP TABLE orders; --' as any;
      await service.getAllOrders({ sortOrder: maliciousSortOrder });

      // Should fallback to default 'DESC' because malicious input is not 'ASC' or 'DESC'
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
        'order.createdAt',
        'DESC',
      );
    });
  });
});
