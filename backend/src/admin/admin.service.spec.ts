import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AdminService } from './admin.service';
import { Order } from '../orders/order.entity';
import { Review } from '../reviews/review.entity';

describe('AdminService Security', () => {
  let service: AdminService;
  const mockQB = {
    where: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockResolvedValue([]),
    getCount: jest.fn().mockResolvedValue(0),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        { provide: getRepositoryToken(Order), useValue: { createQueryBuilder: () => mockQB } },
        { provide: getRepositoryToken(Review), useValue: { createQueryBuilder: () => mockQB } },
      ],
    }).compile();
    service = module.get<AdminService>(AdminService);
  });

  it('getAllOrders whitelists sortBy and sortOrder', async () => {
    await service.getAllOrders({ sortBy: 'id; DROP TABLE orders;--' as any, sortOrder: 'invalid' as any });
    expect(mockQB.orderBy).toHaveBeenCalledWith('order.createdAt', 'DESC');

    await service.getAllOrders({ sortBy: 'total', sortOrder: 'ASC' });
    expect(mockQB.orderBy).toHaveBeenCalledWith('order.total', 'ASC');
  });
});
