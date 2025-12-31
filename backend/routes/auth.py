"""Authentication routes"""
from fastapi import APIRouter, HTTPException, Depends, Request
from datetime import datetime
import os
import logging

from models import AdminLogin, AdminUser, AdminUserCreate
from auth import hash_password, verify_password, create_jwt_token, get_current_user, require_admin
from database import db
from security import limiter, ip_blocker

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["Authentication"])


@router.post("/admin/login")
@limiter.limit("5/minute")  # Rate limit login attempts
async def admin_login(request: Request, login_data: AdminLogin):
    ip = request.client.host
    
    # Check if IP is blocked
    if ip_blocker.is_blocked(ip):
        raise HTTPException(status_code=429, detail="Too many failed attempts. Please try again later.")
    
    admin = await db.admin_users.find_one({"username": login_data.username})
    
    if not admin or not verify_password(login_data.password, admin['password']):
        ip_blocker.record_failed_attempt(ip, "Failed login attempt")
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_jwt_token(admin['username'], admin.get('role', 'manager'))
    logger.info(f"Successful login for user: {admin['username']} from IP: {ip}")
    return {
        "success": True,
        "token": token,
        "user": {
            "username": admin['username'],
            "role": admin.get('role', 'manager')
        }
    }


@router.get("/admin/users")
async def get_users(current_user: dict = Depends(require_admin)):
    users = await db.admin_users.find({}, {'_id': 0, 'password': 0}).to_list(100)
    return {"users": users}


@router.post("/admin/users")
async def create_user(
    user_data: AdminUserCreate,
    current_user: dict = Depends(require_admin)
):
    # Check if username exists
    existing = await db.admin_users.find_one({"username": user_data.username})
    if existing:
        raise HTTPException(status_code=400, detail="Username already exists")
    
    hashed_pw = hash_password(user_data.password)
    new_user = AdminUser(
        username=user_data.username,
        password=hashed_pw,
        role=user_data.role
    )
    await db.admin_users.insert_one(new_user.dict())
    
    return {"success": True, "user": {"username": new_user.username, "role": new_user.role}}


@router.delete("/admin/users/{user_id}")
async def delete_user(
    user_id: str,
    current_user: dict = Depends(require_admin)
):
    result = await db.admin_users.delete_one({"id": user_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"success": True, "message": "User deleted"}
