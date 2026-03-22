import React from 'react';
import { Star, StarHalf } from 'lucide-react';

interface RatingProps {
  rating: number;
  count?: number;
  showCount?: boolean;
  size?: number;
}

const Rating: React.FC<RatingProps> = ({
  rating,
  count,
  showCount = true,
  size = 14,
}) => {
  const ariaLabel = `${rating.toFixed(1)} out of 5 stars${
    count !== undefined ? `, ${count} ${count === 1 ? 'review' : 'reviews'}` : ''
  }`;

  return (
    <div className="flex items-center gap-1" role="img" aria-label={ariaLabel}>
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((i) => {
          const isFull = rating >= i - 0.25;
          const isHalf = !isFull && rating >= i - 0.75;

          return (
            <div key={i} className="relative" style={{ width: size, height: size }}>
              <Star size={size} className="fill-gray-200 text-gray-200" />
              {isFull ? (
                <Star
                  size={size}
                  className="absolute top-0 left-0 fill-star text-star"
                />
              ) : isHalf ? (
                <StarHalf
                  size={size}
                  className="absolute top-0 left-0 fill-star text-star"
                />
              ) : null}
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
