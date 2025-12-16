from datetime import datetime, time, timedelta

def parse_time(time_str):
    """Parse time string like '04:00 PM' to time object"""
    try:
        return datetime.strptime(time_str, '%I:%M %p').time()
    except:
        try:
            return datetime.strptime(time_str, '%H:%M').time()
        except:
            return None

def parse_date(date_str):
    """Parse date string to date object"""
    try:
        return datetime.strptime(date_str, '%Y-%m-%d').date()
    except:
        return None

def get_date_range(start_date_str, end_date_str):
    """Get list of dates between start and end (inclusive)"""
    start = parse_date(start_date_str)
    end = parse_date(end_date_str) if end_date_str else start
    
    if not start or not end:
        return [start_date_str]
    
    dates = []
    current = start
    while current <= end:
        dates.append(current.strftime('%Y-%m-%d'))
        current += timedelta(days=1)
    
    return dates

def times_overlap(start1, end1, start2, end2):
    """
    Check if two time ranges overlap
    Handles cases where booking goes to next day
    """
    start1_time = parse_time(start1) if isinstance(start1, str) else start1
    end1_time = parse_time(end1) if isinstance(end1, str) else end1
    start2_time = parse_time(start2) if isinstance(start2, str) else start2
    end2_time = parse_time(end2) if isinstance(end2, str) else end2
    
    if not all([start1_time, end1_time, start2_time, end2_time]):
        return True  # If we can't parse, assume overlap for safety
    
    # Case 1: Event 1 goes to next day (end < start)
    if end1_time < start1_time:
        # Event 1 occupies from start1 to midnight AND midnight to end1
        # Check if event 2 overlaps with either range
        if end2_time < start2_time:  # Event 2 also goes to next day
            return True  # Both span to next day, they overlap
        else:
            # Event 2 is same day
            # Overlaps if event 2 starts before event 1 ends (next day) OR ends after event 1 starts
            return start2_time <= end1_time or end2_time >= start1_time
    
    # Case 2: Event 2 goes to next day (end < start)
    elif end2_time < start2_time:
        # Event 2 spans to next day, Event 1 doesn't
        return start1_time <= end2_time or end1_time >= start2_time
    
    # Case 3: Both events are within same day
    else:
        # Standard overlap check: start1 < end2 AND start2 < end1
        return start1_time < end2_time and start2_time < end1_time

def get_available_slots(bookings, date):
    """
    Get available time slots for a given date
    Returns list of booked slots with time ranges
    """
    booked_slots = []
    
    for booking in bookings:
        if booking['status'] in ['confirmed', 'pending']:
            start_time = booking.get('eventTimeFrom', '07:00 AM')
            end_time = booking.get('eventTimeTo', '08:00 PM')
            
            # Convert to 12-hour format for display if needed
            start_time = format_time_12hr(start_time)
            end_time = format_time_12hr(end_time)
            
            booked_slots.append({
                'start': start_time,
                'end': end_time,
                'customer': booking['name'],
                'eventType': booking['eventType']
            })
    
    return booked_slots

def format_time_12hr(time_str):
    """Convert 24hr to 12hr format"""
    try:
        time_obj = datetime.strptime(time_str, '%H:%M').time()
        return time_obj.strftime('%I:%M %p')
    except:
        return time_str

def check_multiday_conflict(new_booking, existing_bookings):
    """
    Check if a multi-day booking conflicts with existing bookings.
    Returns (has_conflict, conflict_message)
    """
    new_start_date = new_booking.get('eventDate')
    new_end_date = new_booking.get('eventEndDate') or new_start_date
    new_start_time = new_booking.get('eventTimeFrom', '07:00 AM')
    new_end_time = new_booking.get('eventTimeTo', '11:00 PM')
    
    # Get all dates covered by the new booking
    new_dates = get_date_range(new_start_date, new_end_date)
    
    for existing in existing_bookings:
        existing_start_date = existing.get('eventDate')
        existing_end_date = existing.get('eventEndDate') or existing_start_date
        existing_start_time = existing.get('eventTimeFrom', '07:00 AM')
        existing_end_time = existing.get('eventTimeTo', '11:00 PM')
        
        # Get all dates covered by existing booking
        existing_dates = get_date_range(existing_start_date, existing_end_date)
        
        # Find overlapping dates
        overlapping_dates = set(new_dates).intersection(set(existing_dates))
        
        if not overlapping_dates:
            continue
        
        # Check time conflicts for each overlapping date
        for date_str in overlapping_dates:
            # Determine the effective time range for both bookings on this specific date
            is_new_start = (date_str == new_start_date)
            is_new_end = (date_str == new_end_date)
            is_existing_start = (date_str == existing_start_date)
            is_existing_end = (date_str == existing_end_date)
            
            # Calculate effective time ranges
            # For new booking
            if is_new_start and is_new_end:
                # Single day or same start/end date
                new_effective_start = new_start_time
                new_effective_end = new_end_time
            elif is_new_start:
                # Start day of multi-day event
                new_effective_start = new_start_time
                new_effective_end = '11:59 PM'
            elif is_new_end:
                # End day of multi-day event
                new_effective_start = '12:00 AM'
                new_effective_end = new_end_time
            else:
                # Middle day - fully booked
                new_effective_start = '12:00 AM'
                new_effective_end = '11:59 PM'
            
            # For existing booking
            if is_existing_start and is_existing_end:
                existing_effective_start = existing_start_time
                existing_effective_end = existing_end_time
            elif is_existing_start:
                existing_effective_start = existing_start_time
                existing_effective_end = '11:59 PM'
            elif is_existing_end:
                existing_effective_start = '12:00 AM'
                existing_effective_end = existing_end_time
            else:
                existing_effective_start = '12:00 AM'
                existing_effective_end = '11:59 PM'
            
            # Check if times overlap
            if times_overlap(new_effective_start, new_effective_end, 
                           existing_effective_start, existing_effective_end):
                return True, f"Time conflict on {date_str}: {existing_effective_start} - {existing_effective_end} already booked"
    
    return False, None

def get_daily_availability(date_str, bookings):
    """
    Get available and booked time slots for a specific date.
    Returns list of available and booked periods within business hours (9 AM - 10 PM).
    """
    # Business hours constraints
    BUSINESS_START = parse_time('09:00 AM')
    BUSINESS_END = parse_time('10:00 PM')
    
    booked_periods = []
    
    for booking in bookings:
        if booking['status'] not in ['confirmed', 'pending']:
            continue
        
        start_date = booking.get('eventDate')
        end_date = booking.get('eventEndDate') or start_date
        dates = get_date_range(start_date, end_date)
        
        if date_str not in dates:
            continue
        
        # Determine effective time for this specific date
        is_start = (date_str == start_date)
        is_end = (date_str == end_date)
        start_time = booking.get('eventTimeFrom', '09:00 AM')
        end_time = booking.get('eventTimeTo', '10:00 PM')
        
        if is_start and is_end:
            effective_start = start_time
            effective_end = end_time
        elif is_start:
            effective_start = start_time
            effective_end = '10:00 PM'  # Business hours end
        elif is_end:
            effective_start = '09:00 AM'  # Business hours start
            effective_end = end_time
        else:
            # Middle day - fully booked during business hours
            effective_start = '09:00 AM'
            effective_end = '10:00 PM'
        
        # Convert to 12-hour format
        effective_start = format_time_12hr(effective_start)
        effective_end = format_time_12hr(effective_end)
        
        # Only include if within business hours
        start_parsed = parse_time(effective_start)
        end_parsed = parse_time(effective_end)
        
        # Adjust to business hours if needed
        if start_parsed and start_parsed < BUSINESS_START:
            effective_start = '09:00 AM'
        if end_parsed and end_parsed > BUSINESS_END:
            effective_end = '10:00 PM'
        
        booked_periods.append({
            'start': effective_start,
            'end': effective_end,
            'customer': booking['name'],
            'eventType': booking['eventType'],
            'isMultiDay': start_date != end_date,
            'eventDateRange': f"{start_date} to {end_date}" if start_date != end_date else start_date
        })
    
    # Sort by start time
    booked_periods.sort(key=lambda x: parse_time(x['start']) or time(0, 0))
    
    # Calculate available periods within business hours
    available_periods = []
    last_end = BUSINESS_START
    
    for period in booked_periods:
        period_start = parse_time(period['start'])
        
        if period_start and last_end and period_start > last_end:
            # There's a gap - this is available time
            available_periods.append({
                'start': format_time_12hr(last_end.strftime('%H:%M')),
                'end': period['start']
            })
        
        period_end = parse_time(period['end'])
        if period_end and (not last_end or period_end > last_end):
            last_end = period_end
    
    # Add remaining time until business hours end if available
    if last_end and last_end < BUSINESS_END:
        available_periods.append({
            'start': format_time_12hr(last_end.strftime('%H:%M')),
            'end': '10:00 PM'
        })
    
    # Check if fully booked within business hours
    is_fully_booked = len(available_periods) == 0 or (
        len(booked_periods) > 0 and 
        parse_time(booked_periods[0]['start']) <= BUSINESS_START and
        parse_time(booked_periods[-1]['end']) >= BUSINESS_END
    )
    
    return {
        'bookedPeriods': booked_periods,
        'availablePeriods': available_periods,
        'isFullyBooked': is_fully_booked
    }
