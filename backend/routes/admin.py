"""
Admin Routes - Admin dashboard and management endpoints
"""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime, timezone
from bson import ObjectId
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/admin", tags=["Admin"])

# Database reference
db = None

def set_database(database):
    global db
    db = database

# Import auth helpers (will be set up properly in main)
require_admin = None

def set_auth_helper(admin_helper):
    global require_admin
    require_admin = admin_helper


# ==================== MODELS ====================

class UserUpdate(BaseModel):
    subscription: str

class EmailSend(BaseModel):
    to: str  # "all", "pro", "elite", or specific email
    subject: str
    content: str


# ==================== EARLY ACCESS ROUTES ====================

@router.get("/early-access")
async def get_early_access_list(admin: dict = Depends(lambda: require_admin)):
    """Get all early access registrations"""
    registrations = await db.early_access.find().sort("created_at", -1).to_list(1000)
    return [{**r, "_id": str(r["_id"])} for r in registrations]


@router.delete("/early-access/{email}")
async def delete_early_access(email: str, admin: dict = Depends(lambda: require_admin)):
    """Delete an early access registration"""
    result = await db.early_access.delete_one({"email": email})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Registrierung nicht gefunden")
    return {"success": True, "message": "Registrierung gelöscht"}


# ==================== USER MANAGEMENT ====================

@router.get("/users")
async def get_users(admin: dict = Depends(lambda: require_admin)):
    """Get all users"""
    users = await db.users.find({}, {"password_hash": 0}).sort("created_at", -1).to_list(1000)
    return [{**u, "_id": str(u["_id"])} for u in users]


@router.put("/users/{user_id}/subscription")
async def update_user_subscription(
    user_id: str, 
    update: UserUpdate,
    admin: dict = Depends(lambda: require_admin)
):
    """Update user subscription"""
    try:
        result = await db.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"subscription": update.subscription, "updated_at": datetime.now(timezone.utc)}}
        )
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Benutzer nicht gefunden")
        return {"success": True, "message": "Subscription aktualisiert"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/users/{user_id}")
async def delete_user(user_id: str, admin: dict = Depends(lambda: require_admin)):
    """Delete a user"""
    try:
        result = await db.users.delete_one({"_id": ObjectId(user_id)})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Benutzer nicht gefunden")
        return {"success": True, "message": "Benutzer gelöscht"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# ==================== TELEGRAM USER MANAGEMENT ====================

@router.put("/telegram-users/{telegram_id}/subscription")
async def update_telegram_user_subscription(
    telegram_id: str,
    update: UserUpdate,
    admin: dict = Depends(lambda: require_admin)
):
    """Update telegram user subscription"""
    result = await db.telegram_users.update_one(
        {"telegram_id": telegram_id},
        {"$set": {"subscription_level": update.subscription, "updated_at": datetime.now(timezone.utc)}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Telegram-Benutzer nicht gefunden")
    return {"success": True, "message": "Subscription aktualisiert"}


@router.delete("/telegram-users/{telegram_id}")
async def delete_telegram_user(telegram_id: str, admin: dict = Depends(lambda: require_admin)):
    """Delete a telegram user"""
    result = await db.telegram_users.delete_one({"telegram_id": telegram_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Telegram-Benutzer nicht gefunden")
    return {"success": True, "message": "Telegram-Benutzer gelöscht"}


# ==================== PAYMENTS / STRIPE ====================

@router.get("/payments")
async def get_payments(admin: dict = Depends(lambda: require_admin)):
    """Get all payments"""
    payments = await db.payments.find().sort("created_at", -1).to_list(500)
    return [{**p, "_id": str(p["_id"])} for p in payments]


@router.get("/payments/stats")
async def get_payment_stats(admin: dict = Depends(lambda: require_admin)):
    """Get payment statistics"""
    # Total revenue
    pipeline = [
        {"$match": {"status": "completed"}},
        {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
    ]
    result = await db.payments.aggregate(pipeline).to_list(1)
    total_revenue = result[0]["total"] if result else 0
    
    # Monthly revenue
    from datetime import timedelta
    thirty_days_ago = datetime.now(timezone.utc) - timedelta(days=30)
    pipeline = [
        {"$match": {"status": "completed", "created_at": {"$gte": thirty_days_ago}}},
        {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
    ]
    result = await db.payments.aggregate(pipeline).to_list(1)
    monthly_revenue = result[0]["total"] if result else 0
    
    # Subscription counts
    pro_count = await db.users.count_documents({"subscription": "pro"})
    elite_count = await db.users.count_documents({"subscription": "elite"})
    free_count = await db.users.count_documents({"subscription": "free"})
    
    return {
        "total_revenue": total_revenue,
        "monthly_revenue": monthly_revenue,
        "subscriptions": {
            "pro": pro_count,
            "elite": elite_count,
            "free": free_count
        }
    }


# ==================== EMAIL TO USERS ====================

@router.post("/email/send")
async def send_email_to_users(
    email_data: EmailSend,
    admin: dict = Depends(lambda: require_admin)
):
    """Send email to users"""
    try:
        from email_service import send_email
        
        # Determine recipients
        if email_data.to == "all":
            users = await db.users.find({"email_verified": True}).to_list(10000)
        elif email_data.to == "pro":
            users = await db.users.find({"subscription": "pro"}).to_list(10000)
        elif email_data.to == "elite":
            users = await db.users.find({"subscription": "elite"}).to_list(10000)
        else:
            # Specific email
            users = [{"email": email_data.to}]
        
        sent_count = 0
        failed_count = 0
        
        for user in users:
            try:
                success = await send_email(
                    to_email=user["email"],
                    subject=email_data.subject,
                    html_content=email_data.content
                )
                if success:
                    sent_count += 1
                else:
                    failed_count += 1
            except Exception as e:
                logger.error(f"Failed to send email to {user['email']}: {e}")
                failed_count += 1
        
        return {
            "success": True,
            "sent": sent_count,
            "failed": failed_count,
            "total": len(users)
        }
        
    except Exception as e:
        logger.error(f"Error sending emails: {e}")
        raise HTTPException(status_code=500, detail=str(e))
