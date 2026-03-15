import React from 'react';
import { Star, StarHalf } from 'lucide-react';

interface RatingProps {
  rating: number;
  count?: number;
  showCount?: boolean;
}

const Rating: React.FC<RatingProps> = ({ rating, count, showCount = true }) => {
  const fullStars = Math.floor(rating);
  const fractionalPart = rating - fullStars;
  const hasHalfStar = fractionalPart >= 0.25 && fractionalPart < 0.75;
  const roundedStars = fractionalPart >= 0.75 ? fullStars + 1 : fullStars;

  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (i <= roundedStars) {
      stars.push(
        <Star
          key={i}
          size={14}
          className="fill-star text-star"
          aria-hidden="true"
        />
      );
    } else if (i === roundedStars + 1 && hasHalfStar) {
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

  return (
    <div
      className="flex items-center gap-1"
      role="img"
      aria-label={`Rating: ${rating} out of 5 stars${count !== undefined ? `, based on ${count} reviews` : ''}`}
    >
      <div className="flex items-center">
        {stars}
      </div>
      {showCount && count !== undefined && (
        <span className="text-xs text-gray-500" aria-hidden="true">({count})</span>
      )}
    </div>
  );
};

export default Rating;
