import React, { useState } from 'react';
import { AdminDashboard } from './AdminDashboard';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Plus, Quote } from 'lucide-react';

// Custom Hook
import { useTestimonials } from './hooks/useTestimonials';

// Components
import { TestimonialCard, TestimonialDialog } from './components/testimonials';

export const AdminTestimonials = () => {
  const {
    testimonials,
    loading,
    handleCreate,
    handleUpdate,
    handleDelete,
    handleToggleActive
  } = useTestimonials();

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

  const handleSave = async () => {
    if (editingTestimonial) {
      await handleUpdate(editingTestimonial.id, formData, handleCloseDialog);
    } else {
      await handleCreate(formData, handleCloseDialog);
    }
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
              <TestimonialCard
                key={testimonial.id}
                testimonial={testimonial}
                onEdit={handleOpenDialog}
                onDelete={handleDelete}
                onToggleActive={handleToggleActive}
              />
            ))}
          </div>
        )}

        {/* Add/Edit Dialog */}
        <TestimonialDialog
          isOpen={dialogOpen}
          onClose={handleCloseDialog}
          editingTestimonial={editingTestimonial}
          formData={formData}
          setFormData={setFormData}
          onSave={handleSave}
        />
      </div>
    </AdminDashboard>
  );
};
