'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Star } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { reviewsApi } from '@/api/reviews-api';
import Button from '@/components/ui/Button';

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
      <div className="bg-primary/5 border border-primary/10 rounded-lg p-8 text-center">
        <h3 className="text-lg font-bold text-dark mb-2">Want to share your thoughts?</h3>
        <p className="text-gray-600 mb-6">Sign in to leave a review and help others find great products.</p>
        <Link href="/login">
          <Button variant="primary" className="px-8">
            Sign In
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 md:p-8 border border-gray-100 shadow-sm">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Share Your Review</h3>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Rating */}
      <div className="mb-6">
        <label id="rating-label" className="block text-sm font-medium text-gray-700 mb-3">
          Overall Rating
        </label>
        <div
          role="radiogroup"
          aria-labelledby="rating-label"
          className="flex gap-1"
          onMouseLeave={() => setHoverRating(0)}
        >
          {[1, 2, 3, 4, 5].map((star) => {
            const isActive = star <= (hoverRating || rating);
            return (
              <button
                key={star}
                type="button"
                role="radio"
                aria-checked={star === rating}
                aria-label={`${star} star${star !== 1 ? 's' : ''}`}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                className={`p-1 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md ${
                  isActive ? 'text-star' : 'text-gray-200'
                }`}
              >
                <Star
                  size={32}
                  fill={isActive ? 'currentColor' : 'none'}
                  strokeWidth={isActive ? 0 : 1.5}
                />
              </button>
            );
          })}
        </div>
        <p className="text-xs font-medium text-gray-500 mt-2">
          {rating === 1 && 'Poor'}
          {rating === 2 && 'Fair'}
          {rating === 3 && 'Good'}
          {rating === 4 && 'Very Good'}
          {rating === 5 && 'Excellent'}
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
          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
        />
        <div className="flex justify-end mt-1">
          <span className={`text-[10px] font-bold uppercase tracking-wider ${title.length > 90 ? 'text-red-500' : 'text-gray-400'}`}>
            {title.length} / 100
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
          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
        />
        <div className="flex justify-end mt-1">
          <span className={`text-[10px] font-bold uppercase tracking-wider ${comment.length > 900 ? 'text-red-500' : 'text-gray-400'}`}>
            {comment.length} / 1000
          </span>
        </div>
      </div>

      <Button
        type="submit"
        disabled={loading || title.length < 5 || comment.length < 10}
        fullWidth
        size="lg"
      >
        {loading ? 'Submitting Review...' : 'Post Review'}
      </Button>
    </form>
  );
}
