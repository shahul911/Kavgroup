import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Navigation } from 'lucide-react';
import { Button } from './ui/button';
import { contactInfo } from '../mock';

export const Location = () => {
  return (
    <section id="location" className="py-20 bg-gradient-to-b from-gray-50 to-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Find Us</h2>
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
            Located at a prime location in Mundur, Palakkad
          </motion.p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Address Info */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
            className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300"
          >
            <div className="flex items-start space-x-4 mb-6">
              <motion.div
                whileHover={{ scale: 1.1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                className="p-3 bg-[#D4AF37]/10 rounded-full"
              >
                <MapPin className="w-6 h-6 text-[#D4AF37]" />
              </motion.div>
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">Our Address</h3>
                <p className="text-gray-700 text-lg leading-relaxed">
                  {contactInfo.address}
                </p>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-8"
            >
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={() => window.open(contactInfo.mapLink, '_blank')}
                  className="w-full bg-[#D4AF37] text-black hover:bg-[#C19B2E] py-6 text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-[#D4AF37]/30"
                >
                  <Navigation className="w-5 h-5 mr-2" />
                  Get Directions
                </Button>
              </motion.div>
            </motion.div>

            {/* Additional Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-8 p-6 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100"
            >
              <h4 className="font-semibold text-gray-900 mb-3">Nearby Landmark</h4>
              <p className="text-gray-700">Near Telephone Exchange, Mundur</p>
            </motion.div>
          </motion.div>

          {/* Map */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            className="bg-white p-4 rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300"
          >
            <div className="relative w-full h-full min-h-[400px] rounded-xl overflow-hidden">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.737047619449!2d76.50988907503823!3d10.767234589374447!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba86f3c0ea44e41%3A0x7d0c8f5e9c8d8f9c!2sMundur%2C%20Kerala%20678592!5e0!3m2!1sen!2sin!4v1234567890"
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: '400px' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="K.A.V Auditorium Location"
                className="rounded-lg"
              ></iframe>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
