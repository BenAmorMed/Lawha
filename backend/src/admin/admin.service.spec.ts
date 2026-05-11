import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AdminService } from './admin.service';
import { Order } from '../orders/order.entity';
import { Review } from '../reviews/review.entity';
import { Repository } from 'typeorm';

describe('AdminService', () => {
  let service: AdminService;
  let ordersRepository: Repository<Order>;
  let reviewsRepository: Repository<Review>;

  const mockQueryBuilder = {
    where: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getCount: jest.fn().mockResolvedValue(0),
    getMany: jest.fn().mockResolvedValue([]),
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    getRawMany: jest.fn().mockResolvedValue([]),
    getRawOne: jest.fn().mockResolvedValue({}),
    getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: getRepositoryToken(Order),
          useValue: {
            createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
            findOne: jest.fn(),
            save: jest.fn(),
            count: jest.fn(),
            find: jest.fn(),
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
    ordersRepository = module.get<Repository<Order>>(getRepositoryToken(Order));
    reviewsRepository = module.get<Repository<Review>>(getRepositoryToken(Review));

    jest.clearAllMocks();
  });

  describe('getAllOrders', () => {
    it('should sanitize sortBy and sortOrder to prevent SQL injection', async () => {
      // @ts-ignore - testing malicious input
      const params: any = {
        sortBy: "id'; DROP TABLE orders; --",
        sortOrder: "DESC; DROP TABLE users; --"
      };
      await service.getAllOrders(params);

      // It should fall back to defaults or sanitize
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('order.createdAt', 'DESC');
    });

    it('should use whitelisted sortBy fields', async () => {
      await service.getAllOrders({ sortBy: 'total', sortOrder: 'ASC' });
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('order.total', 'ASC');
    });
  });
});
