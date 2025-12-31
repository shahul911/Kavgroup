import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../../components/ui/dialog';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Textarea } from '../../../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { Calendar } from 'lucide-react';
import { timeOptions } from '../../../constants/reminderConstants';

export const ConvertToBookingDialog = ({
  isOpen,
  onClose,
  enquiry,
  convertData,
  setConvertData,
  onConvert
}) => {
  const balanceDue = (parseFloat(convertData.amount) || 0) - (parseFloat(convertData.advancePaid) || 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Convert to Booking: {enquiry?.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {/* Customer Info */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm"><span className="font-medium">Customer:</span> {enquiry?.name}</p>
            <p className="text-sm"><span className="font-medium">Phone:</span> {enquiry?.phone}</p>
            <p className="text-sm"><span className="font-medium">Event Type:</span> {enquiry?.eventType}</p>
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
                  {timeOptions.from.map(time => (
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
                  {timeOptions.to.map(time => (
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
                Balance Due: Rs. {balanceDue.toLocaleString()}
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
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={onConvert} className="bg-green-600 text-white hover:bg-green-700">
            <Calendar className="w-4 h-4 mr-2" />
            Convert to Booking
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
