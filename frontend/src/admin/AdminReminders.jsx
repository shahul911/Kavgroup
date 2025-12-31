import React, { useState, useEffect } from 'react';
import { AdminDashboard } from './AdminDashboard';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Checkbox } from '../components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { 
  getReminders, markEnquiryReminderDone, markDocumentReminderDone,
  getBillCategories, getBillsByCategory, deleteDocument, deleteEnquiry,
  uploadDocument
} from '../utils/api';
import { toast } from 'sonner';
import { 
  Bell, Phone, Calendar, FileText, AlertCircle, CheckCircle, Trash2, 
  Download, Eye, Plus, Droplet, Building, Map, Zap, Users, Wrench,
  Shield, FileCheck, ArrowLeft, X
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

export const AdminReminders = () => {
  const [reminders, setReminders] = useState({ enquiryReminders: [], documentReminders: [] });
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('reminders'); // 'reminders' or 'bills'
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryBills, setCategoryBills] = useState([]);
  const [isLoadingBills, setIsLoadingBills] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [uploadData, setUploadData] = useState({
    file: null,
    documentType: '',
    billDate: '',
    dueDate: '',
    reminderDate: '',
    reminderEnabled: false,
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
      setUploadData({
        file: null,
        documentType: '',
        billDate: '',
        dueDate: '',
        reminderDate: '',
        reminderEnabled: false,
        amount: '',
        notes: ''
      });
      loadCategories();
      loadReminders();
      if (selectedCategory) {
        loadCategoryBills(selectedCategory);
      }
    } catch (error) {
      toast.error('Failed to upload bill');
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
          {/* Header */}
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

          {/* Bills List */}
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

        {/* Upload Dialog */}
        <UploadDialog
          isOpen={isUploadDialogOpen}
          onClose={() => setIsUploadDialogOpen(false)}
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
              <Button onClick={loadReminders} variant="outline" size="sm">Refresh</Button>
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
                            className={`border rounded-lg p-3 sm:p-4 ${status.color.includes('red') ? 'border-red-200' : status.color.includes('orange') ? 'border-orange-200' : 'border-gray-200'}`}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                              {/* Checkbox */}
                              <div className="flex items-center gap-3">
                                <Checkbox
                                  id={`enquiry-${enquiry.id}`}
                                  onCheckedChange={() => handleMarkEnquiryDone(enquiry.id)}
                                  className="mt-1"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex flex-wrap items-center gap-2 mb-1">
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
                                    <p className="mt-2 text-xs text-gray-500 bg-gray-50 p-2 rounded">{enquiry.notes}</p>
                                  )}
                                </div>
                              </div>
                              {/* Actions */}
                              <div className="flex gap-2 sm:ml-auto">
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

                {/* Document Reminders */}
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
                            className={`border rounded-lg p-3 sm:p-4 ${status.color.includes('red') ? 'border-red-200' : status.color.includes('orange') ? 'border-orange-200' : 'border-gray-200'}`}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                              {/* Checkbox */}
                              <div className="flex items-center gap-3">
                                <Checkbox
                                  id={`doc-${doc.id}`}
                                  onCheckedChange={() => handleMarkDocumentDone(doc.id)}
                                  className="mt-1"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex flex-wrap items-center gap-2 mb-1">
                                    <CategoryIcon className="w-4 h-4 text-[#D4AF37]" />
                                    <h3 className="font-semibold text-gray-900">
                                      {doc.documentType.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
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
                                    <p className="mt-2 text-xs text-gray-500 bg-gray-50 p-2 rounded">{doc.notes}</p>
                                  )}
                                </div>
                              </div>
                              {/* Actions */}
                              <div className="flex gap-2 sm:ml-auto">
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
        onClose={() => setIsUploadDialogOpen(false)}
        uploadData={uploadData}
        setUploadData={setUploadData}
        onUpload={handleUpload}
        categories={categories}
      />
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
          {/* File Input */}
          <div className="space-y-2">
            <Label>File *</Label>
            <Input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => setUploadData({ ...uploadData, file: e.target.files[0] })}
            />
            <p className="text-xs text-gray-500">PDF or images (max 10MB)</p>
          </div>

          {/* Category */}
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

          {/* Bill Date & Amount */}
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

          {/* Due Date & Reminder */}
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

          {/* Enable Reminder */}
          <div className="flex items-center gap-2">
            <Checkbox
              id="reminderEnabled"
              checked={uploadData.reminderEnabled}
              onCheckedChange={(checked) => setUploadData({ ...uploadData, reminderEnabled: checked })}
            />
            <Label htmlFor="reminderEnabled" className="text-sm">Enable reminder notification</Label>
          </div>

          {/* Notes */}
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
