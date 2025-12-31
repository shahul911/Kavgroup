import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, CalendarIcon } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { createEnquiry } from '../utils/api';
import { eventTypes } from '../mock';
import { toast } from 'sonner';
import { format } from 'date-fns';

export const EnquiryForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    eventDate: null,
    eventType: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone || !formData.eventDate || !formData.eventType) {
      toast.error('Please fill all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const enquiryData = {
        name: formData.name,
        phone: formData.phone,
        eventDate: formData.eventDate.toISOString().split('T')[0],
        eventType: formData.eventType
      };
      
      await createEnquiry(enquiryData);
      toast.success('Enquiry submitted successfully! We will contact you soon.');
      setFormData({ name: '', phone: '', eventDate: null, eventType: '' });
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to submit enquiry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formFieldVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: [0.25, 0.1, 0.25, 1]
      }
    })
  };

  return (
    <section id="enquiry" className="py-20 bg-gradient-to-b from-gray-50 to-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Send Enquiry</h2>
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
            Have questions? Fill out the form below and we&apos;ll get back to you shortly
          </motion.p>
        </motion.div>

        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            className="bg-white p-8 md:p-12 rounded-2xl shadow-xl border border-gray-100 transition-shadow duration-300 hover:shadow-2xl"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <motion.div
                custom={0}
                variants={formFieldVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="space-y-2"
              >
                <Label htmlFor="enquiry-name" className="text-lg font-medium">
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <motion.div whileFocus={{ scale: 1.02 }}>
                  <Input
                    id="enquiry-name"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="h-12 text-lg transition-all duration-200 focus:ring-2 focus:ring-[#D4AF37]/50"
                    required
                  />
                </motion.div>
              </motion.div>

              {/* Phone */}
              <motion.div
                custom={1}
                variants={formFieldVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="space-y-2"
              >
                <Label htmlFor="enquiry-phone" className="text-lg font-medium">
                  Phone Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="enquiry-phone"
                  type="tel"
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="h-12 text-lg transition-all duration-200 focus:ring-2 focus:ring-[#D4AF37]/50"
                  required
                />
              </motion.div>

              {/* Event Date */}
              <motion.div
                custom={2}
                variants={formFieldVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="space-y-2"
              >
                <Label className="text-lg font-medium">
                  Event Date <span className="text-red-500">*</span>
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                      <Button
                        variant="outline"
                        className="w-full h-12 justify-start text-left font-normal text-lg transition-all duration-200 hover:border-[#D4AF37]"
                      >
                        <CalendarIcon className="mr-2 h-5 w-5" />
                        {formData.eventDate ? format(formData.eventDate, 'PPP') : 'Select event date'}
                      </Button>
                    </motion.div>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.eventDate}
                      onSelect={(date) => setFormData({ ...formData, eventDate: date })}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </motion.div>

              {/* Event Type */}
              <motion.div
                custom={3}
                variants={formFieldVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="space-y-2"
              >
                <Label htmlFor="enquiry-eventType" className="text-lg font-medium">
                  Event Type <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.eventType}
                  onValueChange={(value) => setFormData({ ...formData, eventType: value })}
                >
                  <SelectTrigger className="h-12 text-lg transition-all duration-200 hover:border-[#D4AF37]">
                    <SelectValue placeholder="Select event type" />
                  </SelectTrigger>
                  <SelectContent>
                    {eventTypes.map((type) => (
                      <SelectItem key={type} value={type} className="text-lg">
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </motion.div>

              {/* Submit Button */}
              <motion.div
                custom={4}
                variants={formFieldVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    type="submit"
                    className="w-full bg-[#D4AF37] text-black hover:bg-[#C19B2E] h-14 text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-[#D4AF37]/50"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="w-5 h-5 border-2 border-black border-t-transparent rounded-full mr-2"
                        />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-2" />
                        Submit Enquiry
                      </>
                    )}
                  </Button>
                </motion.div>
              </motion.div>
            </form>
          </motion.div>

          {/* Additional Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-8 bg-gradient-to-r from-black via-gray-900 to-black p-6 rounded-xl text-center"
          >
            <p className="text-gray-300 text-sm">
              By submitting this form, you agree to be contacted by K.A.V Auditorium regarding your enquiry
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
