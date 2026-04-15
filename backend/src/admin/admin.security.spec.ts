import { AdminService } from './admin.service';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from '../orders/order.entity';
import { Review } from '../reviews/review.entity';
import { BadRequestException } from '@nestjs/common';

describe('AdminService Security & Consistency', () => {
  let adminService: AdminService;
  let ordersRepository: Repository<Order>;
  let reviewsRepository: Repository<Review>;

  const mockQueryBuilder = {
    where: jest.fn().mockReturnThis(),
    getCount: jest.fn().mockResolvedValue(0),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockResolvedValue([]),
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    getRawMany: jest.fn().mockResolvedValue([]),
    getRawOne: jest.fn().mockResolvedValue({}),
  };

  beforeEach(() => {
    ordersRepository = {
      createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
      findOne: jest.fn(),
      save: jest.fn(),
      count: jest.fn().mockResolvedValue(0),
      find: jest.fn().mockResolvedValue([]),
    } as any;
    reviewsRepository = {
      createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
      findOne: jest.fn(),
      delete: jest.fn(),
    } as any;
    adminService = new AdminService(ordersRepository, reviewsRepository);
  });

  it('should prevent SQL injection in getAllOrders sortBy by whitelisting', async () => {
    const maliciousSortBy = 'id; DROP TABLE orders; --' as any;
    await adminService.getAllOrders({ sortBy: maliciousSortBy });

    // Should fallback to default 'createdAt'
    expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('order.createdAt', 'DESC');
  });

  it('should throw BadRequestException in updateOrderStatus for invalid status', async () => {
    const orderId = 'some-uuid';
    (ordersRepository.findOne as jest.Mock).mockResolvedValue({ id: orderId });

    await expect(adminService.updateOrderStatus(orderId, 'invalid-status')).rejects.toThrow(BadRequestException);
  });

  it('should accept REFUNDED as a valid status', async () => {
    const orderId = 'some-uuid';
    const mockOrder = { id: orderId, status: OrderStatus.PENDING_PAYMENT };
    (ordersRepository.findOne as jest.Mock).mockResolvedValue(mockOrder);

    await adminService.updateOrderStatus(orderId, OrderStatus.REFUNDED);

    expect(mockOrder.status).toBe(OrderStatus.REFUNDED);
    expect(ordersRepository.save).toHaveBeenCalled();
  });
});
