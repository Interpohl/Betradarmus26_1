"""
Web Push Notification Service
Handles push notifications for signal alerts and updates
"""
import os
import json
import logging
from datetime import datetime, timezone
from typing import Optional, List, Dict
from pywebpush import webpush, WebPushException

logger = logging.getLogger(__name__)

# VAPID Keys - Generate these once and keep them
# Generate with: openssl ecparam -genkey -name prime256v1 -out private_key.pem
# openssl ec -in private_key.pem -pubout -outform DER | tail -c 65 | base64 | tr '/+' '_-' | tr -d '='
VAPID_PUBLIC_KEY = os.environ.get("VAPID_PUBLIC_KEY", "")
VAPID_PRIVATE_KEY = os.environ.get("VAPID_PRIVATE_KEY", "")
VAPID_CLAIMS = {
    "sub": "mailto:support@betradarmus.de"
}

# Database reference
db = None

def set_database(database):
    global db
    db = database


async def save_push_subscription(user_id: str, subscription: dict) -> bool:
    """Save a push subscription for a user"""
    try:
        await db.push_subscriptions.update_one(
            {"user_id": user_id, "endpoint": subscription.get("endpoint")},
            {
                "$set": {
                    "user_id": user_id,
                    "subscription": subscription,
                    "updated_at": datetime.now(timezone.utc)
                },
                "$setOnInsert": {
                    "created_at": datetime.now(timezone.utc)
                }
            },
            upsert=True
        )
        logger.info(f"Push subscription saved for user {user_id}")
        return True
    except Exception as e:
        logger.error(f"Error saving push subscription: {e}")
        return False


async def remove_push_subscription(user_id: str, endpoint: str) -> bool:
    """Remove a push subscription"""
    try:
        result = await db.push_subscriptions.delete_one({
            "user_id": user_id,
            "endpoint": endpoint
        })
        return result.deleted_count > 0
    except Exception as e:
        logger.error(f"Error removing push subscription: {e}")
        return False


async def get_user_subscriptions(user_id: str) -> List[dict]:
    """Get all push subscriptions for a user"""
    try:
        subs = await db.push_subscriptions.find({"user_id": user_id}).to_list(100)
        return [s.get("subscription") for s in subs if s.get("subscription")]
    except Exception as e:
        logger.error(f"Error getting push subscriptions: {e}")
        return []


async def get_subscriptions_by_plan(plan: str) -> List[dict]:
    """Get all push subscriptions for users with a specific plan"""
    try:
        # Get users with the plan
        users = await db.users.find({"subscription": plan}).to_list(10000)
        user_ids = [str(u["_id"]) for u in users]
        
        # Get subscriptions
        subs = await db.push_subscriptions.find({
            "user_id": {"$in": user_ids}
        }).to_list(50000)
        
        return subs
    except Exception as e:
        logger.error(f"Error getting subscriptions by plan: {e}")
        return []


def send_push_notification(subscription: dict, payload: dict) -> bool:
    """Send a push notification to a single subscription"""
    if not VAPID_PUBLIC_KEY or not VAPID_PRIVATE_KEY:
        logger.warning("VAPID keys not configured")
        return False
    
    try:
        webpush(
            subscription_info=subscription,
            data=json.dumps(payload),
            vapid_private_key=VAPID_PRIVATE_KEY,
            vapid_claims=VAPID_CLAIMS
        )
        return True
    except WebPushException as e:
        logger.error(f"Push notification failed: {e}")
        # If subscription is invalid, return False to potentially remove it
        if e.response and e.response.status_code in [404, 410]:
            return False
        return False
    except Exception as e:
        logger.error(f"Push notification error: {e}")
        return False


async def send_signal_notification(
    signal: dict,
    target_plans: List[str] = None
) -> dict:
    """
    Send a signal notification to users
    
    Args:
        signal: Signal data containing match, market, confidence, etc.
        target_plans: List of subscription plans to target (e.g., ['pro', 'elite'])
    
    Returns:
        dict with success count and failed count
    """
    if target_plans is None:
        target_plans = ['elite']  # Default to elite only
    
    # Build notification payload
    payload = {
        "type": "signal",
        "title": f"⚡ Neues Signal: {signal.get('match', 'Spiel')}",
        "body": f"📊 {signal.get('market', 'Markt')} | Confidence: {int((signal.get('confidence', 0.75)) * 100)}%",
        "icon": "/logo192.png",
        "badge": "/badge.png",
        "tag": f"signal-{signal.get('_id', 'new')}",
        "data": {
            "url": "/dashboard",
            "signal_id": str(signal.get('_id', '')),
            "league": signal.get('league'),
            "match": signal.get('match'),
            "market": signal.get('market')
        },
        "actions": [
            {"action": "view", "title": "Anzeigen"},
            {"action": "dismiss", "title": "Später"}
        ]
    }
    
    success_count = 0
    failed_count = 0
    removed_subscriptions = []
    
    for plan in target_plans:
        subscriptions = await get_subscriptions_by_plan(plan)
        
        for sub_doc in subscriptions:
            subscription = sub_doc.get("subscription")
            if not subscription:
                continue
            
            success = send_push_notification(subscription, payload)
            
            if success:
                success_count += 1
            else:
                failed_count += 1
                # Mark for removal if endpoint is invalid
                removed_subscriptions.append({
                    "user_id": sub_doc.get("user_id"),
                    "endpoint": subscription.get("endpoint")
                })
    
    # Clean up invalid subscriptions
    for sub in removed_subscriptions:
        await remove_push_subscription(sub["user_id"], sub["endpoint"])
    
    logger.info(f"Signal notification sent: {success_count} success, {failed_count} failed")
    
    return {
        "success": success_count,
        "failed": failed_count,
        "removed": len(removed_subscriptions)
    }


async def send_custom_notification(
    title: str,
    body: str,
    target_plans: List[str] = None,
    url: str = "/",
    tag: str = None
) -> dict:
    """
    Send a custom notification to users
    """
    if target_plans is None:
        target_plans = ['pro', 'elite']
    
    payload = {
        "type": "custom",
        "title": title,
        "body": body,
        "icon": "/logo192.png",
        "badge": "/badge.png",
        "tag": tag or f"custom-{datetime.now().timestamp()}",
        "data": {"url": url}
    }
    
    success_count = 0
    failed_count = 0
    
    for plan in target_plans:
        subscriptions = await get_subscriptions_by_plan(plan)
        
        for sub_doc in subscriptions:
            subscription = sub_doc.get("subscription")
            if not subscription:
                continue
            
            if send_push_notification(subscription, payload):
                success_count += 1
            else:
                failed_count += 1
    
    return {"success": success_count, "failed": failed_count}


# Service instance
_push_service = None

def get_push_service():
    global _push_service
    if _push_service is None:
        _push_service = {
            "save_subscription": save_push_subscription,
            "remove_subscription": remove_push_subscription,
            "send_signal": send_signal_notification,
            "send_custom": send_custom_notification,
            "get_user_subscriptions": get_user_subscriptions
        }
    return _push_service
