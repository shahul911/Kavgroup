import React from 'react';
import { Sparkles } from 'lucide-react';

export const About = () => {
  return (
    <section id="about" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center space-x-2 mb-4">
            <Sparkles className="w-6 h-6 text-[#D4AF37]" />
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900">About Us</h2>
            <Sparkles className="w-6 h-6 text-[#D4AF37]" />
          </div>
          <div className="w-24 h-1 bg-[#D4AF37] mx-auto"></div>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-gray-50 to-white p-8 md:p-12 rounded-2xl shadow-lg border border-gray-100">
            <p className="text-lg md:text-xl text-gray-700 leading-relaxed mb-6">
              At <span className="font-semibold text-[#D4AF37]">K.A.V Auditorium</span>, we take pride in offering a warm, traditional, and beautifully designed space in the heart of <span className="font-semibold">Palakkad</span>.
            </p>
            <p className="text-lg md:text-xl text-gray-700 leading-relaxed mb-6">
              Whether it's a <span className="font-semibold">wedding</span>, <span className="font-semibold">celebration</span>, <span className="font-semibold">cultural program</span>, or <span className="font-semibold">convention</span>, our hall provides an elegant and comfortable setting for every occasion.
            </p>
            <p className="text-lg md:text-xl text-gray-700 leading-relaxed">
              Located at a prime spot in <span className="font-semibold">Mundur</span>, K.A.V Auditorium combines traditional charm with modern amenities to make your special day truly memorable.
            </p>
          </div>

          {/* Decorative quote */}
          <div className="mt-12 text-center">
            <div className="inline-block relative">
              <div className="absolute -top-4 -left-4 text-6xl text-[#D4AF37] opacity-20">"</div>
              <p className="text-2xl md:text-3xl font-light text-gray-600 italic px-8">
                Creating memorable moments in the heart of Palakkad
              </p>
              <div className="absolute -bottom-4 -right-4 text-6xl text-[#D4AF37] opacity-20">"</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};