import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AdminService } from './admin.service';
import { Order } from '../orders/order.entity';
import { Review } from '../reviews/review.entity';

describe('AdminService Security', () => {
  let service: AdminService;
  let orderRepository: any;

  const queryBuilderMock = {
    where: jest.fn().mockReturnThis(),
    getCount: jest.fn().mockResolvedValue(0),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockResolvedValue([]),
  };

  const mockOrderRepository = {
    createQueryBuilder: jest.fn(() => queryBuilderMock),
  };

  const mockReviewRepository = {
    createQueryBuilder: jest.fn(() => ({
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getCount: jest.fn().mockResolvedValue(0),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([]),
    })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: getRepositoryToken(Order),
          useValue: mockOrderRepository,
        },
        {
          provide: getRepositoryToken(Review),
          useValue: mockReviewRepository,
        },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
    orderRepository = module.get(getRepositoryToken(Order));
  });

  it('should whitelist sortBy in getAllOrders to prevent SQL injection', async () => {
    // Test with invalid sortBy
    await service.getAllOrders({ sortBy: 'invalid_field' as any });
    expect(queryBuilderMock.orderBy).toHaveBeenCalledWith('order.createdAt', 'DESC');

    // Test with valid sortBy
    await service.getAllOrders({ sortBy: 'total' });
    expect(queryBuilderMock.orderBy).toHaveBeenCalledWith('order.total', 'DESC');
  });

  it('should whitelist sortOrder in getAllOrders to prevent SQL injection', async () => {
    // Test with invalid sortOrder
    await service.getAllOrders({ sortOrder: 'DROP TABLE users' as any });
    expect(queryBuilderMock.orderBy).toHaveBeenCalledWith('order.createdAt', 'DESC');

    // Test with valid sortOrder
    await service.getAllOrders({ sortOrder: 'ASC' });
    expect(queryBuilderMock.orderBy).toHaveBeenCalledWith('order.createdAt', 'ASC');
  });
});
