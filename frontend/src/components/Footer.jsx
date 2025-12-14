import React from 'react';
import { Phone, MapPin, Clock } from 'lucide-react';
import { contactInfo } from '../mock';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Logo and About */}
          <div className="space-y-4">
            <img
              src="https://customer-assets.emergentagent.com/job_1503fdb9-25f1-41c0-817c-a287fdbfacfe/artifacts/zciobxqk_Logo%20design%20for%20a%20we.png"
              alt="KAV Auditorium"
              className="h-24 w-auto"
            />
            <p className="text-gray-400 text-sm leading-relaxed">
              A warm, traditional, and beautifully designed space for weddings, celebrations, and events in the heart of Palakkad.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-[#D4AF37] font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
                  className="text-gray-400 hover:text-[#D4AF37] transition-colors duration-200 text-sm"
                >
                  About Us
                </button>
              </li>
              <li>
                <button
                  onClick={() => document.getElementById('amenities')?.scrollIntoView({ behavior: 'smooth' })}
                  className="text-gray-400 hover:text-[#D4AF37] transition-colors duration-200 text-sm"
                >
                  Amenities
                </button>
              </li>
              <li>
                <button
                  onClick={() => document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' })}
                  className="text-gray-400 hover:text-[#D4AF37] transition-colors duration-200 text-sm"
                >
                  Book Now
                </button>
              </li>
              <li>
                <button
                  onClick={() => document.getElementById('location')?.scrollIntoView({ behavior: 'smooth' })}
                  className="text-gray-400 hover:text-[#D4AF37] transition-colors duration-200 text-sm"
                >
                  Location
                </button>
              </li>
              <li>
                <button
                  onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                  className="text-gray-400 hover:text-[#D4AF37] transition-colors duration-200 text-sm"
                >
                  Contact
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-[#D4AF37] font-semibold text-lg mb-4">Contact Info</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-2">
                <Phone className="w-5 h-5 text-[#D4AF37] flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <a href={`tel:${contactInfo.phone1}`} className="text-gray-400 hover:text-[#D4AF37] transition-colors duration-200 block">
                    {contactInfo.phone1}
                  </a>
                  <a href={`tel:${contactInfo.phone2}`} className="text-gray-400 hover:text-[#D4AF37] transition-colors duration-200 block">
                    {contactInfo.phone2}
                  </a>
                </div>
              </li>
              <li className="flex items-start space-x-2">
                <MapPin className="w-5 h-5 text-[#D4AF37] flex-shrink-0 mt-0.5" />
                <p className="text-gray-400 text-sm">
                  {contactInfo.address}
                </p>
              </li>
              <li className="flex items-start space-x-2">
                <Clock className="w-5 h-5 text-[#D4AF37] flex-shrink-0 mt-0.5" />
                <p className="text-gray-400 text-sm">
                  Open Daily: 9:00 AM - 6:00 PM
                </p>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8">
          <div className="text-center">
            <p className="text-gray-500 text-sm">
              © {currentYear} K.A.V Auditorium. All rights reserved.
            </p>
            <p className="text-gray-600 text-xs mt-2">
              Making your celebrations memorable since inception
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};