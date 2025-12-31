import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import {
  getAdminTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial
} from '../../utils/api';

export const useTestimonials = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTestimonials = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAdminTestimonials();
      setTestimonials(data.testimonials || []);
    } catch (error) {
      toast.error('Failed to load testimonials');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTestimonials();
  }, [fetchTestimonials]);

  const handleCreate = async (formData, onSuccess) => {
    try {
      await createTestimonial(formData);
      toast.success('Testimonial added successfully');
      fetchTestimonials();
      if (onSuccess) onSuccess();
      return true;
    } catch (error) {
      toast.error('Failed to save testimonial');
      return false;
    }
  };

  const handleUpdate = async (testimonialId, formData, onSuccess) => {
    try {
      await updateTestimonial(testimonialId, formData);
      toast.success('Testimonial updated successfully');
      fetchTestimonials();
      if (onSuccess) onSuccess();
      return true;
    } catch (error) {
      toast.error('Failed to save testimonial');
      return false;
    }
  };

  const handleDelete = async (testimonialId) => {
    if (!window.confirm('Are you sure you want to delete this testimonial?')) return false;

    try {
      await deleteTestimonial(testimonialId);
      toast.success('Testimonial deleted successfully');
      fetchTestimonials();
      return true;
    } catch (error) {
      toast.error('Failed to delete testimonial');
      return false;
    }
  };

  const handleToggleActive = async (testimonial) => {
    try {
      await updateTestimonial(testimonial.id, { isActive: !testimonial.isActive });
      toast.success(testimonial.isActive ? 'Testimonial hidden' : 'Testimonial visible');
      fetchTestimonials();
      return true;
    } catch (error) {
      toast.error('Failed to update testimonial');
      return false;
    }
  };

  return {
    testimonials,
    loading,
    fetchTestimonials,
    handleCreate,
    handleUpdate,
    handleDelete,
    handleToggleActive
  };
};
