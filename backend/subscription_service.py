"""
BETRADARMUS Subscription Service
Centralized subscription management for Web and Telegram
"""

from datetime import datetime, timezone, timedelta
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field
from enum import Enum
import logging
import uuid

logger = logging.getLogger(__name__)


class SubscriptionPlan(str, Enum):
    FREE = "free"
    PRO = "pro"
    ELITE = "elite"


class SubscriptionStatus(str, Enum):
    INACTIVE = "inactive"
    ACTIVE = "active"
    PAST_DUE = "past_due"
    CANCELED = "canceled"
    TRIALING = "trialing"


class PaymentProvider(str, Enum):
    STRIPE = "stripe"
    TELEGRAM = "telegram"


class BillingInterval(str, Enum):
    MONTHLY = "monthly"
    YEARLY = "yearly"


# Subscription Plans Configuration (Server-side only - NEVER accept from frontend)
SUBSCRIPTION_PLANS = {
    "free": {
        "name": "Free",
        "price_monthly": 0.0,
        "price_yearly": 0.0,
        "features": {
            "max_signals_per_day": 5,
            "signal_delay_minutes": 15,
            "execution_score": False,
            "confidence_score": False,
            "risk_score": False,
            "signal_lifetime": False,
            "explain_layer": False,
            "personalized_filters": False,
            "signal_history": False,
            "telegram_realtime": False,
            "max_leagues": 2
        }
    },
    "pro": {
        "name": "Pro",
        "price_monthly": 29.0,
        "price_yearly": 249.0,
        "stripe_price_id_monthly": None,  # Will be set from env
        "stripe_price_id_yearly": None,
        "features": {
            "max_signals_per_day": -1,  # Unlimited
            "signal_delay_minutes": 0,
            "execution_score": True,
            "confidence_score": True,
            "risk_score": True,
            "signal_lifetime": False,
            "explain_layer": False,
            "personalized_filters": False,
            "signal_history": False,
            "telegram_realtime": True,
            "max_leagues": 5
        }
    },
    "elite": {
        "name": "Elite",
        "price_monthly": 79.0,
        "price_yearly": 699.0,
        "stripe_price_id_monthly": None,
        "stripe_price_id_yearly": None,
        "features": {
            "max_signals_per_day": -1,
            "signal_delay_minutes": 0,
            "execution_score": True,
            "confidence_score": True,
            "risk_score": True,
            "signal_lifetime": True,
            "explain_layer": True,
            "personalized_filters": True,
            "signal_history": True,
            "telegram_realtime": True,
            "max_leagues": 8
        }
    }
}


# Pydantic Models for Subscription Data

class SubscriptionModel(BaseModel):
    """Subscription document model"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    plan: SubscriptionPlan = SubscriptionPlan.FREE
    provider: Optional[PaymentProvider] = None
    provider_customer_id: Optional[str] = None
    provider_subscription_id: Optional[str] = None
    status: SubscriptionStatus = SubscriptionStatus.ACTIVE
    billing_interval: Optional[BillingInterval] = None
    current_period_start: Optional[datetime] = None
    current_period_end: Optional[datetime] = None
    cancel_at_period_end: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class PaymentModel(BaseModel):
    """Payment transaction model"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    user_email: Optional[str] = None
    subscription_id: Optional[str] = None
    provider: PaymentProvider
    payment_type: str = "subscription"  # 'one_time' or 'subscription'
    amount: float
    currency: str = "eur"
    status: str = "pending"  # pending, completed, failed, refunded
    external_payment_id: Optional[str] = None  # Stripe session_id or Telegram payment_id
    raw_payload: Optional[Dict] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class UserLinkModel(BaseModel):
    """User link between Website and Telegram"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str  # Website user ID
    telegram_id: str
    link_code: Optional[str] = None
    linked_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    verified: bool = True


class SubscriptionService:
    """Centralized subscription management service"""
    
    def __init__(self, db):
        self.db = db
        
    async def get_user_subscription(self, user_id: str) -> Optional[Dict]:
        """Get the active subscription for a user"""
        subscription = await self.db.subscriptions.find_one(
            {"user_id": user_id, "status": {"$in": ["active", "trialing", "past_due"]}},
            {"_id": 0}
        )
        return subscription
    
    async def get_subscription_by_provider_id(self, provider: str, provider_subscription_id: str) -> Optional[Dict]:
        """Get subscription by provider subscription ID"""
        subscription = await self.db.subscriptions.find_one(
            {"provider": provider, "provider_subscription_id": provider_subscription_id},
            {"_id": 0}
        )
        return subscription
    
    async def create_subscription(
        self,
        user_id: str,
        plan: str,
        provider: str,
        provider_customer_id: Optional[str] = None,
        provider_subscription_id: Optional[str] = None,
        billing_interval: str = "monthly",
        period_days: int = 30
    ) -> Dict:
        """Create a new subscription"""
        
        now = datetime.now(timezone.utc)
        period_end = now + timedelta(days=period_days if billing_interval == "monthly" else 365)
        
        subscription = SubscriptionModel(
            user_id=user_id,
            plan=SubscriptionPlan(plan),
            provider=PaymentProvider(provider) if provider else None,
            provider_customer_id=provider_customer_id,
            provider_subscription_id=provider_subscription_id,
            status=SubscriptionStatus.ACTIVE,
            billing_interval=BillingInterval(billing_interval) if billing_interval else None,
            current_period_start=now,
            current_period_end=period_end
        )
        
        # Upsert subscription (one active subscription per user)
        await self.db.subscriptions.update_one(
            {"user_id": user_id},
            {"$set": subscription.model_dump()},
            upsert=True
        )
        
        # Update user's subscription field for quick access
        await self.db.users.update_one(
            {"id": user_id},
            {"$set": {
                "subscription": plan,
                "subscription_status": "active",
                "subscription_updated_at": now.isoformat()
            }}
        )
        
        # If user has linked Telegram, update Telegram user as well
        await self._sync_telegram_subscription(user_id, plan)
        
        logger.info(f"Subscription created: user={user_id}, plan={plan}, provider={provider}")
        return subscription.model_dump()
    
    async def update_subscription_status(
        self,
        user_id: str,
        status: str,
        cancel_at_period_end: bool = False
    ) -> bool:
        """Update subscription status"""
        
        result = await self.db.subscriptions.update_one(
            {"user_id": user_id},
            {"$set": {
                "status": status,
                "cancel_at_period_end": cancel_at_period_end,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }}
        )
        
        # Update user's subscription status
        user_status = "active" if status in ["active", "trialing"] else status
        await self.db.users.update_one(
            {"id": user_id},
            {"$set": {"subscription_status": user_status}}
        )
        
        # Sync with Telegram
        if status in ["canceled", "inactive"]:
            await self._sync_telegram_subscription(user_id, "free")
        
        return result.modified_count > 0
    
    async def cancel_subscription(self, user_id: str, immediate: bool = False) -> bool:
        """Cancel a subscription"""
        
        subscription = await self.get_user_subscription(user_id)
        if not subscription:
            return False
        
        if immediate:
            # Immediate cancellation - downgrade to free
            await self.db.subscriptions.update_one(
                {"user_id": user_id},
                {"$set": {
                    "status": "canceled",
                    "plan": "free",
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }}
            )
            await self.db.users.update_one(
                {"id": user_id},
                {"$set": {"subscription": "free", "subscription_status": "canceled"}}
            )
            await self._sync_telegram_subscription(user_id, "free")
        else:
            # Cancel at period end
            await self.db.subscriptions.update_one(
                {"user_id": user_id},
                {"$set": {
                    "cancel_at_period_end": True,
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }}
            )
        
        logger.info(f"Subscription canceled: user={user_id}, immediate={immediate}")
        return True
    
    async def change_plan(self, user_id: str, new_plan: str, billing_interval: str = "monthly") -> bool:
        """Change subscription plan (upgrade/downgrade)"""
        
        subscription = await self.get_user_subscription(user_id)
        if not subscription:
            # Create new subscription if none exists
            await self.create_subscription(user_id, new_plan, None, billing_interval=billing_interval)
            return True
        
        # Update plan
        await self.db.subscriptions.update_one(
            {"user_id": user_id},
            {"$set": {
                "plan": new_plan,
                "billing_interval": billing_interval,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }}
        )
        
        await self.db.users.update_one(
            {"id": user_id},
            {"$set": {"subscription": new_plan}}
        )
        
        await self._sync_telegram_subscription(user_id, new_plan)
        
        logger.info(f"Plan changed: user={user_id}, new_plan={new_plan}")
        return True
    
    async def _sync_telegram_subscription(self, user_id: str, plan: str):
        """Sync subscription status with linked Telegram account"""
        
        # Find linked Telegram account
        link = await self.db.user_links.find_one({"user_id": user_id}, {"_id": 0})
        if not link:
            return
        
        telegram_id = link.get("telegram_id")
        if telegram_id:
            await self.db.telegram_users.update_one(
                {"telegram_id": telegram_id},
                {"$set": {
                    "subscription_level": plan,
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }}
            )
            logger.info(f"Telegram subscription synced: telegram_id={telegram_id}, plan={plan}")
    
    # ==================== USER LINKING ====================
    
    async def generate_link_code(self, user_id: str) -> str:
        """Generate a unique code for linking Telegram account"""
        
        link_code = str(uuid.uuid4())[:8].upper()
        
        await self.db.link_codes.update_one(
            {"user_id": user_id},
            {"$set": {
                "user_id": user_id,
                "code": link_code,
                "created_at": datetime.now(timezone.utc).isoformat(),
                "expires_at": (datetime.now(timezone.utc) + timedelta(hours=24)).isoformat(),
                "used": False
            }},
            upsert=True
        )
        
        return link_code
    
    async def link_telegram_account(self, link_code: str, telegram_id: str) -> Optional[Dict]:
        """Link a Telegram account using the code"""
        
        # Find the link code
        code_doc = await self.db.link_codes.find_one({
            "code": link_code,
            "used": False
        }, {"_id": 0})
        
        if not code_doc:
            return None
        
        # Check expiry
        expires_at = datetime.fromisoformat(code_doc["expires_at"])
        if datetime.now(timezone.utc) > expires_at:
            return None
        
        user_id = code_doc["user_id"]
        
        # Create the link
        link = UserLinkModel(
            user_id=user_id,
            telegram_id=telegram_id
        )
        
        await self.db.user_links.update_one(
            {"user_id": user_id},
            {"$set": link.model_dump()},
            upsert=True
        )
        
        # Mark code as used
        await self.db.link_codes.update_one(
            {"code": link_code},
            {"$set": {"used": True}}
        )
        
        # Get user's current subscription and sync to Telegram
        user = await self.db.users.find_one({"id": user_id}, {"_id": 0})
        if user:
            plan = user.get("subscription", "free")
            await self.db.telegram_users.update_one(
                {"telegram_id": telegram_id},
                {"$set": {
                    "linked_user_id": user_id,
                    "subscription_level": plan,
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }}
            )
        
        logger.info(f"Account linked: user_id={user_id}, telegram_id={telegram_id}")
        return link.model_dump()
    
    async def get_linked_telegram(self, user_id: str) -> Optional[str]:
        """Get linked Telegram ID for a user"""
        link = await self.db.user_links.find_one({"user_id": user_id}, {"_id": 0})
        return link.get("telegram_id") if link else None
    
    async def get_linked_user(self, telegram_id: str) -> Optional[str]:
        """Get linked user ID for a Telegram account"""
        link = await self.db.user_links.find_one({"telegram_id": telegram_id}, {"_id": 0})
        return link.get("user_id") if link else None
    
    # ==================== ACCESS CONTROL ====================
    
    def get_plan_features(self, plan: str) -> Dict:
        """Get features for a plan"""
        return SUBSCRIPTION_PLANS.get(plan, SUBSCRIPTION_PLANS["free"])["features"]
    
    async def check_feature_access(self, user_id: str, feature: str) -> bool:
        """Check if user has access to a specific feature"""
        
        user = await self.db.users.find_one({"id": user_id}, {"_id": 0})
        if not user:
            return False
        
        plan = user.get("subscription", "free")
        features = self.get_plan_features(plan)
        
        return features.get(feature, False)
    
    async def check_signal_limit(self, user_id: str) -> Dict:
        """Check if user has reached their daily signal limit"""
        
        user = await self.db.users.find_one({"id": user_id}, {"_id": 0})
        plan = user.get("subscription", "free") if user else "free"
        features = self.get_plan_features(plan)
        
        max_signals = features.get("max_signals_per_day", 5)
        if max_signals == -1:
            return {"allowed": True, "remaining": -1, "limit": -1}
        
        # Count signals viewed today
        today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
        count = await self.db.signal_views.count_documents({
            "user_id": user_id,
            "viewed_at": {"$gte": today_start.isoformat()}
        })
        
        return {
            "allowed": count < max_signals,
            "remaining": max(0, max_signals - count),
            "limit": max_signals
        }
    
    # ==================== PAYMENT RECORDING ====================
    
    async def record_payment(
        self,
        user_id: str,
        user_email: str,
        provider: str,
        amount: float,
        currency: str,
        external_payment_id: str,
        payment_type: str = "subscription",
        status: str = "pending",
        raw_payload: Optional[Dict] = None
    ) -> Dict:
        """Record a payment transaction"""
        
        payment = PaymentModel(
            user_id=user_id,
            user_email=user_email,
            provider=PaymentProvider(provider),
            payment_type=payment_type,
            amount=amount,
            currency=currency,
            status=status,
            external_payment_id=external_payment_id,
            raw_payload=raw_payload
        )
        
        await self.db.payments.insert_one(payment.model_dump())
        logger.info(f"Payment recorded: user={user_id}, amount={amount} {currency}, status={status}")
        
        return payment.model_dump()
    
    async def update_payment_status(self, external_payment_id: str, status: str) -> bool:
        """Update payment status by external ID"""
        
        result = await self.db.payments.update_one(
            {"external_payment_id": external_payment_id},
            {"$set": {"status": status}}
        )
        return result.modified_count > 0
    
    async def get_payment_by_external_id(self, external_payment_id: str) -> Optional[Dict]:
        """Get payment by external payment ID"""
        return await self.db.payments.find_one(
            {"external_payment_id": external_payment_id},
            {"_id": 0}
        )
    
    async def get_user_payments(self, user_id: str, limit: int = 20) -> List[Dict]:
        """Get payment history for a user"""
        cursor = self.db.payments.find(
            {"user_id": user_id},
            {"_id": 0}
        ).sort("created_at", -1).limit(limit)
        
        return await cursor.to_list(length=limit)
