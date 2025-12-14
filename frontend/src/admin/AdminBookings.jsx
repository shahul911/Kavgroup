import React, { useState, useEffect } from 'react';
import { AdminDashboard } from './AdminDashboard';
import { CreateBookingDialog, EditBookingDialog } from './BookingDialogs';
import { BookingCalendarView } from './BookingCalendarView';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { getBookings, updateBooking, deleteBooking, generateReceipt, createBookingDirect } from '../utils/api';
import { toast } from 'sonner';
import { Phone, Calendar as CalendarIcon, Trash2, Edit, Search, FileText, Plus, List, CalendarDays } from 'lucide-react';
import { Calendar } from '../components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { format } from 'date-fns';

export const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editData, setEditData] = useState({
    status: '',
    notes: '',
    eventDate: null,
    eventTimeFrom: '',
    eventTimeTo: '',
    amount: '',
    advancePaid: '',
    balanceDue: ''
  });
  const [createData, setCreateData] = useState({
    name: '',
    phone: '',
    eventDate: null,
    eventType: '',
    eventTimeFrom: '07:00 AM',
    eventTimeTo: '08:00 PM',
    amount: '',
    advancePaid: '',
    balanceDue: '',
    notes: ''
  });

  const adminRole = localStorage.getItem('adminRole');

  useEffect(() => {
    loadBookings();
  }, []);

  useEffect(() => {
    filterBookings();
  }, [searchTerm, statusFilter, bookings]);

  const loadBookings = async () => {
    setIsLoading(true);
    try {
      const response = await getBookings();
      setBookings(response.bookings);
    } catch (error) {
      toast.error('Failed to load bookings');
    } finally {
      setIsLoading(false);
    }
  };

  const filterBookings = () => {
    let filtered = [...bookings];

    if (statusFilter !== 'all') {
      filtered = filtered.filter(b => b.status === statusFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(b => 
        b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.phone.includes(searchTerm) ||
        b.eventType.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredBookings(filtered);
  };

  const handleEdit = (booking) => {
    setSelectedBooking(booking);
    setEditData({
      status: booking.status,
      notes: booking.notes || '',
      eventDate: booking.eventDate ? new Date(booking.eventDate) : null,
      eventTimeFrom: booking.eventTimeFrom || '07:00 AM',
      eventTimeTo: booking.eventTimeTo || '08:00 PM',
      amount: booking.amount || '',
      advancePaid: booking.advancePaid || '',
      balanceDue: booking.balanceDue || ''
    });
    setIsEditDialogOpen(true);
  };

  const handleCreate = async () => {
    if (!createData.name || !createData.phone || !createData.eventDate || !createData.eventType || !createData.amount) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      const balanceDue = parseFloat(createData.amount) - parseFloat(createData.advancePaid || 0);
      const bookingData = {
        ...createData,
        eventDate: createData.eventDate.toISOString().split('T')[0],
        amount: parseFloat(createData.amount),
        advancePaid: parseFloat(createData.advancePaid || 0),
        balanceDue: balanceDue,
        status: 'confirmed'
      };

      await createBookingDirect(bookingData);
      toast.success('Booking created successfully!');
      setIsCreateDialogOpen(false);
      setCreateData({
        name: '',
        phone: '',
        eventDate: null,
        eventType: '',
        eventTimeFrom: '07:00 AM',
        eventTimeTo: '08:00 PM',
        amount: '',
        advancePaid: '',
        balanceDue: '',
        notes: ''
      });
      loadBookings();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create booking');
    }
  };

  const handleUpdate = async () => {
    try {
      const updatePayload = {
        status: editData.status,
        notes: editData.notes
      };

      // Include date and payment fields if changed
      if (editData.eventDate) {
        updatePayload.eventDate = editData.eventDate.toISOString().split('T')[0];
      }
      if (editData.eventTimeFrom) updatePayload.eventTimeFrom = editData.eventTimeFrom;
      if (editData.eventTimeTo) updatePayload.eventTimeTo = editData.eventTimeTo;
      if (editData.amount) updatePayload.amount = parseFloat(editData.amount);
      if (editData.advancePaid) updatePayload.advancePaid = parseFloat(editData.advancePaid);

      await updateBooking(selectedBooking.id, updatePayload);
      toast.success('Booking updated successfully');
      setIsEditDialogOpen(false);
      loadBookings();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to update booking');
    }
  };

  const handleDelete = async (bookingId) => {
    if (!window.confirm('Are you sure you want to delete this booking?')) return;

    try {
      await deleteBooking(bookingId);
      toast.success('Booking deleted successfully');
      loadBookings();
    } catch (error) {
      toast.error('Failed to delete booking');
    }
  };

  const handleCall = (phone) => {
    window.location.href = `tel:${phone}`;
  };

  const handleGenerateReceipt = async (booking) => {
    try {
      toast.info('Generating receipt...');
      const response = await generateReceipt(booking.id);
      const backendUrl = process.env.REACT_APP_BACKEND_URL;
      window.open(`${backendUrl}${response.receiptUrl}`, '_blank');
      toast.success('Receipt generated successfully!');
    } catch (error) {
      toast.error('Failed to generate receipt');
    }
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
    <AdminDashboard currentPage="bookings">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Bookings Management</h2>
          <div className="flex gap-2">
            {/* View Toggle */}
            <div className="flex border rounded-lg">
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className={viewMode === 'list' ? 'bg-[#D4AF37] text-black hover:bg-[#C19B2E]' : ''}
              >
                <List className="w-4 h-4 mr-2" />
                List
              </Button>
              <Button
                variant={viewMode === 'calendar' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('calendar')}
                className={viewMode === 'calendar' ? 'bg-[#D4AF37] text-black hover:bg-[#C19B2E]' : ''}
              >
                <CalendarDays className="w-4 h-4 mr-2" />
                Calendar
              </Button>
            </div>
            <Button onClick={loadBookings} variant="outline">Refresh</Button>
            <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-[#D4AF37] text-black hover:bg-[#C19B2E]">
              <CalendarIcon className="w-4 h-4 mr-2" />
              Create Booking
            </Button>
          </div>
        </div>

        {/* Filters - Only show in list view */}
        {viewMode === 'list' && (
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
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        )}

        {/* Calendar View */}
        {viewMode === 'calendar' && (
          <BookingCalendarView 
            bookings={bookings} 
            onDateClick={(booking) => handleEdit(booking)}
          />
        )}

        {/* List View */}
        {viewMode === 'list' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center">Loading bookings...</div>
          ) : filteredBookings.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No bookings found</div>
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredBookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{booking.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleCall(booking.phone)}
                          className="flex items-center text-blue-600 hover:text-blue-800"
                        >
                          <Phone className="w-4 h-4 mr-1" />
                          {booking.phone}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-gray-900">
                          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                          {format(new Date(booking.eventDate), 'MMM dd, yyyy')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900">{booking.eventType}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          {booking.status === 'confirmed' && (
                            <Button
                              onClick={() => handleGenerateReceipt(booking)}
                              size="sm"
                              className="bg-[#D4AF37] text-black hover:bg-[#C19B2E]"
                              title="Generate Receipt"
                            >
                              <FileText className="w-4 h-4" />
                            </Button>
                          )}
                          {adminRole === 'admin' && (
                            <>
                              <Button
                                onClick={() => handleEdit(booking)}
                                variant="outline"
                                size="sm"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                onClick={() => handleDelete(booking.id)}
                                variant="outline"
                                size="sm"
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </>
                          )}
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

      <CreateBookingDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        createData={createData}
        setCreateData={setCreateData}
        handleCreate={handleCreate}
      />

      <EditBookingDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        booking={selectedBooking}
        editData={editData}
        setEditData={setEditData}
        handleUpdate={handleUpdate}
      />
    </AdminDashboard>
  );
};
