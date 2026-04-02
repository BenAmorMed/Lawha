import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AdminService } from './admin.service';
import { Order } from '../orders/order.entity';
import { Review } from '../reviews/review.entity';

describe('AdminService Security', () => {
  let service: AdminService;
  let ordersRepository: any;

  beforeEach(async () => {
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

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: getRepositoryToken(Order),
          useValue: {
            createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
            count: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
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

  it('should sanitize sortBy and sortOrder in getAllOrders to prevent SQL injection', async () => {
    const queryBuilder = ordersRepository.createQueryBuilder();

    // Test with malicious input
    await service.getAllOrders({
      sortBy: "createdAt'; DROP TABLE orders; --" as any,
      sortOrder: "DESC; DELETE FROM users; --" as any,
    });

    // Should fall back to safe defaults
    expect(queryBuilder.orderBy).toHaveBeenCalledWith('order.createdAt', 'DESC');
  });

  it('should allow valid sortBy and sortOrder in getAllOrders', async () => {
    const queryBuilder = ordersRepository.createQueryBuilder();

    await service.getAllOrders({
      sortBy: 'total',
      sortOrder: 'ASC',
    });

    expect(queryBuilder.orderBy).toHaveBeenCalledWith('order.total', 'ASC');
  });
});
