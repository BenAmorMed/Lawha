import React from 'react';
import { Star, StarHalf } from 'lucide-react';

interface RatingProps {
  rating: number;
  count?: number;
  showCount?: boolean;
}

const Rating: React.FC<RatingProps> = ({ rating, count, showCount = true }) => {
  const renderStars = () => {
    return [1, 2, 3, 4, 5].map((starIndex) => {
      const remainder = rating - (starIndex - 1);

      if (remainder >= 0.75) {
        return (
          <Star
            key={starIndex}
            size={14}
            className="fill-star text-star"
            aria-hidden="true"
          />
        );
      } else if (remainder >= 0.25) {
        return (
          <StarHalf
            key={starIndex}
            size={14}
            className="fill-star text-star"
            aria-hidden="true"
          />
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
    });
  };

  return (
    <div
      className="flex items-center gap-1"
      role="img"
      aria-label={`Rating: ${rating.toFixed(1)} out of 5 stars${count !== undefined ? ` from ${count} reviews` : ''}`}
    >
      <div className="flex items-center">
        {renderStars()}
      </div>
      {showCount && count !== undefined && (
        <span className="text-xs text-gray-500">({count})</span>
      )}
    </div>
  );
};

export default Rating;
