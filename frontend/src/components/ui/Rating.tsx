import React from 'react';
import { Star, StarHalf } from 'lucide-react';

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

  const label = `${rating.toFixed(1)} out of 5 stars${
    count !== undefined ? `, based on ${count} review${count !== 1 ? 's' : ''}` : ''
  }`;

  return (
    <div className="flex items-center gap-1" role="img" aria-label={label}>
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((starIndex) => {
          const isFull = starIndex <= roundedStars;
          const isHalf = !isFull && starIndex === roundedStars + 1 && hasHalfStar;

          return (
            <div key={starIndex} className="relative">
              {/* Background Star */}
              <Star
                size={14}
                className="fill-gray-200 text-gray-200"
              />
              {/* Foreground Star (Full or Half) */}
              {isFull && (
                <Star
                  size={14}
                  className="absolute inset-0 fill-star text-star"
                />
              )}
              {isHalf && (
                <StarHalf
                  size={14}
                  className="absolute inset-0 fill-star text-star"
                />
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
