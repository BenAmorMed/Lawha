import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ReviewsService } from './reviews.service';
import { Review } from './review.entity';
import { Order } from '../orders/order.entity';
import { Product } from '../products/product.entity';
import { Repository } from 'typeorm';

describe('ReviewsService', () => {
  let service: ReviewsService;
  let reviewsRepository: Repository<Review>;

  const mockReviewsRepository = {
    createQueryBuilder: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  };

  const mockOrdersRepository = {
    findOne: jest.fn(),
  };

  const mockProductsRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewsService,
        {
          provide: getRepositoryToken(Review),
          useValue: mockReviewsRepository,
        },
        {
          provide: getRepositoryToken(Order),
          useValue: mockOrdersRepository,
        },
        {
          provide: getRepositoryToken(Product),
          useValue: mockProductsRepository,
        },
      ],
    }).compile();

    service = module.get<ReviewsService>(ReviewsService);
    reviewsRepository = module.get<Repository<Review>>(getRepositoryToken(Review));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getProductStats', () => {
    it('should calculate stats correctly from a single distribution query', async () => {
      const productId = 'test-product-id';
      const mockStats = [
        { rating: '5', count: '10' },
        { rating: '4', count: '5' },
        { rating: '1', count: '5' },
      ];

      const createQueryBuilder: any = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue(mockStats),
      };

      mockReviewsRepository.createQueryBuilder.mockReturnValue(createQueryBuilder);

      const result = await service.getProductStats(productId);

      expect(result.total_reviews).toBe(20);
      expect(result.average_rating).toBe(3.75); // (5*10 + 4*5 + 1*5) / 20 = 75 / 20 = 3.75
      expect(result.rating_distribution).toEqual({
        1: 5,
        2: 0,
        3: 0,
        4: 5,
        5: 10,
      });
      expect(mockReviewsRepository.createQueryBuilder).toHaveBeenCalledTimes(1);
    });

    it('should handle zero reviews correctly', async () => {
      const productId = 'empty-product';
      const createQueryBuilder: any = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([]),
      };

      mockReviewsRepository.createQueryBuilder.mockReturnValue(createQueryBuilder);

      const result = await service.getProductStats(productId);

      expect(result.total_reviews).toBe(0);
      expect(result.average_rating).toBe(0);
      expect(result.rating_distribution).toEqual({
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
      });
    });
  });

  describe('getProductReviews', () => {
    it('should return reviews and pagination with optimized total count usage', async () => {
      const productId = 'test-product';
      const mockReviews = [
        { id: '1', rating: 5, title: 'Great', comment: 'Loved it', user: { email: 'u1@ex.com' } },
      ];
      const total = 1;

      const createQueryBuilderPrimary: any = {
        where: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([mockReviews, total]),
      };

      const createQueryBuilderRating: any = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ avg_rating: '5.0' }),
      };

      mockReviewsRepository.createQueryBuilder
        .mockReturnValueOnce(createQueryBuilderPrimary)
        .mockReturnValueOnce(createQueryBuilderRating);

      const result = await service.getProductReviews(productId);

      expect(result.reviews).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
      expect(result.product_rating.average).toBe(5.0);
      expect(result.product_rating.total).toBe(1);

      // Verify no COUNT call in the second query builder chain
      expect(createQueryBuilderRating.addSelect).not.toHaveBeenCalled();
    });
  });
});
