import React, { useState, useEffect } from 'react';
import { AdminDashboard } from './AdminDashboard';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { getReminders } from '../utils/api';
import { toast } from 'sonner';
import { Bell, Phone, Calendar, FileText, AlertCircle } from 'lucide-react';
import { format, isPast, isToday } from 'date-fns';

export const AdminReminders = () => {
  const [reminders, setReminders] = useState({ enquiryReminders: [], documentReminders: [] });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadReminders();
  }, []);

  const loadReminders = async () => {
    setIsLoading(true);
    try {
      const response = await getReminders();
      setReminders(response);
    } catch (error) {
      toast.error('Failed to load reminders');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCall = (phone) => {
    window.location.href = `tel:${phone}`;
  };

  const getReminderStatus = (date) => {
    const reminderDate = new Date(date);
    if (isPast(reminderDate) && !isToday(reminderDate)) {
      return { text: 'Overdue', color: 'text-red-600 bg-red-50' };
    } else if (isToday(reminderDate)) {
      return { text: 'Today', color: 'text-orange-600 bg-orange-50' };
    } else {
      return { text: 'Upcoming', color: 'text-blue-600 bg-blue-50' };
    }
  };

  const totalReminders = reminders.enquiryReminders.length + reminders.documentReminders.length;

  return (
    <AdminDashboard currentPage="reminders">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Reminders & Follow-ups</h2>
            <p className="text-gray-600 mt-1">
              {totalReminders} reminder{totalReminders !== 1 ? 's' : ''} pending
            </p>
          </div>
          <Button onClick={loadReminders} variant="outline">Refresh</Button>
        </div>

        {isLoading ? (
          <div className="p-8 text-center">Loading reminders...</div>
        ) : totalReminders === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">All Clear!</h3>
              <p className="text-gray-600">No pending reminders at this time</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Enquiry Follow-ups */}
            {reminders.enquiryReminders.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="w-5 h-5 text-blue-600" />
                    Enquiry Follow-ups ({reminders.enquiryReminders.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {reminders.enquiryReminders.map((enquiry) => {
                      const status = getReminderStatus(enquiry.followUpDate);
                      return (
                        <div
                          key={enquiry.id}
                          className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-semibold text-gray-900">{enquiry.name}</h3>
                                <span className={`px-2 py-1 rounded text-xs font-medium ${status.color}`}>
                                  {status.text}
                                </span>
                              </div>
                              <div className="space-y-1 text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                  <Phone className="w-4 h-4" />
                                  <button
                                    onClick={() => handleCall(enquiry.phone)}
                                    className="text-blue-600 hover:text-blue-800"
                                  >
                                    {enquiry.phone}
                                  </button>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4" />
                                  <span>Event Date: {format(new Date(enquiry.eventDate), 'MMM dd, yyyy')}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <AlertCircle className="w-4 h-4" />
                                  <span>Follow-up: {format(new Date(enquiry.followUpDate), 'MMM dd, yyyy')}</span>
                                </div>
                                <div>
                                  <span className="font-medium">Event Type:</span> {enquiry.eventType}
                                </div>
                                {enquiry.notes && (
                                  <div className="mt-2 p-2 bg-gray-50 rounded">
                                    <span className="font-medium">Notes:</span> {enquiry.notes}
                                  </div>
                                )}
                              </div>
                            </div>
                            <Button
                              onClick={() => handleCall(enquiry.phone)}
                              className="bg-[#D4AF37] text-black hover:bg-[#C19B2E] ml-4"
                            >
                              <Phone className="w-4 h-4 mr-2" />
                              Call Now
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Document Reminders */}
            {reminders.documentReminders.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-orange-600" />
                    Document Reminders ({reminders.documentReminders.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {reminders.documentReminders.map((doc) => {
                      const status = getReminderStatus(doc.reminderDate);
                      return (
                        <div
                          key={doc.id}
                          className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <FileText className="w-5 h-5 text-[#D4AF37]" />
                                <h3 className="font-semibold text-gray-900">{doc.documentType.replace('-', ' ').toUpperCase()}</h3>
                                <span className={`px-2 py-1 rounded text-xs font-medium ${status.color}`}>
                                  {status.text}
                                </span>
                              </div>
                              <div className="space-y-1 text-sm text-gray-600">
                                <div>
                                  <span className="font-medium">File:</span> {doc.fileName}
                                </div>
                                {doc.billDate && (
                                  <div>
                                    <span className="font-medium">Bill Date:</span> {format(new Date(doc.billDate), 'MMM dd, yyyy')}
                                  </div>
                                )}
                                {doc.dueDate && (
                                  <div>
                                    <span className="font-medium">Due Date:</span> {format(new Date(doc.dueDate), 'MMM dd, yyyy')}
                                  </div>
                                )}
                                <div>
                                  <span className="font-medium">Reminder:</span> {format(new Date(doc.reminderDate), 'MMM dd, yyyy')}
                                </div>
                                {doc.amount && (
                                  <div>
                                    <span className="font-medium">Amount:</span> ₹{doc.amount.toLocaleString()}
                                  </div>
                                )}
                                {doc.notes && (
                                  <div className="mt-2 p-2 bg-gray-50 rounded">
                                    <span className="font-medium">Notes:</span> {doc.notes}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </AdminDashboard>
  );
};