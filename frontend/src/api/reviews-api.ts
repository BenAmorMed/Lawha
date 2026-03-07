import { apiClient } from './api-client';

export interface Review {
  id: string;
  rating: number;
  title: string;
  comment: string;
  userEmail?: string;
  verifiedPurchase: boolean;
  helpfulCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Record<number, number>;
}

export const reviewsApi = {
  // Create a new review
  createReview: async (data: {
    rating: number;
    title: string;
    comment: string;
    productId: string;
    orderId?: string;
  }): Promise<Review> => {
    const response = await apiClient.post('/reviews', data);
    return response.data;
  },

  // Get reviews for a product
  getProductReviews: async (
    productId: string,
    limit: number = 10,
    offset: number = 0,
    sortBy: 'helpful' | 'recent' | 'rating' = 'recent',
  ): Promise<{
    reviews: Review[];
    pagination: { total: number; limit: number; offset: number; pages: number };
    productRating: { average: number; total: number };
  }> => {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
      sortBy,
    });
    const response = await apiClient.get(
      `/reviews/product/${productId}?${params.toString()}`,
    );
    return response.data;
  },

  // Get rating stats for a product
  getProductStats: async (productId: string): Promise<ProductStats> => {
    const response = await apiClient.get(`/reviews/product/${productId}/stats`);
    return response.data;
  },

  // Get rating stats for multiple products
  getMultipleProductStats: async (
    productIds: string[],
  ): Promise<Record<string, { averageRating: number; totalReviews: number }>> => {
    const response = await apiClient.get(
      `/reviews/products/stats?ids=${productIds.join(',')}`,
    );
    return response.data;
  },

  // Get authenticated user's reviews
  getUserReviews: async (
    limit: number = 10,
    offset: number = 0,
  ): Promise<{
    reviews: Review[];
    pagination: { total: number; limit: number; offset: number; pages: number };
  }> => {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });
    const response = await apiClient.get(`/reviews/my-reviews?${params.toString()}`);
    return response.data;
  },

  // Update a review
  updateReview: async (
    reviewId: string,
    data: Partial<{ rating: number; title: string; comment: string }>,
  ): Promise<Review> => {
    const response = await apiClient.patch(`/reviews/${reviewId}`, data);
    return response.data;
  },

  // Delete a review
  deleteReview: async (reviewId: string): Promise<void> => {
    await apiClient.delete(`/reviews/${reviewId}`);
  },

  // Mark review as helpful
  markHelpful: async (reviewId: string): Promise<Review> => {
    const response = await apiClient.post(`/reviews/${reviewId}/helpful`);
    return response.data;
  },
};
