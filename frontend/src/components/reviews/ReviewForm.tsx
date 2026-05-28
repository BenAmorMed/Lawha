'use client';

import React, { useState } from 'react';
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
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      setLoading(true);
      await reviewsApi.createReview({ rating, title, comment, productId, orderId });
      setRating(5); setTitle(''); setComment(''); onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit review.');
    } finally { setLoading(false); }
  };

  if (!user) return null;

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 border border-gray-200">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Share Your Review</h3>
      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
        <div className="flex gap-1" role="radiogroup" aria-label="Star rating" onMouseLeave={() => setHoverRating(0)}>
          {[1, 2, 3, 4, 5].map((star) => (
            <button key={star} type="button" role="radio" aria-checked={star === rating} aria-label={`${star} star${star > 1 ? 's' : ''}`}
              onClick={() => setRating(star)} onMouseEnter={() => setHoverRating(star)}
              className="p-1 transition-transform hover:scale-110 focus-visible:ring-2 focus-visible:ring-primary rounded-sm outline-none">
              <Star size={28} className={`${star <= (hoverRating || rating) ? 'fill-star text-star' : 'text-gray-300'} transition-colors`} />
            </button>
          ))}
        </div>
      </div>
      <div className="mb-4">
        <label htmlFor="review-title" className="block text-sm font-medium text-gray-700 mb-2">Review Title</label>
        <input id="review-title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Beautiful quality" maxLength={100}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none" />
      </div>
      <div className="mb-6">
        <label htmlFor="review-comment" className="block text-sm font-medium text-gray-700 mb-2">Your Review</label>
        <textarea id="review-comment" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Share your experience..." maxLength={1000} rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none" />
      </div>
      <button type="submit" disabled={loading || title.length < 5 || comment.length < 10}
        className="w-full py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:bg-gray-400 font-medium transition-colors">
        {loading ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  );
}
