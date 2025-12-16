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
from time_utils import times_overlap, get_available_slots, check_multiday_conflict, get_daily_availability

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

# Get availability status for date range (for calendar display)
@api_router.get("/bookings/availability")
async def get_availability_overview(start_date: str = None, end_date: str = None):
    """Get availability status for multiple dates (for calendar color coding)"""
    from time_utils import get_date_range
    from datetime import datetime, timedelta
    
    # Default to current month if not specified
    if not start_date:
        today = datetime.utcnow().date()
        start_date = today.replace(day=1).strftime('%Y-%m-%d')
    if not end_date:
        # Get last day of next month
        today = datetime.utcnow().date()
        next_month = today.replace(day=28) + timedelta(days=4)
        end_date = (next_month.replace(day=1) + timedelta(days=32)).replace(day=1).strftime('%Y-%m-%d')
    
    # Get all bookings
    bookings = await db.bookings.find({"status": {"$in": ["pending", "confirmed"]}}, {'_id': 0}).to_list(1000)
    
    # Generate date range
    dates_to_check = get_date_range(start_date, end_date)
    
    # Check availability for each date
    date_status = {}
    for date_str in dates_to_check:
        # Find bookings affecting this date
        relevant_bookings = []
        for booking in bookings:
            b_start = booking.get('eventDate')
            b_end = booking.get('eventEndDate') or b_start
            if b_start <= date_str <= b_end:
                relevant_bookings.append(booking)
        
        if not relevant_bookings:
            date_status[date_str] = 'available'
        else:
            # Check if fully booked
            availability = get_daily_availability(date_str, relevant_bookings)
            if availability['isFullyBooked']:
                date_status[date_str] = 'fullyBooked'
            else:
                date_status[date_str] = 'partiallyBooked'
    
    return {"dateStatus": date_status}

# Get time slots for a specific date
@api_router.get("/bookings/availability/{date}")
async def get_date_availability(date: str):
    """Get available and booked time slots for a specific date"""
    # Get all bookings that might affect this date (including multi-day events)
    bookings = await db.bookings.find({
        "status": {"$in": ["pending", "confirmed"]}
    }, {'_id': 0}).to_list(1000)
    
    # Filter bookings that overlap with this date
    relevant_bookings = []
    for booking in bookings:
        start_date = booking.get('eventDate')
        end_date = booking.get('eventEndDate') or start_date
        
        # Check if this date falls within the booking range
        if start_date <= date <= end_date:
            relevant_bookings.append(booking)
    
    # Get detailed availability for this date
    availability = get_daily_availability(date, relevant_bookings)
    
    return {
        "date": date,
        "isFullyBooked": availability['isFullyBooked'],
        "bookedPeriods": availability['bookedPeriods'],
        "availablePeriods": availability['availablePeriods'],
        "availableForBooking": not availability['isFullyBooked']
    }

# Create a new booking (enquiry/request)
@api_router.post("/bookings")
async def create_booking(booking_data: BookingCreate):
    # Note: This creates an enquiry, not a confirmed booking
    # Time conflict checking will be done when admin converts to booking
    
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
    # Get all existing bookings to check for conflicts
    existing_bookings = await db.bookings.find({
        "status": {"$in": ["pending", "confirmed"]}
    }, {'_id': 0}).to_list(1000)
    
    # Check for multi-day conflicts
    has_conflict, conflict_msg = check_multiday_conflict(booking_data, existing_bookings)
    if has_conflict:
        raise HTTPException(status_code=400, detail=conflict_msg)
    
    # Generate invoice number
    invoice_count = await db.bookings.count_documents({}) + 1
    
    booking = Booking(
        name=booking_data['name'],
        phone=booking_data['phone'],
        eventDate=booking_data['eventDate'],
        eventEndDate=booking_data.get('eventEndDate'),
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
    booking_dict['eventEndDate'] = booking_data.get('eventEndDate')
    
    result = await db.bookings.insert_one(booking_dict)
    
    # Remove _id from dict before returning
    booking_dict.pop('_id', None)
    
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
    
    # Note: For admin panel, fetching all bookings. In production, consider adding pagination with skip/limit parameters
    bookings = await db.bookings.find(query, {'_id': 0}).sort('eventDate', 1).to_list(None)
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
    
    booking = await db.bookings.find_one({"id": booking_id}, {'_id': 0})
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
    current_user: dict = Depends(get_current_user)
):
    query = {}
    if status:
        query['status'] = status
    
    # Note: For admin panel, fetching all enquiries. In production, consider adding pagination with skip/limit parameters
    enquiries = await db.enquiries.find(query, {'_id': 0}).sort('createdAt', -1).to_list(None)
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
    
    enquiry = await db.enquiries.find_one({"id": enquiry_id}, {'_id': 0})
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
    current_user: dict = Depends(get_current_user)
):
    query = {}
    if documentType:
        query['documentType'] = documentType
    
    # Note: For admin panel, fetching all documents. In production, consider adding pagination with skip/limit parameters
    documents = await db.documents.find(query, {'_id': 0}).sort('uploadDate', -1).to_list(None)
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
    enquiry = await db.enquiries.find_one({"id": enquiry_id}, {'_id': 0})
    if not enquiry:
        raise HTTPException(status_code=404, detail="Enquiry not found")
    
    # Prepare booking data for conflict check
    new_booking_data = {
        'eventDate': enquiry['eventDate'],
        'eventEndDate': enquiry.get('eventEndDate') or booking_details.get('eventEndDate'),
        'eventTimeFrom': booking_details.get('eventTimeFrom', '07:00 AM'),
        'eventTimeTo': booking_details.get('eventTimeTo', '08:00 PM')
    }
    
    # Get all existing bookings and check for conflicts
    existing_bookings = await db.bookings.find({
        "status": {"$in": ["pending", "confirmed"]}
    }, {'_id': 0}).to_list(1000)
    
    has_conflict, conflict_msg = check_multiday_conflict(new_booking_data, existing_bookings)
    if has_conflict:
        raise HTTPException(status_code=400, detail=conflict_msg)
    
    # Create booking from enquiry
    booking = Booking(
        name=enquiry['name'],
        phone=enquiry['phone'],
        eventDate=enquiry['eventDate'],
        eventEndDate=enquiry.get('eventEndDate') or booking_details.get('eventEndDate'),
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
    
    result = await db.bookings.insert_one(booking_dict)
    
    # Update enquiry status to closed
    await db.enquiries.update_one(
        {"id": enquiry_id},
        {"$set": {"status": "closed", "notes": "Converted to booking", "updatedAt": datetime.utcnow()}}
    )
    
    # Remove _id from dict before returning
    booking_dict.pop('_id', None)
    
    return {"success": True, "booking": booking_dict}

# Generate receipt PDF (admin)
@api_router.get("/admin/bookings/{booking_id}/receipt")
async def generate_receipt(
    booking_id: str,
    current_user: str = Depends(get_current_user)
):
    from receipt_generator import generate_receipt_pdf
    
    booking = await db.bookings.find_one({"id": booking_id}, {'_id': 0})
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

# User Management (admin only)
@api_router.get("/admin/users")
async def get_all_users(current_user: dict = Depends(require_admin)):
    users = await db.admin_users.find({}, {'password': 0, '_id': 0}).to_list(1000)
    return {"users": users}

@api_router.post("/admin/users")
async def create_user(
    user_data: AdminUserCreate,
    current_user: dict = Depends(require_admin)
):
    # Check if username exists
    existing = await db.admin_users.find_one({"username": user_data.username})
    if existing:
        raise HTTPException(status_code=400, detail="Username already exists")
    
    hashed_pw = hash_password(user_data.password)
    new_user = AdminUser(
        username=user_data.username,
        password=hashed_pw,
        role=user_data.role
    )
    
    await db.admin_users.insert_one(new_user.dict())
    
    return {
        "success": True,
        "user": {
            "id": new_user.id,
            "username": new_user.username,
            "role": new_user.role
        }
    }

@api_router.delete("/admin/users/{user_id}")
async def delete_user(
    user_id: str,
    current_user: dict = Depends(require_admin)
):
    # Don't allow deleting yourself
    user_to_delete = await db.admin_users.find_one({"id": user_id})
    if user_to_delete and user_to_delete['username'] == current_user['username']:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
    
    result = await db.admin_users.delete_one({"id": user_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"success": True, "message": "User deleted"}

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
    admin_username = os.environ.get('ADMIN_USERNAME', 'Shahul')
    admin_password = os.environ.get('ADMIN_PASSWORD', '110076@Catlife')
    
    admin = await db.admin_users.find_one({"username": admin_username})
    if not admin:
        hashed_pw = hash_password(admin_password)
        admin_user = AdminUser(username=admin_username, password=hashed_pw, role="admin")
        await db.admin_users.insert_one(admin_user.dict())
        logger.info("Default admin user created")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
