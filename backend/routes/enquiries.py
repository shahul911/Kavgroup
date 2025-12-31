"""Enquiry routes"""
from fastapi import APIRouter, HTTPException, Depends, Request
from typing import Optional
from datetime import datetime, timezone
import logging

from models import Enquiry, EnquiryCreate, EnquiryUpdate, Booking
from auth import get_current_user, require_admin
from database import db
from security import limiter, ip_blocker, InputValidator, validate_request_body
from email_service import send_booking_notification
from time_utils import check_multiday_conflict

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["Enquiries"])


@router.post("/enquiries")
@limiter.limit("5/minute")  # Max 5 enquiries per minute per IP
async def create_enquiry(request: Request, enquiry_data: EnquiryCreate):
    """Create a new enquiry (rate limited to prevent spam)"""
    ip = request.client.host
    
    # Validate input for malicious content
    data_dict = enquiry_data.dict()
    is_valid, error = await validate_request_body(request, data_dict)
    if not is_valid:
        ip_blocker.record_failed_attempt(ip, error)
        raise HTTPException(status_code=400, detail=error)
    
    # Validate phone number
    if not InputValidator.validate_phone(enquiry_data.phone):
        ip_blocker.record_failed_attempt(ip, "Invalid phone number")
        raise HTTPException(status_code=400, detail="Invalid phone number format")
    
    # Sanitize inputs
    enquiry_data.name = InputValidator.sanitize_string(enquiry_data.name)
    enquiry_data.eventType = InputValidator.sanitize_string(enquiry_data.eventType)
    
    enquiry = Enquiry(**enquiry_data.dict())
    await db.enquiries.insert_one(enquiry.dict())
    
    # Send email notification to admin (non-blocking)
    try:
        send_booking_notification(enquiry.dict())
    except Exception as e:
        logger.error(f"Failed to send booking notification email: {e}")
    
    return {
        "success": True,
        "message": "Enquiry submitted successfully. We will contact you soon.",
        "enquiry": enquiry.dict()
    }


@router.get("/admin/enquiries")
async def get_all_enquiries(
    status: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    query = {}
    if status:
        query['status'] = status
    
    enquiries = await db.enquiries.find(query, {'_id': 0}).sort('createdAt', -1).to_list(None)
    return {"enquiries": enquiries}


@router.put("/admin/enquiries/{enquiry_id}")
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


@router.delete("/admin/enquiries/{enquiry_id}")
async def delete_enquiry(
    enquiry_id: str,
    current_user: str = Depends(get_current_user)
):
    result = await db.enquiries.delete_one({"id": enquiry_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Enquiry not found")
    
    return {"success": True, "message": "Enquiry deleted"}


@router.post("/admin/enquiries/{enquiry_id}/convert")
async def convert_to_booking(
    enquiry_id: str,
    booking_details: dict,
    current_user: dict = Depends(require_admin)
):
    """Convert an enquiry to a confirmed booking"""
    # Get enquiry
    enquiry = await db.enquiries.find_one({"id": enquiry_id}, {'_id': 0})
    if not enquiry:
        raise HTTPException(status_code=404, detail="Enquiry not found")
    
    # Get dates from request or fall back to enquiry dates
    event_date = booking_details.get('eventDate', enquiry['eventDate'])
    event_end_date = booking_details.get('eventEndDate') or enquiry.get('eventEndDate') or event_date
    event_time_from = booking_details.get('eventTimeFrom', enquiry.get('eventTimeFrom', '07:00 AM'))
    event_time_to = booking_details.get('eventTimeTo', enquiry.get('eventTimeTo', '08:00 PM'))
    
    # Check for conflicts
    existing_bookings = await db.bookings.find({
        "status": {"$in": ["pending", "confirmed"]}
    }, {'_id': 0}).to_list(None)
    
    has_conflict = check_multiday_conflict(
        event_date, event_end_date, event_time_from, event_time_to, existing_bookings
    )
    
    if has_conflict:
        raise HTTPException(status_code=400, detail="Time slot conflict with existing booking")
    
    # Create booking from enquiry
    booking = Booking(
        name=enquiry['name'],
        phone=enquiry['phone'],
        eventDate=event_date,
        eventEndDate=event_end_date,
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
    booking_dict['eventTimeFrom'] = event_time_from
    booking_dict['eventTimeTo'] = event_time_to
    
    await db.bookings.insert_one(booking_dict)
    
    # Update enquiry status to closed
    await db.enquiries.update_one(
        {"id": enquiry_id},
        {"$set": {"status": "closed", "notes": "Converted to booking", "updatedAt": datetime.utcnow()}}
    )
    
    booking_dict.pop('_id', None)
    return {"success": True, "booking": booking_dict}
