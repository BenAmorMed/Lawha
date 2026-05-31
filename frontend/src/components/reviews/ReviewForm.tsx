'use client';

import React, { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { reviewsApi } from '@/api/reviews-api';
import { Star } from 'lucide-react';
import Button from '../ui/Button';

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
  const [hoverRating, setHoverRating] = useState(0);
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
      setHoverRating(0);
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
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 text-center">
        <p className="text-primary-dark mb-4 font-medium">Sign in to leave a review</p>
        <a
          href="/login"
          className="inline-block px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-semibold"
        >
          Sign In
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Share Your Review</h3>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <p className="text-red-600 text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Rating */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Rating
        </label>
        <div
          className="flex gap-1"
          role="radiogroup"
          aria-label="Star rating"
          onMouseLeave={() => setHoverRating(0)}
        >
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              className="p-1 focus-visible:ring-2 focus-visible:ring-primary rounded-md outline-none transition-transform hover:scale-110 active:scale-95"
              role="radio"
              aria-checked={star === rating}
              aria-label={`${star} out of 5 stars`}
            >
              <Star
                size={28}
                className={`${
                  star <= (hoverRating || rating)
                    ? 'fill-star text-star'
                    : 'fill-transparent text-gray-300'
                } transition-colors`}
              />
            </button>
          ))}
        </div>
        <p className="text-sm text-gray-600 mt-2 font-medium">
          {hoverRating || rating} out of 5 stars
        </p>
      </div>

      {/* Title */}
      <div className="mb-4">
        <label htmlFor="review-title" className="block text-sm font-medium text-gray-700 mb-2">
          Review Title
        </label>
        <input
          id="review-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Beautiful quality, fast delivery"
          maxLength={100}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
        />
        <div className="flex justify-end mt-1">
          <span className={`text-[10px] font-medium ${title.length > 90 ? 'text-primary' : 'text-gray-400'}`}>
            {title.length}/100 characters
          </span>
        </div>
      </div>

      {/* Comment */}
      <div className="mb-6">
        <label htmlFor="review-comment" className="block text-sm font-medium text-gray-700 mb-2">
          Your Review
        </label>
        <textarea
          id="review-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience with this product..."
          maxLength={1000}
          rows={5}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
        />
        <div className="flex justify-end mt-1">
          <span className={`text-[10px] font-medium ${comment.length > 950 ? 'text-primary' : 'text-gray-400'}`}>
            {comment.length}/1000 characters
          </span>
        </div>
      </div>

      <Button
        type="submit"
        disabled={loading || title.length === 0 || comment.length === 0}
        fullWidth
        className="font-bold uppercase tracking-wider"
      >
        {loading ? 'Submitting...' : 'Submit Review'}
      </Button>
    </form>
  );
}
