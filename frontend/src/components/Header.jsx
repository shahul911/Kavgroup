import React, { useState, useEffect } from 'react';
import { Menu, X, Phone } from 'lucide-react';
import { Button } from './ui/button';

export const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-black/95 backdrop-blur-sm shadow-lg' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <img
              src="https://customer-assets.emergentagent.com/job_1503fdb9-25f1-41c0-817c-a287fdbfacfe/artifacts/zciobxqk_Logo%20design%20for%20a%20we.png"
              alt="KAV Auditorium Logo"
              className="h-14 w-auto transition-transform duration-300 hover:scale-105"
            />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => scrollToSection('about')}
              className="text-gray-300 hover:text-[#D4AF37] transition-colors duration-200 font-medium"
            >
              About
            </button>
            <button
              onClick={() => scrollToSection('amenities')}
              className="text-gray-300 hover:text-[#D4AF37] transition-colors duration-200 font-medium"
            >
              Amenities
            </button>
            <button
              onClick={() => scrollToSection('location')}
              className="text-gray-300 hover:text-[#D4AF37] transition-colors duration-200 font-medium"
            >
              Location
            </button>
            <button
              onClick={() => scrollToSection('contact')}
              className="text-gray-300 hover:text-[#D4AF37] transition-colors duration-200 font-medium"
            >
              Contact
            </button>
            <Button
              onClick={() => scrollToSection('enquiry')}
              className="bg-[#D4AF37] text-black hover:bg-[#C19B2E] transition-colors duration-200 font-semibold"
            >
              <Phone className="w-4 h-4 mr-2" />
              Enquire Now
            </Button>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-[#D4AF37] p-2 transition-transform duration-200 hover:scale-110"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-black/98 backdrop-blur-sm border-t border-[#D4AF37]/20">
          <div className="px-4 py-6 space-y-4">
            <button
              onClick={() => scrollToSection('about')}
              className="block w-full text-left text-gray-300 hover:text-[#D4AF37] transition-colors duration-200 py-2 font-medium"
            >
              About
            </button>
            <button
              onClick={() => scrollToSection('amenities')}
              className="block w-full text-left text-gray-300 hover:text-[#D4AF37] transition-colors duration-200 py-2 font-medium"
            >
              Amenities
            </button>
            <button
              onClick={() => scrollToSection('booking')}
              className="block w-full text-left text-gray-300 hover:text-[#D4AF37] transition-colors duration-200 py-2 font-medium"
            >
              Booking
            </button>
            <button
              onClick={() => scrollToSection('location')}
              className="block w-full text-left text-gray-300 hover:text-[#D4AF37] transition-colors duration-200 py-2 font-medium"
            >
              Location
            </button>
            <button
              onClick={() => scrollToSection('contact')}
              className="block w-full text-left text-gray-300 hover:text-[#D4AF37] transition-colors duration-200 py-2 font-medium"
            >
              Contact
            </button>
            <Button
              onClick={() => scrollToSection('enquiry')}
              className="w-full bg-[#D4AF37] text-black hover:bg-[#C19B2E] transition-colors duration-200 font-semibold mt-4"
            >
              <Phone className="w-4 h-4 mr-2" />
              Enquire Now
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};