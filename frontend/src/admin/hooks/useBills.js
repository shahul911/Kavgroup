import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { getBillCategories, getBillsByCategory, uploadDocument } from '../../utils/api';

export const useBills = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryBills, setCategoryBills] = useState([]);
  const [isLoadingBills, setIsLoadingBills] = useState(false);

  const loadCategories = useCallback(async () => {
    try {
      const response = await getBillCategories();
      setCategories(response.categories);
    } catch (error) {
      console.error('Failed to load categories');
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const loadCategoryBills = async (category) => {
    setIsLoadingBills(true);
    try {
      const response = await getBillsByCategory(category.id);
      setCategoryBills(response.documents);
      setSelectedCategory(category);
    } catch (error) {
      toast.error('Failed to load bills');
    } finally {
      setIsLoadingBills(false);
    }
  };

  const clearSelectedCategory = () => {
    setSelectedCategory(null);
    setCategoryBills([]);
  };

  const handleUploadBill = async (uploadData, onSuccess) => {
    if (!uploadData.file || !uploadData.documentType) {
      toast.error('Please select a file and category');
      return false;
    }

    try {
      const formData = new FormData();
      formData.append('file', uploadData.file);
      formData.append('documentType', uploadData.documentType);
      if (uploadData.billDate) formData.append('billDate', uploadData.billDate);
      if (uploadData.dueDate) formData.append('dueDate', uploadData.dueDate);
      if (uploadData.reminderDate) formData.append('reminderDate', uploadData.reminderDate);
      formData.append('reminderEnabled', uploadData.reminderEnabled);
      if (uploadData.amount) formData.append('amount', uploadData.amount);
      if (uploadData.notes) formData.append('notes', uploadData.notes);

      await uploadDocument(formData);
      toast.success('Bill uploaded successfully');
      loadCategories();
      if (selectedCategory) {
        loadCategoryBills(selectedCategory);
      }
      if (onSuccess) onSuccess();
      return true;
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload bill: ' + (error.response?.data?.detail || error.message));
      return false;
    }
  };

  const handleUploadNewForCategory = async (uploadData, documentType, onSuccess) => {
    if (!uploadData.file) {
      toast.error('Please select a file');
      return false;
    }
    try {
      const formData = new FormData();
      formData.append('file', uploadData.file);
      formData.append('documentType', documentType);
      if (uploadData.billDate) formData.append('billDate', uploadData.billDate);
      if (uploadData.dueDate) formData.append('dueDate', uploadData.dueDate);
      if (uploadData.reminderDate) formData.append('reminderDate', uploadData.reminderDate);
      formData.append('reminderEnabled', !!uploadData.reminderDate);
      if (uploadData.amount) formData.append('amount', uploadData.amount);
      if (uploadData.notes) formData.append('notes', uploadData.notes);

      await uploadDocument(formData);
      toast.success('New bill uploaded');
      loadCategories();
      if (onSuccess) onSuccess();
      return true;
    } catch (error) {
      toast.error('Failed to upload: ' + (error.response?.data?.detail || error.message));
      return false;
    }
  };

  const handleDownload = (fileUrl) => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    const fullUrl = fileUrl.startsWith('http') ? fileUrl : `${backendUrl}${fileUrl}`;
    window.open(fullUrl, '_blank');
  };

  return {
    categories,
    selectedCategory,
    categoryBills,
    isLoadingBills,
    loadCategories,
    loadCategoryBills,
    clearSelectedCategory,
    handleUploadBill,
    handleUploadNewForCategory,
    handleDownload
  };
};
