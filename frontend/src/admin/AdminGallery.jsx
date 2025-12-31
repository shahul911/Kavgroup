import React, { useState } from 'react';
import { AdminDashboard } from './AdminDashboard';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Plus, Image } from 'lucide-react';

// Custom Hook
import { useGallery } from './hooks/useGallery';

// Components
import { GalleryCard, GalleryDialog } from './components/gallery';

export const AdminGallery = () => {
  const {
    images,
    loading,
    isUploading,
    handleUploadFile,
    handleCreateFromUrl,
    handleUpdate,
    handleDelete,
    handleToggleActive,
    getFullImageUrl
  } = useGallery();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingImage, setEditingImage] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    order: 0,
    isActive: true
  });

  const handleOpenDialog = (image = null) => {
    if (image) {
      setEditingImage(image);
      setFormData({
        title: image.title,
        description: image.description || '',
        imageUrl: image.imageUrl,
        order: image.order,
        isActive: image.isActive
      });
    } else {
      setEditingImage(null);
      setFormData({
        title: '',
        description: '',
        imageUrl: '',
        order: images.length,
        isActive: true
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingImage(null);
    setFormData({
      title: '',
      description: '',
      imageUrl: '',
      order: 0,
      isActive: true
    });
  };

  const handleUpload = async (selectedFile, data) => {
    const success = await handleUploadFile(selectedFile, data, handleCloseDialog);
    return success;
  };

  const handleCreateUrl = async (data) => {
    const success = await handleCreateFromUrl(data, handleCloseDialog);
    return success;
  };

  const handleUpdateImage = async (imageId, data) => {
    const success = await handleUpdate(imageId, data, handleCloseDialog);
    return success;
  };

  if (loading) {
    return (
      <AdminDashboard currentPage="gallery">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D4AF37]"></div>
        </div>
      </AdminDashboard>
    );
  }

  return (
    <AdminDashboard currentPage="gallery">
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Gallery Management</h1>
            <p className="text-sm text-gray-500 mt-1">Manage photos displayed on the website</p>
          </div>
          <Button
            onClick={() => handleOpenDialog()}
            className="bg-[#D4AF37] hover:bg-[#B8960C] text-black w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Image
          </Button>
        </div>

        {/* Gallery Grid */}
        {images.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8 sm:py-12">
              <Image className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mb-4" />
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No images yet</h3>
              <p className="text-sm text-gray-500 mb-4 text-center">Add your first gallery image to get started</p>
              <Button
                onClick={() => handleOpenDialog()}
                className="bg-[#D4AF37] hover:bg-[#B8960C] text-black"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add First Image
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {images.map((image) => (
              <GalleryCard
                key={image.id}
                image={image}
                getFullImageUrl={getFullImageUrl}
                onEdit={handleOpenDialog}
                onDelete={handleDelete}
                onToggleActive={handleToggleActive}
              />
            ))}
          </div>
        )}

        {/* Add/Edit Dialog */}
        <GalleryDialog
          isOpen={dialogOpen}
          onClose={handleCloseDialog}
          editingImage={editingImage}
          formData={formData}
          setFormData={setFormData}
          isUploading={isUploading}
          onUpload={handleUpload}
          onCreateFromUrl={handleCreateUrl}
          onUpdate={handleUpdateImage}
          getFullImageUrl={getFullImageUrl}
        />
      </div>
    </AdminDashboard>
  );
};
