import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { Calendar } from '../components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { eventTypes } from '../mock';

export const CreateBookingDialog = ({ isOpen, onClose, createData, setCreateData, handleCreate }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Booking</DialogTitle>
          <DialogDescription>Create a confirmed booking directly</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="space-y-2">
            <Label>Customer Name *</Label>
            <Input
              value={createData.name}
              onChange={(e) => setCreateData({ ...createData, name: e.target.value })}
              placeholder="Enter customer name"
            />
          </div>
          <div className="space-y-2">
            <Label>Phone Number *</Label>
            <Input
              value={createData.phone}
              onChange={(e) => setCreateData({ ...createData, phone: e.target.value })}
              placeholder="Enter phone number"
            />
          </div>
          <div className="space-y-2">
            <Label>Event Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {createData.eventDate ? format(createData.eventDate, 'PPP') : 'Select date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={createData.eventDate}
                  onSelect={(date) => setCreateData({ ...createData, eventDate: date })}
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-2">
            <Label>Event Type *</Label>
            <Select value={createData.eventType} onValueChange={(value) => setCreateData({ ...createData, eventType: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select event type" />
              </SelectTrigger>
              <SelectContent>
                {eventTypes.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Time From</Label>
            <Input
              type="time"
              value={createData.eventTimeFrom}
              onChange={(e) => setCreateData({ ...createData, eventTimeFrom: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Time To</Label>
            <Input
              type="time"
              value={createData.eventTimeTo}
              onChange={(e) => setCreateData({ ...createData, eventTimeTo: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Total Amount (Rs.) *</Label>
            <Input
              type="number"
              value={createData.amount}
              onChange={(e) => {
                const amount = e.target.value;
                const advance = createData.advancePaid || 0;
                setCreateData({
                  ...createData,
                  amount: amount,
                  balanceDue: (parseFloat(amount) - parseFloat(advance)).toString()
                });
              }}
            />
          </div>
          <div className="space-y-2">
            <Label>Advance Paid (Rs.)</Label>
            <Input
              type="number"
              value={createData.advancePaid}
              onChange={(e) => {
                const advance = e.target.value;
                const amount = createData.amount || 0;
                setCreateData({
                  ...createData,
                  advancePaid: advance,
                  balanceDue: (parseFloat(amount) - parseFloat(advance)).toString()
                });
              }}
            />
          </div>
          <div className="col-span-2 space-y-2">
            <Label>Balance Due (Rs.)</Label>
            <Input
              type="number"
              value={createData.balanceDue}
              disabled
              className="bg-gray-100"
            />
          </div>
          <div className="col-span-2 space-y-2">
            <Label>Notes</Label>
            <Textarea
              value={createData.notes}
              onChange={(e) => setCreateData({ ...createData, notes: e.target.value })}
              rows={3}
            />
          </div>
        </div>
        <div className="flex gap-3 mt-4">
          <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
          <Button onClick={handleCreate} className="flex-1 bg-[#D4AF37] text-black hover:bg-[#C19B2E]">
            Create Booking
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export const EditBookingDialog = ({ isOpen, onClose, booking, editData, setEditData, handleUpdate }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Booking</DialogTitle>
          <DialogDescription>Update booking details (Admin only)</DialogDescription>
        </DialogHeader>
        {booking && (
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="col-span-2 p-3 bg-gray-50 rounded">
              <p className="text-sm"><b>Customer:</b> {booking.name}</p>
              <p className="text-sm"><b>Phone:</b> {booking.phone}</p>
              <p className="text-sm"><b>Invoice:</b> {booking.invoiceNumber}</p>
            </div>
            <div className="space-y-2">
              <Label>Event Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {editData.eventDate ? format(editData.eventDate, 'PPP') : 'Select date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={editData.eventDate}
                    onSelect={(date) => setEditData({ ...editData, eventDate: date })}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={editData.status} onValueChange={(value) => setEditData({ ...editData, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Time From</Label>
              <Input
                type="time"
                value={editData.eventTimeFrom}
                onChange={(e) => setEditData({ ...editData, eventTimeFrom: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Time To</Label>
              <Input
                type="time"
                value={editData.eventTimeTo}
                onChange={(e) => setEditData({ ...editData, eventTimeTo: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Total Amount (Rs.)</Label>
              <Input
                type="number"
                value={editData.amount}
                onChange={(e) => {
                  const amount = e.target.value;
                  const advance = editData.advancePaid || 0;
                  setEditData({
                    ...editData,
                    amount: amount,
                    balanceDue: (parseFloat(amount) - parseFloat(advance)).toString()
                  });
                }}
              />
            </div>
            <div className="space-y-2">
              <Label>Advance Paid (Rs.)</Label>
              <Input
                type="number"
                value={editData.advancePaid}
                onChange={(e) => {
                  const advance = e.target.value;
                  const amount = editData.amount || 0;
                  setEditData({
                    ...editData,
                    advancePaid: advance,
                    balanceDue: (parseFloat(amount) - parseFloat(advance)).toString()
                  });
                }}
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label>Balance Due (Rs.)</Label>
              <Input
                type="number"
                value={editData.balanceDue}
                disabled
                className="bg-gray-100"
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={editData.notes}
                onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                rows={3}
              />
            </div>
          </div>
        )}
        <div className="flex gap-3 mt-4">
          <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
          <Button onClick={handleUpdate} className="flex-1 bg-[#D4AF37] text-black hover:bg-[#C19B2E]">
            Update Booking
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
