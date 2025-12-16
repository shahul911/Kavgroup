import React, { useState, useEffect } from 'react';
import { Calendar } from '../components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { format, isSameDay } from 'date-fns';
import { Phone, Clock } from 'lucide-react';
import { getAvailabilityOverview } from '../utils/api';

export const BookingCalendarView = ({ bookings, onDateClick }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dateStatusMap, setDateStatusMap] = useState({});
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Load availability status for calendar month
  useEffect(() => {
    loadAvailabilityForMonth(currentMonth);
  }, [currentMonth, bookings]); // Reload when bookings change

  const loadAvailabilityForMonth = async (monthDate) => {
    try {
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

  // Get bookings for selected date (including multi-day events)
  const bookingsForDate = bookings.filter(booking => {
    // Parse dates correctly to avoid timezone issues
    const parseLocalDate = (dateStr) => {
      const [year, month, day] = dateStr.split('-').map(Number);
      return new Date(year, month - 1, day);
    };
    
    const startDate = parseLocalDate(booking.eventDate);
    const endDate = booking.eventEndDate ? parseLocalDate(booking.eventEndDate) : startDate;
    
    // Check if selected date falls within the booking range
    const selectedDateOnly = new Date(selectedDate);
    selectedDateOnly.setHours(0, 0, 0, 0);
    
    const startDateOnly = new Date(startDate);
    startDateOnly.setHours(0, 0, 0, 0);
    
    const endDateOnly = new Date(endDate);
    endDateOnly.setHours(0, 0, 0, 0);
    
    return selectedDateOnly >= startDateOnly && selectedDateOnly <= endDateOnly;
  });

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

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Calendar */}
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>Booking Calendar</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              onMonthChange={setCurrentMonth}
              modifiers={modifiers}
              modifiersClassNames={modifiersClassNames}
              className="rounded-md border"
            />
            <div className="mt-4 p-3 bg-gray-50 rounded space-y-2">
              <p className="text-sm font-semibold mb-2">Legend:</p>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-5 h-5 rounded bg-green-100 border border-green-500"></div>
                <span>Fully Available</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-5 h-5 rounded bg-orange-100 border border-orange-500"></div>
                <span>Partially Booked</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-5 h-5 rounded bg-red-100 border border-red-500"></div>
                <span>Fully Booked</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bookings for selected date */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>
              Bookings for {format(selectedDate, 'MMMM dd, yyyy')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {bookingsForDate.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p>No bookings for this date</p>
              </div>
            ) : (
              <div className="space-y-4">
                {bookingsForDate.map((booking) => (
                  <div
                    key={booking.id}
                    className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => onDateClick && onDateClick(booking)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900">{booking.name}</h3>
                        <p className="text-sm text-gray-600">{booking.eventType}</p>
                      </div>
                      <Badge className={getStatusColor(booking.status)}>
                        {booking.status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center text-gray-600">
                        <Phone className="w-4 h-4 mr-2" />
                        <a href={`tel:${booking.phone}`} className="text-blue-600 hover:underline">
                          {booking.phone}
                        </a>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Clock className="w-4 h-4 mr-2" />
                        {booking.eventTimeFrom} - {booking.eventTimeTo}
                      </div>
                    </div>

                    {booking.invoiceNumber && (
                      <div className="mt-3 pt-3 border-t text-xs text-gray-500">
                        Invoice: {booking.invoiceNumber}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
