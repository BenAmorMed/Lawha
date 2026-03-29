import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AdminService } from './admin.service';
import { Order } from '../orders/order.entity';
import { Review } from '../reviews/review.entity';

describe('AdminService Security', () => {
  let service: AdminService;
  let ordersRepository: any;

  const mockQueryBuilder: any = {
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
            count: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Review),
          useValue: {
            createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
          },
        },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
    ordersRepository = module.get(getRepositoryToken(Order));
  });

  it('should whitelist sortBy in getAllOrders to prevent SQL injection', async () => {
    // Malicious sortBy attempt
    const maliciousSortBy = "createdAt'; DROP TABLE orders; --" as any;

    await service.getAllOrders({
      sortBy: maliciousSortBy,
    });

    // Should have used the default 'createdAt'
    expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
      'order.createdAt',
      'DESC',
    );
  });

  it('should whitelist sortOrder in getAllOrders', async () => {
    const maliciousSortOrder = 'DESC; DELETE FROM users;' as any;

    await service.getAllOrders({
      sortOrder: maliciousSortOrder,
    });

    // Should have defaulted to 'DESC'
    expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
      expect.any(String),
      'DESC',
    );
  });

  it('should allow valid sortBy and sortOrder', async () => {
    await service.getAllOrders({
      sortBy: 'total',
      sortOrder: 'ASC',
    });

    expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('order.total', 'ASC');
  });
});
