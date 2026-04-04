import React from 'react';
import { Star } from 'lucide-react';

interface RatingProps {
  rating: number;
  count?: number;
  showCount?: boolean;
}

/**
 * Optimized Rating component using React.memo for consistent performance in large lists.
 */
const Rating: React.FC<RatingProps> = React.memo(({ rating, count, showCount = true }) => {
  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={14}
            className={`${
              star <= rating ? 'fill-star text-star' : 'fill-gray-200 text-gray-200'
            }`}
          />
        ))}
      </div>
      {showCount && count !== undefined && (
        <span className="text-xs text-gray-500">({count})</span>
      )}
    </div>
  );
});

Rating.displayName = 'Rating';

export default Rating;
