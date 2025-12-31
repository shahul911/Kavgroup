import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export const About = () => {
  return (
    <section id="about" className="py-20 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center space-x-2 mb-4">
            <motion.div
              initial={{ rotate: -180, opacity: 0 }}
              whileInView={{ rotate: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Sparkles className="w-6 h-6 text-[#D4AF37]" />
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900">About Us</h2>
            <motion.div
              initial={{ rotate: 180, opacity: 0 }}
              whileInView={{ rotate: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Sparkles className="w-6 h-6 text-[#D4AF37]" />
            </motion.div>
          </div>
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="w-24 h-1 bg-[#D4AF37] mx-auto origin-center"
          />
        </motion.div>

        <div className="max-w-4xl mx-auto">
          {/* Main Content Card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            whileHover={{ y: -5 }}
            className="bg-gradient-to-br from-gray-50 to-white p-8 md:p-12 rounded-2xl shadow-lg border border-gray-100 transition-shadow duration-300 hover:shadow-xl"
          >
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-lg md:text-xl text-gray-700 leading-relaxed mb-6"
            >
              At <span className="font-semibold text-[#D4AF37]">K.A.V Auditorium</span>, we take pride in offering a warm, traditional, and beautifully designed space in the heart of <span className="font-semibold">Palakkad</span>.
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-lg md:text-xl text-gray-700 leading-relaxed mb-6"
            >
              Whether it&apos;s a <span className="font-semibold">wedding</span>, <span className="font-semibold">celebration</span>, <span className="font-semibold">cultural program</span>, or <span className="font-semibold">convention</span>, our hall provides an elegant and comfortable setting for every occasion.
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="text-lg md:text-xl text-gray-700 leading-relaxed"
            >
              Located at a prime spot in <span className="font-semibold">Mundur</span>, K.A.V Auditorium combines traditional charm with modern amenities to make your special day truly memorable.
            </motion.p>
          </motion.div>

          {/* Decorative quote */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            className="mt-12 text-center"
          >
            <div className="inline-block relative">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 0.2, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="absolute -top-4 -left-4 text-6xl text-[#D4AF37]"
              >
                &ldquo;
              </motion.div>
              <p className="text-2xl md:text-3xl font-light text-gray-600 italic px-8">
                Creating memorable moments in the heart of Palakkad
              </p>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 0.2, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="absolute -bottom-4 -right-4 text-6xl text-[#D4AF37]"
              >
                &rdquo;
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
