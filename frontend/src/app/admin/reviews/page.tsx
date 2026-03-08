'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { adminApi } from '@/api/admin-api';

export default function AdminReviewsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [reviews, setReviews] = useState<any[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 20,
    offset: 0,
    pages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [ratingFilter, setRatingFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<'createdAt' | 'rating' | 'helpfulCount'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/');
      return;
    }

    fetchReviews();
  }, [user, router, pagination.offset, ratingFilter, sortBy, sortOrder]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getAllReviews({
        rating: ratingFilter ? parseInt(ratingFilter, 10) : undefined,
        limit: pagination.limit,
        offset: pagination.offset,
        sortBy,
        sortOrder,
      });
      setReviews(data.data);
      setPagination(data.pagination);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load reviews.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
      return;
    }

    try {
      await adminApi.deleteReview(reviewId);
      // Refresh list
      fetchReviews();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete review');
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
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
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Review Management</h1>
              <p className="text-gray-600 mt-1">Monitor and manage customer feedback</p>
            </div>
            <div className="flex gap-4">
              <Link
                href="/admin/analytics"
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium"
              >
                Dashboard
              </Link>
              <Link
                href="/admin/orders"
                className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-medium"
              >
                Manage Orders
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters Panel */}
        <div className="bg-white rounded-lg p-6 shadow mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Rating
              </label>
              <select
                value={ratingFilter}
                onChange={(e) => {
                  setRatingFilter(e.target.value);
                  setPagination({ ...pagination, offset: 0 });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="createdAt">Date Created</option>
                <option value="rating">Rating</option>
                <option value="helpfulCount">Helpful Count</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Order
              </label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="DESC">Descending</option>
                <option value="ASC">Ascending</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setRatingFilter('');
                  setSortBy('createdAt');
                  setSortOrder('DESC');
                  setPagination({ ...pagination, offset: 0 });
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>

        {/* Reviews List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-20 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading reviews...</p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="p-20 text-center">
              <p className="text-gray-600 text-lg">No reviews found matching your criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product & User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rating & Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Comment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Engagement
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reviews.map((review) => (
                    <tr key={review.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-gray-900">
                          {review.product?.name || 'Unknown Product'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {review.user?.email || 'Anonymous'}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="mb-1">{renderStars(review.rating)}</div>
                        <div className="text-sm font-semibold text-gray-900 truncate max-w-xs">
                          {review.title}
                        </div>
                        {review.verifiedPurchase && (
                          <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold bg-green-100 text-green-800 rounded">
                            VERIFIED
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600 line-clamp-2 max-w-md">
                          {review.comment}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        👍 {review.helpfulCount} helpful
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDeleteReview(review.id)}
                          className="text-red-600 hover:text-red-900 font-medium text-sm"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {!loading && pagination.pages > 1 && (
          <div className="flex justify-center mt-8 gap-2">
            <button
              disabled={pagination.offset === 0}
              onClick={() => setPagination({ ...pagination, offset: pagination.offset - pagination.limit })}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50"
            >
              Previous
            </button>
            <div className="flex items-center px-4 font-medium">
              Page {Math.floor(pagination.offset / pagination.limit) + 1} of {pagination.pages}
            </div>
            <button
              disabled={Math.floor(pagination.offset / pagination.limit) + 1 >= pagination.pages}
              onClick={() => setPagination({ ...pagination, offset: pagination.offset + pagination.limit })}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
