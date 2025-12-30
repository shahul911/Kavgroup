import React, { useState, useEffect } from 'react';
import { AdminDashboard } from './AdminDashboard';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Switch } from '../components/ui/switch';
import { Plus, Pencil, Trash2, Star, Quote, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { getAdminTestimonials, createTestimonial, updateTestimonial, deleteTestimonial } from '../utils/api';

export const AdminTestimonials = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    event: '',
    rating: 5,
    text: '',
    date: '',
    isActive: true
  });

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const data = await getAdminTestimonials();
      setTestimonials(data.testimonials || []);
    } catch (error) {
      toast.error('Failed to load testimonials');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (testimonial = null) => {
    if (testimonial) {
      setEditingTestimonial(testimonial);
      setFormData({
        name: testimonial.name,
        event: testimonial.event,
        rating: testimonial.rating,
        text: testimonial.text,
        date: testimonial.date || '',
        isActive: testimonial.isActive
      });
    } else {
      setEditingTestimonial(null);
      const currentDate = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      setFormData({
        name: '',
        event: '',
        rating: 5,
        text: '',
        date: currentDate,
        isActive: true
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingTestimonial(null);
    setFormData({
      name: '',
      event: '',
      rating: 5,
      text: '',
      date: '',
      isActive: true
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.event.trim() || !formData.text.trim()) {
      toast.error('Name, event type, and testimonial text are required');
      return;
    }

    try {
      if (editingTestimonial) {
        await updateTestimonial(editingTestimonial.id, formData);
        toast.success('Testimonial updated successfully');
      } else {
        await createTestimonial(formData);
        toast.success('Testimonial added successfully');
      }
      handleCloseDialog();
      fetchTestimonials();
    } catch (error) {
      toast.error('Failed to save testimonial');
    }
  };

  const handleDelete = async (testimonialId) => {
    if (!window.confirm('Are you sure you want to delete this testimonial?')) return;
    
    try {
      await deleteTestimonial(testimonialId);
      toast.success('Testimonial deleted successfully');
      fetchTestimonials();
    } catch (error) {
      toast.error('Failed to delete testimonial');
    }
  };

  const handleToggleActive = async (testimonial) => {
    try {
      await updateTestimonial(testimonial.id, { isActive: !testimonial.isActive });
      toast.success(testimonial.isActive ? 'Testimonial hidden' : 'Testimonial visible');
      fetchTestimonials();
    } catch (error) {
      toast.error('Failed to update testimonial');
    }
  };

  const renderStars = (rating, interactive = false, onChange = null) => {
    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }, (_, index) => (
          <Star
            key={index}
            className={`w-5 h-5 ${interactive ? 'cursor-pointer' : ''} ${
              index < rating ? 'fill-[#D4AF37] text-[#D4AF37]' : 'fill-gray-200 text-gray-200'
            }`}
            onClick={interactive ? () => onChange(index + 1) : undefined}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <AdminDashboard currentPage="testimonials">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D4AF37]"></div>
        </div>
      </AdminDashboard>
    );
  }

  return (
    <AdminDashboard currentPage="testimonials">
      <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Testimonials Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage client testimonials displayed on the website</p>
        </div>
        <Button 
          onClick={() => handleOpenDialog()}
          className="bg-[#D4AF37] hover:bg-[#B8960C] text-black w-full sm:w-auto"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Testimonial
        </Button>
      </div>

      {/* Testimonials Grid */}
      {testimonials.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8 sm:py-12">
            <Quote className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mb-4" />
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No testimonials yet</h3>
            <p className="text-sm text-gray-500 mb-4 text-center">Add your first client testimonial to get started</p>
            <Button 
              onClick={() => handleOpenDialog()}
              className="bg-[#D4AF37] hover:bg-[#B8960C] text-black"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add First Testimonial
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className={`relative ${!testimonial.isActive ? 'opacity-60 bg-gray-50' : ''}`}>
              <CardContent className="p-6">
                {/* Status Badge */}
                {!testimonial.isActive && (
                  <div className="absolute top-2 left-2 bg-gray-500 text-white text-xs px-2 py-1 rounded">
                    Hidden
                  </div>
                )}
                
                {/* Quote Icon */}
                <div className="absolute top-4 right-4 text-[#D4AF37] opacity-20">
                  <Quote className="w-10 h-10" />
                </div>
                
                {/* Rating */}
                <div className="mb-3">
                  {renderStars(testimonial.rating)}
                </div>
                
                {/* Testimonial Text */}
                <p className="text-gray-700 italic mb-4 line-clamp-4">
                  "{testimonial.text}"
                </p>
                
                {/* Client Info */}
                <div className="border-t pt-3 flex items-end justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-[#D4AF37] font-medium">{testimonial.event}</p>
                    {testimonial.date && (
                      <p className="text-xs text-gray-500 mt-1">{testimonial.date}</p>
                    )}
                  </div>
                  
                  {/* Actions */}
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0"
                      onClick={() => handleToggleActive(testimonial)}
                      title={testimonial.isActive ? 'Hide' : 'Show'}
                    >
                      {testimonial.isActive ? 
                        <Eye className="w-4 h-4 text-gray-500" /> : 
                        <EyeOff className="w-4 h-4 text-gray-500" />
                      }
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      onClick={() => handleOpenDialog(testimonial)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDelete(testimonial.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
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
                  {renderStars(formData.rating, true, (rating) => setFormData({ ...formData, rating }))}
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
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button type="submit" className="bg-[#D4AF37] hover:bg-[#B8960C] text-black">
                {editingTestimonial ? 'Save Changes' : 'Add Testimonial'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      </div>
    </AdminDashboard>
  );
};
