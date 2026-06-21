import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AdminService } from './admin.service';
import { Order } from '../orders/order.entity';
import { Review } from '../reviews/review.entity';
import { BadRequestException } from '@nestjs/common';

describe('AdminService (Security)', () => {
  let service: AdminService;
  let ordersRepository: any;

  const mockQueryBuilder = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getCount: jest.fn().mockResolvedValue(0),
    getMany: jest.fn().mockResolvedValue([]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: getRepositoryToken(Order),
          useValue: {
            createQueryBuilder: jest.fn(() => mockQueryBuilder),
            findOne: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Review),
          useValue: {
            createQueryBuilder: jest.fn(() => mockQueryBuilder),
          },
        },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
    ordersRepository = module.get(getRepositoryToken(Order));
  });

  it('should use whitelisted sortBy in getAllOrders', async () => {
    await service.getAllOrders({ sortBy: 'total' as any, sortOrder: 'ASC' });
    expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('order.total', 'ASC');

    await service.getAllOrders({ sortBy: 'invalid_field' as any, sortOrder: 'DESC' });
    expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('order.createdAt', 'DESC');
  });

  it('should use whitelisted sortOrder in getAllOrders', async () => {
    await service.getAllOrders({ sortBy: 'status' as any, sortOrder: 'INVALID' as any });
    expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('order.status', 'DESC');
  });

  it('should throw BadRequestException for invalid status in updateOrderStatus', async () => {
    ordersRepository.findOne.mockResolvedValue({ id: '1', status: 'pending' });
    await expect(service.updateOrderStatus('1', 'invalid_status')).rejects.toThrow(BadRequestException);
  });
});
