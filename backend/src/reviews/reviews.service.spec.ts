import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ReviewsService } from './reviews.service';
import { Review } from './review.entity';
import { Product } from '../products/product.entity';
import { Order } from '../orders/order.entity';
import { Repository } from 'typeorm';

describe('ReviewsService', () => {
  let service: ReviewsService;
  let reviewsRepository: Repository<Review>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewsService,
        {
          provide: getRepositoryToken(Review),
          useValue: {
            createQueryBuilder: jest.fn(),
            getManyAndCount: jest.fn(),
            getRawOne: jest.fn(),
            getRawMany: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Product),
          useValue: {},
        },
        {
          provide: getRepositoryToken(Order),
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<ReviewsService>(ReviewsService);
    reviewsRepository = module.get<Repository<Review>>(getRepositoryToken(Review));
  });

  describe('getProductStats', () => {
    it('should correctly calculate totalReviews and averageRating from distribution', async () => {
      const mockStats = [
        { rating: '5', count: '2' },
        { rating: '4', count: '1' },
      ];

      const queryBuilder: any = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue(mockStats),
      };

      jest.spyOn(reviewsRepository, 'createQueryBuilder').mockReturnValue(queryBuilder);

      const result = await service.getProductStats('product-1');

      expect(result.totalReviews).toBe(3);
      expect(result.averageRating).toBe(4.67); // (5*2 + 4*1) / 3 = 14 / 3 = 4.666...
      expect(result.ratingDistribution).toEqual({ '5': 2, '4': 1 });
    });

    it('should return zeros when no reviews exist', async () => {
      const queryBuilder: any = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([]),
      };

      jest.spyOn(reviewsRepository, 'createQueryBuilder').mockReturnValue(queryBuilder);

      const result = await service.getProductStats('product-1');

      expect(result.totalReviews).toBe(0);
      expect(result.averageRating).toBe(0);
      expect(result.ratingDistribution).toEqual({});
    });
  });

  describe('updateProductStats', () => {
    it('should update product with new stats', async () => {
      const productId = 'product-1';
      const mockStats = [
        { rating: '5', count: '10' },
      ];

      const queryBuilder: any = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue(mockStats),
      };

      jest.spyOn(reviewsRepository, 'createQueryBuilder').mockReturnValue(queryBuilder);
      const productRepo = (service as any).productsRepository;
      productRepo.update = jest.fn().mockResolvedValue({ affected: 1 });

      await (service as any).updateProductStats(productId);

      expect(productRepo.update).toHaveBeenCalledWith(productId, {
        rating: 5,
        reviewsCount: 10,
      });
    });
  });

  describe('getProductReviews', () => {
    it('should return reviews and correct total from getManyAndCount', async () => {
      const mockReviews = [
        { id: '1', rating: 5, title: 'Good', comment: 'Nice', user: { email: 'test@example.com' } },
      ];
      const mockTotal = 1;

      const queryBuilder: any = {
        where: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([mockReviews, mockTotal]),
      };

      const productRepo = (service as any).productsRepository;
      productRepo.findOne = jest.fn().mockResolvedValue({ rating: 5 });

      jest.spyOn(reviewsRepository, 'createQueryBuilder')
        .mockReturnValueOnce(queryBuilder);

      const result = await service.getProductReviews('product-1');

      expect(result.pagination.total).toBe(1);
      expect(result.productRating.total).toBe(1);
      expect(result.productRating.average).toBe(5);
      expect(result.reviews[0].id).toBe('1');
    });
  });
});
