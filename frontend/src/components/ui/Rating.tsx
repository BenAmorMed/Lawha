import React from 'react';
import { Star } from 'lucide-react';

interface RatingProps {
  rating: number;
  count?: number;
  showCount?: boolean;
}

const Rating: React.FC<RatingProps> = ({ rating, count, showCount = true }) => {
  const fullStars = Math.floor(rating);
  const remainder = rating - fullStars;
  const hasHalfStar = remainder >= 0.25 && remainder < 0.75;
  const roundedStars = remainder >= 0.75 ? fullStars + 1 : fullStars;

  const ariaLabel = `${rating.toFixed(1)} out of 5 stars${
    count !== undefined ? ` from ${count} reviews` : ''
  }`;

  return (
    <div className="flex items-center gap-1" role="img" aria-label={ariaLabel}>
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((starIndex) => {
          if (starIndex <= roundedStars) {
            return (
              <Star
                key={starIndex}
                size={14}
                className="fill-star text-star"
                aria-hidden="true"
              />
            );
          } else if (starIndex === roundedStars + 1 && hasHalfStar) {
            return (
              <div key={starIndex} className="relative w-[14px] h-[14px]">
                <Star
                  size={14}
                  className="fill-gray-200 text-gray-200 absolute top-0 left-0"
                  aria-hidden="true"
                />
                <div
                  className="absolute top-0 left-0 w-[50%] overflow-hidden h-full"
                  aria-hidden="true"
                >
                  <Star size={14} className="fill-star text-star" />
                </div>
              </div>
            );
          } else {
            return (
              <Star
                key={starIndex}
                size={14}
                className="fill-gray-200 text-gray-200"
                aria-hidden="true"
              />
            );
          }
        })}
      </div>
      {showCount && count !== undefined && (
        <span className="text-xs text-gray-500">({count})</span>
      )}
    </div>
  );
};

export default Rating;
