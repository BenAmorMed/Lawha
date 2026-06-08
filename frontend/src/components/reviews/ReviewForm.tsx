'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Star } from 'lucide-react';
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
      <div className="bg-secondary border border-gray-200 rounded-lg p-8 text-center">
        <p className="text-dark font-medium mb-4">Sign in to leave a review</p>
        <Link
          href="/login"
          className="inline-block px-8 py-2.5 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors font-bold text-sm uppercase tracking-wider"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Share Your Review</h3>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Rating */}
      <div className="mb-6">
        <label className="block text-sm font-bold text-dark mb-3 uppercase tracking-wider">
          Rating
        </label>
        <div
          className="flex gap-1"
          role="radiogroup"
          aria-label="Select a rating"
        >
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              role="radio"
              aria-checked={star <= rating}
              aria-label={`${star} star${star > 1 ? 's' : ''}`}
              onClick={() => setRating(star)}
              className={`p-1 transition-all hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm ${
                star <= rating ? 'text-star' : 'text-gray-300'
              }`}
            >
              <Star
                size={32}
                fill={star <= rating ? 'currentColor' : 'none'}
              />
            </button>
          ))}
        </div>
        <p className="text-xs font-medium text-gray-500 mt-3">{rating} out of 5 stars</p>
      </div>

      {/* Title */}
      <div className="mb-4">
        <label className="block text-sm font-bold text-dark mb-2 uppercase tracking-wider">
          Review Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Beautiful quality, fast delivery"
          maxLength={100}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary outline-none transition-shadow"
        />
        <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-tighter">
          {title.length}/100 characters
        </p>
      </div>

      {/* Comment */}
      <div className="mb-6">
        <label className="block text-sm font-bold text-dark mb-2 uppercase tracking-wider">
          Your Review
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience with this product..."
          maxLength={1000}
          rows={5}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary outline-none transition-shadow"
        />
        <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-tighter">
          {comment.length}/1000 characters
        </p>
      </div>

      <button
        type="submit"
        disabled={loading || title.length === 0 || comment.length === 0}
        className="w-full px-6 py-3 bg-primary text-white rounded-md hover:bg-primary-dark disabled:bg-gray-300 font-bold uppercase tracking-widest text-sm transition-colors"
      >
        {loading ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  );
}
