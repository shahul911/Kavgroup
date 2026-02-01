from twilio.rest import Client
import os
import logging

logger = logging.getLogger(__name__)

def send_whatsapp_notification(enquiry_data: dict) -> bool:
    """
    Send WhatsApp notification when a new booking request/enquiry is submitted
    """
    
    account_sid = os.environ.get('TWILIO_ACCOUNT_SID')
    auth_token = os.environ.get('TWILIO_AUTH_TOKEN')
    from_number = os.environ.get('TWILIO_FROM_NUMBER')
    to_number = os.environ.get('WHATSAPP_TO_NUMBER')
    
    # Check if credentials are placeholders or missing
    if not all([account_sid, auth_token, from_number, to_number]) or 'YOUR_SID_HERE' in account_sid:
        logger.warning("Twilio credentials not configured properly. Skipping WhatsApp notification.")
        return False
    
    try:
        client = Client(account_sid, auth_token)
        
        # Format date display
        event_date = enquiry_data.get('eventDate', 'Not specified')
        event_end_date = enquiry_data.get('eventEndDate')
        date_display = event_date
        if event_end_date and event_end_date != event_date:
            date_display = f"{event_date} to {event_end_date}"
            
        message_body = (
            f"🔔 *New Booking Request*\n\n"
            f"👤 *Name:* {enquiry_data.get('name', 'N/A')}\n"
            f"📱 *Phone:* {enquiry_data.get('phone', 'N/A')}\n"
            f"🎉 *Event:* {enquiry_data.get('eventType', 'N/A')}\n"
            f"📅 *Date:* {date_display}\n\n"
            f"Please check admin panel for details."
        )
        
        message = client.messages.create(
            from_=from_number,
            body=message_body,
            to=to_number
        )
        
        logger.info(f"WhatsApp notification sent. SID: {message.sid}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send WhatsApp notification: {e}")
        return False
