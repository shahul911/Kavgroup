import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../../components/ui/dialog';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Textarea } from '../../../../components/ui/textarea';

export const EnquiryEditDialog = ({
  isOpen,
  onClose,
  enquiry,
  editData,
  setEditData,
  onSave
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Enquiry: {enquiry?.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {/* Customer Info */}
          <div className="bg-gray-50 p-3 rounded-lg text-sm">
            <p><span className="font-medium">Customer:</span> {enquiry?.name}</p>
            <p><span className="font-medium">Phone:</span> {enquiry?.phone}</p>
            <p><span className="font-medium">Event Type:</span> {enquiry?.eventType}</p>
          </div>

          {/* Event Dates - Customer may change their preferred date */}
          <div className="space-y-2">
            <Label className="text-blue-600 font-medium">Event Date (Customer's Preferred Date)</Label>
            <p className="text-xs text-gray-500">Update if customer changed their preferred event date</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-xs">Start Date</Label>
                <Input
                  type="date"
                  value={editData.eventDate}
                  onChange={(e) => {
                    const newDate = e.target.value;
                    const updatedEndDate = editData.eventEndDate && editData.eventEndDate < newDate
                      ? '' : editData.eventEndDate;
                    setEditData({ ...editData, eventDate: newDate, eventEndDate: updatedEndDate });
                  }}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">End Date</Label>
                <Input
                  type="date"
                  value={editData.eventEndDate}
                  min={editData.eventDate || undefined}
                  onChange={(e) => setEditData({ ...editData, eventEndDate: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Follow-up Date */}
          <div className="space-y-2">
            <Label>Follow-up Date *</Label>
            <Input
              type="date"
              value={editData.followUpDate}
              onChange={(e) => setEditData({ ...editData, followUpDate: e.target.value })}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              placeholder="Add notes about this follow-up..."
              value={editData.notes}
              onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={onSave} className="bg-[#D4AF37] text-black hover:bg-[#C19B2E]">
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
