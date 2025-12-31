import React from 'react';
import { Card, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Pencil, Trash2, Eye, EyeOff, Quote } from 'lucide-react';
import { StarRating } from './StarRating';

export const TestimonialCard = ({
  testimonial,
  onEdit,
  onDelete,
  onToggleActive
}) => {
  return (
    <Card className={`relative ${!testimonial.isActive ? 'opacity-60 bg-gray-50' : ''}`}>
      <CardContent className="p-6">
        {/* Status Badge */}
        {!testimonial.isActive && (
          <div className="absolute top-2 left-2 bg-gray-500 text-white text-xs px-2 py-1 rounded">
            Hidden
          </div>
        )}

        {/* Quote Icon */}
        <div className="absolute top-4 right-4 text-[#D4AF37] opacity-20">
          <Quote className="w-10 h-10" />
        </div>

        {/* Rating */}
        <div className="mb-3">
          <StarRating rating={testimonial.rating} />
        </div>

        {/* Testimonial Text */}
        <p className="text-gray-700 italic mb-4 line-clamp-4">
          &ldquo;{testimonial.text}&rdquo;
        </p>

        {/* Client Info */}
        <div className="border-t pt-3 flex items-end justify-between">
          <div>
            <p className="font-semibold text-gray-900">{testimonial.name}</p>
            <p className="text-sm text-[#D4AF37] font-medium">{testimonial.event}</p>
            {testimonial.date && (
              <p className="text-xs text-gray-500 mt-1">{testimonial.date}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0"
              onClick={() => onToggleActive(testimonial)}
              title={testimonial.isActive ? 'Hide' : 'Show'}
            >
              {testimonial.isActive ?
                <Eye className="w-4 h-4 text-gray-500" /> :
                <EyeOff className="w-4 h-4 text-gray-500" />
              }
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              onClick={() => onEdit(testimonial)}
            >
              <Pencil className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={() => onDelete(testimonial.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
