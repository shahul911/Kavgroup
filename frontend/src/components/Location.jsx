import React from 'react';
import { MapPin, Navigation } from 'lucide-react';
import { Button } from './ui/button';
import { contactInfo } from '../mock';

export const Location = () => {
  return (
    <section id="location" className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Find Us</h2>
          <div className="w-24 h-1 bg-[#D4AF37] mx-auto mb-6"></div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Located at a prime location in Mundur, Palakkad
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Address Info */}
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
            <div className="flex items-start space-x-4 mb-6">
              <div className="p-3 bg-[#D4AF37]/10 rounded-full">
                <MapPin className="w-6 h-6 text-[#D4AF37]" />
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">Our Address</h3>
                <p className="text-gray-700 text-lg leading-relaxed">
                  {contactInfo.address}
                </p>
              </div>
            </div>

            <div className="mt-8">
              <Button
                onClick={() => window.open(contactInfo.mapLink, '_blank')}
                className="w-full bg-[#D4AF37] text-black hover:bg-[#C19B2E] py-6 text-lg font-semibold transition-all duration-300 hover:scale-105"
              >
                <Navigation className="w-5 h-5 mr-2" />
                Get Directions
              </Button>
            </div>

            {/* Additional Info */}
            <div className="mt-8 p-6 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100">
              <h4 className="font-semibold text-gray-900 mb-3">Nearby Landmark</h4>
              <p className="text-gray-700">Near Telephone Exchange, Mundur</p>
            </div>
          </div>

          {/* Map */}
          <div className="bg-white p-4 rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
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
          </div>
        </div>
      </div>
    </section>
  );
};