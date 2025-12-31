import React from 'react';
import { Card, CardContent } from '../../../components/ui/card';
import { FileText } from 'lucide-react';
import { categoryIcons } from '../../constants/reminderConstants';

export const CategoryGrid = ({ categories, onCategorySelect }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
      {categories.map((category) => {
        const CategoryIcon = categoryIcons[category.id] || FileText;
        return (
          <Card
            key={category.id}
            className="cursor-pointer hover:shadow-md transition-shadow hover:border-[#D4AF37]"
            onClick={() => onCategorySelect(category)}
          >
            <CardContent className="p-4 sm:p-6 text-center">
              <CategoryIcon className="w-8 h-8 sm:w-10 sm:h-10 text-[#D4AF37] mx-auto mb-2 sm:mb-3" />
              <h3 className="font-semibold text-gray-900 text-sm sm:text-base mb-1">{category.name}</h3>
              <p className="text-xs sm:text-sm text-gray-500">
                {category.count} {category.count === 1 ? 'record' : 'records'}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
