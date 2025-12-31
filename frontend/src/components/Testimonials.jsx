import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import { getTestimonials } from '../utils/api';

export const Testimonials = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

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
      <motion.div
        key={index}
        initial={{ opacity: 0, scale: 0 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.3, delay: index * 0.1 }}
      >
        <Star
          className={`w-4 h-4 ${
            index < rating ? 'fill-[#D4AF37] text-[#D4AF37]' : 'fill-gray-300 text-gray-300'
          }`}
        />
      </motion.div>
    ));
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.1, 0.25, 1]
      }
    }
  };

  return (
    <section id="testimonials" className="py-20 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">What Our Clients Say</h2>
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            className="w-24 h-1 bg-[#D4AF37] mx-auto mb-6 origin-center"
          />
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-xl text-gray-600 max-w-2xl mx-auto"
          >
            Don&apos;t just take our word for it - hear from our happy clients
          </motion.p>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="rounded-full h-8 w-8 border-b-2 border-[#D4AF37]"
            />
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {testimonials.map((testimonial) => (
              <motion.div
                key={testimonial.id}
                variants={itemVariants}
                className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-[#D4AF37] relative cursor-default hover:-translate-y-2"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 0.2, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="absolute top-4 right-4 text-[#D4AF37]"
                >
                  <Quote className="w-12 h-12" />
                </motion.div>
                
                <div className="relative z-10">
                  <div className="flex items-center gap-1 mb-4">
                    {renderStars(testimonial.rating)}
                  </div>
                  
                  <p className="text-gray-700 mb-6 italic leading-relaxed">
                    &ldquo;{testimonial.text}&rdquo;
                  </p>
                  
                  <motion.div
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="border-t border-gray-200 pt-4 origin-left"
                  >
                    <p className="font-semibold text-gray-900 text-lg">{testimonial.name}</p>
                    <p className="text-sm text-[#D4AF37] font-medium">{testimonial.event}</p>
                    {testimonial.date && (
                      <p className="text-xs text-gray-500 mt-1">{testimonial.date}</p>
                    )}
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.7, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
          className="mt-16 bg-gradient-to-r from-black via-gray-900 to-black p-8 md:p-12 rounded-2xl text-center shadow-xl"
        >
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-2xl md:text-3xl font-bold text-white mb-4"
          >
            Join Our <span className="text-[#D4AF37]">Happy Clients</span>
          </motion.h3>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-gray-300 text-lg mb-6 max-w-2xl mx-auto"
          >
            Experience the perfect venue for your special occasion
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
};
