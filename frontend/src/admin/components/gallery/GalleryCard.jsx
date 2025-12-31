import React from 'react';
import { Card, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Pencil, Trash2, Eye, EyeOff } from 'lucide-react';

export const GalleryCard = ({
  image,
  getFullImageUrl,
  onEdit,
  onDelete,
  onToggleActive
}) => {
  return (
    <Card className={`overflow-hidden ${!image.isActive ? 'opacity-60' : ''}`}>
      <div className="relative aspect-[4/3] bg-gray-100">
        <img
          src={getFullImageUrl(image.imageUrl)}
          alt={image.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found';
          }}
        />
        {!image.isActive && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-medium">Hidden</span>
          </div>
        )}
        <div className="absolute top-2 right-2 flex gap-1">
          <Button
            size="sm"
            variant="secondary"
            className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
            onClick={() => onToggleActive(image)}
            title={image.isActive ? 'Hide image' : 'Show image'}
          >
            {image.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </Button>
        </div>
      </div>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">{image.title}</h3>
            <p className="text-sm text-gray-500 line-clamp-2">{image.description || 'No description'}</p>
            <p className="text-xs text-gray-400 mt-1">Order: {image.order}</p>
          </div>
          <div className="flex gap-1 ml-2">
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              onClick={() => onEdit(image)}
            >
              <Pencil className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={() => onDelete(image.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
