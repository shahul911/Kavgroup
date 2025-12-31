import React, { useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { Switch } from '../../../components/ui/switch';
import { Upload, Link } from 'lucide-react';
import { toast } from 'sonner';

export const GalleryDialog = ({
  isOpen,
  onClose,
  editingImage,
  formData,
  setFormData,
  isUploading,
  onUpload,
  onCreateFromUrl,
  onUpdate,
  getFullImageUrl
}) => {
  const fileInputRef = useRef(null);
  const [uploadMode, setUploadMode] = useState(editingImage ? 'url' : 'file');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(editingImage?.imageUrl || '');

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        toast.error('Invalid file type. Please upload JPEG, PNG, WebP or GIF images.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File too large. Maximum size is 5MB.');
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
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
      await onUpdate(editingImage.id, formData);
    } else {
      if (uploadMode === 'file') {
        await onUpload(selectedFile, formData);
      } else {
        await onCreateFromUrl(formData);
      }
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    setUploadMode('file');
    onClose();
  };

  // Reset preview when dialog opens with editing image
  React.useEffect(() => {
    if (isOpen) {
      if (editingImage) {
        setUploadMode('url');
        setPreviewUrl(editingImage.imageUrl);
      } else {
        setUploadMode('file');
        setPreviewUrl('');
        setSelectedFile(null);
      }
    }
  }, [isOpen, editingImage]);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
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
            <Button type="button" variant="outline" onClick={handleClose}>
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
  );
};
