import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AdminService } from './admin.service';
import { Order } from '../orders/order.entity';
import { Review } from '../reviews/review.entity';

describe('AdminService (Security)', () => {
  let service: AdminService;
  let repo: any;

  beforeEach(async () => {
    repo = { createQueryBuilder: jest.fn() };
    const module: TestingModule = await Test.createTestingModule({
      providers: [AdminService,
        { provide: getRepositoryToken(Order), useValue: repo },
        { provide: getRepositoryToken(Review), useValue: {} },
      ],
    }).compile();
    service = module.get<AdminService>(AdminService);
  });

  it('should sanitize sortBy and sortOrder for malicious input', async () => {
    const qb: any = { where: jest.fn().mockReturnThis(), getCount: jest.fn().mockResolvedValue(0),
      leftJoinAndSelect: jest.fn().mockReturnThis(), orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(), take: jest.fn().mockReturnThis(), getMany: jest.fn().mockResolvedValue([]) };
    jest.spyOn(repo, 'createQueryBuilder').mockReturnValue(qb);

    await service.getAllOrders({ sortBy: 'id; DROP TABLE orders; --' as any, sortOrder: 'ASC; --' as any });
    expect(qb.orderBy).toHaveBeenCalledWith('order.createdAt', 'DESC');

    await service.getAllOrders({ sortBy: 'total', sortOrder: 'ASC' });
    expect(qb.orderBy).toHaveBeenCalledWith('order.total', 'ASC');
  });
});
