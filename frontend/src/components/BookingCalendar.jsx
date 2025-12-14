import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, CheckCircle2, XCircle } from 'lucide-react';
import { Calendar } from './ui/calendar';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { getBookedDates, createEnquiry } from '../utils/api';
import { eventTypes } from '../mock';
import { toast } from 'sonner';
import { format } from 'date-fns';

export const BookingCalendar = () => {
  const [bookedDates, setBookedDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    eventType: ''
  });

  useEffect(() => {
    loadBookedDates();
  }, []);

  const loadBookedDates = async () => {
    try {
      const response = await getBookedDates();
      const dates = response.bookedDates.map(dateStr => new Date(dateStr));
      setBookedDates(dates);
    } catch (error) {
      toast.error('Failed to load availability');
    }
  };

  const isDateAvailable = (date) => {
    return !bookedDates.some(
      bookedDate =>
        bookedDate.getDate() === date.getDate() &&
        bookedDate.getMonth() === date.getMonth() &&
        bookedDate.getFullYear() === date.getFullYear()
    );
  };

  const handleDateSelect = (date) => {
    if (date && isDateAvailable(date)) {
      setSelectedDate(date);
      setIsDialogOpen(true);
    } else if (date) {
      toast.error('This date is already booked. Please select another date.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.eventType || !selectedDate) {
      toast.error('Please fill all fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const enquiryData = {
        ...formData,
        eventDate: selectedDate.toISOString().split('T')[0]
      };
      
      await createEnquiry(enquiryData);
      toast.success('Booking request submitted successfully! We will contact you soon to confirm.');
      setIsDialogOpen(false);
      setFormData({ name: '', phone: '', eventType: '' });
      setSelectedDate(null);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to submit request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const modifiers = {
    booked: bookedDates,
    available: (date) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return date >= today && isDateAvailable(date);
    }
  };

  const modifiersClassNames = {
    booked: 'bg-red-100 text-red-900 line-through hover:bg-red-200',
    available: 'bg-green-50 hover:bg-green-100 text-green-900 font-semibold'
  };

  return (
    <section id="booking" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Check Availability & Request Booking</h2>
          <div className="w-24 h-1 bg-[#D4AF37] mx-auto mb-6"></div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            View available dates and submit a booking request. We'll contact you to confirm your reservation.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Calendar */}
          <div className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl shadow-lg border border-gray-100">
            <div className="flex items-center justify-center mb-6">
              <CalendarIcon className="w-6 h-6 text-[#D4AF37] mr-2" />
              <h3 className="text-2xl font-semibold text-gray-900">Select Your Date</h3>
            </div>
            <div className="flex justify-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                modifiers={modifiers}
                modifiersClassNames={modifiersClassNames}
                disabled={(date) => date < new Date()}
                className="rounded-xl border-2 border-[#D4AF37]/20 p-4"
              />
            </div>
          </div>

          {/* Legend and Info */}
          <div className="space-y-8">
            <div className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl shadow-lg border border-gray-100">
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">Legend</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-green-100 rounded border-2 border-green-500"></div>
                  <div>
                    <p className="font-medium text-gray-900">Available Dates</p>
                    <p className="text-sm text-gray-600">Click to book</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-red-100 rounded border-2 border-red-500"></div>
                  <div>
                    <p className="font-medium text-gray-900">Booked Dates</p>
                    <p className="text-sm text-gray-600">Not available</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-gray-100 rounded border-2 border-gray-300"></div>
                  <div>
                    <p className="font-medium text-gray-900">Past Dates</p>
                    <p className="text-sm text-gray-600">Cannot be selected</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-black via-gray-900 to-black p-8 rounded-2xl shadow-xl">
              <h3 className="text-2xl font-semibold text-white mb-4">How to Request Booking</h3>
              <ol className="space-y-3 text-gray-300">
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-[#D4AF37] rounded-full flex items-center justify-center text-black font-bold text-sm mr-3 mt-0.5">1</span>
                  <span>Check available dates in the calendar (green dates)</span>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-[#D4AF37] rounded-full flex items-center justify-center text-black font-bold text-sm mr-3 mt-0.5">2</span>
                  <span>Click on your preferred date to submit request</span>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-[#D4AF37] rounded-full flex items-center justify-center text-black font-bold text-sm mr-3 mt-0.5">3</span>
                  <span>Fill in your details and event information</span>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-[#D4AF37] rounded-full flex items-center justify-center text-black font-bold text-sm mr-3 mt-0.5">4</span>
                  <span>We'll call you to confirm and finalize your booking</span>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900">
              Request Booking for {selectedDate && format(selectedDate, 'MMMM dd, yyyy')}
            </DialogTitle>
            <DialogDescription>
              Submit your booking request. We'll contact you to confirm availability and details.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
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