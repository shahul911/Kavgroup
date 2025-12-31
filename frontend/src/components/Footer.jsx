import React from 'react';
import { motion } from 'framer-motion';
import { Phone, MapPin, Clock } from 'lucide-react';
import { contactInfo } from '../mock';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { id: 'about', label: 'About Us' },
    { id: 'amenities', label: 'Amenities' },
    { id: 'booking', label: 'Book Now' },
    { id: 'location', label: 'Location' },
    { id: 'contact', label: 'Contact' }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
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
    <footer className="bg-black text-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8"
        >
          {/* Logo and About */}
          <motion.div variants={itemVariants} className="space-y-4">
            <motion.img
              whileHover={{ scale: 1.05 }}
              src="https://customer-assets.emergentagent.com/job_1503fdb9-25f1-41c0-817c-a287fdbfacfe/artifacts/zciobxqk_Logo%20design%20for%20a%20we.png"
              alt="KAV Auditorium"
              className="h-24 w-auto"
            />
            <p className="text-gray-400 text-sm leading-relaxed">
              A warm, traditional, and beautifully designed space for weddings, celebrations, and events in the heart of Palakkad.
            </p>
          </motion.div>

          {/* Quick Links */}
          <motion.div variants={itemVariants}>
            <h3 className="text-[#D4AF37] font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link, index) => (
                <motion.li
                  key={link.id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.4 }}
                >
                  <motion.button
                    whileHover={{ x: 5, color: '#D4AF37' }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => document.getElementById(link.id)?.scrollIntoView({ behavior: 'smooth' })}
                    className="text-gray-400 hover:text-[#D4AF37] transition-colors duration-200 text-sm"
                  >
                    {link.label}
                  </motion.button>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div variants={itemVariants}>
            <h3 className="text-[#D4AF37] font-semibold text-lg mb-4">Contact Info</h3>
            <ul className="space-y-3">
              <motion.li
                whileHover={{ x: 5 }}
                className="flex items-start space-x-2"
              >
                <Phone className="w-5 h-5 text-[#D4AF37] flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <motion.a
                    whileHover={{ color: '#D4AF37' }}
                    href={`tel:${contactInfo.phone1}`}
                    className="text-gray-400 transition-colors duration-200 block"
                  >
                    {contactInfo.phone1}
                  </motion.a>
                  <motion.a
                    whileHover={{ color: '#D4AF37' }}
                    href={`tel:${contactInfo.phone2}`}
                    className="text-gray-400 transition-colors duration-200 block"
                  >
                    {contactInfo.phone2}
                  </motion.a>
                </div>
              </motion.li>
              <motion.li
                whileHover={{ x: 5 }}
                className="flex items-start space-x-2"
              >
                <MapPin className="w-5 h-5 text-[#D4AF37] flex-shrink-0 mt-0.5" />
                <p className="text-gray-400 text-sm">
                  {contactInfo.address}
                </p>
              </motion.li>
              <motion.li
                whileHover={{ x: 5 }}
                className="flex items-start space-x-2"
              >
                <Clock className="w-5 h-5 text-[#D4AF37] flex-shrink-0 mt-0.5" />
                <p className="text-gray-400 text-sm">
                  Open Daily: 9:00 AM - 6:00 PM
                </p>
              </motion.li>
            </ul>
          </motion.div>
        </motion.div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="border-t border-gray-800 pt-8"
        >
          <div className="text-center">
            <p className="text-gray-500 text-sm">
              © {currentYear} K.A.V Auditorium. All rights reserved.
            </p>
            <p className="text-gray-600 text-xs mt-2">
              Making your celebrations memorable since inception
            </p>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};
