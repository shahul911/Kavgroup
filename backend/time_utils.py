from datetime import datetime, time

def parse_time(time_str):
    """Parse time string like '04:00 PM' to time object"""
    try:
        return datetime.strptime(time_str, '%I:%M %p').time()
    except:
        try:
            return datetime.strptime(time_str, '%H:%M').time()
        except:
            return None

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
