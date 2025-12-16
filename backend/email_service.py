import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
import logging

logger = logging.getLogger(__name__)

def send_booking_notification(enquiry_data: dict) -> bool:
    """
    Send email notification when a new booking request/enquiry is submitted
    
    Args:
        enquiry_data: Dictionary containing enquiry details
            - name: Customer name
            - phone: Customer phone
            - eventType: Type of event
            - eventDate: Event date
            - eventEndDate: Event end date (optional)
            - eventTimeFrom: Event start time
            - eventTimeTo: Event end time
    
    Returns:
        bool: True if email sent successfully, False otherwise
    """
    
    # Get SMTP credentials from environment
    smtp_email = os.environ.get('SMTP_EMAIL')
    smtp_password = os.environ.get('SMTP_PASSWORD')
    notification_email = os.environ.get('NOTIFICATION_EMAIL')
    
    if not all([smtp_email, smtp_password, notification_email]):
        logger.warning("Email credentials not configured. Skipping notification.")
        return False
    
    try:
        # Create message
        msg = MIMEMultipart('alternative')
        msg['Subject'] = f"🔔 New Booking Request - {enquiry_data.get('name', 'Unknown')}"
        msg['From'] = f"K.A.V Auditorium <{smtp_email}>"
        msg['To'] = notification_email
        
        # Format date display
        event_date = enquiry_data.get('eventDate', 'Not specified')
        event_end_date = enquiry_data.get('eventEndDate')
        date_display = event_date
        if event_end_date and event_end_date != event_date:
            date_display = f"{event_date} to {event_end_date}"
        
        # Plain text version
        text_content = f"""
NEW BOOKING REQUEST RECEIVED

Customer Details:
-----------------
Name: {enquiry_data.get('name', 'N/A')}
Phone: {enquiry_data.get('phone', 'N/A')}

Event Details:
--------------
Event Type: {enquiry_data.get('eventType', 'N/A')}
Date: {date_display}
Time: {enquiry_data.get('eventTimeFrom', '09:00 AM')} - {enquiry_data.get('eventTimeTo', '10:00 PM')}

Please login to the admin panel to review and respond to this request.

--
K.A.V Auditorium
Near Telephone Exchange, Mundur - I, Kerala 678592
Phone: (+91) 82811 42276, 95679 41222
"""
        
        # HTML version
        html_content = f"""
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); color: #D4AF37; padding: 25px; text-align: center; border-radius: 10px 10px 0 0; }}
        .header h1 {{ margin: 0; font-size: 24px; }}
        .header p {{ margin: 5px 0 0; color: #ccc; font-size: 14px; }}
        .content {{ background: #fff; padding: 25px; border: 1px solid #e0e0e0; }}
        .alert-badge {{ display: inline-block; background: #D4AF37; color: #000; padding: 8px 16px; border-radius: 20px; font-weight: bold; margin-bottom: 20px; }}
        .section {{ margin-bottom: 20px; }}
        .section-title {{ color: #D4AF37; font-size: 14px; font-weight: bold; text-transform: uppercase; margin-bottom: 10px; border-bottom: 2px solid #D4AF37; padding-bottom: 5px; }}
        .detail-row {{ display: flex; padding: 8px 0; border-bottom: 1px solid #f0f0f0; }}
        .detail-label {{ width: 120px; color: #666; font-size: 14px; }}
        .detail-value {{ flex: 1; font-weight: bold; color: #333; font-size: 14px; }}
        .cta-button {{ display: inline-block; background: #D4AF37; color: #000; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 15px; }}
        .footer {{ background: #f8f8f8; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0; border-top: none; }}
        .footer p {{ margin: 5px 0; color: #666; font-size: 12px; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>K.A.V AUDITORIUM</h1>
            <p>Booking Notification System</p>
        </div>
        <div class="content">
            <div class="alert-badge">🔔 New Booking Request</div>
            
            <div class="section">
                <div class="section-title">Customer Details</div>
                <div class="detail-row">
                    <span class="detail-label">Name</span>
                    <span class="detail-value">{enquiry_data.get('name', 'N/A')}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Phone</span>
                    <span class="detail-value"><a href="tel:{enquiry_data.get('phone', '')}" style="color: #D4AF37;">{enquiry_data.get('phone', 'N/A')}</a></span>
                </div>
            </div>
            
            <div class="section">
                <div class="section-title">Event Details</div>
                <div class="detail-row">
                    <span class="detail-label">Event Type</span>
                    <span class="detail-value">{enquiry_data.get('eventType', 'N/A')}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Date</span>
                    <span class="detail-value">{date_display}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Time</span>
                    <span class="detail-value">{enquiry_data.get('eventTimeFrom', '09:00 AM')} - {enquiry_data.get('eventTimeTo', '10:00 PM')}</span>
                </div>
            </div>
            
            <p style="color: #666; font-size: 14px;">Please login to the admin panel to review and respond to this booking request.</p>
        </div>
        <div class="footer">
            <p><strong>K.A.V Auditorium</strong></p>
            <p>Near Telephone Exchange, Mundur - I, Kerala 678592</p>
            <p>📞 (+91) 82811 42276, 95679 41222</p>
        </div>
    </div>
</body>
</html>
"""
        
        # Attach both versions
        part1 = MIMEText(text_content, 'plain')
        part2 = MIMEText(html_content, 'html')
        msg.attach(part1)
        msg.attach(part2)
        
        # Send email via Gmail SMTP
        with smtplib.SMTP_SSL('smtp.gmail.com', 465) as server:
            server.login(smtp_email, smtp_password)
            server.sendmail(smtp_email, notification_email, msg.as_string())
        
        logger.info(f"Booking notification email sent for: {enquiry_data.get('name')}")
        return True
        
    except smtplib.SMTPAuthenticationError as e:
        logger.error(f"SMTP Authentication failed: {e}")
        return False
    except smtplib.SMTPException as e:
        logger.error(f"SMTP error occurred: {e}")
        return False
    except Exception as e:
        logger.error(f"Failed to send notification email: {e}")
        return False
