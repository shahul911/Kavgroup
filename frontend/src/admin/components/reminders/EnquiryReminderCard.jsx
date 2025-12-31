import React from 'react';
import { Button } from '../../../components/ui/button';
import { Phone, Calendar, AlertCircle, CheckCircle, Trash2, CalendarPlus } from 'lucide-react';
import { format } from 'date-fns';

export const EnquiryReminderCard = ({
  enquiry,
  status,
  onCall,
  onConvert,
  onReschedule,
  onMarkDone,
  onDelete
}) => {
  const handleCall = () => {
    window.location.href = `tel:${enquiry.phone}`;
  };

  return (
    <div
      className={`border rounded-lg p-3 sm:p-4 ${status.color.includes('red') ? 'border-red-200 bg-red-50/30' : status.color.includes('orange') ? 'border-orange-200 bg-orange-50/30' : 'border-gray-200'}`}
    >
      <div className="flex flex-col gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <h3 className="font-semibold text-gray-900">{enquiry.name}</h3>
            <span className={`px-2 py-0.5 rounded text-xs font-medium border ${status.color}`}>
              {status.text}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Phone className="w-3 h-3" />
              <button
                onClick={handleCall}
                className="text-blue-600 hover:text-blue-800"
              >
                {enquiry.phone}
              </button>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>Event: {format(new Date(enquiry.eventDate), 'MMM dd, yyyy')}</span>
            </div>
            <div className="flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              <span>Follow-up: {format(new Date(enquiry.followUpDate), 'MMM dd, yyyy')}</span>
            </div>
            {enquiry.eventType && (
              <div className="flex items-center gap-1">
                <span className="font-medium">Type:</span> {enquiry.eventType}
              </div>
            )}
          </div>
          {enquiry.notes && (
            <p className="mt-2 text-xs text-gray-500 bg-gray-100 p-2 rounded">{enquiry.notes}</p>
          )}
        </div>
        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            onClick={() => onConvert(enquiry)}
            className="bg-green-600 text-white hover:bg-green-700 text-xs"
          >
            <Calendar className="w-3 h-3 mr-1" />
            Convert to Booking
          </Button>
          <Button
            size="sm"
            onClick={handleCall}
            className="bg-[#D4AF37] text-black hover:bg-[#C19B2E] text-xs"
          >
            <Phone className="w-3 h-3 mr-1" />
            Call
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onReschedule(enquiry)}
            className="text-blue-600 border-blue-600 hover:bg-blue-50 text-xs"
          >
            <CalendarPlus className="w-3 h-3 mr-1" />
            Reschedule
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onMarkDone(enquiry.id)}
            className="text-green-600 border-green-600 hover:bg-green-50 text-xs"
          >
            <CheckCircle className="w-3 h-3 mr-1" />
            Done
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onDelete(enquiry.id)}
            className="text-red-600 border-red-600 hover:bg-red-50 text-xs"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  );
};
