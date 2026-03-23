import React from 'react';
import { Star, StarHalf } from 'lucide-react';

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
        {[1, 2, 3, 4, 5].map((star) => {
          const diff = rating - (star - 1);
          let showFull = false;
          let showHalf = false;

          if (diff >= 0.75) {
            showFull = true;
          } else if (diff >= 0.25) {
            showHalf = true;
          }

          return (
            <div key={star} className="relative">
              <Star
                size={14}
                className={`${
                  showFull ? 'fill-star text-star' : 'fill-gray-200 text-gray-200'
                }`}
              />
              {showHalf && (
                <div className="absolute inset-0">
                  <StarHalf
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
        <span className="text-xs text-gray-500">({count})</span>
      )}
    </div>
  );
};

export default Rating;
