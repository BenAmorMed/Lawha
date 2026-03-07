'use client';

import React, { useState, useEffect } from 'react';
import { reviewsApi, Review } from '@/api/reviews-api';

interface ReviewsListProps {
  productId: string;
  onReviewAdded?: () => void;
}

export default function ReviewsList({ productId, onReviewAdded }: ReviewsListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: {} as Record<number, number>,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'helpful' | 'recent' | 'rating'>('recent');

  useEffect(() => {
    fetchReviews();
    fetchStats();
  }, [productId, sortBy, onReviewAdded]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const data = await reviewsApi.getProductReviews(productId, 10, 0, sortBy);
      setReviews(data.reviews);
      if (data.productRating) {
        setStats({
          averageRating: data.productRating.average,
          totalReviews: data.productRating.total,
          ratingDistribution: stats.ratingDistribution // Fallback to current until stats fetch finishes
        });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load reviews');
      console.error('Fetch reviews error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await reviewsApi.getProductStats(productId);
      setStats(data);
    } catch (err) {
      console.error('Fetch stats error:', err);
    }
  };

  const handleMarkHelpful = async (reviewId: string) => {
    try {
      await reviewsApi.markHelpful(reviewId);
      fetchReviews();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to mark as helpful');
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={star <= rating ? 'text-yellow-400' : 'text-gray-300'}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Customer Reviews</h2>

      {/* Rating Summary */}
      {stats.totalReviews > 0 && (
        <div className="mb-8 pb-8 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-4xl font-bold text-gray-900">
                  {stats.averageRating.toFixed(1)}
                </span>
                <span className="text-gray-600">out of 5</span>
              </div>
              <div className="mb-2">{renderStars(Math.round(stats.averageRating))}</div>
              <p className="text-sm text-gray-600">
                Based on {stats.totalReviews} review
                {stats.totalReviews !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Rating Breakdown */}
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((stars) => {
                const count = stats.ratingDistribution[stars] || 0;
                const percentage =
                  stats.totalReviews > 0
                    ? (count / stats.totalReviews) * 100
                    : 0;

                return (
                  <div key={stars} className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 min-w-fit">
                      {stars} star
                    </span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-400 h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 min-w-fit">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Sort Controls */}
      {reviews.length > 0 && (
        <div className="mb-6">
          <label className="text-sm font-medium text-gray-700 mr-3">
            Sort by:
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="recent">Most Recent</option>
            <option value="helpful">Most Helpful</option>
            <option value="rating">Highest Rating</option>
          </select>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading reviews...</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Reviews List */}
      {!loading && reviews.length === 0 && !error && (
        <p className="text-center text-gray-600 py-8">
          No reviews yet. Be the first to review this product!
        </p>
      )}

      {!loading && reviews.length > 0 && (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="pb-6 border-b border-gray-200 last:border-0">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div>{renderStars(review.rating)}</div>
                    {review.verifiedPurchase && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        Verified Purchase
                      </span>
                    )}
                  </div>
                  <h4 className="font-semibold text-gray-900">{review.title}</h4>
                  <p className="text-sm text-gray-600">
                    by {review.userEmail || 'Anonymous'} •{' '}
                    {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <p className="text-gray-700 mb-4">{review.comment}</p>

              <button
                onClick={() => handleMarkHelpful(review.id)}
                className="text-sm text-gray-600 hover:text-gray-900 border-b border-gray-300 hover:border-gray-900"
              >
                👍 Helpful ({review.helpfulCount})
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
