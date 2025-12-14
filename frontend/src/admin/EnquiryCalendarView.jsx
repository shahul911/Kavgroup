import React, { useState } from 'react';
import { Calendar } from '../components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { format, isSameDay } from 'date-fns';
import { Phone, Bell } from 'lucide-react';

export const EnquiryCalendarView = ({ enquiries, onDateClick }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Get enquiries for selected date
  const enquiriesForDate = enquiries.filter(enquiry => 
    isSameDay(new Date(enquiry.eventDate), selectedDate)
  );

  // Get all enquiry dates
  const enquiryDates = enquiries.map(e => new Date(e.eventDate));

  const modifiers = {
    hasEnquiry: enquiryDates
  };

  const modifiersClassNames = {
    hasEnquiry: 'bg-blue-100 text-blue-900 font-bold'
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'contacted': return 'bg-yellow-100 text-yellow-800';
      case 'follow-up': return 'bg-orange-100 text-orange-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Calendar */}
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>Enquiry Calendar</CardTitle>
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
                <div className="w-6 h-6 rounded bg-blue-100 border-2 border-blue-500"></div>
                <span>Dates with Enquiries</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enquiries for selected date */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>
              Enquiries for {format(selectedDate, 'MMMM dd, yyyy')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {enquiriesForDate.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p>No enquiries for this date</p>
              </div>
            ) : (
              <div className="space-y-4">
                {enquiriesForDate.map((enquiry) => (
                  <div
                    key={enquiry.id}
                    className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => onDateClick && onDateClick(enquiry)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900">{enquiry.name}</h3>
                        <p className="text-sm text-gray-600">{enquiry.eventType}</p>
                      </div>
                      <Badge className={getStatusColor(enquiry.status)}>
                        {enquiry.status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center text-gray-600">
                        <Phone className="w-4 h-4 mr-2" />
                        <a href={`tel:${enquiry.phone}`} className="text-blue-600 hover:underline">
                          {enquiry.phone}
                        </a>
                      </div>
                      {enquiry.followUpReminder && enquiry.followUpDate && (
                        <div className="flex items-center text-orange-600">
                          <Bell className="w-4 h-4 mr-2" />
                          <span className="text-xs">Follow-up: {format(new Date(enquiry.followUpDate), 'MMM dd')}</span>
                        </div>
                      )}
                    </div>

                    {enquiry.notes && (
                      <div className="mt-3 pt-3 border-t text-xs text-gray-600">
                        {enquiry.notes}
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
