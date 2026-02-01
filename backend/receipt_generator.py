from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_RIGHT, TA_LEFT
from datetime import datetime
from pathlib import Path

# Get the assets directory
ASSETS_DIR = Path(__file__).parent / 'assets'

def generate_receipt_pdf(booking_data, output_path):
    doc = SimpleDocTemplate(
        output_path, 
        pagesize=A4,
        rightMargin=20*mm, 
        leftMargin=20*mm,
        topMargin=15*mm, 
        bottomMargin=15*mm
    )
    
    page_width = A4[0] - 40*mm 
    elements = []
    
    # Colors
    GOLD = colors.HexColor('#B8860B')
    BLACK = colors.HexColor('#000000')
    GRAY = colors.HexColor('#555555')
    
    # ============ STYLES ============
    title_style = ParagraphStyle('Title', fontSize=18, textColor=BLACK, fontName='Helvetica-Bold', alignment=TA_CENTER)
    subtitle_style = ParagraphStyle('Subtitle', fontSize=9, textColor=GRAY, fontName='Helvetica', alignment=TA_CENTER)
    contact_style = ParagraphStyle('Contact', fontSize=8, textColor=GRAY, fontName='Helvetica', alignment=TA_CENTER, leading=11)
    
    # Alignment-specific styles
    left_label_bold = ParagraphStyle('LeftBold', fontSize=10, textColor=BLACK, fontName='Helvetica-Bold', alignment=TA_LEFT)
    right_label_bold = ParagraphStyle('RightBold', fontSize=10, textColor=BLACK, fontName='Helvetica-Bold', alignment=TA_RIGHT)
    
    left_text = ParagraphStyle('LeftText', fontSize=9, textColor=GRAY, fontName='Helvetica', alignment=TA_LEFT)
    right_text = ParagraphStyle('RightText', fontSize=9, textColor=GRAY, fontName='Helvetica', alignment=TA_RIGHT)
    
    # ============ HEADER ============
    logo_path = ASSETS_DIR / 'kav_logo.png'
    if logo_path.exists():
        logo = Image(str(logo_path), width=40*mm, height=40*mm, kind='proportional')
        logo.hAlign = 'CENTER'
        elements.append(logo)
    
    # elements.append(Paragraph("K.A.V AUDITORIUM", title_style))
    # elements.append(Spacer(1, 4*mm))
    # elements.append(Paragraph("Your Perfect Venue for Memorable Events", subtitle_style))
    # elements.append(Spacer(1, 6*mm))
    # elements.append(Paragraph("Near Telephone Exchange, Mundur - I, Kerala 678592<br/>Phone: +91 82811 42276, 95679 41222 | Email: Shahul.kav@gmail.com", contact_style))
    # elements.append(Spacer(1, 4*mm))

    #dfds

    # Company name
    elements.append(Paragraph("K.A.V AUDITORIUM", title_style))

    elements.append(Spacer(1, 4*mm))
    
    # Subtitle with improved styling
    elements.append(Paragraph("<i>YOUR PERFECT VENUE FOR MEMORABLE EVENTS</i>", subtitle_style))
    
    elements.append(Spacer(1, 4*mm))
    
    # Contact details
    elements.append(Paragraph(
        "Near Telephone Exchange, Mundur - I, Kerala 678592<br/>"
        "Phone: +91 82811 42276, 95679 41222 | Email: Shahul.kav@gmail.com",
        contact_style
    ))
    elements.append(Spacer(1, 6*mm))
    #dfds
    
    # Gold Separator
    line = Table([['']], colWidths=[page_width])
    line.setStyle(TableStyle([('LINEBELOW', (0, 0), (-1, -1), 2, GOLD)]))
    elements.append(line)
    elements.append(Spacer(1, 4*mm))
    
    # ============ RECEIPT HEADER ============
    elements.append(Paragraph("BOOKING RECEIPT", ParagraphStyle('H', fontSize=14, fontName='Helvetica-Bold', alignment=TA_CENTER)))
    elements.append(Spacer(1, 4*mm))
    
    # FIXED: Invoice and Date alignment
    invoice_data = [[
        Paragraph(f"<b>Invoice No:</b> #{booking_data.get('invoice_number', '000002')}", left_text),
        Paragraph(f"<b>Date:</b> {datetime.now().strftime('%d %b %Y')}", right_text)
    ]]
    invoice_table = Table(invoice_data, colWidths=[page_width/2, page_width/2])
    invoice_table.setStyle(TableStyle([('VALIGN', (0,0), (-1,-1), 'TOP'), ('LEFTPADDING', (0,0), (-1,-1), 0), ('RIGHTPADDING', (0,0), (-1,-1), 0)]))
    elements.append(invoice_table)
    elements.append(Spacer(1, 8*mm))
    
    # ============ FIXED: CUSTOMER & EVENT DETAILS ALIGNMENT ============
    details_data = [
        [Paragraph("CUSTOMER DETAILS", left_label_bold), Paragraph("EVENT DETAILS", right_label_bold)],
        [Paragraph(f"Name: <b>{booking_data.get('customer_name', 'Basim')}</b>", left_text), 
         Paragraph(f"Event Type: <b>{booking_data.get('event_type', 'Convention')}</b>", right_text)],
        [Paragraph(f"Phone: <b>{booking_data.get('customer_phone', '6235632987')}</b>", left_text), 
         Paragraph(f"Date: <b>{booking_data.get('event_date', '2026-01-27')}</b>", right_text)],
        [Paragraph("", left_text), 
         Paragraph(f"Time: <b>{booking_data.get('event_time_from', '20:07')} - {booking_data.get('event_time_to', '20:08')}</b>", right_text)]
    ]
    
    details_table = Table(details_data, colWidths=[page_width/2, page_width/2])
    details_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 1.5*mm),
        ('LEFTPADDING', (0,0), (-1,-1), 0),
        ('RIGHTPADDING', (0,0), (-1,-1), 0),
    ]))
    elements.append(details_table)
    elements.append(Spacer(1, 8*mm))
    
    # ============ PAYMENT SUMMARY (Matches your visual) ============
    elements.append(Paragraph("PAYMENT SUMMARY", left_label_bold))
    elements.append(Spacer(1, 2*mm))
    
    amount = booking_data.get('amount', 5000)
    advance = booking_data.get('advance_paid', 1000)
    balance = amount - advance
    
    payment_data = [
        ['Description', 'Amount'],
        ['Auditorium Booking Charges', f"Rs. {amount:,.2f}"],
        ['Advance Paid', f"- Rs. {advance:,.2f}"],
        ['Balance Due', f"Rs. {balance:,.2f}"]
    ]
    
    pay_table = Table(payment_data, colWidths=[page_width*0.7, page_width*0.3])
    pay_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), BLACK),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('ALIGN', (1,0), (1,-1), 'RIGHT'),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,-1), 9),
        ('GRID', (0,0), (-1,-1), 0.5, colors.grey),
        ('BACKGROUND', (0,-1), (-1,-1), colors.HexColor('#FFF9E6')),
        ('TEXTCOLOR', (1,2), (1,2), colors.darkgreen),
        ('TEXTCOLOR', (1,3), (1,3), colors.red),
        ('TOPPADDING', (0,0), (-1,-1), 4*mm),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4*mm),
    ]))
    elements.append(pay_table)

    # ============ ADDED: DISCLAIMER SECTION ============
    elements.append(Spacer(1, 4*mm))
    disclaimer_style = ParagraphStyle(
        'Disclaimer', 
        fontSize=8, 
        textColor=colors.red, 
        fontName='Helvetica-Oblique', 
        alignment=TA_LEFT,
        leftIndent=0
    )
    elements.append(Paragraph(
        "* Kindly be informed that the advance payment is non-refundable under any circumstances.", 
        disclaimer_style
    ))
    # ===================================================
    
    # ============ SIGNATURES & FOOTER ============
    elements.append(Spacer(1, 15*mm))
    sig_data = [[Paragraph("_______________________<br/>Customer Signature", contact_style), 
                 Paragraph("_______________________<br/>Authorized Signature", contact_style)]]
    sig_table = Table(sig_data, colWidths=[page_width/2, page_width/2])
    elements.append(sig_table)
    
    elements.append(Spacer(1, 10*mm))
    elements.append(Paragraph("Thank You for Choosing K.A.V Auditorium!", ParagraphStyle('T', alignment=TA_CENTER, fontName='Helvetica-Bold')))
    elements.append(Paragraph("www.kavgroup.in", ParagraphStyle('W', alignment=TA_CENTER, textColor=GOLD, fontName='Helvetica-Bold')))
    
    doc.build(elements)
    return output_path