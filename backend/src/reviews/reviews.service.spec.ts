import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
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

      const ratingQueryBuilder: any = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ avg_rating: '5', total_reviews: '1' }),
      };

      jest.spyOn(reviewsRepository, 'createQueryBuilder')
        .mockReturnValueOnce(queryBuilder)
        .mockReturnValueOnce(ratingQueryBuilder);

      const result = await service.getProductReviews('product-1');

      expect(result.pagination.total).toBe(1);
      expect(result.productRating.total).toBe(1);
      expect(result.productRating.average).toBe(5);
      expect(result.reviews[0].id).toBe('1');
    });

    it('should return fullName if available, otherwise masked email', async () => {
      const mockReviews = [
        {
          id: '1',
          rating: 5,
          title: 'Good',
          comment: 'Nice',
          user: { email: 'john.doe@example.com', fullName: 'John Doe' },
        },
        {
          id: '2',
          rating: 4,
          title: 'Okay',
          comment: 'Not bad',
          user: { email: 'jane.smith@example.com', fullName: null },
        },
      ];
      const mockTotal = 2;

      const queryBuilder: any = {
        where: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([mockReviews, mockTotal]),
      };

      const ratingQueryBuilder: any = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ avg_rating: '4.5', total_reviews: '2' }),
      };

      jest.spyOn(reviewsRepository, 'createQueryBuilder')
        .mockReturnValueOnce(queryBuilder)
        .mockReturnValueOnce(ratingQueryBuilder);

      const result = await service.getProductReviews('product-1');

      expect(result.reviews[0].userEmail).toBe('John Doe');
      expect(result.reviews[1].userEmail).toBe('j***@example.com');
    });
  });

  describe('updateReview and deleteReview ownership', () => {
    it('updateReview should throw NotFoundException if user is not the owner', async () => {
      const mockReview = { id: 'rev-1', userId: 'user-1' } as Review;
      jest.spyOn(service, 'getReviewById').mockResolvedValue(mockReview);

      await expect(service.updateReview('rev-1', 'user-2', {})).rejects.toThrow(
        NotFoundException,
      );
    });

    it('deleteReview should throw NotFoundException if user is not the owner', async () => {
      const mockReview = { id: 'rev-1', userId: 'user-1' } as Review;
      jest.spyOn(service, 'getReviewById').mockResolvedValue(mockReview);

      await expect(service.deleteReview('rev-1', 'user-2')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
