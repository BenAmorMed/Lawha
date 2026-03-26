import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AdminService } from './admin.service';
import { Order } from '../orders/order.entity';
import { Review } from '../reviews/review.entity';

describe('AdminService', () => {
  let service: AdminService;
  let orderRepository: any;

  beforeEach(async () => {
    const mockQueryBuilder = {
      where: jest.fn().mockReturnThis(),
      getCount: jest.fn().mockResolvedValue(0),
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([]),
    };

    orderRepository = {
      createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: getRepositoryToken(Order),
          useValue: orderRepository,
        },
        {
          provide: getRepositoryToken(Review),
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
  });

  describe('getAllOrders', () => {
    it('should use default sortBy if malicious value is provided', async () => {
      const mockQueryBuilder = orderRepository.createQueryBuilder();
      const maliciousSortBy = 'total; DROP TABLE orders; --';

      await service.getAllOrders({ sortBy: maliciousSortBy as any, sortOrder: 'DESC' });
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('order.createdAt', 'DESC');
    });

    it('should use default sortOrder if malicious value is provided', async () => {
      const mockQueryBuilder = orderRepository.createQueryBuilder();
      const maliciousSortOrder = 'DESC; DROP TABLE orders; --';

      await service.getAllOrders({ sortBy: 'total', sortOrder: maliciousSortOrder as any });
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('order.total', 'DESC');
    });

    it('should use valid sortBy and sortOrder', async () => {
      const mockQueryBuilder = orderRepository.createQueryBuilder();

      await service.getAllOrders({ sortBy: 'total', sortOrder: 'ASC' });
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('order.total', 'ASC');
    });
  });
});
