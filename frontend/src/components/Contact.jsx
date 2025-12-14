import React from 'react';
import { Phone, Mail, Clock } from 'lucide-react';
import { Button } from './ui/button';
import { contactInfo } from '../mock';

export const Contact = () => {
  return (
    <section id="contact" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Contact Us</h2>
          <div className="w-24 h-1 bg-[#D4AF37] mx-auto mb-6"></div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get in touch with us for bookings and inquiries
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Phone 1 */}
          <div className="group bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-2xl hover:border-[#D4AF37] transition-all duration-300 hover:-translate-y-2">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-4 bg-[#D4AF37]/10 rounded-full group-hover:scale-110 transition-transform duration-300">
                <Phone className="w-8 h-8 text-[#D4AF37]" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Primary Contact</h3>
              <a
                href={`tel:${contactInfo.phone1}`}
                className="text-2xl font-bold text-[#D4AF37] hover:text-[#C19B2E] transition-colors duration-200"
              >
                {contactInfo.phone1}
              </a>
              <Button
                onClick={() => window.location.href = `tel:${contactInfo.phone1}`}
                className="w-full bg-[#D4AF37] text-black hover:bg-[#C19B2E] transition-colors duration-200"
              >
                Call Now
              </Button>
            </div>
          </div>

          {/* Phone 2 */}
          <div className="group bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-2xl hover:border-[#D4AF37] transition-all duration-300 hover:-translate-y-2">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-4 bg-[#D4AF37]/10 rounded-full group-hover:scale-110 transition-transform duration-300">
                <Phone className="w-8 h-8 text-[#D4AF37]" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Alternate Contact</h3>
              <a
                href={`tel:${contactInfo.phone2}`}
                className="text-2xl font-bold text-[#D4AF37] hover:text-[#C19B2E] transition-colors duration-200"
              >
                {contactInfo.phone2}
              </a>
              <Button
                onClick={() => window.location.href = `tel:${contactInfo.phone2}`}
                className="w-full bg-[#D4AF37] text-black hover:bg-[#C19B2E] transition-colors duration-200"
              >
                Call Now
              </Button>
            </div>
          </div>

          {/* Business Hours */}
          <div className="group bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-2xl hover:border-[#D4AF37] transition-all duration-300 hover:-translate-y-2">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-4 bg-[#D4AF37]/10 rounded-full group-hover:scale-110 transition-transform duration-300">
                <Clock className="w-8 h-8 text-[#D4AF37]" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Business Hours</h3>
              <div className="space-y-2 text-gray-700">
                <p className="font-medium">Open Daily</p>
                <p className="text-lg">9:00 AM - 6:00 PM</p>
                <p className="text-sm text-gray-600 mt-4">
                  Available for viewings by appointment
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 bg-gradient-to-r from-black via-gray-900 to-black p-8 md:p-12 rounded-2xl text-center shadow-xl">
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Ready to Book Your <span className="text-[#D4AF37]">Special Event</span>?
          </h3>
          <p className="text-gray-300 text-lg mb-6 max-w-2xl mx-auto">
            Contact us today to check availability and discuss your requirements
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => window.location.href = `tel:${contactInfo.phone1}`}
              className="bg-[#D4AF37] text-black hover:bg-[#C19B2E] px-8 py-6 text-lg font-semibold transition-all duration-300 hover:scale-105"
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
              className="border-2 border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black px-8 py-6 text-lg font-semibold transition-all duration-300 hover:scale-105"
            >
              Send Enquiry
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};