"""Booking routes - Public and Admin endpoints"""
from fastapi import APIRouter, HTTPException, Depends, Request
from typing import Optional
from datetime import datetime, timedelta, timezone
import logging

from models import Booking, BookingCreate, BookingUpdate
from auth import get_current_user, require_admin
from database import db, RECEIPT_DIR
from time_utils import get_date_range, get_daily_availability, check_multiday_conflict

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["Bookings"])


# ============= PUBLIC ENDPOINTS =============

@router.get("/bookings/availability")
async def get_availability_overview(start_date: str = None, end_date: str = None):
    """Get availability status for multiple dates (for calendar color coding)"""
    # Default to current month if not specified
    if not start_date:
        today = datetime.utcnow().date()
        start_date = today.replace(day=1).strftime('%Y-%m-%d')
    if not end_date:
        # Get last day of next month
        today = datetime.utcnow().date()
        next_month = today.replace(day=28) + timedelta(days=4)
        end_date = (next_month.replace(day=1) + timedelta(days=32)).replace(day=1).strftime('%Y-%m-%d')
    
    # Get bookings with projection (only needed fields) - limited for performance
    bookings = await db.bookings.find(
        {"status": {"$in": ["pending", "confirmed"]}}, 
        {'_id': 0, 'eventDate': 1, 'eventEndDate': 1, 'eventTimeFrom': 1, 'eventTimeTo': 1, 'name': 1, 'eventType': 1, 'status': 1}
    ).to_list(1000)
    
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


@router.get("/bookings/availability/{date}")
async def get_date_availability(date: str):
    """Get available and booked time slots for a specific date"""
    # Get bookings that might affect this date - limited for performance
    bookings = await db.bookings.find({
        "status": {"$in": ["pending", "confirmed"]}
    }, {'_id': 0, 'eventDate': 1, 'eventEndDate': 1, 'eventTimeFrom': 1, 'eventTimeTo': 1, 'name': 1, 'eventType': 1, 'status': 1}).to_list(1000)
    
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


@router.post("/bookings")
async def create_booking(booking_data: BookingCreate):
    """Create a booking (enquiry/request) - no conflict check here"""
    booking = Booking(**booking_data.dict())
    await db.bookings.insert_one(booking.dict())
    
    return {
        "success": True,
        "message": "Booking request submitted successfully",
        "booking": booking.dict()
    }


# ============= ADMIN ENDPOINTS =============

@router.get("/admin/bookings")
async def get_all_bookings(
    status: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    query = {}
    if status:
        query['status'] = status
    
    bookings = await db.bookings.find(query, {'_id': 0}).sort('eventDate', -1).to_list(500)
    return {"bookings": bookings}


@router.post("/admin/bookings")
async def create_direct_booking(
    booking_data: dict,
    current_user: dict = Depends(require_admin)
):
    """Create a booking directly (admin only)"""
    # Check for conflicts
    event_date = booking_data.get('eventDate')
    event_end_date = booking_data.get('eventEndDate') or event_date
    event_time_from = booking_data.get('eventTimeFrom', '07:00 AM')
    event_time_to = booking_data.get('eventTimeTo', '08:00 PM')
    
    existing_bookings = await db.bookings.find({
        "status": {"$in": ["pending", "confirmed"]}
    }, {'_id': 0}).to_list(1000)
    
    # Build new booking dict for conflict check
    new_booking = {
        'eventDate': event_date,
        'eventEndDate': event_end_date,
        'eventTimeFrom': event_time_from,
        'eventTimeTo': event_time_to
    }
    
    has_conflict, conflict_msg = check_multiday_conflict(new_booking, existing_bookings)
    
    if has_conflict:
        raise HTTPException(status_code=400, detail=f"Time slot conflict: {conflict_msg}")
    
    booking = Booking(
        name=booking_data.get('name'),
        phone=booking_data.get('phone'),
        eventDate=event_date,
        eventEndDate=event_end_date,
        eventType=booking_data.get('eventType'),
        status=booking_data.get('status', 'confirmed'),
        notes=booking_data.get('notes', '')
    )
    
    # Add invoice number and payment details
    invoice_count = await db.bookings.count_documents({}) + 1
    booking_dict = booking.dict()
    booking_dict['invoiceNumber'] = f"{invoice_count:06d}"
    booking_dict['amount'] = booking_data.get('amount', 0)
    booking_dict['advancePaid'] = booking_data.get('advancePaid', 0)
    booking_dict['balanceDue'] = booking_data.get('balanceDue', 0)
    booking_dict['eventTimeFrom'] = event_time_from
    booking_dict['eventTimeTo'] = event_time_to
    
    await db.bookings.insert_one(booking_dict)
    booking_dict.pop('_id', None)
    
    return {"success": True, "booking": booking_dict}


@router.put("/admin/bookings/{booking_id}")
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


@router.delete("/admin/bookings/{booking_id}")
async def delete_booking(
    booking_id: str,
    current_user: dict = Depends(require_admin)
):
    result = await db.bookings.delete_one({"id": booking_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    return {"success": True, "message": "Booking deleted"}


@router.get("/admin/bookings/{booking_id}/receipt")
async def generate_receipt(
    booking_id: str,
    current_user: str = Depends(get_current_user)
):
    """Generate receipt PDF for a booking"""
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
    receipt_filename = f"receipt_{booking['invoiceNumber']}_{booking['name'].replace(' ', '_')}.pdf"
    receipt_path = RECEIPT_DIR / receipt_filename
    
    generate_receipt_pdf(receipt_data, str(receipt_path))
    
    return {
        "success": True,
        "receiptUrl": f"/api/uploads/receipts/{receipt_filename}",
        "receiptPath": str(receipt_path)
    }
