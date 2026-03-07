import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto, UpdateReviewDto } from './reviews.dto';

@Controller('api/v1/reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  /**
   * Create a review for a product
   * Requires authentication
   * Body: { rating (1-5), title, comment, productId, orderId? }
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  async createReview(
    @Req() req: any,
    @Body() createReviewDto: CreateReviewDto,
  ) {
    const review = await this.reviewsService.createReview(
      req.user.id,
      createReviewDto,
    );

    return {
      id: review.id,
      rating: review.rating,
      title: review.title,
      comment: review.comment,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
      verifiedPurchase: review.verifiedPurchase,
      helpfulCount: review.helpfulCount,
    };
  }

  /**
   * Get all reviews for a product
   * Query params: limit, offset, sortBy (recent/helpful/rating)
   */
  @Get('product/:productId')
  async getProductReviews(
    @Param('productId') productId: string,
    @Query('limit') limit: string = '10',
    @Query('offset') offset: string = '0',
    @Query('sortBy') sortBy: 'helpful' | 'recent' | 'rating' = 'recent',
  ) {
    return this.reviewsService.getProductReviews(
      productId,
      parseInt(limit, 10),
      parseInt(offset, 10),
      sortBy,
    );
  }

  /**
   * Get rating stats for a product
   * Returns: average_rating, total_reviews, rating_distribution
   */
  @Get('product/:productId/stats')
  async getProductStats(@Param('productId') productId: string) {
    return this.reviewsService.getProductStats(productId);
  }

  /**
   * Get rating stats for multiple products
   * Query params: ids (comma separated UUIDs)
   */
  @Get('products/stats')
  async getMultipleProductStats(@Query('ids') ids?: string) {
    if (!ids) {
      return {};
    }
    const productIds = ids.split(',');
    return this.reviewsService.getMultipleProductStats(productIds);
  }

  /**
   * Get authenticated user's reviews
   * Query params: limit, offset
   */
  @Get('my-reviews')
  @UseGuards(JwtAuthGuard)
  async getUserReviews(
    @Req() req: any,
    @Query('limit') limit: string = '10',
    @Query('offset') offset: string = '0',
  ) {
    return this.reviewsService.getUserReviews(
      req.user.id,
      parseInt(limit, 10),
      parseInt(offset, 10),
    );
  }

  /**
   * Get specific review by ID
   */
  @Get(':id')
  async getReviewById(@Param('id') reviewId: string) {
    return this.reviewsService.getReviewById(reviewId);
  }

  /**
   * Update a review (only owner can update)
   * Body: { rating?, title?, comment? }
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async updateReview(
    @Req() req: any,
    @Param('id') reviewId: string,
    @Body() updateReviewDto: UpdateReviewDto,
  ) {
    return this.reviewsService.updateReview(
      reviewId,
      req.user.id,
      updateReviewDto,
    );
  }

  /**
   * Delete a review (only owner can delete)
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteReview(
    @Req() req: any,
    @Param('id') reviewId: string,
  ) {
    await this.reviewsService.deleteReview(reviewId, req.user.id);
    return { message: 'Review deleted successfully' };
  }

  /**
   * Mark a review as helpful
   */
  @Post(':id/helpful')
  @UseGuards(JwtAuthGuard)
  async markHelpful(
    @Req() req: any,
    @Param('id') reviewId: string,
  ) {
    return this.reviewsService.markHelpful(reviewId, req.user.id);
  }
}
