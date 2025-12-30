"""
Security middleware and utilities for K.A.V Auditorium API
Implements rate limiting, bot protection, and security headers
"""

from fastapi import Request, HTTPException, status
from fastapi.responses import JSONResponse
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from starlette.middleware.base import BaseHTTPMiddleware
from datetime import datetime, timedelta
from collections import defaultdict
import re
import hashlib
import time
import logging

logger = logging.getLogger(__name__)

# ==================== RATE LIMITER ====================
# Initialize rate limiter
limiter = Limiter(key_func=get_remote_address)

def rate_limit_exceeded_handler(request: Request, exc: RateLimitExceeded):
    """Custom handler for rate limit exceeded"""
    logger.warning(f"Rate limit exceeded for IP: {get_remote_address(request)}")
    return JSONResponse(
        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
        content={
            "error": "Too many requests",
            "message": "You have exceeded the allowed number of requests. Please try again later.",
            "retry_after": 60
        }
    )

# ==================== IP BLOCKING ====================
class IPBlocker:
    """Track and block suspicious IPs"""
    
    def __init__(self):
        self.failed_attempts = defaultdict(list)  # IP -> list of timestamps
        self.blocked_ips = {}  # IP -> block_until timestamp
        self.suspicious_patterns = defaultdict(int)  # IP -> suspicion score
        
        # Thresholds
        self.MAX_FAILED_ATTEMPTS = 10  # Max failed attempts before block
        self.FAILED_ATTEMPT_WINDOW = 300  # 5 minutes window
        self.BLOCK_DURATION = 900  # 15 minutes block
        self.SUSPICIOUS_THRESHOLD = 50  # Suspicion score threshold
    
    def is_blocked(self, ip: str) -> bool:
        """Check if IP is currently blocked"""
        if ip in self.blocked_ips:
            if datetime.now() < self.blocked_ips[ip]:
                return True
            else:
                # Block expired, remove it
                del self.blocked_ips[ip]
                self.suspicious_patterns[ip] = 0
        return False
    
    def record_failed_attempt(self, ip: str, reason: str = ""):
        """Record a failed attempt from an IP"""
        now = datetime.now()
        
        # Clean old attempts
        self.failed_attempts[ip] = [
            ts for ts in self.failed_attempts[ip]
            if now - ts < timedelta(seconds=self.FAILED_ATTEMPT_WINDOW)
        ]
        
        # Add new attempt
        self.failed_attempts[ip].append(now)
        
        # Increase suspicion score
        self.suspicious_patterns[ip] += 1
        
        logger.warning(f"Failed attempt from {ip}: {reason}")
        
        # Check if should block
        if len(self.failed_attempts[ip]) >= self.MAX_FAILED_ATTEMPTS:
            self.block_ip(ip, f"Too many failed attempts: {reason}")
    
    def block_ip(self, ip: str, reason: str = ""):
        """Block an IP address"""
        self.blocked_ips[ip] = datetime.now() + timedelta(seconds=self.BLOCK_DURATION)
        logger.warning(f"Blocked IP {ip} until {self.blocked_ips[ip]}: {reason}")
    
    def record_suspicious_activity(self, ip: str, score: int = 5):
        """Record suspicious activity from an IP"""
        self.suspicious_patterns[ip] += score
        
        if self.suspicious_patterns[ip] >= self.SUSPICIOUS_THRESHOLD:
            self.block_ip(ip, "Suspicious activity threshold exceeded")

# Global IP blocker instance
ip_blocker = IPBlocker()

# ==================== BOT DETECTION ====================
class BotDetector:
    """Detect and block bot traffic"""
    
    # Common bot user agents
    BOT_USER_AGENTS = [
        'bot', 'crawler', 'spider', 'scraper', 'curl', 'wget', 'python-requests',
        'httpie', 'postman', 'insomnia', 'axios', 'node-fetch', 'go-http-client',
        'java', 'perl', 'ruby', 'php', 'libwww', 'lwp-trivial', 'scrapy'
    ]
    
    # Suspicious patterns in requests
    SUSPICIOUS_PATHS = [
        '/wp-admin', '/wp-login', '/.env', '/config', '/admin.php',
        '/phpinfo', '/phpmyadmin', '/.git', '/actuator', '/swagger',
        '/api/v1', '/graphql', '/debug', '/trace', '/metrics',
        '/server-status', '/solr', '/jenkins', '/manager'
    ]
    
    @classmethod
    def is_bot(cls, request: Request) -> tuple[bool, str]:
        """Check if request appears to be from a bot"""
        user_agent = request.headers.get('user-agent', '').lower()
        path = request.url.path.lower()
        
        # Check for missing or suspicious user agent
        if not user_agent:
            return True, "Missing user agent"
        
        # Check for known bot user agents (but allow legitimate browsers)
        for bot_ua in cls.BOT_USER_AGENTS:
            if bot_ua in user_agent and 'mozilla' not in user_agent:
                return True, f"Bot user agent detected: {bot_ua}"
        
        # Check for suspicious paths (vulnerability scanners)
        for suspicious_path in cls.SUSPICIOUS_PATHS:
            if suspicious_path in path:
                return True, f"Suspicious path access: {path}"
        
        return False, ""
    
    @classmethod
    def check_honeypot(cls, data: dict) -> bool:
        """Check if honeypot field was filled (indicates bot)"""
        honeypot_fields = ['website', 'url', 'homepage', 'fax', 'company_website']
        for field in honeypot_fields:
            if data.get(field):
                return True
        return False

# ==================== INPUT VALIDATION ====================
class InputValidator:
    """Validate and sanitize user inputs"""
    
    # Dangerous patterns
    SQL_INJECTION_PATTERNS = [
        r"(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|TRUNCATE)\b)",
        r"(--|;|'|\"|\\)",
        r"(\bOR\b\s+\d+\s*=\s*\d+)",
        r"(\bAND\b\s+\d+\s*=\s*\d+)"
    ]
    
    XSS_PATTERNS = [
        r"<script[^>]*>",
        r"javascript:",
        r"on\w+\s*=",
        r"<iframe",
        r"<object",
        r"<embed",
        r"<link",
        r"<meta"
    ]
    
    @classmethod
    def sanitize_string(cls, value: str) -> str:
        """Basic sanitization of string input"""
        if not isinstance(value, str):
            return value
        
        # Remove null bytes
        value = value.replace('\x00', '')
        
        # Strip excessive whitespace
        value = ' '.join(value.split())
        
        # Limit length
        return value[:5000]
    
    @classmethod
    def check_malicious_input(cls, value: str) -> tuple[bool, str]:
        """Check if input contains malicious patterns"""
        if not isinstance(value, str):
            return False, ""
        
        value_upper = value.upper()
        
        # Check SQL injection
        for pattern in cls.SQL_INJECTION_PATTERNS:
            if re.search(pattern, value_upper, re.IGNORECASE):
                return True, "Potential SQL injection detected"
        
        # Check XSS
        for pattern in cls.XSS_PATTERNS:
            if re.search(pattern, value, re.IGNORECASE):
                return True, "Potential XSS attack detected"
        
        return False, ""
    
    @classmethod
    def validate_phone(cls, phone: str) -> bool:
        """Validate phone number format"""
        # Remove spaces and dashes
        phone = re.sub(r'[\s\-\(\)]', '', phone)
        # Check if it's a valid phone number (10-15 digits, optional +)
        return bool(re.match(r'^\+?\d{10,15}$', phone))
    
    @classmethod
    def validate_email(cls, email: str) -> bool:
        """Validate email format"""
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return bool(re.match(pattern, email))

# ==================== SECURITY MIDDLEWARE ====================
class SecurityMiddleware(BaseHTTPMiddleware):
    """Main security middleware"""
    
    async def dispatch(self, request: Request, call_next):
        ip = get_remote_address(request)
        
        # Check if IP is blocked
        if ip_blocker.is_blocked(ip):
            logger.warning(f"Blocked request from {ip}")
            return JSONResponse(
                status_code=status.HTTP_403_FORBIDDEN,
                content={"error": "Access denied", "message": "Your IP has been temporarily blocked due to suspicious activity."}
            )
        
        # Bot detection (skip for legitimate API calls from frontend)
        referer = request.headers.get('referer', '')
        origin = request.headers.get('origin', '')
        
        # Only check bots for public endpoints without proper origin
        if not origin and not referer and request.url.path.startswith('/api/'):
            is_bot, reason = BotDetector.is_bot(request)
            if is_bot:
                ip_blocker.record_suspicious_activity(ip, 10)
                logger.warning(f"Bot detected from {ip}: {reason}")
                # Don't block immediately, just log and increase suspicion
        
        # Add security headers to response
        response = await call_next(request)
        
        # Security headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
        
        return response

# ==================== REQUEST VALIDATION ====================
async def validate_request_body(request: Request, data: dict) -> tuple[bool, str]:
    """Validate request body for malicious content"""
    ip = get_remote_address(request)
    
    # Check honeypot
    if BotDetector.check_honeypot(data):
        ip_blocker.block_ip(ip, "Honeypot field filled")
        return False, "Invalid request"
    
    # Check each field for malicious content
    for key, value in data.items():
        if isinstance(value, str):
            is_malicious, reason = InputValidator.check_malicious_input(value)
            if is_malicious:
                ip_blocker.record_failed_attempt(ip, reason)
                return False, "Invalid input detected"
    
    return True, ""

# ==================== RATE LIMIT DECORATORS ====================
# These are the rate limits for different endpoints
RATE_LIMITS = {
    "public_enquiry": "5/minute",  # 5 enquiries per minute per IP
    "public_booking": "10/minute",  # 10 availability checks per minute
    "admin_login": "5/minute",  # 5 login attempts per minute
    "admin_action": "30/minute",  # 30 admin actions per minute
    "general": "60/minute"  # 60 general requests per minute
}
