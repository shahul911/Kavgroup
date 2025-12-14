from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
import uuid

# Booking Model
class BookingCreate(BaseModel):
    name: str
    phone: str
    eventDate: str
    eventType: str

class Booking(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    phone: str
    eventDate: str
    eventType: str
    status: str = 'pending'  # pending, confirmed, cancelled
    notes: Optional[str] = None
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

class BookingUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None
    eventDate: Optional[str] = None
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
    eventType: str

class Enquiry(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    phone: str
    eventDate: str
    eventType: str
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
