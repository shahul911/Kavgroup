"""
K.A.V Auditorium API Server

Refactored modular architecture with route separation
"""
from dotenv import load_dotenv
# Load environment variables FIRST before any other imports
load_dotenv()

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from starlette.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
import os
import logging
from pathlib import Path

from database import db, UPLOAD_DIR, close_db_connection
from auth import hash_password
from models import AdminUser
from security import limiter, rate_limit_exceeded_handler, SecurityMiddleware
from routes import (
    auth_router,
    bookings_router,
    enquiries_router,
    content_router,
    documents_router,
    dashboard_router
)

ROOT_DIR = Path(__file__).parent

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create the main app
app = FastAPI(
    title="K.A.V Auditorium API",
    description="Secure API for K.A.V Auditorium booking system",
    version="1.0.0"
)

# Add security middleware
app.add_middleware(SecurityMiddleware)

# Add rate limiter
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, rate_limit_exceeded_handler)

# Register all routers
app.include_router(auth_router)
app.include_router(bookings_router)
app.include_router(enquiries_router)
app.include_router(content_router)
app.include_router(documents_router)
app.include_router(dashboard_router)


# Root endpoint
@app.get("/api/")
async def root():
    return {"message": "K.A.V Auditorium API"}


# Serve uploaded files - mounted under /api to ensure it goes through backend
app.mount("/api/uploads", StaticFiles(directory=str(UPLOAD_DIR.parent)), name="uploads")


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://kavgroup.in",
        "https://www.kavgroup.in",
        "https://kav-group.netlify.app",  # optional (can remove later)
        "http://localhost:3000",          # local dev
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    """Initialize on startup - create default admin user if not exists"""
    admin_username = os.environ.get('ADMIN_USERNAME', 'Shahul')
    admin_password = os.environ.get('ADMIN_PASSWORD', '110076@Catlife')
    
    admin = await db.admin_users.find_one({"username": admin_username})
    if not admin:
        hashed_pw = hash_password(admin_password)
        admin_user = AdminUser(username=admin_username, password=hashed_pw, role="admin")
        await db.admin_users.insert_one(admin_user.dict())
        logger.info("Default admin user created")


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    await close_db_connection()
