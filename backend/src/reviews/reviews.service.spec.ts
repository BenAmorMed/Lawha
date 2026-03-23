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
  let productsRepository: Repository<Product>;

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
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
            find: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Product),
          useValue: {
            findOne: jest.fn(),
            update: jest.fn(),
            find: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Order),
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ReviewsService>(ReviewsService);
    reviewsRepository = module.get<Repository<Review>>(getRepositoryToken(Review));
    productsRepository = module.get<Repository<Product>>(getRepositoryToken(Product));
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
    it('should return reviews and denormalized stats from product repository', async () => {
      const mockReviews = [
        { id: '1', rating: 5, title: 'Good', comment: 'Nice', user: { email: 'test@example.com' } },
      ];
      const mockTotal = 1;
      const mockProduct = { id: 'product-1', rating: 4.5, reviewsCount: 10 };

      const queryBuilder: any = {
        where: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([mockReviews, mockTotal]),
      };

      jest.spyOn(reviewsRepository, 'createQueryBuilder').mockReturnValue(queryBuilder);
      jest.spyOn(productsRepository, 'findOne').mockResolvedValue(mockProduct as any);

      const result = await service.getProductReviews('product-1');

      expect(result.pagination.total).toBe(1);
      expect(result.productRating.total).toBe(10);
      expect(result.productRating.average).toBe(4.5);
      expect(result.reviews[0].id).toBe('1');
      expect(productsRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'product-1' },
        select: ['rating', 'reviewsCount']
      });
    });
  });

  describe('getMultipleProductStats', () => {
    it('should fetch denormalized stats from product repository', async () => {
      const mockProducts = [
        { id: 'p1', rating: 4.8, reviewsCount: 100 },
        { id: 'p2', rating: 3.5, reviewsCount: 50 },
      ];

      jest.spyOn(productsRepository, 'find').mockResolvedValue(mockProducts as any);

      const result = await service.getMultipleProductStats(['p1', 'p2', 'p3']);

      expect(result['p1']).toEqual({ averageRating: 4.8, totalReviews: 100 });
      expect(result['p2']).toEqual({ averageRating: 3.5, totalReviews: 50 });
      expect(result['p3']).toEqual({ averageRating: 0, totalReviews: 0 });
      expect(productsRepository.find).toHaveBeenCalled();
    });
  });

  describe('denormalization', () => {
    it('should update product stats when a review is created', async () => {
      const createDto = { productId: 'p1', rating: 5, title: 'T', comment: 'C' };
      const mockStats = { averageRating: 5, totalReviews: 1, ratingDistribution: { '5': 1 } };

      jest.spyOn(productsRepository, 'findOne').mockResolvedValue({ id: 'p1' } as any);
      jest.spyOn(reviewsRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(reviewsRepository, 'create').mockReturnValue({ ...createDto, id: 'r1' } as any);
      jest.spyOn(reviewsRepository, 'save').mockResolvedValue({ id: 'r1' } as any);

      // Mock updateProductStats dependency
      jest.spyOn(service, 'getProductStats').mockResolvedValue(mockStats);
      jest.spyOn(productsRepository, 'update').mockResolvedValue({} as any);

      await service.createReview('u1', createDto);

      expect(productsRepository.update).toHaveBeenCalledWith('p1', {
        rating: 5,
        reviewsCount: 1,
      });
    });
  });
});
