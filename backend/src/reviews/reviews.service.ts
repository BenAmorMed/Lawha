import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
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

    // Denormalize aggregate stats to Product entity for faster read-paths
    await this.updateProductStats(productId);

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
    // Parallelize reviews fetch and product stats retrieval for better performance
    const [reviewsResult, product] = await Promise.all([
      (async () => {
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

        return query.getManyAndCount();
      })(),
      this.productsRepository.findOne({
        where: { id: productId },
        select: ['rating', 'reviewsCount']
      })
    ]);

    const [reviews, total] = reviewsResult;

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
      productRating: {
        // Use denormalized fields from Product entity instead of aggregate SQL queries
        average: product ? parseFloat(product.rating.toString()) : 0,
        total: product ? product.reviewsCount : 0,
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

    // Update denormalized stats if rating changed
    if (updateReviewDto.rating !== undefined) {
      await this.updateProductStats(review.productId);
    }

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

    // Update denormalized stats
    await this.updateProductStats(review.productId);

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

  async getMultipleProductStats(productIds: string[]) {
    // Optimization: Batch fetch denormalized stats from Product entity
    // instead of performing heavy aggregate queries on the reviews table.
    const products = await this.productsRepository.find({
      where: { id: In(productIds) },
      select: ['id', 'rating', 'reviewsCount']
    });

    const results: Record<string, { averageRating: number; totalReviews: number }> = {};

    // Initialize with zeros for all requested IDs
    productIds.forEach(id => {
      results[id] = { averageRating: 0, totalReviews: 0 };
    });

    products.forEach(product => {
      results[product.id] = {
        averageRating: parseFloat(product.rating.toString() || '0'),
        totalReviews: product.reviewsCount || 0,
      };
    });

    return results;
  }

  async getProductStats(productId: string) {
    // Optimization: Perform only ONE database query to get the rating distribution
    // and derive totalReviews and averageRating in-memory.
    const stats = await this.reviewsRepository
      .createQueryBuilder('review')
      .select('review.rating', 'rating')
      .addSelect('COUNT(review.id)', 'count')
      .where('review.productId = :productId', { productId })
      .groupBy('review.rating')
      .orderBy('review.rating', 'DESC')
      .getRawMany();

    let totalReviews = 0;
    let totalPoints = 0;
    const distribution = {};

    stats.forEach(item => {
      const rating = parseInt(item.rating, 10);
      const count = parseInt(item.count, 10);
      totalReviews += count;
      totalPoints += rating * count;
      distribution[rating] = count;
    });

    return {
      averageRating: totalReviews > 0 ? parseFloat((totalPoints / totalReviews).toFixed(2)) : 0,
      totalReviews: totalReviews,
      ratingDistribution: distribution,
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

  /**
   * Recalculates and updates product rating and review count
   * to provide O(1) read-paths for product listings.
   */
  private async updateProductStats(productId: string): Promise<void> {
    const stats = await this.getProductStats(productId);

    await this.productsRepository.update(productId, {
      rating: stats.averageRating,
      reviewsCount: stats.totalReviews,
    });
  }
}
