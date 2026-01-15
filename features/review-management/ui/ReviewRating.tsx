'use client';

import { Star } from 'lucide-react';
import { getRatingStars } from '../lib/utils/review-utils';

interface ReviewRatingProps {
  rating: number;
  size?: 'sm' | 'md' | 'lg';
}

export function ReviewRating({ rating, size = 'sm' }: ReviewRatingProps) {
  const stars = getRatingStars(rating);
  const iconSize = size === 'sm' ? 'h-4 w-4' : size === 'md' ? 'h-5 w-5' : 'h-6 w-6';
  const textSize = size === 'sm' ? 'text-sm' : size === 'md' ? 'text-base' : 'text-lg';

  return (
    <div className='flex items-center gap-1'>
      {stars.map((star) => (
        <Star
          key={star.index}
          className={`${iconSize} ${
            star.filled ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
          }`}
        />
      ))}
      <span className={`ml-1 ${textSize} text-gray-600`}>({rating})</span>
    </div>
  );
}
