'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { reviewsApi } from '@/api/reviews-api';

interface UserReview {
  id: string;
  rating: number;
  title: string;
  comment: string;
  product: { id: string; name: string };
  createdAt: string;
  updatedAt: string;
}

export default function MyReviewsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [reviews, setReviews] = useState<UserReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    fetchReviews();
  }, [user, router]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const data = await reviewsApi.getUserReviews();
      setReviews(data.reviews as any);
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Failed to load reviews.'
      );
      console.error('Fetch reviews error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;

    try {
      await reviewsApi.deleteReview(reviewId);
      setReviews(reviews.filter((r) => r.id !== reviewId));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete review');
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <Link
            href="/gallery"
            className="text-blue-600 hover:text-blue-700 font-medium mb-4 inline-block"
          >
            ← Back to Shopping
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">My Reviews</h1>
          <p className="text-gray-600 mt-1">
            Manage all of your product reviews
          </p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading your reviews...</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
            <button
              onClick={fetchReviews}
              className="text-red-600 font-medium mt-2 hover:text-red-700"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && reviews.length === 0 && !error && (
          <div className="text-center py-12 bg-white rounded-lg">
            <div className="text-5xl mb-4">📝</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              No reviews yet
            </h2>
            <p className="text-gray-600 mb-6">
              You haven't written any reviews. Start by purchasing a product!
            </p>
            <Link
              href="/gallery"
              className="inline-block px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Browse Products
            </Link>
          </div>
        )}

        {/* Reviews Grid */}
        {!loading && reviews.length > 0 && (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <Link
                      href={`/products/${review.product.id}`}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      {review.product.name}
                    </Link>
                    <div className="mt-2">{renderStars(review.rating)}</div>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/products/${review.product.id}/reviews`}
                      className="px-3 py-2 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 text-sm font-medium"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDeleteReview(review.id)}
                      className="px-3 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {review.title}
                </h3>
                <p className="text-gray-700 mb-3">{review.comment}</p>

                <div className="text-xs text-gray-600">
                  Posted on {new Date(review.createdAt).toLocaleDateString()} •{' '}
                  {review.updatedAt !== review.createdAt && (
                    <>
                      Updated on{' '}
                      {new Date(review.updatedAt).toLocaleDateString()}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
