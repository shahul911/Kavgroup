import React, { useState } from 'react';
import { AdminDashboard } from './AdminDashboard';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Bell, Phone, FileText, Plus, RefreshCw } from 'lucide-react';

// Custom Hooks
import { useReminders } from './hooks/useReminders';
import { useBills } from './hooks/useBills';

// Components
import {
  EnquiryReminderCard,
  BillReminderCard,
  CategoryGrid,
  CategoryBillsView,
  UploadBillDialog,
  EnquiryEditDialog,
  DocumentEditDialog,
  ConvertToBookingDialog
} from './components/reminders';

const initialUploadData = {
  file: null,
  documentType: '',
  billDate: '',
  dueDate: '',
  reminderDate: '',
  reminderEnabled: true,
  amount: '',
  notes: ''
};

export const AdminReminders = () => {
  // Custom hooks for state management
  const {
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
  } = useReminders();

  const {
    categories,
    selectedCategory,
    categoryBills,
    isLoadingBills,
    loadCategories,
    loadCategoryBills,
    clearSelectedCategory,
    handleUploadBill,
    handleUploadNewForCategory,
    handleDownload
  } = useBills();

  // UI State
  const [activeTab, setActiveTab] = useState('reminders');

  // Dialog states
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isEnquiryEditOpen, setIsEnquiryEditOpen] = useState(false);
  const [isDocEditOpen, setIsDocEditOpen] = useState(false);
  const [isConvertDialogOpen, setIsConvertDialogOpen] = useState(false);

  // Selected items
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [selectedDoc, setSelectedDoc] = useState(null);

  // Form states
  const [uploadData, setUploadData] = useState(initialUploadData);

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

  // Reset upload data
  const resetUploadData = () => setUploadData(initialUploadData);

  // Edit enquiry follow-up
  const openEnquiryEdit = (enquiry) => {
    setSelectedEnquiry(enquiry);
    setEnquiryEditData({
      followUpDate: enquiry.followUpDate || '',
      eventDate: enquiry.eventDate || '',
      eventEndDate: enquiry.eventEndDate || '',
      notes: enquiry.notes || ''
    });
    setIsEnquiryEditOpen(true);
  };

  const handleSaveEnquiry = async () => {
    const success = await handleRescheduleEnquiry(selectedEnquiry.id, enquiryEditData);
    if (success) setIsEnquiryEditOpen(false);
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

  const handleConvert = async () => {
    const success = await handleConvertToBooking(selectedEnquiry.id, convertData);
    if (success) setIsConvertDialogOpen(false);
  };

  // Edit document reminder
  const openDocEdit = (doc) => {
    setSelectedDoc(doc);
    setDocEditData({
      reminderDate: doc.reminderDate || '',
      dueDate: doc.dueDate || '',
      amount: doc.amount || '',
      notes: doc.notes || ''
    });
    setUploadData({
      ...initialUploadData,
      documentType: doc.documentType
    });
    setIsDocEditOpen(true);
  };

  const handleUpdateDocReminder = async () => {
    const success = await handleRescheduleDocument(selectedDoc.id, docEditData);
    if (success) setIsDocEditOpen(false);
  };

  const handleUploadNewForDoc = async () => {
    const success = await handleUploadNewForCategory(
      uploadData,
      selectedDoc.documentType,
      () => {
        setIsDocEditOpen(false);
        resetUploadData();
        loadReminders();
      }
    );
    if (success) loadReminders();
  };

  // Upload dialog handlers
  const handleUpload = async () => {
    const success = await handleUploadBill(uploadData, () => {
      setIsUploadDialogOpen(false);
      resetUploadData();
      loadReminders();
    });
    if (success) loadReminders();
  };

  // Delete document with refresh
  const onDeleteDocument = (docId) => {
    handleDeleteDocument(docId, () => {
      loadCategories();
      if (selectedCategory) {
        loadCategoryBills(selectedCategory);
      }
    });
  };

  // Bills Category View
  if (selectedCategory) {
    return (
      <AdminDashboard currentPage="reminders">
        <CategoryBillsView
          category={selectedCategory}
          bills={categoryBills}
          isLoading={isLoadingBills}
          onBack={clearSelectedCategory}
          onAddBill={() => {
            setUploadData({ ...uploadData, documentType: selectedCategory.id });
            setIsUploadDialogOpen(true);
          }}
          onDownload={handleDownload}
          onDelete={onDeleteDocument}
        />

        <UploadBillDialog
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
                      {reminders.enquiryReminders.map((enquiry) => (
                        <EnquiryReminderCard
                          key={enquiry.id}
                          enquiry={enquiry}
                          status={getReminderStatus(enquiry.followUpDate)}
                          onConvert={openConvertDialog}
                          onReschedule={openEnquiryEdit}
                          onMarkDone={handleMarkEnquiryDone}
                          onDelete={handleDeleteEnquiry}
                        />
                      ))}
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
                      {reminders.documentReminders.map((doc) => (
                        <BillReminderCard
                          key={doc.id}
                          doc={doc}
                          status={getReminderStatus(doc.reminderDate)}
                          onDownload={handleDownload}
                          onEdit={openDocEdit}
                          onMarkDone={handleMarkDocumentDone}
                          onDelete={onDeleteDocument}
                        />
                      ))}
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </>
        )}

        {/* Bills Tab - Category Grid */}
        {activeTab === 'bills' && (
          <CategoryGrid
            categories={categories}
            onCategorySelect={loadCategoryBills}
          />
        )}
      </div>

      {/* Dialogs */}
      <UploadBillDialog
        isOpen={isUploadDialogOpen}
        onClose={() => { setIsUploadDialogOpen(false); resetUploadData(); }}
        uploadData={uploadData}
        setUploadData={setUploadData}
        onUpload={handleUpload}
        categories={categories}
      />

      <EnquiryEditDialog
        isOpen={isEnquiryEditOpen}
        onClose={() => setIsEnquiryEditOpen(false)}
        enquiry={selectedEnquiry}
        editData={enquiryEditData}
        setEditData={setEnquiryEditData}
        onSave={handleSaveEnquiry}
      />

      <DocumentEditDialog
        isOpen={isDocEditOpen}
        onClose={() => setIsDocEditOpen(false)}
        doc={selectedDoc}
        editData={docEditData}
        setEditData={setDocEditData}
        uploadData={uploadData}
        setUploadData={setUploadData}
        onUpdateReminder={handleUpdateDocReminder}
        onUploadNew={handleUploadNewForDoc}
      />

      <ConvertToBookingDialog
        isOpen={isConvertDialogOpen}
        onClose={() => setIsConvertDialogOpen(false)}
        enquiry={selectedEnquiry}
        convertData={convertData}
        setConvertData={setConvertData}
        onConvert={handleConvert}
      />
    </AdminDashboard>
  );
};
