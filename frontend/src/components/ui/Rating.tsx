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
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.25 && rating % 1 < 0.75;
  const roundedFullStars = rating % 1 >= 0.75 ? fullStars + 1 : fullStars;

  return (
    <div
      className="flex items-center gap-1"
      role="img"
      aria-label={`Rating: ${rating} out of 5 stars`}
    >
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => {
          if (star <= roundedFullStars) {
            return (
              <Star key={star} size={size} className="fill-star text-star" />
            );
          }
          if (star === roundedFullStars + 1 && hasHalfStar) {
            return (
              <StarHalf key={star} size={size} className="fill-star text-star" />
            );
          }
          return (
            <Star
              key={star}
              size={size}
              className="fill-gray-200 text-gray-200"
            />
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
