from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import inch, mm
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_RIGHT, TA_LEFT
from datetime import datetime
from pathlib import Path

# Get the assets directory
ASSETS_DIR = Path(__file__).parent / 'assets'

def generate_receipt_pdf(booking_data, output_path):
    """
    Generate a minimal, professional receipt PDF for a confirmed booking
    """
    
    # Create the PDF with A4 size and proper margins
    doc = SimpleDocTemplate(
        output_path, 
        pagesize=A4,
        rightMargin=20*mm, 
        leftMargin=20*mm,
        topMargin=15*mm, 
        bottomMargin=15*mm
    )
    
    # Calculate available width
    page_width = A4[0] - 40*mm  # 170mm available
    
    elements = []
    
    # Colors
    GOLD = colors.HexColor('#B8860B')  # Darker gold for better print
    BLACK = colors.HexColor('#000000')
    GRAY = colors.HexColor('#555555')
    
    # ============ STYLES ============
    title_style = ParagraphStyle(
        'Title',
        fontSize=18,
        textColor=BLACK,
        fontName='Helvetica-Bold',
        alignment=TA_CENTER,
        spaceAfter=2*mm
    )
    
    subtitle_style = ParagraphStyle(
        'Subtitle',
        fontSize=9,
        textColor=GRAY,
        fontName='Helvetica',
        alignment=TA_CENTER,
        spaceAfter=1*mm
    )
    
    contact_style = ParagraphStyle(
        'Contact',
        fontSize=8,
        textColor=GRAY,
        fontName='Helvetica',
        alignment=TA_CENTER,
        leading=11
    )
    
    section_title = ParagraphStyle(
        'SectionTitle',
        fontSize=10,
        textColor=BLACK,
        fontName='Helvetica-Bold',
        spaceBefore=4*mm,
        spaceAfter=2*mm
    )
    
    label_style = ParagraphStyle(
        'Label',
        fontSize=9,
        textColor=GRAY,
        fontName='Helvetica'
    )
    
    # ============ HEADER ============
    # Logo centered at top
    logo_path = ASSETS_DIR / 'kav_logo.png'
    if logo_path.exists():
        logo = Image(str(logo_path), width=20*mm, height=20*mm, kind='proportional')
        logo.hAlign = 'CENTER'
        elements.append(logo)
        elements.append(Spacer(1, 3*mm))
    
    # Company name and details
    elements.append(Paragraph("K.A.V AUDITORIUM", title_style))
    elements.append(Paragraph("Your Perfect Venue for Memorable Events", subtitle_style))
    elements.append(Paragraph(
        "Near Telephone Exchange, Mundur - I, Kerala 678592<br/>"
        "Phone: +91 82811 42276, 95679 41222 | Email: Shahul.kav@gmail.com",
        contact_style
    ))
    
    elements.append(Spacer(1, 4*mm))
    
    # Gold line
    line_table = Table([['']], colWidths=[page_width])
    line_table.setStyle(TableStyle([
        ('LINEBELOW', (0, 0), (-1, -1), 2, GOLD),
    ]))
    elements.append(line_table)
    
    # ============ RECEIPT TITLE & INVOICE INFO ============
    elements.append(Spacer(1, 4*mm))
    
    receipt_header = ParagraphStyle(
        'ReceiptHeader',
        fontSize=14,
        textColor=BLACK,
        fontName='Helvetica-Bold',
        alignment=TA_CENTER
    )
    elements.append(Paragraph("BOOKING RECEIPT", receipt_header))
    
    elements.append(Spacer(1, 3*mm))
    
    # Invoice details in a clean row
    invoice_data = [
        [
            Paragraph(f"<b>Invoice No:</b> #{booking_data.get('invoice_number', '000000')}", label_style),
            Paragraph(f"<b>Date:</b> {datetime.now().strftime('%d %b %Y')}", label_style)
        ]
    ]
    invoice_table = Table(invoice_data, colWidths=[page_width/2, page_width/2])
    invoice_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (0, 0), 'LEFT'),
        ('ALIGN', (1, 0), (1, 0), 'RIGHT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    elements.append(invoice_table)
    
    elements.append(Spacer(1, 5*mm))
    
    # ============ CUSTOMER & EVENT DETAILS ============
    # Two-column layout
    col_width = (page_width - 5*mm) / 2
    
    # Customer Details
    customer_rows = [
        [Paragraph("<b>CUSTOMER DETAILS</b>", section_title)],
        [Paragraph(f"Name: <b>{booking_data.get('customer_name', 'N/A')}</b>", label_style)],
        [Paragraph(f"Phone: <b>{booking_data.get('customer_phone', 'N/A')}</b>", label_style)],
    ]
    if booking_data.get('customer_email'):
        customer_rows.append([Paragraph(f"Email: <b>{booking_data.get('customer_email')}</b>", label_style)])
    
    # Event Details
    event_rows = [
        [Paragraph("<b>EVENT DETAILS</b>", section_title)],
        [Paragraph(f"Event Type: <b>{booking_data.get('event_type', 'Event')}</b>", label_style)],
        [Paragraph(f"Date: <b>{booking_data.get('event_date', 'N/A')}</b>", label_style)],
        [Paragraph(f"Time: <b>{booking_data.get('event_time_from', '09:00 AM')} - {booking_data.get('event_time_to', '10:00 PM')}</b>", label_style)],
    ]
    
    # Create separate tables for each column
    customer_table = Table(customer_rows, colWidths=[col_width])
    customer_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 1*mm),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 1*mm),
    ]))
    
    event_table = Table(event_rows, colWidths=[col_width])
    event_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 1*mm),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 1*mm),
    ]))
    
    # Combine in a main table
    details_table = Table([[customer_table, event_table]], colWidths=[col_width, col_width])
    details_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ('RIGHTPADDING', (0, 0), (-1, -1), 0),
    ]))
    elements.append(details_table)
    
    elements.append(Spacer(1, 6*mm))
    
    # ============ PAYMENT SUMMARY ============
    elements.append(Paragraph("<b>PAYMENT SUMMARY</b>", section_title))
    elements.append(Spacer(1, 2*mm))
    
    amount = booking_data.get('amount', 0)
    advance = booking_data.get('advance_paid', 0)
    balance = booking_data.get('balance_due', amount - advance)
    
    # Format currency
    def fmt_currency(val):
        return f"Rs. {val:,.2f}"
    
    payment_data = [
        ['Description', 'Amount'],
        ['Auditorium Booking Charges', fmt_currency(amount)],
        ['Advance Paid', f"- {fmt_currency(advance)}"],
        ['Balance Due', fmt_currency(balance)],
    ]
    
    payment_table = Table(payment_data, colWidths=[page_width * 0.65, page_width * 0.35])
    payment_table.setStyle(TableStyle([
        # Header row
        ('BACKGROUND', (0, 0), (-1, 0), BLACK),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 9),
        ('ALIGN', (0, 0), (0, -1), 'LEFT'),
        ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        # Content rows
        ('FONTNAME', (0, 1), (-1, -2), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -1), 9),
        # Balance row - highlight
        ('BACKGROUND', (0, -1), (-1, -1), colors.HexColor('#FEF9E7')),
        ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
        ('TEXTCOLOR', (1, -1), (1, -1), colors.HexColor('#C0392B')),
        # Green for advance paid
        ('TEXTCOLOR', (1, 2), (1, 2), colors.HexColor('#27AE60')),
        # Padding
        ('TOPPADDING', (0, 0), (-1, -1), 3*mm),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3*mm),
        ('LEFTPADDING', (0, 0), (-1, -1), 3*mm),
        ('RIGHTPADDING', (0, 0), (-1, -1), 3*mm),
        # Borders
        ('BOX', (0, 0), (-1, -1), 0.5, GRAY),
        ('LINEBELOW', (0, 0), (-1, 0), 1.5, GOLD),
        ('LINEABOVE', (0, -1), (-1, -1), 0.5, GRAY),
    ]))
    elements.append(payment_table)
    
    elements.append(Spacer(1, 10*mm))
    
    # ============ SIGNATURES ============
    sig_style = ParagraphStyle(
        'Signature',
        fontSize=8,
        textColor=GRAY,
        fontName='Helvetica',
        alignment=TA_CENTER
    )
    
    sig_data = [
        [
            Paragraph("____________________________", sig_style),
            Paragraph("", sig_style),
            Paragraph("____________________________", sig_style)
        ],
        [
            Paragraph("Customer Signature", sig_style),
            Paragraph("", sig_style),
            Paragraph("Authorized Signature", sig_style)
        ]
    ]
    
    sig_table = Table(sig_data, colWidths=[page_width * 0.35, page_width * 0.30, page_width * 0.35])
    sig_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 1), (-1, 1), 2*mm),
    ]))
    elements.append(sig_table)
    
    elements.append(Spacer(1, 10*mm))
    
    # ============ FOOTER ============
    # Gold line
    line_table2 = Table([['']], colWidths=[page_width])
    line_table2.setStyle(TableStyle([
        ('LINEBELOW', (0, 0), (-1, -1), 1.5, GOLD),
    ]))
    elements.append(line_table2)
    
    elements.append(Spacer(1, 3*mm))
    
    # Thank you message
    thank_style = ParagraphStyle(
        'ThankYou',
        fontSize=11,
        textColor=BLACK,
        fontName='Helvetica-Bold',
        alignment=TA_CENTER
    )
    elements.append(Paragraph("Thank You for Choosing K.A.V Auditorium!", thank_style))
    
    # Website
    web_style = ParagraphStyle(
        'Website',
        fontSize=9,
        textColor=GOLD,
        fontName='Helvetica-Bold',
        alignment=TA_CENTER,
        spaceBefore=1*mm
    )
    elements.append(Paragraph("www.kavgroup.in", web_style))
    
    elements.append(Spacer(1, 3*mm))
    
    # Terms
    terms_style = ParagraphStyle(
        'Terms',
        fontSize=7,
        textColor=GRAY,
        fontName='Helvetica',
        alignment=TA_CENTER,
        leading=9
    )
    elements.append(Paragraph(
        "This is a computer-generated receipt. Advance payment is non-refundable.<br/>"
        "Please carry this receipt on the day of the event.",
        terms_style
    ))
    
    # Build PDF
    doc.build(elements)
    return output_path
