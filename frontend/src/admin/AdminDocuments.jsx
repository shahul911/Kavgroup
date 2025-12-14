import React, { useState, useEffect } from 'react';
import { AdminDashboard } from './AdminDashboard';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Calendar } from '../components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { Switch } from '../components/ui/switch';
import { getDocuments, uploadDocument, deleteDocument } from '../utils/api';
import { toast } from 'sonner';
import { FileText, Trash2, Upload, Calendar as CalendarIcon, Download, Plus } from 'lucide-react';
import { format } from 'date-fns';

const DOCUMENT_TYPES = [
  { value: 'water-test', label: 'Water Test Result' },
  { value: 'building-tax', label: 'Building Tax' },
  { value: 'land-tax', label: 'Land Tax' },
  { value: 'electricity-bill', label: 'Electricity Bill' },
  { value: 'staff-payment', label: 'Staff Payment Records' },
  { value: 'other', label: 'Other Documents' }
];

export const AdminDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const [typeFilter, setTypeFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [uploadData, setUploadData] = useState({
    documentType: '',
    file: null,
    billDate: null,
    dueDate: null,
    reminderDate: null,
    reminderEnabled: false,
    amount: '',
    notes: ''
  });
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    loadDocuments();
  }, []);

  useEffect(() => {
    filterDocuments();
  }, [typeFilter, documents]);

  const loadDocuments = async () => {
    setIsLoading(true);
    try {
      const response = await getDocuments();
      setDocuments(response.documents);
    } catch (error) {
      toast.error('Failed to load documents');
    } finally {
      setIsLoading(false);
    }
  };

  const filterDocuments = () => {
    if (typeFilter === 'all') {
      setFilteredDocuments(documents);
    } else {
      setFilteredDocuments(documents.filter(d => d.documentType === typeFilter));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Only PDF and image files are allowed');
        return;
      }
      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      setUploadData({ ...uploadData, file });
    }
  };

  const handleUpload = async () => {
    if (!uploadData.file || !uploadData.documentType) {
      toast.error('Please select a file and document type');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', uploadData.file);
      formData.append('documentType', uploadData.documentType);
      
      if (uploadData.billDate) {
        formData.append('billDate', uploadData.billDate.toISOString().split('T')[0]);
      }
      if (uploadData.dueDate) {
        formData.append('dueDate', uploadData.dueDate.toISOString().split('T')[0]);
      }
      if (uploadData.reminderDate) {
        formData.append('reminderDate', uploadData.reminderDate.toISOString().split('T')[0]);
      }
      formData.append('reminderEnabled', uploadData.reminderEnabled);
      if (uploadData.amount) {
        formData.append('amount', uploadData.amount);
      }
      if (uploadData.notes) {
        formData.append('notes', uploadData.notes);
      }

      await uploadDocument(formData);
      toast.success('Document uploaded successfully');
      setIsUploadDialogOpen(false);
      resetUploadForm();
      loadDocuments();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to upload document');
    } finally {
      setIsUploading(false);
    }
  };

  const resetUploadForm = () => {
    setUploadData({
      documentType: '',
      file: null,
      billDate: null,
      dueDate: null,
      reminderDate: null,
      reminderEnabled: false,
      amount: '',
      notes: ''
    });
  };

  const handleDelete = async (documentId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;

    try {
      await deleteDocument(documentId);
      toast.success('Document deleted successfully');
      loadDocuments();
    } catch (error) {
      toast.error('Failed to delete document');
    }
  };

  const handleDownload = (fileUrl, fileName) => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    window.open(`${backendUrl}${fileUrl}`, '_blank');
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <AdminDashboard currentPage="documents">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Document Management</h2>
          <div className="flex gap-2">
            <Button onClick={loadDocuments} variant="outline">Refresh</Button>
            <Button onClick={() => setIsUploadDialogOpen(true)} className="bg-[#D4AF37] text-black hover:bg-[#C19B2E]">
              <Plus className="w-4 h-4 mr-2" />
              Upload Document
            </Button>
          </div>
        </div>

        {/* Filter */}
        <div className="bg-white p-4 rounded-lg shadow">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full md:w-64">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Documents</SelectItem>
              {DOCUMENT_TYPES.map(type => (
                <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Documents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            <div className="col-span-full p-8 text-center">Loading documents...</div>
          ) : filteredDocuments.length === 0 ? (
            <div className="col-span-full p-8 text-center text-gray-500">No documents found</div>
          ) : (
            filteredDocuments.map((doc) => (
              <div key={doc.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-8 h-8 text-[#D4AF37]" />
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {DOCUMENT_TYPES.find(t => t.value === doc.documentType)?.label || doc.documentType}
                      </h3>
                      <p className="text-xs text-gray-500">{formatFileSize(doc.fileSize)}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">File:</span>
                    <span className="text-gray-900 truncate ml-2 max-w-[150px]" title={doc.fileName}>{doc.fileName}</span>
                  </div>
                  {doc.billDate && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Bill Date:</span>
                      <span className="text-gray-900">{format(new Date(doc.billDate), 'MMM dd, yyyy')}</span>
                    </div>
                  )}
                  {doc.dueDate && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Due Date:</span>
                      <span className="text-gray-900">{format(new Date(doc.dueDate), 'MMM dd, yyyy')}</span>
                    </div>
                  )}
                  {doc.amount && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Amount:</span>
                      <span className="text-gray-900 font-medium">Rs. {doc.amount.toLocaleString()}</span>
                    </div>
                  )}
                  {doc.reminderEnabled && doc.reminderDate && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Reminder:</span>
                      <span className="text-orange-600 text-xs flex items-center">
                        <CalendarIcon className="w-3 h-3 mr-1" />
                        {format(new Date(doc.reminderDate), 'MMM dd')}
                      </span>
                    </div>
                  )}
                </div>

                {doc.notes && (
                  <p className="text-xs text-gray-600 border-t pt-2">{doc.notes}</p>
                )}

                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={() => handleDownload(doc.fileUrl, doc.fileName)}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </Button>
                  <Button
                    onClick={() => handleDelete(doc.id)}
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Upload Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogDescription>
              Upload a new document with optional bill cycle reminders
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Document Type *</Label>
              <Select value={uploadData.documentType} onValueChange={(value) => setUploadData({ ...uploadData, documentType: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  {DOCUMENT_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>File * (PDF or Image, max 10MB)</Label>
              <Input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
              />
              {uploadData.file && (
                <p className="text-sm text-gray-600">Selected: {uploadData.file.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Bill Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {uploadData.billDate ? format(uploadData.billDate, 'PPP') : 'Select date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={uploadData.billDate}
                    onSelect={(date) => setUploadData({ ...uploadData, billDate: date })}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {uploadData.dueDate ? format(uploadData.dueDate, 'PPP') : 'Select date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={uploadData.dueDate}
                    onSelect={(date) => setUploadData({ ...uploadData, dueDate: date })}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Reminder Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {uploadData.reminderDate ? format(uploadData.reminderDate, 'PPP') : 'Select date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={uploadData.reminderDate}
                    onSelect={(date) => setUploadData({ ...uploadData, reminderDate: date })}
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={uploadData.reminderEnabled}
                onCheckedChange={(checked) => setUploadData({ ...uploadData, reminderEnabled: checked })}
              />
              <Label>Enable Reminder</Label>
            </div>

            <div className="space-y-2">
              <Label>Amount (Rs.)</Label>
              <Input
                type="number"
                placeholder="Enter amount"
                value={uploadData.amount}
                onChange={(e) => setUploadData({ ...uploadData, amount: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={uploadData.notes}
                onChange={(e) => setUploadData({ ...uploadData, notes: e.target.value })}
                placeholder="Add any notes..."
                rows={3}
              />
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setIsUploadDialogOpen(false);
                  resetUploadForm();
                }}
                className="flex-1"
                disabled={isUploading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpload}
                className="flex-1 bg-[#D4AF37] text-black hover:bg-[#C19B2E]"
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin mr-2"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AdminDashboard>
  );
};