import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../../components/ui/dialog';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Textarea } from '../../../../components/ui/textarea';
import { Plus } from 'lucide-react';
import { categoryNames } from '../../../constants/reminderConstants';

export const DocumentEditDialog = ({
  isOpen,
  onClose,
  doc,
  editData,
  setEditData,
  uploadData,
  setUploadData,
  onUpdateReminder,
  onUploadNew
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {categoryNames[doc?.documentType] || doc?.documentType}
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
                  value={editData.reminderDate}
                  onChange={(e) => setEditData({ ...editData, reminderDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Due Date</Label>
                <Input
                  type="date"
                  value={editData.dueDate}
                  onChange={(e) => setEditData({ ...editData, dueDate: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Amount (Rs.)</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={editData.amount}
                  onChange={(e) => setEditData({ ...editData, amount: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                placeholder="Add notes..."
                value={editData.notes}
                onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                rows={2}
              />
            </div>
            <Button onClick={onUpdateReminder} className="w-full bg-[#D4AF37] text-black hover:bg-[#C19B2E]">
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
              onClick={onUploadNew}
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
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
