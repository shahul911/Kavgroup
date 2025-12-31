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
    
    # Enquiry follow-ups - show ALL enquiries with followUpReminder enabled and not closed
    # No date filtering - show all pending follow-ups regardless of event date or follow-up date
    # This allows seeing follow-ups even when customer changes event date to a later date
    enquiry_reminders = await db.enquiries.find({
        "followUpReminder": True,
        "status": {"$nin": ["closed"]}
    }, {
        '_id': 0, 'id': 1, 'name': 1, 'phone': 1, 'eventDate': 1, 'eventEndDate': 1,
        'eventType': 1, 'followUpDate': 1, 'notes': 1, 'status': 1
    }).sort('followUpDate', 1).limit(100).to_list(100)
    
    # Document reminders - show all with reminder enabled (no date filter to catch overdue ones too)
    document_reminders = await db.documents.find({
        "reminderEnabled": True
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


@router.put("/admin/reminders/enquiry/{enquiry_id}/reschedule")
async def reschedule_enquiry_reminder(
    enquiry_id: str,
    data: dict,
    current_user: str = Depends(get_current_user)
):
    """Reschedule an enquiry follow-up reminder and optionally update event date"""
    new_follow_up_date = data.get('followUpDate')
    new_event_date = data.get('eventDate')
    new_event_end_date = data.get('eventEndDate')
    notes = data.get('notes')
    
    if not new_follow_up_date:
        raise HTTPException(status_code=400, detail="New follow-up date is required")
    
    update_data = {
        "followUpDate": new_follow_up_date,
        "followUpReminder": True,
        "updatedAt": datetime.utcnow()
    }
    
    # Allow updating event date if customer changed their preferred date
    if new_event_date:
        update_data["eventDate"] = new_event_date
    if new_event_end_date is not None:
        update_data["eventEndDate"] = new_event_end_date if new_event_end_date else None
    if notes is not None:
        update_data["notes"] = notes
    
    result = await db.enquiries.update_one(
        {"id": enquiry_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Enquiry not found")
    
    enquiry = await db.enquiries.find_one({"id": enquiry_id}, {"_id": 0})
    return {"success": True, "enquiry": enquiry}


@router.put("/admin/reminders/document/{document_id}/reschedule")
async def reschedule_document_reminder(
    document_id: str,
    data: dict,
    current_user: str = Depends(get_current_user)
):
    """Reschedule a document reminder and optionally update details"""
    new_date = data.get('reminderDate')
    
    update_data = {"updatedAt": datetime.utcnow()}
    
    if new_date:
        update_data["reminderDate"] = new_date
        update_data["reminderEnabled"] = True
    
    if data.get('notes') is not None:
        update_data["notes"] = data.get('notes')
    if data.get('amount') is not None:
        update_data["amount"] = data.get('amount')
    if data.get('dueDate') is not None:
        update_data["dueDate"] = data.get('dueDate')
    
    result = await db.documents.update_one(
        {"id": document_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Document not found")
    
    document = await db.documents.find_one({"id": document_id}, {"_id": 0})
    return {"success": True, "document": document}


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

