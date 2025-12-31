"""Routes package"""
from .auth import router as auth_router
from .bookings import router as bookings_router
from .enquiries import router as enquiries_router
from .content import router as content_router
from .documents import router as documents_router
from .dashboard import router as dashboard_router

__all__ = [
    'auth_router',
    'bookings_router',
    'enquiries_router',
    'content_router',
    'documents_router',
    'dashboard_router'
]
