import React, { useState } from 'react';
import { Send, CheckCircle, CalendarIcon } from 'lucide-react';
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

  return (
    <section id="enquiry" className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Send Enquiry</h2>
          <div className="w-24 h-1 bg-[#D4AF37] mx-auto mb-6"></div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Have questions? Fill out the form below and we'll get back to you shortly
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="bg-white p-8 md:p-12 rounded-2xl shadow-xl border border-gray-100">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="enquiry-name" className="text-lg font-medium">
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="enquiry-name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="h-12 text-lg"
                  required
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="enquiry-phone" className="text-lg font-medium">
                  Phone Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="enquiry-phone"
                  type="tel"
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="h-12 text-lg"
                  required
                />
              </div>

              {/* Event Date */}
              <div className="space-y-2">
                <Label className="text-lg font-medium">
                  Event Date <span className="text-red-500">*</span>
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full h-12 justify-start text-left font-normal text-lg"
                    >
                      <CalendarIcon className="mr-2 h-5 w-5" />
                      {formData.eventDate ? format(formData.eventDate, 'PPP') : 'Select event date'}
                    </Button>
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
              </div>

              {/* Event Type */}
              <div className="space-y-2">
                <Label htmlFor="enquiry-eventType" className="text-lg font-medium">
                  Event Type <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.eventType}
                  onValueChange={(value) => setFormData({ ...formData, eventType: value })}
                >
                  <SelectTrigger className="h-12 text-lg">
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
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-[#D4AF37] text-black hover:bg-[#C19B2E] h-14 text-lg font-semibold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-[#D4AF37]/50"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    Submit Enquiry
                  </>
                )}
              </Button>
            </form>
          </div>

          {/* Additional Info */}
          <div className="mt-8 bg-gradient-to-r from-black via-gray-900 to-black p-6 rounded-xl text-center">
            <p className="text-gray-300 text-sm">
              By submitting this form, you agree to be contacted by K.A.V Auditorium regarding your enquiry
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};