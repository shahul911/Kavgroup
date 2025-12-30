import React, { useState, useEffect, useRef } from 'react';
import { AdminDashboard } from './AdminDashboard';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Switch } from '../components/ui/switch';
import { Plus, Pencil, Trash2, Image, Eye, EyeOff, Upload, Link } from 'lucide-react';
import { toast } from 'sonner';
import { getAdminGallery, uploadGalleryImage, createGalleryImage, updateGalleryImage, deleteGalleryImage } from '../utils/api';

export const AdminGallery = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingImage, setEditingImage] = useState(null);
  const [uploadMode, setUploadMode] = useState('file'); // 'file' or 'url'
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    order: 0,
    isActive: true
  });

  useEffect(() => {
    fetchGallery();
  }, []);

  const fetchGallery = async () => {
    try {
      setLoading(true);
      const data = await getAdminGallery();
      setImages(data.images || []);
    } catch (error) {
      toast.error('Failed to load gallery');
    } finally {
      setLoading(false);
    }
  };

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
      setPreviewUrl(image.imageUrl);
      setUploadMode('url'); // When editing, show URL mode
    } else {
      setEditingImage(null);
      setFormData({
        title: '',
        description: '',
        imageUrl: '',
        order: images.length,
        isActive: true
      });
      setPreviewUrl('');
      setSelectedFile(null);
      setUploadMode('file'); // Default to file upload for new images
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingImage(null);
    setSelectedFile(null);
    setPreviewUrl('');
    setFormData({
      title: '',
      description: '',
      imageUrl: '',
      order: 0,
      isActive: true
    });
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        toast.error('Invalid file type. Please upload JPEG, PNG, WebP or GIF images.');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File too large. Maximum size is 5MB.');
        return;
      }
      
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      
      // Auto-fill title from filename if empty
      if (!formData.title) {
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        setFormData(prev => ({ ...prev, title: nameWithoutExt }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }

    if (editingImage) {
      // Update existing image
      try {
        await updateGalleryImage(editingImage.id, formData);
        toast.success('Image updated successfully');
        handleCloseDialog();
        fetchGallery();
      } catch (error) {
        toast.error('Failed to update image');
      }
    } else {
      // Create new image
      if (uploadMode === 'file') {
        if (!selectedFile) {
          toast.error('Please select an image file');
          return;
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
          handleCloseDialog();
          fetchGallery();
        } catch (error) {
          toast.error('Failed to upload image');
        } finally {
          setIsUploading(false);
        }
      } else {
        // URL mode
        if (!formData.imageUrl.trim()) {
          toast.error('Image URL is required');
          return;
        }
        
        try {
          await createGalleryImage(formData);
          toast.success('Image added successfully');
          handleCloseDialog();
          fetchGallery();
        } catch (error) {
          toast.error('Failed to add image');
        }
      }
    }
  };

  const handleDelete = async (imageId) => {
    if (!window.confirm('Are you sure you want to delete this image?')) return;
    
    try {
      await deleteGalleryImage(imageId);
      toast.success('Image deleted successfully');
      fetchGallery();
    } catch (error) {
      toast.error('Failed to delete image');
    }
  };

  const handleToggleActive = async (image) => {
    try {
      await updateGalleryImage(image.id, { isActive: !image.isActive });
      toast.success(image.isActive ? 'Image hidden' : 'Image visible');
      fetchGallery();
    } catch (error) {
      toast.error('Failed to update image');
    }
  };

  const getFullImageUrl = (url) => {
    if (url.startsWith('http')) return url;
    return `${process.env.REACT_APP_BACKEND_URL}${url}`;
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
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Image className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No images yet</h3>
              <p className="text-gray-500 mb-4">Add your first gallery image to get started</p>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {images.map((image) => (
              <Card key={image.id} className={`overflow-hidden ${!image.isActive ? 'opacity-60' : ''}`}>
                <div className="relative aspect-[4/3] bg-gray-100">
                  <img
                    src={getFullImageUrl(image.imageUrl)}
                    alt={image.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found';
                    }}
                  />
                  {!image.isActive && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-white font-medium">Hidden</span>
                    </div>
                  )}
                  <div className="absolute top-2 right-2 flex gap-1">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
                      onClick={() => handleToggleActive(image)}
                      title={image.isActive ? 'Hide image' : 'Show image'}
                    >
                      {image.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{image.title}</h3>
                      <p className="text-sm text-gray-500 line-clamp-2">{image.description || 'No description'}</p>
                      <p className="text-xs text-gray-400 mt-1">Order: {image.order}</p>
                    </div>
                    <div className="flex gap-1 ml-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        onClick={() => handleOpenDialog(image)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDelete(image.id)}
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
              <DialogTitle>{editingImage ? 'Edit Image' : 'Add New Image'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Upload Mode Toggle - Only show for new images */}
              {!editingImage && (
                <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
                  <button
                    type="button"
                    className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                      uploadMode === 'file' 
                        ? 'bg-white text-gray-900 shadow-sm' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                    onClick={() => setUploadMode('file')}
                  >
                    <Upload className="w-4 h-4" />
                    Upload File
                  </button>
                  <button
                    type="button"
                    className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                      uploadMode === 'url' 
                        ? 'bg-white text-gray-900 shadow-sm' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                    onClick={() => setUploadMode('url')}
                  >
                    <Link className="w-4 h-4" />
                    Use URL
                  </button>
                </div>
              )}

              {/* File Upload */}
              {!editingImage && uploadMode === 'file' && (
                <div className="space-y-2">
                  <Label>Image File *</Label>
                  <div 
                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#D4AF37] transition-colors cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {previewUrl ? (
                      <div className="space-y-2">
                        <img 
                          src={previewUrl} 
                          alt="Preview" 
                          className="max-h-48 mx-auto rounded-lg object-cover"
                        />
                        <p className="text-sm text-gray-500">{selectedFile?.name}</p>
                        <p className="text-xs text-gray-400">Click to change</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="w-10 h-10 mx-auto text-gray-400" />
                        <p className="text-gray-600">Click to upload an image</p>
                        <p className="text-xs text-gray-400">JPEG, PNG, WebP, GIF (max 5MB)</p>
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              )}

              {/* URL Input */}
              {(editingImage || uploadMode === 'url') && (
                <div className="space-y-2">
                  <Label htmlFor="imageUrl">Image URL {!editingImage && '*'}</Label>
                  <Input
                    id="imageUrl"
                    value={formData.imageUrl}
                    onChange={(e) => {
                      setFormData({ ...formData, imageUrl: e.target.value });
                      setPreviewUrl(e.target.value);
                    }}
                    placeholder="https://example.com/image.jpg"
                  />
                  {previewUrl && (
                    <div className="mt-2 rounded-lg overflow-hidden border aspect-video bg-gray-100">
                      <img
                        src={editingImage ? getFullImageUrl(previewUrl) : previewUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/400x225?text=Invalid+URL';
                        }}
                      />
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Main Hall, Stage View"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the image"
                  rows={2}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="order">Display Order</Label>
                  <Input
                    id="order"
                    type="number"
                    min="0"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                  />
                </div>
                
                {editingImage && (
                  <div className="space-y-2">
                    <Label>Visibility</Label>
                    <div className="flex items-center space-x-2 h-10">
                      <Switch
                        checked={formData.isActive}
                        onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                      />
                      <span className="text-sm text-gray-600">
                        {formData.isActive ? 'Visible' : 'Hidden'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-[#D4AF37] hover:bg-[#B8960C] text-black"
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin mr-2"></div>
                      Uploading...
                    </>
                  ) : (
                    editingImage ? 'Save Changes' : 'Add Image'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminDashboard>
  );
};
