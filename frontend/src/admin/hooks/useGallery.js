import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import {
  getAdminGallery,
  uploadGalleryImage,
  createGalleryImage,
  updateGalleryImage,
  deleteGalleryImage
} from '../../utils/api';

export const useGallery = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  const fetchGallery = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAdminGallery();
      setImages(data.images || []);
    } catch (error) {
      toast.error('Failed to load gallery');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGallery();
  }, [fetchGallery]);

  const handleUploadFile = async (selectedFile, formData, onSuccess) => {
    if (!selectedFile) {
      toast.error('Please select an image file');
      return false;
    }

    setIsUploading(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', selectedFile);
      uploadFormData.append('title', formData.title);
      uploadFormData.append('description', formData.description || '');
      uploadFormData.append('order', formData.order);

      await uploadGalleryImage(uploadFormData);
      toast.success('Image uploaded successfully');
      fetchGallery();
      if (onSuccess) onSuccess();
      return true;
    } catch (error) {
      toast.error('Failed to upload image');
      return false;
    } finally {
      setIsUploading(false);
    }
  };

  const handleCreateFromUrl = async (formData, onSuccess) => {
    if (!formData.imageUrl.trim()) {
      toast.error('Image URL is required');
      return false;
    }

    try {
      await createGalleryImage(formData);
      toast.success('Image added successfully');
      fetchGallery();
      if (onSuccess) onSuccess();
      return true;
    } catch (error) {
      toast.error('Failed to add image');
      return false;
    }
  };

  const handleUpdate = async (imageId, formData, onSuccess) => {
    try {
      await updateGalleryImage(imageId, formData);
      toast.success('Image updated successfully');
      fetchGallery();
      if (onSuccess) onSuccess();
      return true;
    } catch (error) {
      toast.error('Failed to update image');
      return false;
    }
  };

  const handleDelete = async (imageId) => {
    if (!window.confirm('Are you sure you want to delete this image?')) return false;

    try {
      await deleteGalleryImage(imageId);
      toast.success('Image deleted successfully');
      fetchGallery();
      return true;
    } catch (error) {
      toast.error('Failed to delete image');
      return false;
    }
  };

  const handleToggleActive = async (image) => {
    try {
      await updateGalleryImage(image.id, { isActive: !image.isActive });
      toast.success(image.isActive ? 'Image hidden' : 'Image visible');
      fetchGallery();
      return true;
    } catch (error) {
      toast.error('Failed to update image');
      return false;
    }
  };

  const getFullImageUrl = (url) => {
    if (url.startsWith('http')) return url;
    return `${process.env.REACT_APP_BACKEND_URL}${url}`;
  };

  return {
    images,
    loading,
    isUploading,
    fetchGallery,
    handleUploadFile,
    handleCreateFromUrl,
    handleUpdate,
    handleDelete,
    handleToggleActive,
    getFullImageUrl
  };
};
