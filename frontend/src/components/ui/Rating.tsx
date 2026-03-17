import React from 'react';
import { Star, StarHalf } from 'lucide-react';

interface RatingProps {
  rating: number;
  count?: number;
  showCount?: boolean;
}

const Rating: React.FC<RatingProps> = ({ rating, count, showCount = true }) => {
  const fullStars = Math.floor(rating);
  const decimal = rating % 1;
  const hasHalfStar = decimal >= 0.25 && decimal < 0.75;
  const roundedUp = decimal >= 0.75;

  const displayFullStars = roundedUp ? fullStars + 1 : fullStars;

  const ariaLabel = `${rating.toFixed(1)} out of 5 stars${
    count !== undefined ? ` based on ${count} review${count !== 1 ? 's' : ''}` : ''
  }`;

  return (
    <div
      className="flex items-center gap-1"
      role="img"
      aria-label={ariaLabel}
    >
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((starIndex) => {
          if (starIndex <= displayFullStars) {
            return (
              <Star
                key={starIndex}
                size={14}
                className="fill-star text-star"
              />
            );
          } else if (starIndex === displayFullStars + 1 && hasHalfStar) {
            return (
              <StarHalf
                key={starIndex}
                size={14}
                className="fill-star text-star"
              />
            );
          } else {
            return (
              <Star
                key={starIndex}
                size={14}
                className="fill-gray-200 text-gray-200"
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
