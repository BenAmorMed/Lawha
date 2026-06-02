import React from 'react';
import { Star } from 'lucide-react';

interface RatingProps {
  rating: number;
  count?: number;
  showCount?: boolean;
}

const Rating: React.FC<RatingProps> = ({ rating, count, showCount = true }) => {
  return (
    <div
      className="flex items-center gap-1"
      role="img"
      aria-label={`Rating: ${rating} out of 5 stars`}
    >
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={14}
            aria-hidden="true"
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
};

export default Rating;
