from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_RIGHT, TA_LEFT
from reportlab.graphics.shapes import Drawing, Rect, Line
from reportlab.graphics import renderPDF
from datetime import datetime
from pathlib import Path
import os

# Get the assets directory
ASSETS_DIR = Path(__file__).parent / 'assets'

def generate_receipt_pdf(booking_data, output_path):
    """
    Generate a professional, elegant receipt PDF for a confirmed booking
    
    booking_data should contain:
    - invoice_number
    - customer_name
    - customer_phone
    - customer_email (optional)
    - event_date
    - event_time_from
    - event_time_to
    - amount
    - advance_paid
    - balance_due
    """
    
    # Create the PDF with custom margins
    doc = SimpleDocTemplate(
        output_path, 
        pagesize=letter,
        rightMargin=0.6*inch, 
        leftMargin=0.6*inch,
        topMargin=0.4*inch, 
        bottomMargin=0.4*inch
    )
    
    # Container for elements
    elements = []
    
    # Styles
    styles = getSampleStyleSheet()
    
    # Color palette - Gold and Black theme
    GOLD = colors.HexColor('#D4AF37')
    DARK_GOLD = colors.HexColor('#B8860B')
    BLACK = colors.HexColor('#1a1a1a')
    LIGHT_GRAY = colors.HexColor('#f5f5f5')
    MEDIUM_GRAY = colors.HexColor('#666666')
    
    # Custom styles
    company_name_style = ParagraphStyle(
        'CompanyName',
        parent=styles['Heading1'],
        fontSize=28,
        textColor=GOLD,
        spaceAfter=2,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold',
        leading=32
    )
    
    tagline_style = ParagraphStyle(
        'Tagline',
        parent=styles['Normal'],
        fontSize=10,
        alignment=TA_CENTER,
        textColor=MEDIUM_GRAY,
        fontName='Helvetica-Oblique',
        spaceAfter=6
    )
    
    contact_style = ParagraphStyle(
        'Contact',
        parent=styles['Normal'],
        fontSize=9,
        alignment=TA_CENTER,
        textColor=BLACK,
        leading=14
    )
    
    receipt_title_style = ParagraphStyle(
        'ReceiptTitle',
        parent=styles['Normal'],
        fontSize=18,
        alignment=TA_CENTER,
        textColor=BLACK,
        fontName='Helvetica-Bold',
        spaceBefore=15,
        spaceAfter=15
    )
    
    section_header_style = ParagraphStyle(
        'SectionHeader',
        parent=styles['Normal'],
        fontSize=11,
        textColor=GOLD,
        fontName='Helvetica-Bold',
        spaceBefore=12,
        spaceAfter=6
    )
    
    label_style = ParagraphStyle(
        'Label',
        parent=styles['Normal'],
        fontSize=10,
        textColor=MEDIUM_GRAY
    )
    
    value_style = ParagraphStyle(
        'Value',
        parent=styles['Normal'],
        fontSize=10,
        textColor=BLACK,
        fontName='Helvetica-Bold'
    )
    
    # ============ HEADER WITH LOGO ============
    # Add logo if exists
    logo_path = ASSETS_DIR / 'kav_logo.png'
    if logo_path.exists():
        # Create a centered logo
        logo = Image(str(logo_path), width=1.2*inch, height=1.2*inch)
        logo.hAlign = 'CENTER'
        elements.append(logo)
        elements.append(Spacer(1, 8))
    
    # Company Name
    elements.append(Paragraph("K.A.V AUDITORIUM", company_name_style))
    
    # Tagline
    elements.append(Paragraph("Your Perfect Venue for Memorable Events", tagline_style))
    
    elements.append(Spacer(1, 6))
    
    # Contact Information
    contact_info = """
    Near Telephone Exchange, Mundur - I, Kerala 678592<br/>
    📞 (+91) 82811 42276, 95679 41222 &nbsp;&nbsp;|&nbsp;&nbsp; ✉ Shahul.kav@gmail.com
    """
    elements.append(Paragraph(contact_info, contact_style))
    
    # Gold decorative line
    elements.append(Spacer(1, 12))
    elements.append(HRFlowable(width="100%", thickness=2, color=GOLD, spaceBefore=0, spaceAfter=0))
    elements.append(Spacer(1, 4))
    elements.append(HRFlowable(width="100%", thickness=0.5, color=GOLD, spaceBefore=0, spaceAfter=0))
    
    # ============ RECEIPT TITLE ============
    elements.append(Paragraph("BOOKING RECEIPT", receipt_title_style))
    
    # Invoice and Date row
    invoice_date_data = [
        [
            Paragraph(f"<b>Invoice No:</b> #{booking_data.get('invoice_number', '000000')}", value_style),
            Paragraph(f"<b>Date:</b> {datetime.now().strftime('%B %d, %Y')}", value_style)
        ]
    ]
    invoice_table = Table(invoice_date_data, colWidths=[3.5*inch, 3.5*inch])
    invoice_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (0, 0), 'LEFT'),
        ('ALIGN', (1, 0), (1, 0), 'RIGHT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
    ]))
    elements.append(invoice_table)
    
    elements.append(Spacer(1, 10))
    
    # ============ CUSTOMER DETAILS ============
    elements.append(Paragraph("CUSTOMER DETAILS", section_header_style))
    
    customer_data = [
        [Paragraph("Name", label_style), Paragraph(booking_data.get('customer_name', 'N/A'), value_style)],
        [Paragraph("Phone", label_style), Paragraph(booking_data.get('customer_phone', 'N/A'), value_style)],
    ]
    if booking_data.get('customer_email'):
        customer_data.append([Paragraph("Email", label_style), Paragraph(booking_data.get('customer_email', ''), value_style)])
    
    customer_table = Table(customer_data, colWidths=[1.2*inch, 5.8*inch])
    customer_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (0, -1), 'LEFT'),
        ('ALIGN', (1, 0), (1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('BACKGROUND', (0, 0), (-1, -1), LIGHT_GRAY),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('LEFTPADDING', (0, 0), (-1, -1), 12),
        ('RIGHTPADDING', (0, 0), (-1, -1), 12),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#e0e0e0')),
    ]))
    elements.append(customer_table)
    
    elements.append(Spacer(1, 15))
    
    # ============ EVENT DETAILS TABLE ============
    elements.append(Paragraph("EVENT DETAILS", section_header_style))
    
    event_details_data = [
        [
            Paragraph('<b>DESCRIPTION</b>', value_style),
            Paragraph('<b>DATE & TIME</b>', value_style),
            Paragraph('<b>AMOUNT</b>', value_style)
        ],
        [
            Paragraph(f"Auditorium Booking<br/><font size='9' color='#666666'>{booking_data.get('event_type', 'Event')}</font>", value_style),
            Paragraph(f"{booking_data.get('event_date', 'N/A')}<br/><font size='9' color='#666666'>{booking_data.get('event_time_from', '09:00 AM')} - {booking_data.get('event_time_to', '10:00 PM')}</font>", value_style),
            Paragraph(f"₹ {booking_data.get('amount', 0):,.2f}", value_style)
        ]
    ]
    
    event_table = Table(event_details_data, colWidths=[3*inch, 2.5*inch, 1.5*inch])
    event_table.setStyle(TableStyle([
        # Header row styling
        ('BACKGROUND', (0, 0), (-1, 0), BLACK),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 10),
        ('ALIGN', (0, 0), (-1, 0), 'LEFT'),
        ('ALIGN', (-1, 0), (-1, -1), 'RIGHT'),
        
        # Data rows
        ('BACKGROUND', (0, 1), (-1, -1), colors.white),
        ('FONTSIZE', (0, 1), (-1, -1), 10),
        ('ALIGN', (0, 1), (1, -1), 'LEFT'),
        
        # Padding
        ('TOPPADDING', (0, 0), (-1, -1), 12),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ('RIGHTPADDING', (0, 0), (-1, -1), 10),
        
        # Grid
        ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#e0e0e0')),
        ('LINEBELOW', (0, 0), (-1, 0), 2, GOLD),
        
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    elements.append(event_table)
    
    elements.append(Spacer(1, 15))
    
    # ============ PAYMENT SUMMARY ============
    elements.append(Paragraph("PAYMENT SUMMARY", section_header_style))
    
    amount = booking_data.get('amount', 0)
    advance = booking_data.get('advance_paid', 0)
    balance = booking_data.get('balance_due', 0)
    
    payment_data = [
        [Paragraph('Total Amount', label_style), Paragraph(f"₹ {amount:,.2f}", value_style)],
        [Paragraph('Advance Paid', label_style), Paragraph(f"<font color='#22c55e'>₹ {advance:,.2f}</font>", value_style)],
        [Paragraph('<b>Balance Due</b>', value_style), Paragraph(f"<b><font color='#dc2626'>₹ {balance:,.2f}</font></b>", value_style)],
    ]
    
    payment_table = Table(payment_data, colWidths=[5.5*inch, 1.5*inch])
    payment_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (0, -1), 'RIGHT'),
        ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
        ('RIGHTPADDING', (0, 0), (-1, -1), 15),
        ('LEFTPADDING', (0, 0), (-1, -1), 15),
        ('BACKGROUND', (0, -1), (-1, -1), colors.HexColor('#fef3c7')),  # Light gold for balance row
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#e0e0e0')),
        ('LINEABOVE', (0, -1), (-1, -1), 2, GOLD),
    ]))
    elements.append(payment_table)
    
    elements.append(Spacer(1, 25))
    
    # ============ SIGNATURE SECTION ============
    sig_data = [
        [
            Paragraph('Customer Signature', label_style),
            Paragraph('', label_style),
            Paragraph('Authorized Signature', label_style)
        ],
        [
            '_' * 25,
            '',
            '_' * 25
        ]
    ]
    sig_table = Table(sig_data, colWidths=[2.5*inch, 2*inch, 2.5*inch])
    sig_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'BOTTOM'),
        ('TOPPADDING', (0, 0), (-1, 0), 0),
        ('BOTTOMPADDING', (0, 1), (-1, 1), 0),
        ('TOPPADDING', (0, 1), (-1, 1), 30),
        ('FONTSIZE', (0, 1), (-1, 1), 10),
        ('TEXTCOLOR', (0, 1), (-1, 1), MEDIUM_GRAY),
    ]))
    elements.append(sig_table)
    
    elements.append(Spacer(1, 30))
    
    # ============ FOOTER ============
    # Decorative lines
    elements.append(HRFlowable(width="100%", thickness=0.5, color=GOLD, spaceBefore=0, spaceAfter=0))
    elements.append(Spacer(1, 4))
    elements.append(HRFlowable(width="100%", thickness=2, color=GOLD, spaceBefore=0, spaceAfter=0))
    
    elements.append(Spacer(1, 12))
    
    # Thank you message
    thank_you_style = ParagraphStyle(
        'ThankYou',
        parent=styles['Normal'],
        fontSize=12,
        alignment=TA_CENTER,
        textColor=BLACK,
        fontName='Helvetica-Bold',
        spaceAfter=6
    )
    elements.append(Paragraph("Thank You for Choosing K.A.V Auditorium!", thank_you_style))
    
    # Website
    website_style = ParagraphStyle(
        'Website',
        parent=styles['Normal'],
        fontSize=9,
        alignment=TA_CENTER,
        textColor=GOLD,
        fontName='Helvetica-Bold'
    )
    elements.append(Paragraph("🌐 www.kavgroup.in", website_style))
    
    elements.append(Spacer(1, 10))
    
    # Terms note
    terms_style = ParagraphStyle(
        'Terms',
        parent=styles['Normal'],
        fontSize=7,
        alignment=TA_CENTER,
        textColor=MEDIUM_GRAY,
        leading=10
    )
    elements.append(Paragraph(
        "This is a computer-generated receipt. | Advance payment is non-refundable. | "
        "Please carry this receipt on the day of the event.",
        terms_style
    ))
    
    # Build PDF
    doc.build(elements)
    return output_path
