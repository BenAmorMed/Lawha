import React from 'react';
import { Star, StarHalf } from 'lucide-react';

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
      aria-label={`${rating} out of 5 stars${count !== undefined ? `, ${count} reviews` : ''}`}
    >
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => {
          const diff = rating - (star - 1);

          return (
            <div key={star} className="relative">
              <Star size={14} className="fill-gray-200 text-gray-200" />
              <div className="absolute inset-0">
                {diff >= 0.75 ? (
                  <Star size={14} className="fill-star text-star" />
                ) : diff >= 0.25 ? (
                  <StarHalf size={14} className="fill-star text-star" />
                ) : null}
              </div>
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
