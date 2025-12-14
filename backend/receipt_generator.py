from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_RIGHT, TA_LEFT
from datetime import datetime
from pathlib import Path
import os

def generate_receipt_pdf(booking_data, output_path):
    """
    Generate a receipt PDF for a confirmed booking
    
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
    
    # Create the PDF
    doc = SimpleDocTemplate(output_path, pagesize=letter,
                           rightMargin=0.5*inch, leftMargin=0.5*inch,
                           topMargin=0.5*inch, bottomMargin=0.5*inch)
    
    # Container for elements
    elements = []
    
    # Styles
    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor('#D4AF37'),
        spaceAfter=6,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold'
    )
    
    header_style = ParagraphStyle(
        'Header',
        parent=styles['Normal'],
        fontSize=10,
        alignment=TA_CENTER,
        textColor=colors.black
    )
    
    receipt_title_style = ParagraphStyle(
        'ReceiptTitle',
        parent=styles['Normal'],
        fontSize=14,
        alignment=TA_CENTER,
        textColor=colors.grey,
        spaceAfter=12
    )
    
    label_style = ParagraphStyle(
        'Label',
        parent=styles['Normal'],
        fontSize=10,
        textColor=colors.grey
    )
    
    value_style = ParagraphStyle(
        'Value',
        parent=styles['Normal'],
        fontSize=10,
        textColor=colors.black,
        fontName='Helvetica-Bold'
    )
    
    # Header - Company Name
    elements.append(Paragraph("K.A.V AUDITORIUM", title_style))
    elements.append(Spacer(1, 6))
    
    # Address and contact
    contact_info = """
    Near Telephone Exchange, Mundur - I, Kerala 678592<br/>
    Phone: (+91) 82811 42276, 95679 41222 | Email: Shahul.kav@gmail.com
    """
    elements.append(Paragraph(contact_info, header_style))
    elements.append(Spacer(1, 20))
    
    # Receipt/Invoice title
    elements.append(Paragraph("Receipt / Invoice", receipt_title_style))
    elements.append(Spacer(1, 12))
    
    # Invoice details (Invoice No and Date)
    invoice_data = [
        [Paragraph(f"<b>Invoice No :</b> {booking_data.get('invoice_number', 'N/A')}", value_style),
         Paragraph(f"<b>Date:</b> {datetime.now().strftime('%B %d, %Y')}", value_style)]
    ]
    invoice_table = Table(invoice_data, colWidths=[4*inch, 3*inch])
    invoice_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    elements.append(invoice_table)
    elements.append(Spacer(1, 20))
    
    # Bill To section
    elements.append(Paragraph("<b>Bill To :</b>", value_style))
    elements.append(Spacer(1, 6))
    bill_to_data = [
        [Paragraph(booking_data.get('customer_name', 'N/A'), value_style)],
        [Paragraph(f"{booking_data.get('customer_phone', 'N/A')}", label_style)],
        [Paragraph(f"{booking_data.get('customer_email', '')}", label_style)]
    ]
    bill_to_table = Table(bill_to_data, colWidths=[7*inch])
    bill_to_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    elements.append(bill_to_table)
    elements.append(Spacer(1, 20))
    
    # Booking details table
    booking_details_data = [
        [Paragraph('<b>DESCRIPTION</b>', value_style),
         Paragraph('<b>FROM</b>', value_style),
         Paragraph('<b>TO</b>', value_style),
         Paragraph('<b>AMOUNT</b>', value_style)],
        [
            Paragraph(f"Auditorium Booking (Event)<br/>{booking_data.get('event_type', '')}", label_style),
            Paragraph(f"Date: {booking_data.get('event_date', 'N/A')}<br/>Time: {booking_data.get('event_time_from', '07:00 AM')}", label_style),
            Paragraph(f"Date: {booking_data.get('event_date', 'N/A')}<br/>Time: {booking_data.get('event_time_to', '08:00 PM')}", label_style),
            Paragraph(f"{booking_data.get('amount', 0):,.2f}", value_style)
        ]
    ]
    
    booking_table = Table(booking_details_data, colWidths=[2.5*inch, 1.75*inch, 1.75*inch, 1*inch])
    booking_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#F5F5F5')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.black),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('ALIGN', (-1, 0), (-1, -1), 'RIGHT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('TOPPADDING', (0, 1), (-1, -1), 12),
        ('BOTTOMPADDING', (0, 1), (-1, -1), 12),
        ('GRID', (0, 0), (-1, -1), 1, colors.grey),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    elements.append(booking_table)
    elements.append(Spacer(1, 20))
    
    # Financial summary
    amount = booking_data.get('amount', 0)
    advance = booking_data.get('advance_paid', 0)
    balance = booking_data.get('balance_due', 0)
    
    summary_data = [
        ['', '', Paragraph('<b>Total Amount</b>', value_style), Paragraph(f"<b>Rs. {amount:,.2f}</b>", value_style)],
        ['', '', Paragraph('<b>Advance Paid</b>', value_style), Paragraph(f"<b>Rs. {advance:,.2f}</b>", value_style)],
        ['', '', Paragraph('<b>Balance Due</b>', value_style), Paragraph(f"<b>Rs. {balance:,.2f}</b>", value_style)],
    ]
    
    summary_table = Table(summary_data, colWidths=[2.5*inch, 1.75*inch, 1.75*inch, 1*inch])
    summary_table.setStyle(TableStyle([
        ('ALIGN', (-2, 0), (-1, -1), 'RIGHT'),
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    elements.append(summary_table)
    elements.append(Spacer(1, 30))
    
    # Authorization section
    auth_data = [
        [Paragraph('<b>Authorized Signature :</b>', value_style), Paragraph('<b>Date :</b>', value_style)],
        ['', ''],
        ['', '']
    ]
    auth_table = Table(auth_data, colWidths=[4*inch, 3*inch])
    auth_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('LINEABOVE', (0, 1), (0, 1), 1, colors.black),
        ('LINEABOVE', (1, 1), (1, 1), 1, colors.black),
    ]))
    elements.append(auth_table)
    elements.append(Spacer(1, 40))
    
    # Footer
    footer_style = ParagraphStyle(
        'Footer',
        parent=styles['Normal'],
        fontSize=10,
        alignment=TA_CENTER,
        textColor=colors.black
    )
    
    elements.append(Paragraph("Thank you for choosing K.A.V Auditorium for your event.", footer_style))
    elements.append(Spacer(1, 10))
    
    website_style = ParagraphStyle(
        'Website',
        parent=styles['Normal'],
        fontSize=8,
        alignment=TA_CENTER,
        textColor=colors.grey
    )
    elements.append(Paragraph("www.kavgroup.in", website_style))
    
    # Build PDF
    doc.build(elements)
    return output_path
