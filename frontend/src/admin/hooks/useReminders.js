import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import {
  getReminders,
  markEnquiryReminderDone,
  markDocumentReminderDone,
  deleteEnquiry,
  deleteDocument,
  rescheduleEnquiryReminder,
  rescheduleDocumentReminder,
  convertEnquiryToBooking
} from '../../utils/api';
import { isPast, isToday } from 'date-fns';

export const useReminders = () => {
  const [reminders, setReminders] = useState({ enquiryReminders: [], documentReminders: [] });
  const [isLoading, setIsLoading] = useState(true);

  const loadReminders = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getReminders();
      setReminders(response);
    } catch (error) {
      toast.error('Failed to load reminders');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReminders();
    
    // Refresh data when tab becomes visible again
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadReminders();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [loadReminders]);

  const handleMarkEnquiryDone = async (enquiryId) => {
    try {
      await markEnquiryReminderDone(enquiryId);
      toast.success('Reminder marked as done');
      loadReminders();
    } catch (error) {
      toast.error('Failed to mark reminder as done');
    }
  };

  const handleMarkDocumentDone = async (documentId) => {
    try {
      await markDocumentReminderDone(documentId);
      toast.success('Reminder marked as done');
      loadReminders();
    } catch (error) {
      toast.error('Failed to mark reminder as done');
    }
  };

  const handleDeleteEnquiry = async (enquiryId) => {
    if (!window.confirm('Are you sure you want to delete this enquiry?')) return;
    try {
      await deleteEnquiry(enquiryId);
      toast.success('Enquiry deleted');
      loadReminders();
    } catch (error) {
      toast.error('Failed to delete enquiry');
    }
  };

  const handleDeleteDocument = async (documentId, onSuccess) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    try {
      await deleteDocument(documentId);
      toast.success('Document deleted');
      loadReminders();
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error('Failed to delete document');
    }
  };

  const handleRescheduleEnquiry = async (enquiryId, data) => {
    if (!data.followUpDate) {
      toast.error('Please select a follow-up date');
      return false;
    }
    try {
      await rescheduleEnquiryReminder(enquiryId, data);
      toast.success('Enquiry updated successfully');
      loadReminders();
      return true;
    } catch (error) {
      toast.error('Failed to update: ' + (error.response?.data?.detail || error.message));
      return false;
    }
  };

  const handleRescheduleDocument = async (docId, data) => {
    try {
      await rescheduleDocumentReminder(docId, data);
      toast.success('Reminder updated');
      loadReminders();
      return true;
    } catch (error) {
      toast.error('Failed to update reminder');
      return false;
    }
  };

  const handleConvertToBooking = async (enquiryId, bookingDetails) => {
    if (!bookingDetails.eventDate) {
      toast.error('Please select an event date');
      return false;
    }
    try {
      const details = {
        eventDate: bookingDetails.eventDate,
        eventEndDate: bookingDetails.eventEndDate || bookingDetails.eventDate,
        eventTimeFrom: bookingDetails.eventTimeFrom,
        eventTimeTo: bookingDetails.eventTimeTo,
        amount: parseFloat(bookingDetails.amount) || 0,
        advancePaid: parseFloat(bookingDetails.advancePaid) || 0,
        balanceDue: (parseFloat(bookingDetails.amount) || 0) - (parseFloat(bookingDetails.advancePaid) || 0),
        notes: bookingDetails.notes
      };
      await convertEnquiryToBooking(enquiryId, details);
      toast.success('Enquiry converted to booking successfully!');
      loadReminders();
      return true;
    } catch (error) {
      toast.error('Failed to convert: ' + (error.response?.data?.detail || error.message));
      return false;
    }
  };

  const getReminderStatus = (date) => {
    const reminderDate = new Date(date);
    if (isPast(reminderDate) && !isToday(reminderDate)) {
      return { text: 'Overdue', color: 'text-red-600 bg-red-50 border-red-200' };
    } else if (isToday(reminderDate)) {
      return { text: 'Today', color: 'text-orange-600 bg-orange-50 border-orange-200' };
    } else {
      return { text: 'Upcoming', color: 'text-blue-600 bg-blue-50 border-blue-200' };
    }
  };

  const totalReminders = reminders.enquiryReminders.length + reminders.documentReminders.length;

  return {
    reminders,
    isLoading,
    totalReminders,
    loadReminders,
    handleMarkEnquiryDone,
    handleMarkDocumentDone,
    handleDeleteEnquiry,
    handleDeleteDocument,
    handleRescheduleEnquiry,
    handleRescheduleDocument,
    handleConvertToBooking,
    getReminderStatus
  };
};
