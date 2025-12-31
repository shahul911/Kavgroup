"""Content management routes - Gallery and Testimonials"""
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
from datetime import datetime, timezone
import uuid
import logging

from models import (
    GalleryImage, GalleryImageCreate, GalleryImageUpdate,
    Testimonial, TestimonialCreate, TestimonialUpdate
)
from auth import get_current_user, require_admin
from database import db, GALLERY_UPLOAD_DIR

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["Content"])


# ==================== GALLERY ENDPOINTS ====================

@router.get("/gallery")
async def get_gallery():
    """Get all active gallery images (public)"""
    images = await db.gallery.find({"isActive": True}, {"_id": 0}).sort("order", 1).to_list(100)
    return {"images": images}


@router.get("/admin/gallery")
async def get_admin_gallery(current_user: dict = Depends(get_current_user)):
    """Get all gallery images including inactive (admin)"""
    images = await db.gallery.find({}, {"_id": 0}).sort("order", 1).to_list(100)
    return {"images": images}


@router.post("/admin/gallery")
async def create_gallery_image(
    image_data: GalleryImageCreate,
    current_user: dict = Depends(require_admin)
):
    """Create gallery image from URL"""
    image = GalleryImage(**image_data.dict())
    await db.gallery.insert_one(image.dict())
    return {"success": True, "image": image.dict()}


@router.post("/admin/gallery/upload")
async def upload_gallery_image(
    file: UploadFile = File(...),
    title: str = Form(...),
    description: str = Form(None),
    order: int = Form(0),
    current_user: dict = Depends(require_admin)
):
    """Upload gallery image file"""
    # Validate file type
    allowed_types = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Invalid file type. Only JPEG, PNG, WebP and GIF are allowed.")
    
    # Generate unique filename
    file_ext = file.filename.split('.')[-1] if '.' in file.filename else 'jpg'
    unique_filename = f"gallery_{uuid.uuid4().hex[:8]}_{datetime.now().strftime('%Y%m%d%H%M%S')}.{file_ext}"
    file_path = GALLERY_UPLOAD_DIR / unique_filename
    
    # Save file
    try:
        content = await file.read()
        with open(file_path, "wb") as f:
            f.write(content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")
    
    # Create gallery image record
    image_url = f"/api/uploads/gallery/{unique_filename}"
    image = GalleryImage(
        title=title,
        description=description,
        imageUrl=image_url,
        order=order,
        isActive=True
    )
    await db.gallery.insert_one(image.dict())
    
    return {"success": True, "image": image.dict()}


@router.put("/admin/gallery/{image_id}")
async def update_gallery_image(
    image_id: str,
    image_data: GalleryImageUpdate,
    current_user: dict = Depends(require_admin)
):
    update_dict = {k: v for k, v in image_data.dict().items() if v is not None}
    if update_dict:
        update_dict['updatedAt'] = datetime.now(timezone.utc)
        await db.gallery.update_one({"id": image_id}, {"$set": update_dict})
    
    updated = await db.gallery.find_one({"id": image_id}, {"_id": 0})
    if not updated:
        raise HTTPException(status_code=404, detail="Gallery image not found")
    return {"success": True, "image": updated}


@router.delete("/admin/gallery/{image_id}")
async def delete_gallery_image(
    image_id: str,
    current_user: dict = Depends(require_admin)
):
    result = await db.gallery.delete_one({"id": image_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Gallery image not found")
    return {"success": True, "message": "Gallery image deleted"}


# ==================== TESTIMONIAL ENDPOINTS ====================

@router.get("/testimonials")
async def get_testimonials():
    """Get all active testimonials (public)"""
    testimonials = await db.testimonials.find({"isActive": True}, {"_id": 0}).sort("createdAt", -1).to_list(100)
    return {"testimonials": testimonials}


@router.get("/admin/testimonials")
async def get_admin_testimonials(current_user: dict = Depends(get_current_user)):
    """Get all testimonials including inactive (admin)"""
    testimonials = await db.testimonials.find({}, {"_id": 0}).sort("createdAt", -1).to_list(100)
    return {"testimonials": testimonials}


@router.post("/admin/testimonials")
async def create_testimonial(
    testimonial_data: TestimonialCreate,
    current_user: dict = Depends(require_admin)
):
    testimonial = Testimonial(**testimonial_data.dict())
    await db.testimonials.insert_one(testimonial.dict())
    return {"success": True, "testimonial": testimonial.dict()}


@router.put("/admin/testimonials/{testimonial_id}")
async def update_testimonial(
    testimonial_id: str,
    testimonial_data: TestimonialUpdate,
    current_user: dict = Depends(require_admin)
):
    update_dict = {k: v for k, v in testimonial_data.dict().items() if v is not None}
    if update_dict:
        update_dict['updatedAt'] = datetime.now(timezone.utc)
        await db.testimonials.update_one({"id": testimonial_id}, {"$set": update_dict})
    
    updated = await db.testimonials.find_one({"id": testimonial_id}, {"_id": 0})
    if not updated:
        raise HTTPException(status_code=404, detail="Testimonial not found")
    return {"success": True, "testimonial": updated}


@router.delete("/admin/testimonials/{testimonial_id}")
async def delete_testimonial(
    testimonial_id: str,
    current_user: dict = Depends(require_admin)
):
    result = await db.testimonials.delete_one({"id": testimonial_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Testimonial not found")
    return {"success": True, "message": "Testimonial deleted"}
