import React from 'react';
import { Star, StarHalf } from 'lucide-react';

interface RatingProps {
  rating: number;
  count?: number;
  showCount?: boolean;
}

const Rating: React.FC<RatingProps> = ({ rating, count, showCount = true }) => {
  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      const isFull = rating >= i;
      const isHalf = !isFull && rating >= i - 0.75 && rating < i - 0.25;
      const isRoundingUp = !isFull && !isHalf && rating >= i - 0.25;

      if (isFull || isRoundingUp) {
        stars.push(
          <Star
            key={i}
            size={14}
            className="fill-star text-star"
            aria-hidden="true"
          />
        );
      } else if (isHalf) {
        stars.push(
          <StarHalf
            key={i}
            size={14}
            className="fill-star text-star"
            aria-hidden="true"
          />
        );
      } else {
        stars.push(
          <Star
            key={i}
            size={14}
            className="fill-gray-200 text-gray-200"
            aria-hidden="true"
          />
        );
      }
    }
    return stars;
  };

  const label = `${rating} out of 5 stars${count !== undefined ? `, based on ${count} reviews` : ''}`;

  return (
    <div
      className="flex items-center gap-1"
      role="img"
      aria-label={label}
    >
      <div className="flex items-center">
        {renderStars()}
      </div>
      {showCount && count !== undefined && (
        <span className="text-xs text-gray-500" aria-hidden="true">({count})</span>
      )}
    </div>
  );
};

export default Rating;
