import React from 'react';
import { Star } from 'lucide-react';

interface RatingProps {
  rating: number;
  count?: number;
  showCount?: boolean;
}

const Rating: React.FC<RatingProps> = ({ rating, count, showCount = true }) => {
  const ariaLabel = `${rating} out of 5 stars${count !== undefined ? `, based on ${count} reviews` : ''}`;

  return (
    <div className="flex items-center gap-1" role="img" aria-label={ariaLabel}>
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((starIndex) => {
          const isFull = starIndex <= Math.floor(rating) || (starIndex === Math.ceil(rating) && rating % 1 >= 0.75);
          const isHalf = starIndex === Math.ceil(rating) && rating % 1 >= 0.25 && rating % 1 < 0.75;

          return (
            <div key={starIndex} className="relative">
              {/* Background empty star */}
              <Star
                size={14}
                className="fill-gray-200 text-gray-200"
              />

              {/* Full star overlay */}
              {isFull && (
                <div className="absolute inset-0">
                  <Star
                    size={14}
                    className="fill-star text-star"
                  />
                </div>
              )}

              {/* Half star overlay */}
              {isHalf && (
                <div className="absolute inset-0 w-1/2 overflow-hidden">
                  <Star
                    size={14}
                    className="fill-star text-star"
                  />
                </div>
              )}
            </div>
          );
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
