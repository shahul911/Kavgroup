import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, CheckCircle2, XCircle } from 'lucide-react';
import { Calendar } from './ui/calendar';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { getAvailabilityOverview, createEnquiry, getDateTimeSlots } from '../utils/api';
import { eventTypes } from '../mock';
import { toast } from 'sonner';
import { format } from 'date-fns';

export const BookingCalendar = () => {
  const [dateStatusMap, setDateStatusMap] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEndDate, setSelectedEndDate] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availabilityData, setAvailabilityData] = useState(null);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    eventType: '',
    // Honeypot fields - hidden from users, bots fill these
    website: '',
    company_website: ''
  });
  const [lastSubmitTime, setLastSubmitTime] = useState(0);

  useEffect(() => {
    loadAvailabilityForMonth(currentMonth);
    
    // Refresh availability when tab becomes visible again
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadAvailabilityForMonth(currentMonth);
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [currentMonth]);

  const loadAvailabilityForMonth = async (monthDate) => {
    try {
      // Get first and last day of the month (plus some buffer) - using local dates
      const firstDay = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
      const lastDay = new Date(monthDate.getFullYear(), monthDate.getMonth() + 2, 0);
      
      // Format dates in local timezone
      const formatDateLocal = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };
      
      const startDate = formatDateLocal(firstDay);
      const endDate = formatDateLocal(lastDay);
      
      const response = await getAvailabilityOverview(startDate, endDate);
      setDateStatusMap(response.dateStatus || {});
    } catch (error) {
      console.error('Failed to load availability:', error);
      toast.error('Failed to load availability');
    }
  };

  const getDateStatus = (date) => {
    // Format date in local timezone
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    return dateStatusMap[dateStr] || 'unknown';
  };

  const handleDateSelect = async (date) => {
    if (date) {
      setSelectedDate(date);
      setSelectedEndDate(null); // Reset end date
      setIsLoadingSlots(true);
      
      try {
        // Format date in local timezone
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;
        
        const availability = await getDateTimeSlots(dateStr);
        setAvailabilityData(availability);
        setIsDialogOpen(true);
      } catch (error) {
        toast.error('Failed to load availability');
        setAvailabilityData(null);
      } finally {
        setIsLoadingSlots(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Bot detection - honeypot check
    if (formData.website || formData.company_website) {
      // Silently reject bot submissions
      toast.success('Thank you for your submission!');
      setIsDialogOpen(false);
      return;
    }
    
    // Rate limiting - prevent rapid submissions
    const now = Date.now();
    if (now - lastSubmitTime < 30000) { // 30 seconds between submissions
      toast.error('Please wait a moment before submitting another request.');
      return;
    }
    
    if (!formData.name || !formData.phone || !formData.eventType || !selectedDate) {
      toast.error('Please fill all required fields');
      return;
    }
    
    // Basic phone validation
    const phoneRegex = /^[\d\s\-\+\(\)]{10,15}$/;
    if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
      toast.error('Please enter a valid phone number');
      return;
    }

    setIsSubmitting(true);
    try {
      // Format dates in local timezone to avoid timezone conversion issues
      const formatDateLocal = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      const enquiryData = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        eventType: formData.eventType,
        eventDate: formatDateLocal(selectedDate),
        eventEndDate: selectedEndDate ? formatDateLocal(selectedEndDate) : null,
        eventTimeFrom: '09:00 AM',  // Default business hours start
        eventTimeTo: '10:00 PM',    // Default business hours end
        // Include honeypot fields (should be empty)
        website: formData.website,
        company_website: formData.company_website
      };
      
      await createEnquiry(enquiryData);
      setLastSubmitTime(Date.now());
      const daysText = selectedEndDate ? ` (${selectedDate.toISOString().split('T')[0]} to ${selectedEndDate.toISOString().split('T')[0]})` : '';
      toast.success(`Booking request submitted successfully${daysText}! We will contact you soon to confirm availability.`);
      setIsDialogOpen(false);
      setFormData({ name: '', phone: '', eventType: '', website: '', company_website: '' });
      setSelectedDate(null);
      setSelectedEndDate(null);
      setAvailabilityData(null);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to submit request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const modifiers = {
    fullyBooked: (date) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return date >= today && getDateStatus(date) === 'fullyBooked';
    },
    partiallyBooked: (date) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return date >= today && getDateStatus(date) === 'partiallyBooked';
    },
    available: (date) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return date >= today && getDateStatus(date) === 'available';
    }
  };

  // Use inline styles to override the default button styles
  const modifiersStyles = {
    fullyBooked: { 
      backgroundColor: '#fee2e2', 
      color: '#7f1d1d', 
      textDecoration: 'line-through',
      fontWeight: 'bold'
    },
    partiallyBooked: { 
      backgroundColor: '#ffedd5', 
      color: '#9a3412', 
      fontWeight: 'bold'
    },
    available: { 
      backgroundColor: '#f0fdf4', 
      color: '#166534', 
      fontWeight: 'bold'
    }
  };

  return (
    <section id="booking" className="py-20 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Check Availability & Request Booking</h2>
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
            View available dates and submit a booking request. We&apos;ll contact you to confirm your reservation.
          </motion.p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Calendar */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
            className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl shadow-lg border border-gray-100 transition-shadow duration-300 hover:shadow-xl"
          >
            <div className="flex items-center justify-center mb-6">
              <CalendarIcon className="w-6 h-6 text-[#D4AF37] mr-2" />
              <h3 className="text-2xl font-semibold text-gray-900">Select Your Date</h3>
            </div>
            <div className="flex justify-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                onMonthChange={setCurrentMonth}
                modifiers={modifiers}
                modifiersStyles={modifiersStyles}
                disabled={(date) => date < new Date()}
                className="rounded-xl border-2 border-[#D4AF37]/20 p-4"
              />
            </div>
          </motion.div>

          {/* Legend and Info */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
              className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl shadow-lg border border-gray-100 transition-shadow duration-300 hover:shadow-xl"
            >
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">Legend</h3>
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={{
                  visible: { transition: { staggerChildren: 0.1 } }
                }}
                className="space-y-4"
              >
                {[
                  { color: 'green', label: 'Fully Available', desc: 'Click to book any time' },
                  { color: 'orange', label: 'Partially Booked', desc: 'Some time slots available' },
                  { color: 'red', label: 'Fully Booked', desc: 'No availability' },
                  { color: 'gray', label: 'Past Dates', desc: 'Cannot be selected' }
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    variants={{
                      hidden: { opacity: 0, x: -20 },
                      visible: { opacity: 1, x: 0, transition: { duration: 0.4 } }
                    }}
                    whileHover={{ x: 5 }}
                    className="flex items-center space-x-3"
                  >
                    <div className={`w-6 h-6 bg-${item.color}-100 rounded border-2 border-${item.color}-${item.color === 'gray' ? '300' : '500'}`}></div>
                    <div>
                      <p className="font-medium text-gray-900">{item.label}</p>
                      <p className="text-sm text-gray-600">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
              className="bg-gradient-to-r from-black via-gray-900 to-black p-8 rounded-2xl shadow-xl"
            >
              <h3 className="text-2xl font-semibold text-white mb-4">How to Request Booking</h3>
              <motion.ol
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={{
                  visible: { transition: { staggerChildren: 0.15 } }
                }}
                className="space-y-3 text-gray-300"
              >
                {[
                  'Check available dates in the calendar (green dates)',
                  'Click on your preferred date to submit request',
                  'Fill in your details and event information',
                  "We'll call you to confirm and finalize your booking"
                ].map((step, index) => (
                  <motion.li
                    key={index}
                    variants={{
                      hidden: { opacity: 0, x: -20 },
                      visible: { opacity: 1, x: 0, transition: { duration: 0.4 } }
                    }}
                    className="flex items-start"
                  >
                    <span className="flex-shrink-0 w-6 h-6 bg-[#D4AF37] rounded-full flex items-center justify-center text-black font-bold text-sm mr-3 mt-0.5">
                      {index + 1}
                    </span>
                    <span>{step}</span>
                  </motion.li>
                ))}
              </motion.ol>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Booking Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900">
              Request Booking for {selectedDate && format(selectedDate, 'MMMM dd, yyyy')}
            </DialogTitle>
            <DialogDescription>
              Check available time slots and submit your booking request.
            </DialogDescription>
          </DialogHeader>

          {/* Show availability for selected date */}
          {availabilityData && (
            <div className="space-y-3 mb-4">
              {/* Available Periods */}
              {availabilityData.availablePeriods && availabilityData.availablePeriods.length > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-900 mb-2 flex items-center">
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Available Time Slots:
                  </h4>
                  <div className="space-y-1">
                    {availabilityData.availablePeriods.map((slot, index) => (
                      <div key={index} className="text-sm text-green-800">
                        <span className="font-medium">{slot.start} - {slot.end}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Booked Periods */}
              {availabilityData.bookedPeriods && availabilityData.bookedPeriods.length > 0 && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h4 className="font-semibold text-orange-900 mb-2 flex items-center">
                    <XCircle className="w-4 h-4 mr-2" />
                    Already Booked Times:
                  </h4>
                  <div className="space-y-2">
                    {availabilityData.bookedPeriods.map((slot, index) => (
                      <div key={index} className="text-sm text-orange-800">
                        <span className="font-medium">{slot.start} - {slot.end}</span>
                        <span className="text-xs ml-2">({slot.eventType})</span>
                        {slot.isMultiDay && (
                          <span className="text-xs ml-2 italic">Multi-day event: {slot.eventDateRange}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Fully Booked Warning */}
              {availabilityData.isFullyBooked && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-semibold text-red-900">⚠️ This date is fully booked</h4>
                  <p className="text-sm text-red-700 mt-1">Please select a different date.</p>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                placeholder="Enter your name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="eventType">Event Type *</Label>
              <Select
                value={formData.eventType}
                onValueChange={(value) => setFormData({ ...formData, eventType: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select event type" />
                </SelectTrigger>
                <SelectContent>
                  {eventTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Honeypot fields - hidden from users, bots fill these */}
            <div style={{ position: 'absolute', left: '-9999px', opacity: 0, height: 0, overflow: 'hidden' }} aria-hidden="true">
              <label>Website (leave empty)</label>
              <input
                type="text"
                name="website"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                tabIndex={-1}
                autoComplete="off"
              />
              <label>Company Website (leave empty)</label>
              <input
                type="text"
                name="company_website"
                value={formData.company_website}
                onChange={(e) => setFormData({ ...formData, company_website: e.target.value })}
                tabIndex={-1}
                autoComplete="off"
              />
            </div>

            {/* Date Selection - User Friendly */}
            <div className="col-span-2 space-y-3">
              <Label className="text-lg font-semibold">Select Event Dates</Label>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Start Date */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Event Start Date</Label>
                  <div className="p-4 bg-gradient-to-br from-[#D4AF37]/10 to-gray-50 rounded-lg border-2 border-[#D4AF37]/30">
                    <div className="flex items-center space-x-3">
                      <CalendarIcon className="w-5 h-5 text-[#D4AF37]" />
                      <div>
                        <p className="text-xs text-gray-500 uppercase">Start Date</p>
                        <p className="font-semibold text-gray-900">
                          {selectedDate ? format(selectedDate, 'EEE, MMM dd, yyyy') : 'Select a date from calendar'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* End Date */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Event End Date (Optional)</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button 
                        variant="outline" 
                        className="w-full p-4 h-auto justify-start bg-gradient-to-br from-[#D4AF37]/10 to-gray-50 border-2 border-[#D4AF37]/30 hover:border-[#D4AF37]/50"
                      >
                        <div className="flex items-center space-x-3 w-full">
                          <CalendarIcon className="w-5 h-5 text-[#D4AF37]" />
                          <div className="text-left">
                            <p className="text-xs text-gray-500 uppercase">End Date</p>
                            <p className="font-semibold text-gray-900">
                              {selectedEndDate ? format(selectedEndDate, 'EEE, MMM dd, yyyy') : 'Same day event'}
                            </p>
                          </div>
                        </div>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        key={selectedDate ? selectedDate.toISOString() : 'no-date'}
                        mode="single"
                        selected={selectedEndDate}
                        onSelect={setSelectedEndDate}
                        defaultMonth={selectedDate || new Date()}
                        disabled={(date) => {
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          return !selectedDate || date < selectedDate || date < today;
                        }}
                        initialFocus
                      />
                      {selectedEndDate && (
                        <div className="p-3 border-t">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedEndDate(null)}
                            className="w-full"
                          >
                            Clear (Single day event)
                          </Button>
                        </div>
                      )}
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Duration Display */}
              {selectedEndDate && (
                <div className="bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">📅</span>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Multi-day Event</p>
                      <p className="text-sm text-gray-600">
                        {format(selectedDate, 'MMM dd')} - {format(selectedEndDate, 'MMM dd, yyyy')} 
                        <span className="ml-2 text-[#D4AF37] font-semibold">
                          ({Math.ceil((selectedEndDate - selectedDate) / (1000 * 60 * 60 * 24)) + 1} days)
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Business Hours Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <strong>🕒 Operating Hours:</strong> All bookings are from 9:00 AM to 10:00 PM
                </p>
              </div>
            </div>

            {/* Time inputs removed - using default business hours 9 AM - 10 PM */}

            <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-800">
              <p className="font-medium mb-1">💡 Multi-Day Events:</p>
              <p>Select an end date above if your event spans multiple days. The start and end times will apply to the first and last days respectively.</p>
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="flex-1"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-[#D4AF37] text-black hover:bg-[#C19B2E]"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Request'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
};