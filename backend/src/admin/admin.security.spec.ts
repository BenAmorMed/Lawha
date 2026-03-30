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
    orderRepository = module.get(getRepositoryToken(Order));
  });

  it('should whitelist sortBy fields in getAllOrders', async () => {
    // Test with malicious sortBy
    await service.getAllOrders({ sortBy: 'id; DROP TABLE orders; --' as any });
    expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('order.createdAt', 'DESC');

    // Test with valid sortBy
    await service.getAllOrders({ sortBy: 'total' });
    expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('order.total', 'DESC');
  });

  it('should whitelist sortOrder in getAllOrders', async () => {
    // Test with malicious sortOrder
    await service.getAllOrders({ sortOrder: 'DESC; DROP TABLE orders; --' as any });
    expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('order.createdAt', 'DESC');

    // Test with valid sortOrder
    await service.getAllOrders({ sortOrder: 'ASC' });
    expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('order.createdAt', 'ASC');
  });
});
