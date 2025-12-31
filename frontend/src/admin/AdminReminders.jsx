import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminDashboard } from './AdminDashboard';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { 
  getReminders, markEnquiryReminderDone, markDocumentReminderDone,
  getBillCategories, getBillsByCategory, deleteDocument, deleteEnquiry,
  uploadDocument, rescheduleEnquiryReminder, rescheduleDocumentReminder,
  convertEnquiryToBooking
} from '../utils/api';
import { toast } from 'sonner';
import { 
  Bell, Phone, Calendar, FileText, AlertCircle, CheckCircle, Trash2, 
  Download, Plus, Droplet, Building, Map, Zap, Users, Wrench,
  Shield, FileCheck, ArrowLeft, Edit, CalendarPlus, RefreshCw
} from 'lucide-react';
import { format, isPast, isToday } from 'date-fns';

const categoryIcons = {
  'water-test': Droplet,
  'building-tax': Building,
  'land-tax': Map,
  'electricity-bill': Zap,
  'staff-payment': Users,
  'maintenance': Wrench,
  'insurance': Shield,
  'license': FileCheck,
  'other': FileText
};

const categoryNames = {
  'water-test': 'Water Test Results',
  'building-tax': 'Building Tax',
  'land-tax': 'Land Tax',
  'electricity-bill': 'Electricity Bill',
  'staff-payment': 'Staff Payment',
  'maintenance': 'Maintenance',
  'insurance': 'Insurance',
  'license': 'License & Permits',
  'other': 'Other Bills'
};

export const AdminReminders = () => {
  const navigate = useNavigate();
  const [reminders, setReminders] = useState({ enquiryReminders: [], documentReminders: [] });
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('reminders');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryBills, setCategoryBills] = useState([]);
  const [isLoadingBills, setIsLoadingBills] = useState(false);
  
  // Dialog states
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isEnquiryEditOpen, setIsEnquiryEditOpen] = useState(false);
  const [isDocEditOpen, setIsDocEditOpen] = useState(false);
  const [isConvertDialogOpen, setIsConvertDialogOpen] = useState(false);
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [selectedDoc, setSelectedDoc] = useState(null);
  
  // Form states
  const [uploadData, setUploadData] = useState({
    file: null,
    documentType: '',
    billDate: '',
    dueDate: '',
    reminderDate: '',
    reminderEnabled: true,
    amount: '',
    notes: ''
  });
  
  const [enquiryEditData, setEnquiryEditData] = useState({
    followUpDate: '',
    eventDate: '',
    eventEndDate: '',
    notes: ''
  });
  
  const [convertData, setConvertData] = useState({
    eventDate: '',
    eventEndDate: '',
    eventTimeFrom: '07:00 AM',
    eventTimeTo: '08:00 PM',
    amount: '',
    advancePaid: '',
    notes: ''
  });
  
  const [docEditData, setDocEditData] = useState({
    reminderDate: '',
    dueDate: '',
    amount: '',
    notes: ''
  });

  useEffect(() => {
    loadReminders();
    loadCategories();
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

  const loadCategories = async () => {
    try {
      const response = await getBillCategories();
      setCategories(response.categories);
    } catch (error) {
      console.error('Failed to load categories');
    }
  };

  const loadCategoryBills = async (category) => {
    setIsLoadingBills(true);
    try {
      const response = await getBillsByCategory(category.id);
      setCategoryBills(response.documents);
      setSelectedCategory(category);
    } catch (error) {
      toast.error('Failed to load bills');
    } finally {
      setIsLoadingBills(false);
    }
  };

  const handleCall = (phone) => {
    window.location.href = `tel:${phone}`;
  };

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

  const handleDeleteDocument = async (documentId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    try {
      await deleteDocument(documentId);
      toast.success('Document deleted');
      loadReminders();
      loadCategories();
      if (selectedCategory) {
        loadCategoryBills(selectedCategory);
      }
    } catch (error) {
      toast.error('Failed to delete document');
    }
  };

  const handleDownload = (fileUrl) => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    const fullUrl = fileUrl.startsWith('http') ? fileUrl : `${backendUrl}${fileUrl}`;
    window.open(fullUrl, '_blank');
  };

  const handleUpload = async () => {
    if (!uploadData.file || !uploadData.documentType) {
      toast.error('Please select a file and category');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', uploadData.file);
      formData.append('documentType', uploadData.documentType);
      if (uploadData.billDate) formData.append('billDate', uploadData.billDate);
      if (uploadData.dueDate) formData.append('dueDate', uploadData.dueDate);
      if (uploadData.reminderDate) formData.append('reminderDate', uploadData.reminderDate);
      formData.append('reminderEnabled', uploadData.reminderEnabled);
      if (uploadData.amount) formData.append('amount', uploadData.amount);
      if (uploadData.notes) formData.append('notes', uploadData.notes);

      await uploadDocument(formData);
      toast.success('Bill uploaded successfully');
      setIsUploadDialogOpen(false);
      resetUploadData();
      loadCategories();
      loadReminders();
      if (selectedCategory) {
        loadCategoryBills(selectedCategory);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload bill: ' + (error.response?.data?.detail || error.message));
    }
  };

  const resetUploadData = () => {
    setUploadData({
      file: null,
      documentType: '',
      billDate: '',
      dueDate: '',
      reminderDate: '',
      reminderEnabled: true,
      amount: '',
      notes: ''
    });
  };

  // Edit enquiry follow-up
  const openEnquiryEdit = (enquiry) => {
    setSelectedEnquiry(enquiry);
    setEnquiryEditData({
      followUpDate: enquiry.followUpDate || '',
      notes: enquiry.notes || ''
    });
    setIsEnquiryEditOpen(true);
  };

  const handleRescheduleEnquiry = async () => {
    if (!enquiryEditData.followUpDate) {
      toast.error('Please select a follow-up date');
      return;
    }
    try {
      await rescheduleEnquiryReminder(selectedEnquiry.id, enquiryEditData);
      toast.success('Follow-up rescheduled');
      setIsEnquiryEditOpen(false);
      loadReminders();
    } catch (error) {
      toast.error('Failed to reschedule');
    }
  };

  // Open convert to booking dialog
  const openConvertDialog = (enquiry) => {
    setSelectedEnquiry(enquiry);
    setConvertData({
      eventDate: enquiry.eventDate || '',
      eventEndDate: enquiry.eventEndDate || '',
      eventTimeFrom: enquiry.eventTimeFrom || '07:00 AM',
      eventTimeTo: enquiry.eventTimeTo || '08:00 PM',
      amount: '',
      advancePaid: '',
      notes: enquiry.notes || ''
    });
    setIsConvertDialogOpen(true);
  };

  const handleConvertToBooking = async () => {
    if (!convertData.eventDate) {
      toast.error('Please select an event date');
      return;
    }
    try {
      const bookingDetails = {
        eventDate: convertData.eventDate,
        eventEndDate: convertData.eventEndDate || convertData.eventDate,
        eventTimeFrom: convertData.eventTimeFrom,
        eventTimeTo: convertData.eventTimeTo,
        amount: parseFloat(convertData.amount) || 0,
        advancePaid: parseFloat(convertData.advancePaid) || 0,
        balanceDue: (parseFloat(convertData.amount) || 0) - (parseFloat(convertData.advancePaid) || 0),
        notes: convertData.notes
      };
      await convertEnquiryToBooking(selectedEnquiry.id, bookingDetails);
      toast.success('Enquiry converted to booking successfully!');
      setIsConvertDialogOpen(false);
      loadReminders();
    } catch (error) {
      toast.error('Failed to convert: ' + (error.response?.data?.detail || error.message));
    }
  };

  // Edit document reminder - clicking on bill reminder card
  const openDocEdit = (doc) => {
    setSelectedDoc(doc);
    setDocEditData({
      reminderDate: doc.reminderDate || '',
      dueDate: doc.dueDate || '',
      amount: doc.amount || '',
      notes: doc.notes || ''
    });
    // Also prepare for upload if they want to add new bill
    setUploadData({
      ...uploadData,
      documentType: doc.documentType,
      reminderDate: '',
      billDate: '',
      dueDate: '',
      amount: '',
      notes: ''
    });
    setIsDocEditOpen(true);
  };

  const handleUpdateDocReminder = async () => {
    try {
      await rescheduleDocumentReminder(selectedDoc.id, docEditData);
      toast.success('Reminder updated');
      setIsDocEditOpen(false);
      loadReminders();
    } catch (error) {
      toast.error('Failed to update reminder');
    }
  };

  const handleUploadNewForCategory = async () => {
    if (!uploadData.file) {
      toast.error('Please select a file');
      return;
    }
    try {
      const formData = new FormData();
      formData.append('file', uploadData.file);
      formData.append('documentType', selectedDoc.documentType);
      if (uploadData.billDate) formData.append('billDate', uploadData.billDate);
      if (uploadData.dueDate) formData.append('dueDate', uploadData.dueDate);
      if (uploadData.reminderDate) formData.append('reminderDate', uploadData.reminderDate);
      formData.append('reminderEnabled', !!uploadData.reminderDate);
      if (uploadData.amount) formData.append('amount', uploadData.amount);
      if (uploadData.notes) formData.append('notes', uploadData.notes);

      await uploadDocument(formData);
      toast.success('New bill uploaded');
      setIsDocEditOpen(false);
      resetUploadData();
      loadReminders();
      loadCategories();
    } catch (error) {
      toast.error('Failed to upload: ' + (error.response?.data?.detail || error.message));
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

  // Bills Category View
  if (selectedCategory) {
    const CategoryIcon = categoryIcons[selectedCategory.id] || FileText;
    return (
      <AdminDashboard currentPage="reminders">
        <div className="space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => setSelectedCategory(null)}>
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
              <div className="flex items-center gap-2">
                <CategoryIcon className="w-6 h-6 text-[#D4AF37]" />
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{selectedCategory.name}</h2>
              </div>
            </div>
            <Button 
              onClick={() => {
                setUploadData({ ...uploadData, documentType: selectedCategory.id });
                setIsUploadDialogOpen(true);
              }}
              className="bg-[#D4AF37] text-black hover:bg-[#C19B2E]"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Bill
            </Button>
          </div>

          {isLoadingBills ? (
            <div className="p-8 text-center">Loading bills...</div>
          ) : categoryBills.length === 0 ? (
            <Card>
              <CardContent className="p-8 sm:p-12 text-center">
                <CategoryIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No bills yet</h3>
                <p className="text-gray-600 mb-4">Upload your first {selectedCategory.name.toLowerCase()} record</p>
                <Button 
                  onClick={() => {
                    setUploadData({ ...uploadData, documentType: selectedCategory.id });
                    setIsUploadDialogOpen(true);
                  }}
                  className="bg-[#D4AF37] text-black hover:bg-[#C19B2E]"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Upload Bill
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryBills.map((bill) => (
                <Card key={bill.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-[#D4AF37]" />
                        <span className="font-medium text-gray-900 text-sm truncate max-w-[150px]">
                          {bill.fileName}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-blue-600"
                          onClick={() => handleDownload(bill.fileUrl)}
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-red-600"
                          onClick={() => handleDeleteDocument(bill.id)}
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      {bill.billDate && (
                        <p><span className="font-medium">Bill Date:</span> {format(new Date(bill.billDate), 'MMM dd, yyyy')}</p>
                      )}
                      {bill.amount && (
                        <p><span className="font-medium">Amount:</span> Rs. {bill.amount.toLocaleString()}</p>
                      )}
                      {bill.notes && (
                        <p className="text-xs text-gray-500 truncate">{bill.notes}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <UploadDialog
          isOpen={isUploadDialogOpen}
          onClose={() => { setIsUploadDialogOpen(false); resetUploadData(); }}
          uploadData={uploadData}
          setUploadData={setUploadData}
          onUpload={handleUpload}
          categories={categories}
        />
      </AdminDashboard>
    );
  }

  return (
    <AdminDashboard currentPage="reminders">
      <div className="space-y-4 sm:space-y-6">
        {/* Header with Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Reminders & Bills</h2>
            <p className="text-sm text-gray-600 mt-1">
              {activeTab === 'reminders' 
                ? `${totalReminders} reminder${totalReminders !== 1 ? 's' : ''} pending`
                : 'Manage all your bills and records'
              }
            </p>
          </div>
          <div className="flex gap-2">
            <div className="flex border rounded-lg">
              <Button
                variant={activeTab === 'reminders' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('reminders')}
                className={`text-xs sm:text-sm ${activeTab === 'reminders' ? 'bg-[#D4AF37] text-black hover:bg-[#C19B2E]' : ''}`}
              >
                <Bell className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Reminders</span>
              </Button>
              <Button
                variant={activeTab === 'bills' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('bills')}
                className={`text-xs sm:text-sm ${activeTab === 'bills' ? 'bg-[#D4AF37] text-black hover:bg-[#C19B2E]' : ''}`}
              >
                <FileText className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">All Bills</span>
              </Button>
            </div>
            {activeTab === 'reminders' && (
              <Button onClick={loadReminders} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4" />
              </Button>
            )}
            {activeTab === 'bills' && (
              <Button 
                onClick={() => setIsUploadDialogOpen(true)}
                className="bg-[#D4AF37] text-black hover:bg-[#C19B2E]"
                size="sm"
              >
                <Plus className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Add Bill</span>
              </Button>
            )}
          </div>
        </div>

        {/* Reminders Tab */}
        {activeTab === 'reminders' && (
          <>
            {isLoading ? (
              <div className="p-8 text-center">Loading reminders...</div>
            ) : totalReminders === 0 ? (
              <Card>
                <CardContent className="p-8 sm:p-12 text-center">
                  <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">All Clear!</h3>
                  <p className="text-gray-600">No pending reminders at this time</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {/* Enquiry Follow-ups */}
                {reminders.enquiryReminders.length > 0 && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                        <Phone className="w-5 h-5 text-blue-600" />
                        Enquiry Follow-ups ({reminders.enquiryReminders.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {reminders.enquiryReminders.map((enquiry) => {
                        const status = getReminderStatus(enquiry.followUpDate);
                        return (
                          <div
                            key={enquiry.id}
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
                                      onClick={() => handleCall(enquiry.phone)}
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
                                  onClick={() => openConvertDialog(enquiry)}
                                  className="bg-green-600 text-white hover:bg-green-700 text-xs"
                                >
                                  <Calendar className="w-3 h-3 mr-1" />
                                  Convert to Booking
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => handleCall(enquiry.phone)}
                                  className="bg-[#D4AF37] text-black hover:bg-[#C19B2E] text-xs"
                                >
                                  <Phone className="w-3 h-3 mr-1" />
                                  Call
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openEnquiryEdit(enquiry)}
                                  className="text-blue-600 border-blue-600 hover:bg-blue-50 text-xs"
                                >
                                  <CalendarPlus className="w-3 h-3 mr-1" />
                                  Reschedule
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleMarkEnquiryDone(enquiry.id)}
                                  className="text-green-600 border-green-600 hover:bg-green-50 text-xs"
                                >
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Done
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDeleteEnquiry(enquiry.id)}
                                  className="text-red-600 border-red-600 hover:bg-red-50 text-xs"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>
                )}

                {/* Document/Bill Reminders */}
                {reminders.documentReminders.length > 0 && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                        <FileText className="w-5 h-5 text-orange-600" />
                        Bill Reminders ({reminders.documentReminders.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {reminders.documentReminders.map((doc) => {
                        const status = getReminderStatus(doc.reminderDate);
                        const CategoryIcon = categoryIcons[doc.documentType] || FileText;
                        return (
                          <div
                            key={doc.id}
                            className={`border rounded-lg p-3 sm:p-4 cursor-pointer hover:shadow-md transition-shadow ${status.color.includes('red') ? 'border-red-200 bg-red-50/30' : status.color.includes('orange') ? 'border-orange-200 bg-orange-50/30' : 'border-gray-200'}`}
                            onClick={() => openDocEdit(doc)}
                          >
                            <div className="flex flex-col gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                  <CategoryIcon className="w-4 h-4 text-[#D4AF37]" />
                                  <h3 className="font-semibold text-gray-900">
                                    {categoryNames[doc.documentType] || doc.documentType}
                                  </h3>
                                  <span className={`px-2 py-0.5 rounded text-xs font-medium border ${status.color}`}>
                                    {status.text}
                                  </span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-sm text-gray-600">
                                  <div><span className="font-medium">File:</span> {doc.fileName}</div>
                                  <div><span className="font-medium">Reminder:</span> {format(new Date(doc.reminderDate), 'MMM dd, yyyy')}</div>
                                  {doc.dueDate && (
                                    <div><span className="font-medium">Due:</span> {format(new Date(doc.dueDate), 'MMM dd, yyyy')}</div>
                                  )}
                                  {doc.amount && (
                                    <div><span className="font-medium">Amount:</span> Rs. {doc.amount.toLocaleString()}</div>
                                  )}
                                </div>
                                {doc.notes && (
                                  <p className="mt-2 text-xs text-gray-500 bg-gray-100 p-2 rounded">{doc.notes}</p>
                                )}
                              </div>
                              {/* Actions */}
                              <div className="flex flex-wrap gap-2" onClick={(e) => e.stopPropagation()}>
                                <Button
                                  size="sm"
                                  onClick={() => handleDownload(doc.fileUrl)}
                                  className="bg-blue-600 text-white hover:bg-blue-700 text-xs"
                                >
                                  <Download className="w-3 h-3 mr-1" />
                                  View
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openDocEdit(doc)}
                                  className="text-blue-600 border-blue-600 hover:bg-blue-50 text-xs"
                                >
                                  <Edit className="w-3 h-3 mr-1" />
                                  Edit / Add New
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleMarkDocumentDone(doc.id)}
                                  className="text-green-600 border-green-600 hover:bg-green-50 text-xs"
                                >
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Done
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDeleteDocument(doc.id)}
                                  className="text-red-600 border-red-600 hover:bg-red-50 text-xs"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </>
        )}

        {/* Bills Tab - Category Grid */}
        {activeTab === 'bills' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {categories.map((category) => {
              const CategoryIcon = categoryIcons[category.id] || FileText;
              return (
                <Card 
                  key={category.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow hover:border-[#D4AF37]"
                  onClick={() => loadCategoryBills(category)}
                >
                  <CardContent className="p-4 sm:p-6 text-center">
                    <CategoryIcon className="w-8 h-8 sm:w-10 sm:h-10 text-[#D4AF37] mx-auto mb-2 sm:mb-3" />
                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base mb-1">{category.name}</h3>
                    <p className="text-xs sm:text-sm text-gray-500">
                      {category.count} {category.count === 1 ? 'record' : 'records'}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Upload Dialog */}
      <UploadDialog
        isOpen={isUploadDialogOpen}
        onClose={() => { setIsUploadDialogOpen(false); resetUploadData(); }}
        uploadData={uploadData}
        setUploadData={setUploadData}
        onUpload={handleUpload}
        categories={categories}
      />

      {/* Enquiry Edit Dialog */}
      <Dialog open={isEnquiryEditOpen} onOpenChange={setIsEnquiryEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reschedule Follow-up: {selectedEnquiry?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>New Follow-up Date *</Label>
              <Input
                type="date"
                value={enquiryEditData.followUpDate}
                onChange={(e) => setEnquiryEditData({ ...enquiryEditData, followUpDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                placeholder="Add notes about this follow-up..."
                value={enquiryEditData.notes}
                onChange={(e) => setEnquiryEditData({ ...enquiryEditData, notes: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEnquiryEditOpen(false)}>Cancel</Button>
            <Button onClick={handleRescheduleEnquiry} className="bg-[#D4AF37] text-black hover:bg-[#C19B2E]">
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Document Edit / Upload New Dialog */}
      <Dialog open={isDocEditOpen} onOpenChange={setIsDocEditOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {categoryNames[selectedDoc?.documentType] || selectedDoc?.documentType}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Section 1: Update Current Reminder */}
            <div className="space-y-4 border-b pb-4">
              <h3 className="font-semibold text-gray-900">Update Current Reminder</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>New Reminder Date</Label>
                  <Input
                    type="date"
                    value={docEditData.reminderDate}
                    onChange={(e) => setDocEditData({ ...docEditData, reminderDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Due Date</Label>
                  <Input
                    type="date"
                    value={docEditData.dueDate}
                    onChange={(e) => setDocEditData({ ...docEditData, dueDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Amount (Rs.)</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={docEditData.amount}
                    onChange={(e) => setDocEditData({ ...docEditData, amount: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  placeholder="Add notes..."
                  value={docEditData.notes}
                  onChange={(e) => setDocEditData({ ...docEditData, notes: e.target.value })}
                  rows={2}
                />
              </div>
              <Button onClick={handleUpdateDocReminder} className="w-full bg-[#D4AF37] text-black hover:bg-[#C19B2E]">
                Update Reminder
              </Button>
            </div>

            {/* Section 2: Upload New Bill */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Upload New Bill/Receipt</h3>
              <div className="space-y-2">
                <Label>File *</Label>
                <Input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setUploadData({ ...uploadData, file: e.target.files[0] })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Bill Date</Label>
                  <Input
                    type="date"
                    value={uploadData.billDate}
                    onChange={(e) => setUploadData({ ...uploadData, billDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Amount (Rs.)</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={uploadData.amount}
                    onChange={(e) => setUploadData({ ...uploadData, amount: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Due Date</Label>
                  <Input
                    type="date"
                    value={uploadData.dueDate}
                    onChange={(e) => setUploadData({ ...uploadData, dueDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Reminder Date</Label>
                  <Input
                    type="date"
                    value={uploadData.reminderDate}
                    onChange={(e) => setUploadData({ ...uploadData, reminderDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Input
                  placeholder="Optional notes..."
                  value={uploadData.notes}
                  onChange={(e) => setUploadData({ ...uploadData, notes: e.target.value })}
                />
              </div>
              <Button 
                onClick={handleUploadNewForCategory} 
                variant="outline"
                className="w-full"
                disabled={!uploadData.file}
              >
                <Plus className="w-4 h-4 mr-2" />
                Upload New Bill
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDocEditOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Convert to Booking Dialog */}
      <Dialog open={isConvertDialogOpen} onOpenChange={setIsConvertDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Convert to Booking: {selectedEnquiry?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Customer Info */}
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm"><span className="font-medium">Customer:</span> {selectedEnquiry?.name}</p>
              <p className="text-sm"><span className="font-medium">Phone:</span> {selectedEnquiry?.phone}</p>
              <p className="text-sm"><span className="font-medium">Event Type:</span> {selectedEnquiry?.eventType}</p>
            </div>

            {/* Event Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Event Start Date *</Label>
                <Input
                  type="date"
                  value={convertData.eventDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => {
                    const newStartDate = e.target.value;
                    // If end date is before new start date, clear it
                    const updatedEndDate = convertData.eventEndDate && convertData.eventEndDate < newStartDate 
                      ? '' 
                      : convertData.eventEndDate;
                    setConvertData({ ...convertData, eventDate: newStartDate, eventEndDate: updatedEndDate });
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label>Event End Date</Label>
                <Input
                  type="date"
                  value={convertData.eventEndDate}
                  min={convertData.eventDate || new Date().toISOString().split('T')[0]}
                  onChange={(e) => setConvertData({ ...convertData, eventEndDate: e.target.value })}
                />
              </div>
            </div>

            {/* Event Times */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Time From</Label>
                <Select 
                  value={convertData.eventTimeFrom} 
                  onValueChange={(value) => setConvertData({ ...convertData, eventTimeFrom: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {['07:00 AM', '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
                      '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM'].map(time => (
                      <SelectItem key={time} value={time}>{time}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Time To</Label>
                <Select 
                  value={convertData.eventTimeTo} 
                  onValueChange={(value) => setConvertData({ ...convertData, eventTimeTo: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {['12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM',
                      '06:00 PM', '07:00 PM', '08:00 PM', '09:00 PM', '10:00 PM', '11:00 PM'].map(time => (
                      <SelectItem key={time} value={time}>{time}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Payment Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Total Amount (Rs.)</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={convertData.amount}
                  onChange={(e) => setConvertData({ ...convertData, amount: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Advance Paid (Rs.)</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={convertData.advancePaid}
                  onChange={(e) => setConvertData({ ...convertData, advancePaid: e.target.value })}
                />
              </div>
            </div>

            {/* Balance Due */}
            {(convertData.amount || convertData.advancePaid) && (
              <div className="bg-yellow-50 p-3 rounded-lg">
                <p className="text-sm font-medium">
                  Balance Due: Rs. {((parseFloat(convertData.amount) || 0) - (parseFloat(convertData.advancePaid) || 0)).toLocaleString()}
                </p>
              </div>
            )}

            {/* Notes */}
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                placeholder="Any special instructions or notes..."
                value={convertData.notes}
                onChange={(e) => setConvertData({ ...convertData, notes: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConvertDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleConvertToBooking} className="bg-green-600 text-white hover:bg-green-700">
              <Calendar className="w-4 h-4 mr-2" />
              Convert to Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminDashboard>
  );
};

// Upload Dialog Component
const UploadDialog = ({ isOpen, onClose, uploadData, setUploadData, onUpload, categories }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload Bill / Document</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>File *</Label>
            <Input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => setUploadData({ ...uploadData, file: e.target.files[0] })}
            />
            <p className="text-xs text-gray-500">PDF or images (max 10MB)</p>
          </div>

          <div className="space-y-2">
            <Label>Category *</Label>
            <Select 
              value={uploadData.documentType} 
              onValueChange={(value) => setUploadData({ ...uploadData, documentType: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Bill Date</Label>
              <Input
                type="date"
                value={uploadData.billDate}
                onChange={(e) => setUploadData({ ...uploadData, billDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Amount (Rs.)</Label>
              <Input
                type="number"
                placeholder="0"
                value={uploadData.amount}
                onChange={(e) => setUploadData({ ...uploadData, amount: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Due Date</Label>
              <Input
                type="date"
                value={uploadData.dueDate}
                onChange={(e) => setUploadData({ ...uploadData, dueDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Reminder Date</Label>
              <Input
                type="date"
                value={uploadData.reminderDate}
                onChange={(e) => setUploadData({ ...uploadData, reminderDate: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Notes</Label>
            <Input
              placeholder="Optional notes..."
              value={uploadData.notes}
              onChange={(e) => setUploadData({ ...uploadData, notes: e.target.value })}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={onUpload} className="bg-[#D4AF37] text-black hover:bg-[#C19B2E]">
            Upload
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
