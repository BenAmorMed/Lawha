import { Test } from '@nestjs/testing';
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
    getCount: jest.fn().mockResolvedValue(0),
    getMany: jest.fn().mockResolvedValue([]),
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AdminService,
        { provide: getRepositoryToken(Order), useValue: { createQueryBuilder: () => mockQB } },
        { provide: getRepositoryToken(Review), useValue: {} },
      ],
    }).compile();
    service = module.get(AdminService);
  });

  it('prevents SQL injection by whitelisting sortBy and sortOrder', async () => {
    await service.getAllOrders({ sortBy: 'id; DROP TABLE orders' as any, sortOrder: 'DESC' });
    expect(mockQB.orderBy).toHaveBeenCalledWith('order.createdAt', 'DESC');

    await service.getAllOrders({ sortBy: 'total', sortOrder: 'invalid' as any });
    expect(mockQB.orderBy).toHaveBeenCalledWith('order.total', 'DESC');
  });
});
