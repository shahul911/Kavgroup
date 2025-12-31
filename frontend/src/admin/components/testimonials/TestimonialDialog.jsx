import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { Switch } from '../../../components/ui/switch';
import { StarRating } from './StarRating';
import { toast } from 'sonner';

export const TestimonialDialog = ({
  isOpen,
  onClose,
  editingTestimonial,
  formData,
  setFormData,
  onSave
}) => {
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.event.trim() || !formData.text.trim()) {
      toast.error('Name, event type, and testimonial text are required');
      return;
    }

    await onSave();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{editingTestimonial ? 'Edit Testimonial' : 'Add New Testimonial'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Client Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Rajesh Kumar"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="event">Event Type *</Label>
              <Input
                id="event"
                value={formData.event}
                onChange={(e) => setFormData({ ...formData, event: e.target.value })}
                placeholder="e.g., Wedding Reception"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Rating *</Label>
              <div className="py-2">
                <StarRating
                  rating={formData.rating}
                  interactive={true}
                  onChange={(rating) => setFormData({ ...formData, rating })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                placeholder="e.g., December 2024"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="text">Testimonial Text *</Label>
            <Textarea
              id="text"
              value={formData.text}
              onChange={(e) => setFormData({ ...formData, text: e.target.value })}
              placeholder="Enter the client's testimonial..."
              rows={4}
              required
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
            />
            <Label className="text-sm text-gray-600">
              {formData.isActive ? 'Visible on website' : 'Hidden from website'}
            </Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-[#D4AF37] hover:bg-[#B8960C] text-black">
              {editingTestimonial ? 'Save Changes' : 'Add Testimonial'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
