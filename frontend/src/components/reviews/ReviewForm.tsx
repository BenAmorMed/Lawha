'use client';

import React, { useState, useId } from 'react';
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

  const titleId = useId();
  const commentId = useId();

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
      <div className="bg-secondary border border-gray-200 rounded-lg p-6 text-center">
        <p className="text-dark mb-4">Sign in to leave a review</p>
        <a
          href="/login"
          className="inline-block px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors font-medium"
        >
          Sign In
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 border border-gray-200">
      <h3 className="text-lg font-bold text-dark mb-4">Share Your Review</h3>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Rating */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-dark mb-2">
          Rating
        </label>
        <div className="flex gap-2" role="group" aria-label="Select star rating">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
              className={`text-3xl transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm ${
                star <= rating ? 'text-star' : 'text-gray-300'
              }`}
            >
              ★
            </button>
          ))}
        </div>
        <p className="text-sm text-gray-600 mt-2" aria-live="polite">{rating} out of 5 stars</p>
      </div>

      {/* Title */}
      <div className="mb-4">
        <label htmlFor={titleId} className="block text-sm font-medium text-dark mb-2">
          Review Title
        </label>
        <input
          id={titleId}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Beautiful quality, fast delivery"
          maxLength={100}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary outline-none"
          required
        />
        <p className="text-xs text-gray-600 mt-1">
          {title.length}/100 characters
        </p>
      </div>

      {/* Comment */}
      <div className="mb-6">
        <label htmlFor={commentId} className="block text-sm font-medium text-dark mb-2">
          Your Review
        </label>
        <textarea
          id={commentId}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience with this product..."
          maxLength={1000}
          rows={5}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary outline-none"
          required
        />
        <p className="text-xs text-gray-600 mt-1">
          {comment.length}/1000 characters
        </p>
      </div>

      <button
        type="submit"
        disabled={loading || title.length === 0 || comment.length === 0}
        className="w-full px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark disabled:bg-gray-400 font-medium transition"
      >
        {loading ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  );
}
