import React, { memo } from 'react';
import { Star, StarHalf } from 'lucide-react';

interface RatingProps {
  rating: number;
  count?: number;
  showCount?: boolean;
  size?: number;
}

const Rating: React.FC<RatingProps> = ({ rating, count, showCount = true, size = 14 }) => {
  const fullStars = Math.floor(rating);
  const remainder = rating - fullStars;
  const hasHalfStar = remainder >= 0.25 && remainder < 0.75;
  const starsToDisplay = remainder >= 0.75 ? fullStars + 1 : fullStars;

  const ariaLabel = `Rating: ${rating} out of 5 stars${
    showCount && count !== undefined ? ` (${count} reviews)` : ''
  }`;

  return (
    <div className="flex items-center gap-1" role="img" aria-label={ariaLabel}>
      <div className="flex items-center" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((star) => {
          const isFull = star <= starsToDisplay;
          const isHalf = !isFull && star === starsToDisplay + 1 && hasHalfStar;

          return (
            <div key={star} className="relative" style={{ width: size, height: size }}>
              <Star size={size} className="fill-gray-200 text-gray-200" />
              {isFull && (
                <div className="absolute inset-0">
                  <Star size={size} className="fill-star text-star" />
                </div>
              )}
              {isHalf && (
                <div className="absolute inset-0">
                  <StarHalf size={size} className="fill-star text-star" />
                </div>
              )}
            </div>
          );
        })}
      </div>
      {showCount && count !== undefined && (
        <span className="text-xs text-gray-500" aria-hidden="true">({count})</span>
      )}
    </div>
  );
};

export default memo(Rating);
