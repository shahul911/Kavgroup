"""Dashboard and statistics routes"""
from fastapi import APIRouter, Depends
from datetime import datetime, timedelta
import logging

from auth import get_current_user
from database import db

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["Dashboard"])


@router.get("/admin/dashboard/stats")
async def get_dashboard_stats(current_user: str = Depends(get_current_user)):
    """Get dashboard statistics"""
    today = datetime.utcnow().date().isoformat()
    
    # Count documents with proper filters
    total_bookings = await db.bookings.count_documents({})
    pending_bookings = await db.bookings.count_documents({"status": "pending"})
    confirmed_bookings = await db.bookings.count_documents({"status": "confirmed"})
    new_enquiries = await db.enquiries.count_documents({"status": "new"})
    
    # Upcoming bookings (confirmed, date >= today)
    upcoming_bookings = await db.bookings.count_documents({
        "status": "confirmed",
        "eventDate": {"$gte": today}
    })
    
    return {
        "totalBookings": total_bookings,
        "pendingBookings": pending_bookings,
        "confirmedBookings": confirmed_bookings,
        "newEnquiries": new_enquiries,
        "upcomingBookings": upcoming_bookings
    }


@router.get("/admin/reminders")
async def get_reminders(current_user: str = Depends(get_current_user)):
    """Get pending reminders"""
    today = datetime.utcnow().date().isoformat()
    
    # Enquiry follow-ups (today or overdue) - with projection
    enquiry_reminders = await db.enquiries.find({
        "followUpReminder": True,
        "followUpDate": {"$lte": today},
        "status": {"$ne": "closed"}
    }, {'_id': 0, 'id': 1, 'name': 1, 'phone': 1, 'eventDate': 1, 'followUpDate': 1, 'notes': 1}).limit(100).to_list(100)
    
    # Document reminders (within next 7 days) - with projection
    next_week = (datetime.utcnow().date() + timedelta(days=7)).isoformat()
    document_reminders = await db.documents.find({
        "reminderEnabled": True,
        "reminderDate": {"$lte": next_week, "$gte": today}
    }, {'_id': 0, 'id': 1, 'documentType': 1, 'fileName': 1, 'reminderDate': 1, 'notes': 1}).limit(100).to_list(100)
    
    return {
        "enquiryReminders": enquiry_reminders,
        "documentReminders": document_reminders
    }
