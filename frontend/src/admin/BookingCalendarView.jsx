import React, { useState } from 'react';
import { Calendar } from '../components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { format, isSameDay } from 'date-fns';
import { Phone, Clock } from 'lucide-react';

export const BookingCalendarView = ({ bookings, onDateClick }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Get bookings for selected date
  const bookingsForDate = bookings.filter(booking => 
    isSameDay(new Date(booking.eventDate), selectedDate)
  );

  // Get all booked dates
  const bookedDates = bookings.map(b => new Date(b.eventDate));

  const modifiers = {
    booked: bookedDates
  };

  const modifiersClassNames = {
    booked: 'bg-[#D4AF37] text-black font-bold'
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
              modifiers={modifiers}
              modifiersClassNames={modifiersClassNames}
              className="rounded-md border"
            />
            <div className="mt-4 p-3 bg-gray-50 rounded">
              <p className="text-sm font-medium mb-2">Legend:</p>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-6 h-6 rounded bg-[#D4AF37]"></div>
                <span>Booked Dates</span>
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
