import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AdminService } from './admin.service';
import { Order } from '../orders/order.entity';
import { Review } from '../reviews/review.entity';
import { Repository } from 'typeorm';

describe('AdminService', () => {
  let service: AdminService;
  let orderRepository: Repository<Order>;
  let reviewRepository: Repository<Review>;

  const mockOrderRepository = {
    createQueryBuilder: jest.fn(),
  };

  const mockReviewRepository = {
    createQueryBuilder: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: getRepositoryToken(Order),
          useValue: mockOrderRepository,
        },
        {
          provide: getRepositoryToken(Review),
          useValue: mockReviewRepository,
        },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
    orderRepository = module.get<Repository<Order>>(getRepositoryToken(Order));
    reviewRepository = module.get<Repository<Review>>(getRepositoryToken(Review));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAllOrders', () => {
    it('should use loadRelationCountAndMap and getManyAndCount', async () => {
      const mockOrders = [{ id: '1', itemsCount: 2 }];
      const mockTotal = 1;

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        loadRelationCountAndMap: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([mockOrders, mockTotal]),
      };

      mockOrderRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.getAllOrders({ status: 'pending' });

      expect(mockOrderRepository.createQueryBuilder).toHaveBeenCalledWith('order');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('order.status = :status', { status: 'pending' });
      expect(mockQueryBuilder.loadRelationCountAndMap).toHaveBeenCalledWith('order.itemsCount', 'order.items');
      expect(mockQueryBuilder.getManyAndCount).toHaveBeenCalled();
      expect(result.data[0].itemsCount).toBe(2);
      expect(result.pagination.total).toBe(mockTotal);
    });
  });

  describe('getAllReviews', () => {
    it('should use getManyAndCount', async () => {
      const mockReviews = [{ id: '1', rating: 5 }];
      const mockTotal = 1;

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([mockReviews, mockTotal]),
      };

      mockReviewRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.getAllReviews({ rating: 5 });

      expect(mockReviewRepository.createQueryBuilder).toHaveBeenCalledWith('review');
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('review.rating = :rating', { rating: 5 });
      expect(mockQueryBuilder.getManyAndCount).toHaveBeenCalled();
      expect(result.data).toEqual(mockReviews);
      expect(result.pagination.total).toBe(mockTotal);
    });
  });
});
