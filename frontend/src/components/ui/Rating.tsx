import React from 'react';
import { Star } from 'lucide-react';

interface RatingProps {
  rating: number;
  count?: number;
  showCount?: boolean;
}

const Rating: React.FC<RatingProps> = ({ rating, count, showCount = true }) => {
  const label = `${rating} out of 5 stars${count !== undefined ? `, based on ${count} ${count === 1 ? 'review' : 'reviews'}` : ''}`;

  return (
    <div className="flex items-center gap-1" role="img" aria-label={label}>
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
        <span className="text-xs text-gray-500" aria-hidden="true">({count})</span>
      )}
    </div>
  );
};

export default Rating;
