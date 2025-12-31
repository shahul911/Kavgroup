import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../../components/ui/dialog';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';

export const UploadBillDialog = ({
  isOpen,
  onClose,
  uploadData,
  setUploadData,
  onUpload,
  categories
}) => {
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
