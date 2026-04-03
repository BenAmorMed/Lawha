import React from 'react';
import { Star, StarHalf } from 'lucide-react';

interface RatingProps {
  rating: number;
  count?: number;
  showCount?: boolean;
  size?: number;
}

/**
 * A reusable Rating component that displays stars and optionally a review count.
 * Optimized with React.memo to prevent unnecessary re-renders.
 */
const Rating: React.FC<RatingProps> = ({
  rating,
  count,
  showCount = true,
  size = 14
}) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.25 && rating % 1 < 0.75;

  return (
    <div
      className="flex items-center gap-1"
      role="img"
      aria-label={`${rating.toFixed(1)} out of 5 stars${count !== undefined ? `, based on ${count} reviews` : ''}`}
    >
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((starIndex) => {
          const isFull = starIndex <= fullStars || (starIndex === Math.ceil(rating) && rating % 1 >= 0.75);
          const isHalf = !isFull && starIndex === fullStars + 1 && hasHalfStar;

          return (
            <div key={starIndex} className="relative">
              {/* Background Empty Star */}
              <Star
                size={size}
                className="fill-gray-200 text-gray-200"
              />

              {/* Full Star Overlay */}
              {isFull && (
                <Star
                  size={size}
                  className="fill-star text-star absolute inset-0"
                />
              )}

              {/* Half Star Overlay */}
              {isHalf && (
                <StarHalf
                  size={size}
                  className="fill-star text-star absolute inset-0"
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

export default React.memo(Rating);
