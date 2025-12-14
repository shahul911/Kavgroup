from fastapi import FastAPI, APIRouter, HTTPException, Depends, UploadFile, File, Form
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from typing import List, Optional
from datetime import datetime, timedelta
import shutil

from models import (
    Booking, BookingCreate, BookingUpdate,
    Enquiry, EnquiryCreate, EnquiryUpdate,
    AdminLogin, AdminUser, AdminUserCreate,
    Document, DocumentCreate
)
from auth import hash_password, verify_password, create_jwt_token, get_current_user, require_admin

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create uploads directory
UPLOAD_DIR = ROOT_DIR / 'uploads' / 'documents'
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# Create the main app
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# ============= PUBLIC ENDPOINTS =============

@api_router.get("/")
async def root():
    return {"message": "K.A.V Auditorium API"}

# Get all booked dates
@api_router.get("/bookings/availability")
async def get_booked_dates():
    bookings = await db.bookings.find({"status": {"$in": ["pending", "confirmed"]}}).to_list(1000)
    booked_dates = [booking['eventDate'] for booking in bookings]
    return {"bookedDates": booked_dates}

# Create a new booking
@api_router.post("/bookings")
async def create_booking(booking_data: BookingCreate):
    # Check if date is already booked
    existing = await db.bookings.find_one({
        "eventDate": booking_data.eventDate,
        "status": {"$in": ["pending", "confirmed"]}
    })
    
    if existing:
        raise HTTPException(status_code=400, detail="This date is already booked")
    
    booking = Booking(**booking_data.dict())
    await db.bookings.insert_one(booking.dict())
    
    return {
        "success": True,
        "message": "Booking request submitted successfully",
        "booking": booking.dict()
    }

# Create a new enquiry
@api_router.post("/enquiries")
async def create_enquiry(enquiry_data: EnquiryCreate):
    enquiry = Enquiry(**enquiry_data.dict())
    await db.enquiries.insert_one(enquiry.dict())
    
    return {
        "success": True,
        "message": "Enquiry submitted successfully",
        "enquiry": enquiry.dict()
    }

# ============= ADMIN ENDPOINTS =============

# Admin login
@api_router.post("/admin/login")
async def admin_login(login_data: AdminLogin):
    admin = await db.admin_users.find_one({"username": login_data.username})
    
    if not admin or not verify_password(login_data.password, admin['password']):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_jwt_token(admin['username'], admin.get('role', 'manager'))
    
    return {
        "success": True,
        "token": token,
        "user": {
            "username": admin['username'],
            "role": admin.get('role', 'manager')
        }
    }

# Create booking directly (admin/manager)
@api_router.post("/admin/bookings")
async def create_booking_direct(
    booking_data: dict,
    current_user: dict = Depends(get_current_user)
):
    # Check if date is already booked
    existing = await db.bookings.find_one({
        "eventDate": booking_data['eventDate'],
        "status": {"$in": ["pending", "confirmed"]}
    })
    
    if existing:
        raise HTTPException(status_code=400, detail="This date is already booked")
    
    # Generate invoice number
    invoice_count = await db.bookings.count_documents({}) + 1
    
    booking = Booking(
        name=booking_data['name'],
        phone=booking_data['phone'],
        eventDate=booking_data['eventDate'],
        eventType=booking_data['eventType'],
        status=booking_data.get('status', 'confirmed'),
        notes=booking_data.get('notes', '')
    )
    
    booking_dict = booking.dict()
    booking_dict['invoiceNumber'] = f"{invoice_count:06d}"
    booking_dict['amount'] = booking_data.get('amount', 0)
    booking_dict['advancePaid'] = booking_data.get('advancePaid', 0)
    booking_dict['balanceDue'] = booking_data.get('balanceDue', 0)
    booking_dict['eventTimeFrom'] = booking_data.get('eventTimeFrom', '07:00 AM')
    booking_dict['eventTimeTo'] = booking_data.get('eventTimeTo', '08:00 PM')
    
    await db.bookings.insert_one(booking_dict)
    
    return {"success": True, "booking": booking_dict}

# Get all bookings (admin/manager)
@api_router.get("/admin/bookings")
async def get_all_bookings(
    status: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    query = {}
    if status:
        query['status'] = status
    
    bookings = await db.bookings.find(query).sort('eventDate', 1).to_list(1000)
    return {"bookings": bookings}

# Update booking (admin only)
@api_router.put("/admin/bookings/{booking_id}")
async def update_booking(
    booking_id: str,
    update_data: BookingUpdate,
    current_user: dict = Depends(require_admin)
):
    update_dict = {k: v for k, v in update_data.dict().items() if v is not None}
    update_dict['updatedAt'] = datetime.utcnow()
    
    # Recalculate balance if amount or advance changed
    if 'amount' in update_dict or 'advancePaid' in update_dict:
        booking = await db.bookings.find_one({"id": booking_id})
        if booking:
            amount = update_dict.get('amount', booking.get('amount', 0))
            advance = update_dict.get('advancePaid', booking.get('advancePaid', 0))
            update_dict['balanceDue'] = amount - advance
    
    result = await db.bookings.update_one(
        {"id": booking_id},
        {"$set": update_dict}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    booking = await db.bookings.find_one({"id": booking_id})
    return {"success": True, "booking": booking}

# Delete booking (admin only)
@api_router.delete("/admin/bookings/{booking_id}")
async def delete_booking(
    booking_id: str,
    current_user: dict = Depends(require_admin)
):
    result = await db.bookings.delete_one({"id": booking_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    return {"success": True, "message": "Booking deleted"}

# Get all enquiries (admin)
@api_router.get("/admin/enquiries")
async def get_all_enquiries(
    status: Optional[str] = None,
    current_user: str = Depends(get_current_user)
):
    query = {}
    if status:
        query['status'] = status
    
    enquiries = await db.enquiries.find(query).sort('createdAt', -1).to_list(1000)
    return {"enquiries": enquiries}

# Update enquiry (admin)
@api_router.put("/admin/enquiries/{enquiry_id}")
async def update_enquiry(
    enquiry_id: str,
    update_data: EnquiryUpdate,
    current_user: str = Depends(get_current_user)
):
    update_dict = {k: v for k, v in update_data.dict().items() if v is not None}
    update_dict['updatedAt'] = datetime.utcnow()
    
    result = await db.enquiries.update_one(
        {"id": enquiry_id},
        {"$set": update_dict}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Enquiry not found")
    
    enquiry = await db.enquiries.find_one({"id": enquiry_id})
    return {"success": True, "enquiry": enquiry}

# Delete enquiry (admin)
@api_router.delete("/admin/enquiries/{enquiry_id}")
async def delete_enquiry(
    enquiry_id: str,
    current_user: str = Depends(get_current_user)
):
    result = await db.enquiries.delete_one({"id": enquiry_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Enquiry not found")
    
    return {"success": True, "message": "Enquiry deleted"}

# Upload document (admin)
@api_router.post("/admin/documents")
async def upload_document(
    file: UploadFile = File(...),
    documentType: str = Form(...),
    billDate: Optional[str] = Form(None),
    dueDate: Optional[str] = Form(None),
    reminderDate: Optional[str] = Form(None),
    reminderEnabled: bool = Form(False),
    amount: Optional[float] = Form(None),
    notes: Optional[str] = Form(None),
    current_user: str = Depends(get_current_user)
):
    # Validate file type
    allowed_types = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="File type not allowed. Only PDF and images are accepted.")
    
    # Validate file size (10MB max)
    file_size = 0
    file_content = await file.read()
    file_size = len(file_content)
    
    if file_size > 10 * 1024 * 1024:  # 10MB
        raise HTTPException(status_code=400, detail="File size exceeds 10MB limit")
    
    # Save file
    file_extension = file.filename.split('.')[-1]
    file_name = f"{documentType}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.{file_extension}"
    file_path = UPLOAD_DIR / file_name
    
    with open(file_path, 'wb') as f:
        f.write(file_content)
    
    # Create document record
    document_data = DocumentCreate(
        documentType=documentType,
        fileName=file.filename,
        fileUrl=f"/uploads/documents/{file_name}",
        fileSize=file_size,
        billDate=billDate,
        dueDate=dueDate,
        reminderDate=reminderDate,
        reminderEnabled=reminderEnabled,
        amount=amount,
        notes=notes
    )
    
    document = Document(**document_data.dict())
    await db.documents.insert_one(document.dict())
    
    return {"success": True, "document": document.dict()}

# Get all documents (admin)
@api_router.get("/admin/documents")
async def get_all_documents(
    documentType: Optional[str] = None,
    current_user: str = Depends(get_current_user)
):
    query = {}
    if documentType:
        query['documentType'] = documentType
    
    documents = await db.documents.find(query).sort('uploadDate', -1).to_list(1000)
    return {"documents": documents}

# Delete document (admin)
@api_router.delete("/admin/documents/{document_id}")
async def delete_document(
    document_id: str,
    current_user: str = Depends(get_current_user)
):
    document = await db.documents.find_one({"id": document_id})
    
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Delete file from filesystem
    file_path = ROOT_DIR / document['fileUrl'].lstrip('/')
    if file_path.exists():
        file_path.unlink()
    
    # Delete from database
    await db.documents.delete_one({"id": document_id})
    
    return {"success": True, "message": "Document deleted"}

# Convert enquiry to booking (admin)
@api_router.post("/admin/enquiries/{enquiry_id}/convert-to-booking")
async def convert_enquiry_to_booking(
    enquiry_id: str,
    booking_details: dict,
    current_user: str = Depends(get_current_user)
):
    # Get enquiry
    enquiry = await db.enquiries.find_one({"id": enquiry_id})
    if not enquiry:
        raise HTTPException(status_code=404, detail="Enquiry not found")
    
    # Check if date is already booked
    existing = await db.bookings.find_one({
        "eventDate": enquiry['eventDate'],
        "status": {"$in": ["pending", "confirmed"]}
    })
    
    if existing:
        raise HTTPException(status_code=400, detail="This date is already booked")
    
    # Create booking from enquiry
    booking = Booking(
        name=enquiry['name'],
        phone=enquiry['phone'],
        eventDate=enquiry['eventDate'],
        eventType=enquiry['eventType'],
        status='confirmed',
        notes=booking_details.get('notes', '')
    )
    
    # Add invoice number and payment details
    invoice_count = await db.bookings.count_documents({}) + 1
    booking_dict = booking.dict()
    booking_dict['invoiceNumber'] = f"{invoice_count:06d}"
    booking_dict['amount'] = booking_details.get('amount', 0)
    booking_dict['advancePaid'] = booking_details.get('advancePaid', 0)
    booking_dict['balanceDue'] = booking_details.get('balanceDue', 0)
    booking_dict['eventTimeFrom'] = booking_details.get('eventTimeFrom', '07:00 AM')
    booking_dict['eventTimeTo'] = booking_details.get('eventTimeTo', '08:00 PM')
    
    await db.bookings.insert_one(booking_dict)
    
    # Update enquiry status to closed
    await db.enquiries.update_one(
        {"id": enquiry_id},
        {"$set": {"status": "closed", "notes": "Converted to booking", "updatedAt": datetime.utcnow()}}
    )
    
    return {"success": True, "booking": booking_dict}

# Generate receipt PDF (admin)
@api_router.get("/admin/bookings/{booking_id}/receipt")
async def generate_receipt(
    booking_id: str,
    current_user: str = Depends(get_current_user)
):
    from receipt_generator import generate_receipt_pdf
    
    booking = await db.bookings.find_one({"id": booking_id})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    # Prepare receipt data
    receipt_data = {
        'invoice_number': booking.get('invoiceNumber', '000000'),
        'customer_name': booking['name'],
        'customer_phone': booking['phone'],
        'customer_email': booking.get('email', ''),
        'event_date': booking['eventDate'],
        'event_time_from': booking.get('eventTimeFrom', '07:00 AM'),
        'event_time_to': booking.get('eventTimeTo', '08:00 PM'),
        'event_type': booking['eventType'],
        'amount': booking.get('amount', 0),
        'advance_paid': booking.get('advancePaid', 0),
        'balance_due': booking.get('balanceDue', 0)
    }
    
    # Generate PDF
    receipt_dir = UPLOAD_DIR.parent / 'receipts'
    receipt_dir.mkdir(parents=True, exist_ok=True)
    
    receipt_filename = f"receipt_{booking['invoiceNumber']}_{booking['name'].replace(' ', '_')}.pdf"
    receipt_path = receipt_dir / receipt_filename
    
    generate_receipt_pdf(receipt_data, str(receipt_path))
    
    # Return file URL
    return {
        "success": True,
        "receiptUrl": f"/uploads/receipts/{receipt_filename}",
        "receiptPath": str(receipt_path)
    }

# Get reminders (admin)
@api_router.get("/admin/reminders")
async def get_reminders(current_user: str = Depends(get_current_user)):
    today = datetime.utcnow().date().isoformat()
    
    # Enquiry follow-ups (today or overdue)
    enquiry_reminders = await db.enquiries.find({
        "followUpReminder": True,
        "followUpDate": {"$lte": today},
        "status": {"$ne": "closed"}
    }).to_list(1000)
    
    # Document reminders (within next 7 days)
    next_week = (datetime.utcnow().date() + timedelta(days=7)).isoformat()
    document_reminders = await db.documents.find({
        "reminderEnabled": True,
        "reminderDate": {"$lte": next_week, "$gte": today}
    }).to_list(1000)
    
    return {
        "enquiryReminders": enquiry_reminders,
        "documentReminders": document_reminders
    }

# Get dashboard stats (admin)
@api_router.get("/admin/stats")
async def get_dashboard_stats(current_user: str = Depends(get_current_user)):
    # Count bookings by status
    total_bookings = await db.bookings.count_documents({})
    pending_bookings = await db.bookings.count_documents({"status": "pending"})
    confirmed_bookings = await db.bookings.count_documents({"status": "confirmed"})
    
    # Count enquiries by status
    total_enquiries = await db.enquiries.count_documents({})
    new_enquiries = await db.enquiries.count_documents({"status": "new"})
    
    # Count documents
    total_documents = await db.documents.count_documents({})
    
    # Upcoming bookings (next 30 days)
    today = datetime.utcnow().date().isoformat()
    next_month = (datetime.utcnow().date() + timedelta(days=30)).isoformat()
    upcoming_bookings = await db.bookings.count_documents({
        "eventDate": {"$gte": today, "$lte": next_month},
        "status": {"$in": ["pending", "confirmed"]}
    })
    
    return {
        "totalBookings": total_bookings,
        "pendingBookings": pending_bookings,
        "confirmedBookings": confirmed_bookings,
        "totalEnquiries": total_enquiries,
        "newEnquiries": new_enquiries,
        "totalDocuments": total_documents,
        "upcomingBookings": upcoming_bookings
    }

# Include the router in the main app
app.include_router(api_router)

# Serve uploaded files
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR.parent)), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_event():
    # Create default admin user if not exists
    admin = await db.admin_users.find_one({"username": "Shahul"})
    if not admin:
        hashed_pw = hash_password("110076@Catlife")
        admin_user = AdminUser(username="Shahul", password=hashed_pw)
        await db.admin_users.insert_one(admin_user.dict())
        logger.info("Default admin user created")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
