import React, { useState, useEffect } from 'react';
import { Star, Quote } from 'lucide-react';
import { getTestimonials } from '../utils/api';

export const Testimonials = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  // Default placeholder testimonials if none in database
  const defaultTestimonials = [
    {
      id: 1,
      name: 'Rajesh Kumar',
      event: 'Wedding Reception',
      rating: 5,
      text: 'Excellent venue for our wedding reception! The hall was spacious, well-maintained, and the staff was very cooperative. The dining hall on the same floor made it very convenient for our guests. Highly recommend!',
      date: 'December 2024'
    },
    {
      id: 2,
      name: 'Priya Menon',
      event: 'Birthday Celebration',
      rating: 5,
      text: 'Beautiful auditorium with great facilities. The parking space was ample, and the generator backup ensured our event went smoothly without any interruptions. Perfect location in Mundur!',
      date: 'November 2024'
    },
    {
      id: 3,
      name: 'Anand Krishnan',
      event: 'Cultural Program',
      rating: 4,
      text: 'Good venue for cultural events. The seating arrangement is comfortable and the acoustics are decent. Staff was helpful and responsive to our requirements.',
      date: 'October 2024'
    },
    {
      id: 4,
      name: 'Lakshmi Nair',
      event: 'Wedding Ceremony',
      rating: 5,
      text: 'We hosted our wedding here and it was perfect! The traditional design adds to the ambiance. Great value for money with all modern amenities. Thank you K.A.V Auditorium team!',
      date: 'September 2024'
    },
    {
      id: 5,
      name: 'Suresh Babu',
      event: 'Corporate Event',
      rating: 4,
      text: 'Professional setup for our company convention. The floating capacity of 1000 was perfect for our large gathering. Clean facilities and good management.',
      date: 'August 2024'
    },
    {
      id: 6,
      name: 'Divya Prakash',
      event: 'Anniversary Party',
      rating: 5,
      text: 'Lovely venue with warm and traditional ambiance. The location is easily accessible and the booking process was smooth. Will definitely book again for future events!',
      date: 'July 2024'
    }
  ];

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const data = await getTestimonials();
      if (data.testimonials && data.testimonials.length > 0) {
        setTestimonials(data.testimonials);
      } else {
        setTestimonials(defaultTestimonials);
      }
    } catch (error) {
      console.error('Failed to load testimonials:', error);
      setTestimonials(defaultTestimonials);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < rating ? 'fill-[#D4AF37] text-[#D4AF37]' : 'fill-gray-300 text-gray-300'
        }`}
      />
    ));
  };

  return (
    <section id="testimonials" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">What Our Clients Say</h2>
          <div className="w-24 h-1 bg-[#D4AF37] mx-auto mb-6"></div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Don't just take our word for it - hear from our happy clients
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D4AF37]"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={testimonial.id}
                className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-[#D4AF37] relative"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="absolute top-4 right-4 text-[#D4AF37] opacity-20">
                  <Quote className="w-12 h-12" />
                </div>
                
                <div className="relative z-10">
                  <div className="flex items-center gap-1 mb-4">
                    {renderStars(testimonial.rating)}
                  </div>
                  
                  <p className="text-gray-700 mb-6 italic leading-relaxed">
                    "{testimonial.text}"
                  </p>
                  
                  <div className="border-t border-gray-200 pt-4">
                    <p className="font-semibold text-gray-900 text-lg">{testimonial.name}</p>
                    <p className="text-sm text-[#D4AF37] font-medium">{testimonial.event}</p>
                    {testimonial.date && (
                      <p className="text-xs text-gray-500 mt-1">{testimonial.date}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-16 bg-gradient-to-r from-black via-gray-900 to-black p-8 md:p-12 rounded-2xl text-center shadow-xl">
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Join Our <span className="text-[#D4AF37]">Happy Clients</span>
          </h3>
          <p className="text-gray-300 text-lg mb-6 max-w-2xl mx-auto">
            Experience the perfect venue for your special occasion
          </p>
        </div>
      </div>
    </section>
  );
};
