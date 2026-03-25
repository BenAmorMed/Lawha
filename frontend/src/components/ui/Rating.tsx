import React from 'react';
import { Star, StarHalf } from 'lucide-react';

interface RatingProps {
  rating: number;
  count?: number;
  showCount?: boolean;
  size?: number;
}

const Rating: React.FC<RatingProps> = ({ rating, count, showCount = true, size = 14 }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  return (
    <div
      className="flex items-center gap-1"
      role="img"
      aria-label={`Rating: ${rating} out of 5 stars`}
    >
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => {
          const isFull = star <= fullStars;
          const isHalf = !isFull && star === fullStars + 1 && hasHalfStar;

          return (
            <div key={star} className="relative flex items-center justify-center">
              <Star size={size} className="fill-gray-200 text-gray-200" />
              {isFull && (
                <Star size={size} className="absolute inset-0 fill-star text-star" />
              )}
              {isHalf && (
                <StarHalf size={size} className="absolute inset-0 fill-star text-star" />
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
