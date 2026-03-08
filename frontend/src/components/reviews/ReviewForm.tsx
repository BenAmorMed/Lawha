'use client';

import React, { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { reviewsApi } from '@/api/reviews-api';

interface ReviewFormProps {
  productId: string;
  orderId?: string;
  onSuccess: () => void;
}

export default function ReviewForm({
  productId,
  orderId,
  onSuccess,
}: ReviewFormProps) {
  const { user } = useAuthStore();
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (title.length < 5 || title.length > 100) {
      setError('Title must be between 5 and 100 characters');
      return;
    }

    if (comment.length < 10 || comment.length > 1000) {
      setError('Comment must be between 10 and 1000 characters');
      return;
    }

    try {
      setLoading(true);
      await reviewsApi.createReview({
        rating,
        title,
        comment,
        productId,
        orderId,
      });

      setRating(5);
      setTitle('');
      setComment('');
      onSuccess();
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Failed to submit review. Please try again.'
      );
      console.error('Review submit error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
        <p className="text-blue-900 mb-4">Sign in to leave a review</p>
        <a
          href="/login"
          className="inline-block px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Sign In
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 border border-gray-200">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Share Your Review</h3>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Rating */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Rating
        </label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className={`text-3xl transition ${
                star <= rating ? 'text-yellow-400' : 'text-gray-300'
              }`}
            >
              ★
            </button>
          ))}
        </div>
        <p className="text-sm text-gray-600 mt-2">{rating} out of 5 stars</p>
      </div>

      {/* Title */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Review Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Beautiful quality, fast delivery"
          maxLength={100}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        />
        <p className="text-xs text-gray-600 mt-1">
          {title.length}/100 characters
        </p>
      </div>

      {/* Comment */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Your Review
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience with this product..."
          maxLength={1000}
          rows={5}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        />
        <p className="text-xs text-gray-600 mt-1">
          {comment.length}/1000 characters
        </p>
      </div>

      <button
        type="submit"
        disabled={loading || title.length === 0 || comment.length === 0}
        className="w-full px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 font-medium transition"
      >
        {loading ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  );
}
