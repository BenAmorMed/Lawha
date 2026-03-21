import React from 'react';
import { Star, StarHalf } from 'lucide-react';

interface RatingProps {
  rating: number;
  count?: number;
  showCount?: boolean;
}

const Rating: React.FC<RatingProps> = ({ rating, count, showCount = true }) => {
  const roundedRating = Math.round(rating * 2) / 2;

  return (
    <div
      className="flex items-center gap-1"
      role="img"
      aria-label={`${roundedRating.toFixed(1)} out of 5 stars${count !== undefined ? `, ${count} review${count !== 1 ? 's' : ''}` : ''}`}
    >
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => {
          const diff = rating - (star - 1);

          if (diff >= 0.75) {
            return (
              <Star
                key={star}
                size={14}
                className="fill-star text-star"
              />
            );
          } else if (diff >= 0.25) {
            return (
              <div key={star} className="relative">
                <Star
                  size={14}
                  className="fill-gray-200 text-gray-200"
                />
                <div className="absolute inset-0 overflow-hidden">
                  <StarHalf
                    size={14}
                    className="fill-star text-star"
                  />
                </div>
              </div>
            );
          } else {
            return (
              <Star
                key={star}
                size={14}
                className="fill-gray-200 text-gray-200"
              />
            );
          }
        })}
      </div>
      {showCount && count !== undefined && (
        <span className="text-xs text-gray-500" aria-hidden="true">({count})</span>
      )}
    </div>
  );
};

export default Rating;
