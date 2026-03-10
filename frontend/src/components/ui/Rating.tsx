import React from 'react';
import { Star, StarHalf } from 'lucide-react';

interface RatingProps {
  rating: number;
  count?: number;
  showCount?: boolean;
}

const Rating: React.FC<RatingProps> = ({ rating, count, showCount = true }) => {
  // Round to nearest 0.5 for star display
  const roundedRating = Math.round(rating * 2) / 2;

  return (
    <div
      className="flex items-center gap-1.5"
      role="img"
      aria-label={`Rating: ${rating} out of 5 stars${count !== undefined ? `, based on ${count} reviews` : ''}`}
    >
      <div className="flex items-center" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((star) => {
          const isFull = star <= roundedRating;
          const isHalf = !isFull && star - 0.5 <= roundedRating;

          if (isHalf) {
            return (
              <StarHalf
                key={star}
                size={14}
                className="fill-star text-star"
              />
            );
          }

          return (
            <Star
              key={star}
              size={14}
              className={`${
                isFull ? 'fill-star text-star' : 'fill-gray-200 text-gray-200'
              }`}
            />
          );
        })}
      </div>
      {showCount && count !== undefined && (
        <span className="text-xs text-gray-500 font-medium">
          ({count} {count === 1 ? 'review' : 'reviews'})
        </span>
      )}
    </div>
  );
};

export default Rating;
