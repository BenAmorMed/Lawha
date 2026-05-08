import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { AdminService } from './admin.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Order, OrderStatus } from '../orders/order.entity';
import { Review } from '../reviews/review.entity';

describe('AdminService', () => {
  let service: AdminService;
  let ordersRepository: any;
  let reviewsRepository: any;

  const mockQueryBuilder = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
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
  };

  beforeEach(async () => {
    ordersRepository = {
      createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
      findOne: jest.fn(),
      save: jest.fn(),
      count: jest.fn(),
      find: jest.fn(),
    };

    reviewsRepository = {
      createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
      findOne: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        { provide: getRepositoryToken(Order), useValue: ordersRepository },
        { provide: getRepositoryToken(Review), useValue: reviewsRepository },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
    jest.clearAllMocks();
  });

  describe('getAllOrders', () => {
    it('should use default sort if no filters provided', async () => {
      await service.getAllOrders({});
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('order.createdAt', 'DESC');
    });

    it('should use provided sort filters', async () => {
      await service.getAllOrders({ sortBy: 'total', sortOrder: 'ASC' });
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('order.total', 'ASC');
    });

    it('should use default sort if malicious sortBy is provided', async () => {
      const maliciousSortBy = 'total; DROP TABLE orders;--' as any;
      await service.getAllOrders({ sortBy: maliciousSortBy });
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('order.createdAt', 'DESC');
    });

    it('should use default sort order if malicious sortOrder is provided', async () => {
      await service.getAllOrders({ sortOrder: 'DESC; DROP TABLE orders;--' as any });
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('order.createdAt', 'DESC');
    });
  });

  describe('updateOrderStatus', () => {
    it('should update status successfully', async () => {
      const mockOrder = { id: 'order-1', status: OrderStatus.PENDING_PAYMENT };
      ordersRepository.findOne.mockResolvedValue(mockOrder);
      ordersRepository.save.mockResolvedValue({ ...mockOrder, status: 'shipped' });

      const result = await service.updateOrderStatus('order-1', 'shipped');
      expect(result.status).toBe('shipped');
      expect(ordersRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if order not found', async () => {
      ordersRepository.findOne.mockResolvedValue(null);
      await expect(service.updateOrderStatus('none', 'shipped'))
        .rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for invalid status', async () => {
      const mockOrder = { id: 'order-1', status: OrderStatus.PENDING_PAYMENT };
      ordersRepository.findOne.mockResolvedValue(mockOrder);

      await expect(
        service.updateOrderStatus('order-1', 'invalid-status'),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
