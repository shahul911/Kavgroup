import React from 'react';
import { ImageIcon } from 'lucide-react';

export const Gallery = () => {
  const galleryImages = [
    {
      id: 1,
      url: 'https://images.unsplash.com/photo-1519167758481-83f29da8c2b0?w=800&q=80',
      title: 'Main Hall',
      description: 'Spacious auditorium with seating for 550 guests'
    },
    {
      id: 2,
      url: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&q=80',
      title: 'Stage View',
      description: 'Well-lit stage perfect for ceremonies'
    },
    {
      id: 3,
      url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&q=80',
      title: 'Dining Hall',
      description: 'Same floor dining convenience'
    },
    {
      id: 4,
      url: 'https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=800&q=80',
      title: 'Interior Decor',
      description: 'Elegant traditional design'
    },
    {
      id: 5,
      url: 'https://images.unsplash.com/photo-1510076857177-7470076d4098?w=800&q=80',
      title: 'Event Setup',
      description: 'Beautifully decorated for weddings'
    },
    {
      id: 6,
      url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80',
      title: 'Parking Area',
      description: 'Ample parking space for guests'
    }
  ];

  return (
    <section id="gallery" className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Gallery</h2>
          <div className="w-24 h-1 bg-[#D4AF37] mx-auto mb-6"></div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Take a glimpse of our beautiful venue
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleryImages.map((image, index) => (
            <div
              key={image.id}
              className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 aspect-[4/3] bg-gray-100"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <img
                src={image.url}
                alt={image.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  <h3 className="text-xl font-semibold mb-2">{image.title}</h3>
                  <p className="text-sm text-gray-200">{image.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-500 text-sm flex items-center justify-center gap-2">
            <ImageIcon className="w-4 h-4" />
            Placeholder images - actual photos will be updated soon
          </p>
        </div>
      </div>
    </section>
  );
};