import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from './admin.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Order } from '../orders/order.entity';
import { Review } from '../reviews/review.entity';

describe('AdminService Security', () => {
  let service: AdminService;
  const qb = { where: jest.fn().mockReturnThis(), andWhere: jest.fn().mockReturnThis(), leftJoinAndSelect: jest.fn().mockReturnThis(), orderBy: jest.fn().mockReturnThis(), skip: jest.fn().mockReturnThis(), take: jest.fn().mockReturnThis(), getCount: jest.fn().mockResolvedValue(0), getMany: jest.fn().mockResolvedValue([]) };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AdminService, { provide: getRepositoryToken(Order), useValue: { createQueryBuilder: () => qb } }, { provide: getRepositoryToken(Review), useValue: { createQueryBuilder: () => qb } }],
    }).compile();
    service = module.get<AdminService>(AdminService);
    jest.clearAllMocks();
  });

  it('whitelists orders sorting', async () => {
    await service.getAllOrders({ sortBy: 'id' as any, sortOrder: 'INVALID' as any });
    expect(qb.orderBy).toHaveBeenCalledWith('order.createdAt', 'DESC');
  });

  it('whitelists reviews sorting', async () => {
    await service.getAllReviews({ sortBy: 'comment' as any, sortOrder: 'ASC' });
    expect(qb.orderBy).toHaveBeenCalledWith('review.createdAt', 'ASC');
  });
});
