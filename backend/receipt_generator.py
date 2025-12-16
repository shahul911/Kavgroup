from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_RIGHT, TA_LEFT
from datetime import datetime
from pathlib import Path

# Get the assets directory
ASSETS_DIR = Path(__file__).parent / 'assets'

def generate_receipt_pdf(booking_data, output_path):
    """
    Generate a professional, elegant receipt PDF for a confirmed booking - Single Page
    """
    
    # Create the PDF with custom margins
    doc = SimpleDocTemplate(
        output_path, 
        pagesize=letter,
        rightMargin=0.5*inch, 
        leftMargin=0.5*inch,
        topMargin=0.3*inch, 
        bottomMargin=0.3*inch
    )
    
    # Container for elements
    elements = []
    
    # Styles
    styles = getSampleStyleSheet()
    
    # Color palette - Gold and Black theme
    GOLD = colors.HexColor('#D4AF37')
    BLACK = colors.HexColor('#1a1a1a')
    LIGHT_GRAY = colors.HexColor('#f8f8f8')
    MEDIUM_GRAY = colors.HexColor('#666666')
    
    # Custom styles
    company_name_style = ParagraphStyle(
        'CompanyName',
        parent=styles['Heading1'],
        fontSize=22,
        textColor=GOLD,
        spaceAfter=0,
        alignment=TA_LEFT,
        fontName='Helvetica-Bold',
        leading=26
    )
    
    tagline_style = ParagraphStyle(
        'Tagline',
        parent=styles['Normal'],
        fontSize=8,
        alignment=TA_LEFT,
        textColor=MEDIUM_GRAY,
        fontName='Helvetica-Oblique'
    )
    
    contact_style = ParagraphStyle(
        'Contact',
        parent=styles['Normal'],
        fontSize=8,
        alignment=TA_LEFT,
        textColor=BLACK,
        leading=11
    )
    
    receipt_title_style = ParagraphStyle(
        'ReceiptTitle',
        parent=styles['Normal'],
        fontSize=14,
        alignment=TA_CENTER,
        textColor=BLACK,
        fontName='Helvetica-Bold',
        spaceBefore=8,
        spaceAfter=8
    )
    
    section_header_style = ParagraphStyle(
        'SectionHeader',
        parent=styles['Normal'],
        fontSize=9,
        textColor=GOLD,
        fontName='Helvetica-Bold',
        spaceBefore=8,
        spaceAfter=4
    )
    
    label_style = ParagraphStyle(
        'Label',
        parent=styles['Normal'],
        fontSize=9,
        textColor=MEDIUM_GRAY
    )
    
    value_style = ParagraphStyle(
        'Value',
        parent=styles['Normal'],
        fontSize=9,
        textColor=BLACK,
        fontName='Helvetica-Bold'
    )
    
    small_style = ParagraphStyle(
        'Small',
        parent=styles['Normal'],
        fontSize=8,
        textColor=MEDIUM_GRAY
    )
    
    # ============ HEADER WITH LOGO ON LEFT ============
    logo_path = ASSETS_DIR / 'kav_logo.png'
    
    # Create header with logo on left, company info on right
    if logo_path.exists():
        # Logo - smaller size, maintaining aspect ratio
        logo = Image(str(logo_path), width=0.8*inch, height=0.8*inch, kind='proportional')
        
        # Company info column
        company_info = [
            Paragraph("K.A.V AUDITORIUM", company_name_style),
            Paragraph("Your Perfect Venue for Memorable Events", tagline_style),
            Spacer(1, 4),
            Paragraph("Near Telephone Exchange, Mundur - I, Kerala 678592", contact_style),
            Paragraph("📞 (+91) 82811 42276, 95679 41222 | ✉ Shahul.kav@gmail.com", contact_style),
        ]
        
        # Header table with logo on left
        header_data = [[logo, company_info]]
        header_table = Table(header_data, colWidths=[1*inch, 6.5*inch])
        header_table.setStyle(TableStyle([
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('ALIGN', (0, 0), (0, 0), 'LEFT'),
            ('ALIGN', (1, 0), (1, 0), 'LEFT'),
            ('LEFTPADDING', (0, 0), (-1, -1), 0),
            ('RIGHTPADDING', (0, 0), (-1, -1), 0),
            ('TOPPADDING', (0, 0), (-1, -1), 0),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
        ]))
        elements.append(header_table)
    else:
        # Fallback if no logo
        elements.append(Paragraph("K.A.V AUDITORIUM", company_name_style))
        elements.append(Paragraph("Your Perfect Venue for Memorable Events", tagline_style))
    
    # Gold decorative line
    elements.append(Spacer(1, 8))
    elements.append(HRFlowable(width="100%", thickness=2, color=GOLD, spaceBefore=0, spaceAfter=0))
    
    # ============ RECEIPT TITLE & INVOICE INFO ============
    # Combined title and invoice row
    title_invoice_data = [
        [
            Paragraph("BOOKING RECEIPT", receipt_title_style),
            Paragraph(f"<b>Invoice:</b> #{booking_data.get('invoice_number', '000000')}&nbsp;&nbsp;|&nbsp;&nbsp;<b>Date:</b> {datetime.now().strftime('%b %d, %Y')}", small_style)
        ]
    ]
    title_table = Table(title_invoice_data, colWidths=[4*inch, 3.5*inch])
    title_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (0, 0), 'LEFT'),
        ('ALIGN', (1, 0), (1, 0), 'RIGHT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    elements.append(title_table)
    
    # ============ CUSTOMER & EVENT DETAILS SIDE BY SIDE ============
    elements.append(Spacer(1, 6))
    
    # Customer details
    customer_content = [
        Paragraph("CUSTOMER DETAILS", section_header_style),
        Paragraph(f"<b>Name:</b> {booking_data.get('customer_name', 'N/A')}", small_style),
        Paragraph(f"<b>Phone:</b> {booking_data.get('customer_phone', 'N/A')}", small_style),
    ]
    if booking_data.get('customer_email'):
        customer_content.append(Paragraph(f"<b>Email:</b> {booking_data.get('customer_email', '')}", small_style))
    
    # Event details
    event_content = [
        Paragraph("EVENT DETAILS", section_header_style),
        Paragraph(f"<b>Event:</b> {booking_data.get('event_type', 'Event')}", small_style),
        Paragraph(f"<b>Date:</b> {booking_data.get('event_date', 'N/A')}", small_style),
        Paragraph(f"<b>Time:</b> {booking_data.get('event_time_from', '09:00 AM')} - {booking_data.get('event_time_to', '10:00 PM')}", small_style),
    ]
    
    # Side by side layout
    details_data = [[customer_content, event_content]]
    details_table = Table(details_data, colWidths=[3.75*inch, 3.75*inch])
    details_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('BACKGROUND', (0, 0), (-1, -1), LIGHT_GRAY),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#e0e0e0')),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ('RIGHTPADDING', (0, 0), (-1, -1), 10),
    ]))
    elements.append(details_table)
    
    elements.append(Spacer(1, 10))
    
    # ============ PAYMENT SUMMARY TABLE ============
    elements.append(Paragraph("PAYMENT SUMMARY", section_header_style))
    
    amount = booking_data.get('amount', 0)
    advance = booking_data.get('advance_paid', 0)
    balance = booking_data.get('balance_due', 0)
    
    payment_data = [
        [Paragraph('<b>Description</b>', value_style), Paragraph('<b>Amount</b>', value_style)],
        [Paragraph('Auditorium Booking Charges', small_style), Paragraph(f"₹ {amount:,.2f}", value_style)],
        [Paragraph('Advance Paid', small_style), Paragraph(f"<font color='#16a34a'>- ₹ {advance:,.2f}</font>", value_style)],
        [Paragraph('<b>Balance Due</b>', value_style), Paragraph(f"<b><font color='#dc2626'>₹ {balance:,.2f}</font></b>", value_style)],
    ]
    
    payment_table = Table(payment_data, colWidths=[5.5*inch, 2*inch])
    payment_table.setStyle(TableStyle([
        # Header
        ('BACKGROUND', (0, 0), (-1, 0), BLACK),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('ALIGN', (0, 0), (0, -1), 'LEFT'),
        ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        # Padding
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ('RIGHTPADDING', (0, 0), (-1, -1), 10),
        # Grid
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e0e0e0')),
        ('LINEBELOW', (0, 0), (-1, 0), 2, GOLD),
        # Balance row highlight
        ('BACKGROUND', (0, -1), (-1, -1), colors.HexColor('#fef3c7')),
        ('LINEABOVE', (0, -1), (-1, -1), 1.5, GOLD),
    ]))
    elements.append(payment_table)
    
    elements.append(Spacer(1, 15))
    
    # ============ SIGNATURE SECTION ============
    sig_data = [
        [
            Paragraph('Customer Signature', label_style),
            Paragraph('', label_style),
            Paragraph('Authorized Signature', label_style)
        ],
        ['_' * 22, '', '_' * 22]
    ]
    sig_table = Table(sig_data, colWidths=[2.5*inch, 2.5*inch, 2.5*inch])
    sig_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'BOTTOM'),
        ('TOPPADDING', (0, 1), (-1, 1), 20),
        ('FONTSIZE', (0, 1), (-1, 1), 9),
        ('TEXTCOLOR', (0, 1), (-1, 1), MEDIUM_GRAY),
    ]))
    elements.append(sig_table)
    
    elements.append(Spacer(1, 15))
    
    # ============ FOOTER ============
    elements.append(HRFlowable(width="100%", thickness=1.5, color=GOLD, spaceBefore=0, spaceAfter=0))
    
    elements.append(Spacer(1, 8))
    
    # Thank you and website
    footer_style = ParagraphStyle(
        'Footer',
        parent=styles['Normal'],
        fontSize=10,
        alignment=TA_CENTER,
        textColor=BLACK,
        fontName='Helvetica-Bold'
    )
    elements.append(Paragraph("Thank You for Choosing K.A.V Auditorium!", footer_style))
    
    website_style = ParagraphStyle(
        'Website',
        parent=styles['Normal'],
        fontSize=8,
        alignment=TA_CENTER,
        textColor=GOLD,
        fontName='Helvetica-Bold'
    )
    elements.append(Paragraph("🌐 www.kavgroup.in", website_style))
    
    elements.append(Spacer(1, 6))
    
    # Terms
    terms_style = ParagraphStyle(
        'Terms',
        parent=styles['Normal'],
        fontSize=7,
        alignment=TA_CENTER,
        textColor=MEDIUM_GRAY,
        leading=9
    )
    elements.append(Paragraph(
        "This is a computer-generated receipt. | Advance payment is non-refundable. | Please carry this receipt on the day of the event.",
        terms_style
    ))
    
    # Build PDF
    doc.build(elements)
    return output_path
