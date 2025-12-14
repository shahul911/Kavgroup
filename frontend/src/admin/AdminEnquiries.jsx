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
import { getEnquiries, updateEnquiry, deleteEnquiry, convertEnquiryToBooking } from '../utils/api';
import { toast } from 'sonner';
import { Phone, Calendar as CalendarIcon, Trash2, Edit, Search, Bell } from 'lucide-react';
import { format } from 'date-fns';

export const AdminEnquiries = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [filteredEnquiries, setFilteredEnquiries] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isConvertDialogOpen, setIsConvertDialogOpen] = useState(false);
  const [editData, setEditData] = useState({
    status: '',
    notes: '',
    followUpDate: null,
    followUpReminder: false
  });
  const [bookingData, setBookingData] = useState({
    amount: '',
    advancePaid: '',
    balanceDue: '',
    eventTimeFrom: '07:00 AM',
    eventTimeTo: '08:00 PM',
    notes: ''
  });

  useEffect(() => {
    loadEnquiries();
  }, []);

  useEffect(() => {
    filterEnquiries();
  }, [searchTerm, statusFilter, enquiries]);

  const loadEnquiries = async () => {
    setIsLoading(true);
    try {
      const response = await getEnquiries();
      setEnquiries(response.enquiries);
    } catch (error) {
      toast.error('Failed to load enquiries');
    } finally {
      setIsLoading(false);
    }
  };

  const filterEnquiries = () => {
    let filtered = [...enquiries];

    if (statusFilter !== 'all') {
      filtered = filtered.filter(e => e.status === statusFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(e => 
        e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.phone.includes(searchTerm) ||
        e.eventType.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredEnquiries(filtered);
  };

  const handleEdit = (enquiry) => {
    setSelectedEnquiry(enquiry);
    setEditData({
      status: enquiry.status,
      notes: enquiry.notes || '',
      followUpDate: enquiry.followUpDate ? new Date(enquiry.followUpDate) : null,
      followUpReminder: enquiry.followUpReminder || false
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    try {
      const updatePayload = {
        status: editData.status,
        notes: editData.notes,
        followUpReminder: editData.followUpReminder
      };
      
      if (editData.followUpDate) {
        updatePayload.followUpDate = editData.followUpDate.toISOString().split('T')[0];
      }

      await updateEnquiry(selectedEnquiry.id, updatePayload);
      toast.success('Enquiry updated successfully');
      setIsEditDialogOpen(false);
      loadEnquiries();
    } catch (error) {
      toast.error('Failed to update enquiry');
    }
  };

  const handleDelete = async (enquiryId) => {
    if (!window.confirm('Are you sure you want to delete this enquiry?')) return;

    try {
      await deleteEnquiry(enquiryId);
      toast.success('Enquiry deleted successfully');
      loadEnquiries();
    } catch (error) {
      toast.error('Failed to delete enquiry');
    }
  };

  const handleCall = (phone) => {
    window.location.href = `tel:${phone}`;
  };

  const handleConvertToBooking = (enquiry) => {
    setSelectedEnquiry(enquiry);
    setBookingData({
      amount: '',
      advancePaid: '',
      balanceDue: '',
      eventTimeFrom: '07:00 AM',
      eventTimeTo: '08:00 PM',
      notes: ''
    });
    setIsConvertDialogOpen(true);
  };

  const handleConvert = async () => {
    if (!bookingData.amount || !bookingData.advancePaid) {
      toast.error('Please fill amount and advance paid');
      return;
    }

    try {
      const balanceDue = parseFloat(bookingData.amount) - parseFloat(bookingData.advancePaid);
      const convertData = {
        ...bookingData,
        amount: parseFloat(bookingData.amount),
        advancePaid: parseFloat(bookingData.advancePaid),
        balanceDue: balanceDue
      };

      await convertEnquiryToBooking(selectedEnquiry.id, convertData);
      toast.success('Enquiry converted to booking successfully!');
      setIsConvertDialogOpen(false);
      loadEnquiries();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to convert enquiry');
    }
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
    <AdminDashboard currentPage="enquiries">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Enquiries Management</h2>
          <Button onClick={loadEnquiries} variant="outline">Refresh</Button>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow space-y-4 md:space-y-0 md:flex md:items-center md:gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name, phone, or event type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="contacted">Contacted</SelectItem>
              <SelectItem value="follow-up">Follow-up</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Enquiries List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center">Loading enquiries...</div>
          ) : filteredEnquiries.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No enquiries found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Event Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Event Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Follow-up</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredEnquiries.map((enquiry) => (
                    <tr key={enquiry.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{enquiry.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleCall(enquiry.phone)}
                          className="flex items-center text-blue-600 hover:text-blue-800"
                        >
                          <Phone className="w-4 h-4 mr-1" />
                          {enquiry.phone}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-gray-900">
                          <CalendarIcon className="w-4 h-4 mr-2 text-gray-400" />
                          {format(new Date(enquiry.eventDate), 'MMM dd, yyyy')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900">{enquiry.eventType}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(enquiry.status)}`}>
                          {enquiry.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {enquiry.followUpReminder && enquiry.followUpDate ? (
                          <div className="flex items-center text-orange-600">
                            <Bell className="w-4 h-4 mr-1" />
                            <span className="text-xs">{format(new Date(enquiry.followUpDate), 'MMM dd')}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">None</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          {enquiry.status !== 'closed' && (
                            <Button
                              onClick={() => handleConvertToBooking(enquiry)}
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              Convert
                            </Button>
                          )}
                          <Button
                            onClick={() => handleEdit(enquiry)}
                            variant="outline"
                            size="sm"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => handleDelete(enquiry.id)}
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Enquiry</DialogTitle>
            <DialogDescription>
              Update enquiry status and set follow-up reminders
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={editData.status} onValueChange={(value) => setEditData({ ...editData, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="follow-up">Follow-up</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Follow-up Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {editData.followUpDate ? format(editData.followUpDate, 'PPP') : 'Select date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={editData.followUpDate}
                    onSelect={(date) => setEditData({ ...editData, followUpDate: date })}
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={editData.followUpReminder}
                onCheckedChange={(checked) => setEditData({ ...editData, followUpReminder: checked })}
              />
              <Label>Enable Follow-up Reminder</Label>
            </div>

            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={editData.notes}
                onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                placeholder="Add any notes..."
                rows={4}
              />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleUpdate} className="flex-1 bg-[#D4AF37] text-black hover:bg-[#C19B2E]">
                Update
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AdminDashboard>
  );
};