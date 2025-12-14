import React from 'react';
import * as LucideIcons from 'lucide-react';
import { amenities } from '../mock';

export const Amenities = () => {
  const getIcon = (iconName) => {
    const Icon = LucideIcons[iconName];
    return Icon ? <Icon className="w-12 h-12" /> : null;
  };

  return (
    <section id="amenities" className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Our Amenities</h2>
          <div className="w-24 h-1 bg-[#D4AF37] mx-auto mb-6"></div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need for a perfect event
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {amenities.map((amenity, index) => (
            <div
              key={amenity.id}
              className="group bg-white p-8 rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-[#D4AF37] hover:-translate-y-2"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="p-4 bg-gradient-to-br from-[#D4AF37]/10 to-[#D4AF37]/5 rounded-full group-hover:scale-110 transition-transform duration-300">
                  <div className="text-[#D4AF37]">
                    {getIcon(amenity.icon)}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 group-hover:text-[#D4AF37] transition-colors duration-300">
                  {amenity.title}
                </h3>
                <p className="text-gray-600">
                  {amenity.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Additional highlight */}
        <div className="mt-16 bg-gradient-to-r from-black via-gray-900 to-black p-8 md:p-12 rounded-2xl text-center shadow-xl">
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Premium Facilities at <span className="text-[#D4AF37]">Prime Location</span>
          </h3>
          <p className="text-gray-300 text-lg max-w-3xl mx-auto">
            Our auditorium is strategically located in Mundur, making it easily accessible for your guests while providing all modern amenities for a seamless event experience.
          </p>
        </div>
      </div>
    </section>
  );
};