import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './review.entity';
import { Order } from '../orders/order.entity';
import { Product } from '../products/product.entity';
import { CreateReviewDto, UpdateReviewDto } from './reviews.dto';

@Injectable()
export class ReviewsService {
  private readonly logger = new Logger(ReviewsService.name);

  constructor(
    @InjectRepository(Review)
    private reviewsRepository: Repository<Review>,
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
  ) { }

  async createReview(
    userId: string,
    createReviewDto: CreateReviewDto,
  ): Promise<Review> {
    const { productId, orderId } = createReviewDto;

    // Verify product exists
    const product = await this.productsRepository.findOne({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException(`Product ${productId} not found`);
    }

    // Check if user already reviewed this product
    const existingReview = await this.reviewsRepository.findOne({
      where: {
        userId: userId,
        productId,
      },
    });

    if (existingReview) {
      throw new BadRequestException(
        'You have already reviewed this product',
      );
    }

    let verifiedPurchase = false;

    // If orderId provided, verify it belongs to the user and contains the product
    if (orderId) {
      const order = await this.ordersRepository.findOne({
        where: {
          id: orderId,
          userId: userId,
        },
        relations: ['items'],
      });

      if (!order) {
        throw new BadRequestException('Order not found or does not belong to you');
      }

      // Check if order contains this product
      const hasProduct = order.items?.some((item) => item.productId === productId);
      verifiedPurchase = hasProduct ? true : false;
    }

    const review = this.reviewsRepository.create({
      ...createReviewDto,
      userId: userId,
      orderId: orderId || null,
      verifiedPurchase: verifiedPurchase,
    });

    await this.reviewsRepository.save(review);

    this.logger.log(
      `Review created by user ${userId} for product ${productId}`,
      ReviewsService.name,
    );

    return review;
  }

  async getProductReviews(
    productId: string,
    limit: number = 10,
    offset: number = 0,
    sortBy: 'helpful' | 'recent' | 'rating' = 'recent',
  ) {
    const query = this.reviewsRepository
      .createQueryBuilder('review')
      .where('review.productId = :productId', { productId })
      .leftJoinAndSelect('review.user', 'user')
      .skip(offset)
      .take(limit);

    if (sortBy === 'helpful') {
      query.orderBy('review.helpfulCount', 'DESC');
    } else if (sortBy === 'rating') {
      query.orderBy('review.rating', 'DESC');
    } else {
      query.orderBy('review.createdAt', 'DESC');
    }

    const [reviews, total] = await query.getManyAndCount();

    // Calculate product rating average
    const ratingQuery = await this.reviewsRepository
      .createQueryBuilder('review')
      .select('AVG(review.rating)', 'avg_rating')
      .addSelect('COUNT(review.id)', 'total_reviews')
      .where('review.productId = :productId', { productId })
      .getRawOne();

    return {
      reviews: reviews.map((review) => ({
        id: review.id,
        rating: review.rating,
        title: review.title,
        comment: review.comment,
        userEmail: review.user?.email,
        verifiedPurchase: review.verifiedPurchase,
        helpfulCount: review.helpfulCount,
        createdAt: review.createdAt,
      })),
      pagination: {
        total,
        limit,
        offset,
        pages: Math.ceil(Number(total) / limit),
      },
      product_rating: {
        average: parseFloat(ratingQuery?.avg_rating || 0),
        total: parseInt(ratingQuery?.total_reviews || 0, 10),
      },
    };
  }

  async getUserReviews(
    userId: string,
    limit: number = 10,
    offset: number = 0,
  ) {
    const [reviews, total] = await this.reviewsRepository.find({
      where: { userId: userId },
      relations: ['product'],
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });

    return {
      reviews,
      pagination: {
        total,
        limit,
        offset,
        pages: Math.ceil(Number(total) / limit),
      },
    };
  }

  async getReviewById(reviewId: string): Promise<Review> {
    const review = await this.reviewsRepository.findOne({
      where: { id: reviewId },
      relations: ['user', 'product'],
    });

    if (!review) {
      throw new NotFoundException(`Review ${reviewId} not found`);
    }

    return review;
  }

  async updateReview(
    reviewId: string,
    userId: string,
    updateReviewDto: UpdateReviewDto,
  ): Promise<Review> {
    const review = await this.getReviewById(reviewId);

    // Verify ownership
    if (review.userId !== userId) {
      throw new BadRequestException('You can only edit your own reviews');
    }

    Object.assign(review, updateReviewDto);
    await this.reviewsRepository.save(review);

    this.logger.log(
      `Review ${reviewId} updated by user ${userId}`,
      ReviewsService.name,
    );

    return review;
  }

  async deleteReview(reviewId: string, userId: string): Promise<void> {
    const review = await this.getReviewById(reviewId);

    // Verify ownership
    if (review.userId !== userId) {
      throw new BadRequestException('You can only delete your own reviews');
    }

    await this.reviewsRepository.delete(reviewId);

    this.logger.log(
      `Review ${reviewId} deleted by user ${userId}`,
      ReviewsService.name,
    );
  }

  async markHelpful(reviewId: string, userId: string): Promise<Review> {
    const review = await this.getReviewById(reviewId);

    // Check if user already marked as helpful
    if (review.helpfulBy?.includes(userId)) {
      throw new BadRequestException('You have already marked this as helpful');
    }

    review.helpfulCount += 1;
    review.helpfulBy = [...(review.helpfulBy || []), userId];

    await this.reviewsRepository.save(review);

    return review;
  }

  async getProductStats(productId: string) {
    const stats = await this.reviewsRepository
      .createQueryBuilder('review')
      .select('review.rating', 'rating')
      .addSelect('COUNT(review.id)', 'count')
      .where('review.productId = :productId', { productId })
      .groupBy('review.rating')
      .orderBy('review.rating', 'DESC')
      .getRawMany();

    const totalReviews = await this.reviewsRepository.count({
      where: { productId: productId },
    });

    const avgRating = await this.reviewsRepository
      .createQueryBuilder('review')
      .select('AVG(review.rating)', 'avg')
      .where('review.productId = :productId', { productId })
      .getRawOne();

    return {
      average_rating: parseFloat(avgRating?.avg || 0),
      total_reviews: totalReviews,
      rating_distribution: stats.reduce(
        (acc, item) => ({
          ...acc,
          [item.rating]: parseInt(item.count, 10),
        }),
        {},
      ),
    };
  }

  async getAllReviews(
    limit: number = 20,
    offset: number = 0,
    sortBy: 'recent' | 'helpful' | 'rating' = 'recent',
  ) {
    const query = this.reviewsRepository
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.user', 'user')
      .leftJoinAndSelect('review.product', 'product')
      .skip(offset)
      .take(limit);

    if (sortBy === 'helpful') {
      query.orderBy('review.helpfulCount', 'DESC');
    } else if (sortBy === 'rating') {
      query.orderBy('review.rating', 'DESC');
    } else {
      query.orderBy('review.createdAt', 'DESC');
    }

    const [reviews, total] = await query.getManyAndCount();

    return {
      reviews,
      pagination: {
        total,
        limit,
        offset,
        pages: Math.ceil(Number(total) / limit),
      },
    };
  }
}
