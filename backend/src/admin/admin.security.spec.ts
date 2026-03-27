import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AdminService } from './admin.service';
import { Order } from '../orders/order.entity';
import { Review } from '../reviews/review.entity';
import { Repository } from 'typeorm';

describe('AdminService Security', () => {
  let service: AdminService;
  let orderRepository: Repository<Order>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: getRepositoryToken(Order),
          useValue: { createQueryBuilder: jest.fn() },
        },
        {
          provide: getRepositoryToken(Review),
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
    orderRepository = module.get<Repository<Order>>(getRepositoryToken(Order));
  });

  it('should NOT be vulnerable to SQL injection in getAllOrders via sortBy', async () => {
    const mockQueryBuilder: any = {
      where: jest.fn().mockReturnThis(),
      getCount: jest.fn().mockResolvedValue(0),
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([]),
    };

    (orderRepository.createQueryBuilder as jest.Mock).mockReturnValue(mockQueryBuilder);

    const maliciousSortBy: any = "createdAt; DROP TABLE users; --";

    await service.getAllOrders({ sortBy: maliciousSortBy });

    expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
      `order.createdAt`,
      'DESC'
    );
  });
});
