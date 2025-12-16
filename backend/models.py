from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
import uuid

# Booking Model
class BookingCreate(BaseModel):
    name: str
    phone: str
    eventDate: str
    eventEndDate: Optional[str] = None  # For multi-day events
    eventType: str

class Booking(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    phone: str
    eventDate: str
    eventEndDate: Optional[str] = None  # For multi-day events
    eventType: str
    status: str = 'pending'  # pending, confirmed, cancelled
    notes: Optional[str] = None
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

class BookingUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None
    eventDate: Optional[str] = None
    eventEndDate: Optional[str] = None
    eventTimeFrom: Optional[str] = None
    eventTimeTo: Optional[str] = None
    amount: Optional[float] = None
    advancePaid: Optional[float] = None
    balanceDue: Optional[float] = None

# Enquiry Model
class EnquiryCreate(BaseModel):
    name: str
    phone: str
    eventDate: str
    eventEndDate: Optional[str] = None  # For multi-day events
    eventType: str
    eventTimeFrom: Optional[str] = '07:00 AM'
    eventTimeTo: Optional[str] = '08:00 PM'

class Enquiry(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    phone: str
    eventDate: str
    eventEndDate: Optional[str] = None  # For multi-day events
    eventType: str
    eventTimeFrom: str = '07:00 AM'
    eventTimeTo: str = '08:00 PM'
    status: str = 'new'  # new, contacted, follow-up, closed
    followUpDate: Optional[str] = None
    followUpReminder: bool = False
    notes: Optional[str] = None
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

class EnquiryUpdate(BaseModel):
    status: Optional[str] = None
    followUpDate: Optional[str] = None
    followUpReminder: Optional[bool] = None
    notes: Optional[str] = None

# Admin User Model
class AdminLogin(BaseModel):
    username: str
    password: str

class AdminUser(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    username: str
    password: str  # Will be hashed
    role: str = 'manager'  # admin or manager
    createdAt: datetime = Field(default_factory=datetime.utcnow)

class AdminUserCreate(BaseModel):
    username: str
    password: str
    role: str = 'manager'

# Document Model
class DocumentCreate(BaseModel):
    documentType: str  # water-test, building-tax, land-tax, electricity-bill, staff-payment
    fileName: str
    fileUrl: str
    fileSize: int
    billDate: Optional[str] = None
    dueDate: Optional[str] = None
    reminderDate: Optional[str] = None
    reminderEnabled: bool = False
    amount: Optional[float] = None
    notes: Optional[str] = None

class Document(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    documentType: str
    fileName: str
    fileUrl: str
    fileSize: int
    uploadDate: datetime = Field(default_factory=datetime.utcnow)
    billDate: Optional[str] = None
    dueDate: Optional[str] = None
    reminderDate: Optional[str] = None
    reminderEnabled: bool = False
    amount: Optional[float] = None
    notes: Optional[str] = None
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

# Gallery Model
class GalleryImageCreate(BaseModel):
    title: str
    description: Optional[str] = None
    imageUrl: str
    order: int = 0

class GalleryImage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: Optional[str] = None
    imageUrl: str
    order: int = 0
    isActive: bool = True
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

class GalleryImageUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    imageUrl: Optional[str] = None
    order: Optional[int] = None
    isActive: Optional[bool] = None

# Testimonial Model
class TestimonialCreate(BaseModel):
    name: str
    event: str
    rating: int = 5
    text: str
    date: Optional[str] = None

class Testimonial(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    event: str
    rating: int = 5
    text: str
    date: Optional[str] = None
    isActive: bool = True
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

class TestimonialUpdate(BaseModel):
    name: Optional[str] = None
    event: Optional[str] = None
    rating: Optional[int] = None
    text: Optional[str] = None
    date: Optional[str] = None
    isActive: Optional[bool] = None
