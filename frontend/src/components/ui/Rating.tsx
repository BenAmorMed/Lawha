import React from 'react';
import { Star, StarHalf } from 'lucide-react';

interface RatingProps {
  rating: number;
  count?: number;
  showCount?: boolean;
}

const Rating: React.FC<RatingProps> = ({ rating, count, showCount = true }) => {
  const ariaLabel = `Rating: ${rating} out of 5 stars${
    count !== undefined ? ` from ${count} reviews` : ''
  }`;

  return (
    <div className="flex items-center gap-1" role="img" aria-label={ariaLabel}>
      <div className="flex items-center" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((i) => {
          const diff = rating - (i - 1);
          if (diff >= 0.75) {
            return (
              <Star
                key={i}
                size={14}
                className="fill-star text-star"
              />
            );
          } else if (diff >= 0.25) {
            return (
              <StarHalf
                key={i}
                size={14}
                className="fill-star text-star"
              />
            );
          } else {
            return (
              <Star
                key={i}
                size={14}
                className="fill-gray-200 text-gray-200"
              />
            );
          }
        })}
      </div>
      {showCount && count !== undefined && (
        <span className="text-xs text-gray-500" aria-hidden="true">
          ({count})
        </span>
      )}
    </div>
  );
};

export default Rating;
