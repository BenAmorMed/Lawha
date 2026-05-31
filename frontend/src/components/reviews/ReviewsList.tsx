'use client';

import React, { useState, useEffect } from 'react';
import { reviewsApi, Review } from '@/api/reviews-api';
import Rating from '../ui/Rating';

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
        setStats((prev) => ({
          ...prev,
          averageRating: data.productRating.average,
          totalReviews: data.productRating.total,
        }));
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

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm">
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
                <span className="text-gray-600 font-medium">out of 5</span>
              </div>
              <div className="mb-2">
                <Rating rating={Math.round(stats.averageRating)} showCount={false} />
              </div>
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
                  <div key={stars} className="flex items-center gap-2 group">
                    <span className="text-sm text-gray-600 min-w-[50px]">
                      {stars} star
                    </span>
                    <div className="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-star h-full rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 min-w-[20px] text-right font-medium">
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
        <div className="mb-6 flex items-center gap-3">
          <label htmlFor="sort-reviews" className="text-sm font-medium text-gray-700">
            Sort by:
          </label>
          <select
            id="sort-reviews"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
          >
            <option value="recent">Most Recent</option>
            <option value="helpful">Most Helpful</option>
            <option value="rating">Highest Rating</option>
          </select>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto"></div>
          <p className="text-gray-500 mt-4 font-medium">Loading reviews...</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-red-600 font-medium">{error}</p>
        </div>
      )}

      {/* Reviews List */}
      {!loading && reviews.length === 0 && !error && (
        <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
          <p className="text-gray-500 font-medium">
            No reviews yet. Be the first to review this product!
          </p>
        </div>
      )}

      {!loading && reviews.length > 0 && (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="pb-6 border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors rounded-lg p-4 -mx-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <Rating rating={review.rating} showCount={false} />
                    {review.verifiedPurchase && (
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                        Verified Purchase
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-gray-900 text-lg">{review.title}</h4>
                  <p className="text-xs text-gray-500 mt-1">
                    by <span className="font-semibold text-gray-700">{review.userEmail || 'Anonymous'}</span> •{' '}
                    {new Date(review.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
              </div>

              <p className="text-gray-700 mb-4 leading-relaxed">{review.comment}</p>

              <button
                onClick={() => handleMarkHelpful(review.id)}
                className="text-xs font-bold text-gray-500 hover:text-primary transition-colors flex items-center gap-1.5"
                aria-label={`Mark review by ${review.userEmail || 'Anonymous'} as helpful`}
              >
                <span className="text-sm">👍</span> Helpful ({review.helpfulCount})
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
