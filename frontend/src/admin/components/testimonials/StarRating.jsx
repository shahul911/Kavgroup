import React from 'react';
import { Star } from 'lucide-react';

export const StarRating = ({ rating, interactive = false, onChange = null, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          className={`${sizeClasses[size]} ${interactive ? 'cursor-pointer' : ''} ${
            index < rating ? 'fill-[#D4AF37] text-[#D4AF37]' : 'fill-gray-200 text-gray-200'
          }`}
          onClick={interactive ? () => onChange(index + 1) : undefined}
        />
      ))}
    </div>
  );
};
