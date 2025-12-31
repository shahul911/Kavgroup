import React from 'react';
import { motion } from 'framer-motion';
import { Phone, Clock } from 'lucide-react';
import { Button } from './ui/button';
import { contactInfo } from '../mock';

export const Contact = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
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

  const contactCards = [
    {
      title: 'Primary Contact',
      phone: contactInfo.phone1,
      icon: Phone
    },
    {
      title: 'Alternate Contact',
      phone: contactInfo.phone2,
      icon: Phone
    },
    {
      title: 'Business Hours',
      isHours: true,
      icon: Clock
    }
  ];

  return (
    <section id="contact" className="py-20 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Contact Us</h2>
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
            Get in touch with us for bookings and inquiries
          </motion.p>
        </motion.div>

        {/* Contact Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid md:grid-cols-3 gap-8"
        >
          {contactCards.map((card, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="group bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-2xl hover:border-[#D4AF37] transition-all duration-300 hover:-translate-y-2"
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="p-4 bg-[#D4AF37]/10 rounded-full transition-transform duration-200 group-hover:scale-110">
                  <card.icon className="w-8 h-8 text-[#D4AF37]" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">{card.title}</h3>
                
                {card.isHours ? (
                  <div className="space-y-2 text-gray-700">
                    <p className="font-medium">Open Daily</p>
                    <p className="text-lg">9:00 AM - 6:00 PM</p>
                    <p className="text-sm text-gray-600 mt-4">
                      Available for viewings by appointment
                    </p>
                  </div>
                ) : (
                  <>
                    <a
                      href={`tel:${card.phone}`}
                      className="text-2xl font-bold text-[#D4AF37] hover:text-[#C19B2E] transition-colors duration-200"
                    >
                      {card.phone}
                    </a>
                    <Button
                      onClick={() => window.location.href = `tel:${card.phone}`}
                      className="w-full bg-[#D4AF37] text-black hover:bg-[#C19B2E] transition-all duration-200 hover:scale-105 active:scale-95"
                    >
                      Call Now
                    </Button>
                  </>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>

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
            Ready to Book Your <span className="text-[#D4AF37]">Special Event</span>?
          </motion.h3>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-gray-300 text-lg mb-6 max-w-2xl mx-auto"
          >
            Contact us today to check availability and discuss your requirements
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Button
              onClick={() => window.location.href = `tel:${contactInfo.phone1}`}
              className="bg-[#D4AF37] text-black hover:bg-[#C19B2E] px-8 py-6 text-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-[#D4AF37]/50 w-[220px] hover:scale-105 active:scale-95"
            >
              <Phone className="w-5 h-5 mr-2" />
              Call Now
            </Button>
            <Button
              onClick={() => {
                const element = document.getElementById('enquiry');
                if (element) element.scrollIntoView({ behavior: 'smooth' });
              }}
              variant="outline"
              className="border-2 border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black px-8 py-6 text-lg font-semibold transition-all duration-200 w-[220px] hover:scale-105 active:scale-95"
            >
              Send Enquiry
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
