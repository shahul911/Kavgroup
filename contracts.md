# K.A.V Auditorium - API Contracts & Implementation Plan

## Overview
This document outlines the backend implementation plan for K.A.V Auditorium website, including API contracts, data models, and integration strategy.

---

## 1. MongoDB Models

### 1.1 Booking Model
```javascript
{
  _id: ObjectId,
  name: String (required),
  phone: String (required),
  eventDate: Date (required),
  eventType: String (required), // Wedding, Reception, Birthday, etc.
  status: String (default: 'pending'), // pending, confirmed, cancelled
  notes: String (optional),
  createdAt: Date,
  updatedAt: Date
}
```

### 1.2 Enquiry Model
```javascript
{
  _id: ObjectId,
  name: String (required),
  phone: String (required),
  eventDate: Date (required),
  eventType: String (required),
  status: String (default: 'new'), // new, contacted, follow-up, closed
  followUpDate: Date (optional),
  followUpReminder: Boolean (default: false),
  notes: String (optional),
  createdAt: Date,
  updatedAt: Date
}
```

### 1.3 Admin User Model
```javascript
{
  _id: ObjectId,
  username: String (required, unique),
  password: String (required, hashed),
  createdAt: Date,
  updatedAt: Date
}
```

### 1.4 Document Model
```javascript
{
  _id: ObjectId,
  documentType: String (required), // water-test, building-tax, land-tax, electricity-bill, staff-payment
  fileName: String (required),
  fileUrl: String (required),
  fileSize: Number,
  uploadDate: Date (required),
  billDate: Date (optional),
  dueDate: Date (optional),
  reminderDate: Date (optional),
  reminderEnabled: Boolean (default: false),
  amount: Number (optional),
  notes: String (optional),
  createdAt: Date,
  updatedAt: Date
}
```

---

## 2. API Endpoints

### 2.1 Public Endpoints (Frontend)

#### POST /api/bookings
Request a new booking
```json
Request Body:
{
  "name": "string",
  "phone": "string",
  "eventDate": "ISO date string",
  "eventType": "string"
}

Response: 201 Created
{
  "success": true,
  "message": "Booking request submitted successfully",
  "booking": { booking object }
}
```

#### POST /api/enquiries
Submit an enquiry
```json
Request Body:
{
  "name": "string",
  "phone": "string",
  "eventDate": "ISO date string",
  "eventType": "string"
}

Response: 201 Created
{
  "success": true,
  "message": "Enquiry submitted successfully",
  "enquiry": { enquiry object }
}
```

#### GET /api/bookings/availability
Get all booked dates
```json
Response: 200 OK
{
  "bookedDates": ["2025-08-15", "2025-08-20", ...]
}
```

### 2.2 Admin Endpoints (Protected with JWT)

#### POST /api/admin/login
Admin authentication
```json
Request Body:
{
  "username": "string",
  "password": "string"
}

Response: 200 OK
{
  "success": true,
  "token": "JWT token",
  "user": { username }
}
```

#### GET /api/admin/bookings
Get all bookings with filters
```json
Query Params: ?status=pending&date=2025-08
Response: 200 OK
{
  "bookings": [ array of bookings ]
}
```

#### PUT /api/admin/bookings/:id
Update booking status
```json
Request Body:
{
  "status": "confirmed" | "cancelled",
  "notes": "string (optional)"
}

Response: 200 OK
{
  "success": true,
  "booking": { updated booking }
}
```

#### GET /api/admin/enquiries
Get all enquiries with filters
```json
Query Params: ?status=new
Response: 200 OK
{
  "enquiries": [ array of enquiries ]
}
```

#### PUT /api/admin/enquiries/:id
Update enquiry and set follow-up reminder
```json
Request Body:
{
  "status": "contacted" | "follow-up" | "closed",
  "followUpDate": "ISO date string (optional)",
  "followUpReminder": boolean,
  "notes": "string (optional)"
}

Response: 200 OK
{
  "success": true,
  "enquiry": { updated enquiry }
}
```

#### POST /api/admin/documents
Upload a document
```json
Request: multipart/form-data
- file: File
- documentType: string
- billDate: date (optional)
- dueDate: date (optional)
- reminderDate: date (optional)
- reminderEnabled: boolean
- amount: number (optional)
- notes: string (optional)

Response: 201 Created
{
  "success": true,
  "document": { document object }
}
```

#### GET /api/admin/documents
Get all documents
```json
Query Params: ?documentType=electricity-bill
Response: 200 OK
{
  "documents": [ array of documents ]
}
```

#### DELETE /api/admin/documents/:id
Delete a document
```json
Response: 200 OK
{
  "success": true,
  "message": "Document deleted"
}
```

#### GET /api/admin/reminders
Get all pending reminders (enquiry follow-ups + document reminders)
```json
Response: 200 OK
{
  "enquiryReminders": [ enquiries needing follow-up ],
  "documentReminders": [ documents with upcoming due dates ]
}
```

---

## 3. Frontend Integration Changes

### 3.1 Remove from mock.js
- `bookedDates` - will come from API
- `submitEnquiry()` - will use API call
- `submitBooking()` - will use API call

### 3.2 Update Components

**BookingCalendar.jsx**
- Fetch booked dates from `/api/bookings/availability`
- Submit booking via `/api/bookings`

**EnquiryForm.jsx**
- Submit enquiry via `/api/enquiries`

**Admin Components (New)**
- Login page at `/admin-kav-Catlife41056`
- Protected admin dashboard
- Bookings management
- Enquiries management with reminders
- Document management with file upload
- Reminders/Follow-up dashboard

---

## 4. Authentication Strategy

- JWT-based authentication
- Admin credentials stored in MongoDB (hashed password)
- Protected routes require valid JWT token
- Token stored in localStorage
- Auto-logout on token expiry

---

## 5. File Upload Strategy

- Use `multer` for file uploads
- Store files in `/app/backend/uploads/documents/`
- Create persistent volume mount for files
- File types allowed: PDF, JPG, PNG, JPEG
- Max file size: 10MB

---

## 6. Reminder System

### Enquiry Follow-ups
- Admin sets `followUpDate` and enables reminder
- Dashboard shows enquiries needing follow-up today/overdue

### Document Reminders
- Admin sets `reminderDate` for bill cycles
- Dashboard shows documents with upcoming due dates (within 7 days)

---

## 7. Implementation Order

1. ✅ Frontend (Gallery, Testimonials) - DONE
2. Backend Models & Database setup
3. Admin authentication system
4. Public booking/enquiry APIs
5. Admin CRUD APIs
6. File upload functionality
7. Admin UI components
8. Integration & testing

---

## 8. Security Considerations

- Password hashing using bcrypt
- JWT token validation
- File upload validation
- SQL injection prevention (using Mongoose)
- XSS prevention
- CORS configuration
- Admin route protection
