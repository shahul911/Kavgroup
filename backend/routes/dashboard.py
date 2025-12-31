"""Dashboard and statistics routes"""
from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime, timedelta
import logging

from auth import get_current_user
from database import db

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["Dashboard"])


@router.get("/admin/stats")
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
    """Get pending reminders - enquiry follow-ups and document reminders"""
    today = datetime.utcnow().date().isoformat()
    
    # Enquiry follow-ups - include all with followUpReminder enabled and not closed
    # Show reminders that are today, overdue, or upcoming (within 7 days)
    next_week = (datetime.utcnow().date() + timedelta(days=7)).isoformat()
    enquiry_reminders = await db.enquiries.find({
        "followUpReminder": True,
        "followUpDate": {"$lte": next_week},
        "status": {"$nin": ["closed"]}
    }, {
        '_id': 0, 'id': 1, 'name': 1, 'phone': 1, 'eventDate': 1, 
        'eventType': 1, 'followUpDate': 1, 'notes': 1, 'status': 1
    }).sort('followUpDate', 1).limit(100).to_list(100)
    
    # Document reminders (within next 14 days or overdue)
    two_weeks = (datetime.utcnow().date() + timedelta(days=14)).isoformat()
    document_reminders = await db.documents.find({
        "reminderEnabled": True,
        "reminderDate": {"$lte": two_weeks}
    }, {
        '_id': 0, 'id': 1, 'documentType': 1, 'fileName': 1, 'fileUrl': 1,
        'reminderDate': 1, 'billDate': 1, 'dueDate': 1, 'amount': 1, 'notes': 1
    }).sort('reminderDate', 1).limit(100).to_list(100)
    
    return {
        "enquiryReminders": enquiry_reminders,
        "documentReminders": document_reminders
    }


@router.put("/admin/reminders/enquiry/{enquiry_id}/done")
async def mark_enquiry_reminder_done(
    enquiry_id: str,
    current_user: str = Depends(get_current_user)
):
    """Mark an enquiry follow-up reminder as done (disables the reminder)"""
    result = await db.enquiries.update_one(
        {"id": enquiry_id},
        {"$set": {"followUpReminder": False, "updatedAt": datetime.utcnow()}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Enquiry not found")
    
    return {"success": True, "message": "Reminder marked as done"}


@router.put("/admin/reminders/document/{document_id}/done")
async def mark_document_reminder_done(
    document_id: str,
    current_user: str = Depends(get_current_user)
):
    """Mark a document reminder as done (disables the reminder)"""
    result = await db.documents.update_one(
        {"id": document_id},
        {"$set": {"reminderEnabled": False, "updatedAt": datetime.utcnow()}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Document not found")
    
    return {"success": True, "message": "Reminder marked as done"}


@router.get("/admin/bill-categories")
async def get_bill_categories(current_user: str = Depends(get_current_user)):
    """Get all bill/document categories with counts"""
    # Predefined categories
    categories = [
        {"id": "water-test", "name": "Water Test Results", "icon": "droplet"},
        {"id": "building-tax", "name": "Building Tax", "icon": "building"},
        {"id": "land-tax", "name": "Land Tax", "icon": "map"},
        {"id": "electricity-bill", "name": "Electricity Bill", "icon": "zap"},
        {"id": "staff-payment", "name": "Staff Payment", "icon": "users"},
        {"id": "maintenance", "name": "Maintenance", "icon": "wrench"},
        {"id": "insurance", "name": "Insurance", "icon": "shield"},
        {"id": "license", "name": "License & Permits", "icon": "file-check"},
        {"id": "other", "name": "Other Bills", "icon": "file-text"}
    ]
    
    # Get counts for each category
    for cat in categories:
        count = await db.documents.count_documents({"documentType": cat["id"]})
        cat["count"] = count
    
    return {"categories": categories}


@router.get("/admin/bills/{category}")
async def get_bills_by_category(
    category: str,
    current_user: str = Depends(get_current_user)
):
    """Get all bills/documents for a specific category"""
    documents = await db.documents.find(
        {"documentType": category},
        {"_id": 0}
    ).sort("billDate", -1).to_list(200)
    
    return {"documents": documents, "category": category}

