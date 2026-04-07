"""
Billing Routes - Stripe payments and subscription management
"""
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from typing import Optional, Dict
from datetime import datetime, timezone
import stripe
import os
import logging

logger = logging.getLogger(__name__)

# Stripe Config
STRIPE_SECRET_KEY = os.environ.get("STRIPE_SECRET_KEY", "")
STRIPE_WEBHOOK_SECRET = os.environ.get("STRIPE_WEBHOOK_SECRET", "")
FRONTEND_URL = os.environ.get("FRONTEND_URL", "https://betradarmus.de")

if STRIPE_SECRET_KEY:
    stripe.api_key = STRIPE_SECRET_KEY

router = APIRouter(tags=["Billing"])

# Database reference
db = None

def set_database(database):
    global db
    db = database

# Auth helper
require_auth = None

def set_auth_helper(auth_helper):
    global require_auth
    require_auth = auth_helper


# ==================== MODELS ====================

class CheckoutRequest(BaseModel):
    plan: str  # "pro" or "elite"
    interval: str = "monthly"  # "monthly" or "yearly"

class CheckoutResponse(BaseModel):
    success: bool
    checkout_url: Optional[str] = None
    message: Optional[str] = None


# ==================== PRICE IDS ====================

STRIPE_PRICES = {
    "pro_monthly": os.environ.get("STRIPE_PRICE_PRO_MONTHLY", ""),
    "pro_yearly": os.environ.get("STRIPE_PRICE_PRO_YEARLY", ""),
    "elite_monthly": os.environ.get("STRIPE_PRICE_ELITE_MONTHLY", ""),
    "elite_yearly": os.environ.get("STRIPE_PRICE_ELITE_YEARLY", ""),
}


# ==================== CHECKOUT ====================

@router.post("/payments/checkout", response_model=CheckoutResponse)
async def create_checkout(input: CheckoutRequest, request: Request, user: dict = Depends(lambda: require_auth)):
    """Create Stripe checkout session"""
    if not STRIPE_SECRET_KEY:
        return CheckoutResponse(success=False, message="Stripe nicht konfiguriert")
    
    price_key = f"{input.plan}_{input.interval}"
    price_id = STRIPE_PRICES.get(price_key)
    
    if not price_id:
        return CheckoutResponse(success=False, message=f"Ungültiger Plan: {price_key}")
    
    try:
        # Get or create Stripe customer
        customer_id = user.get("stripe_customer_id")
        
        if not customer_id:
            customer = stripe.Customer.create(
                email=user["email"],
                metadata={"user_id": str(user["_id"])}
            )
            customer_id = customer.id
            
            # Save customer ID
            await db.users.update_one(
                {"_id": user["_id"]},
                {"$set": {"stripe_customer_id": customer_id}}
            )
        
        # Create checkout session
        session = stripe.checkout.Session.create(
            customer=customer_id,
            payment_method_types=["card"],
            line_items=[{"price": price_id, "quantity": 1}],
            mode="subscription",
            success_url=f"{FRONTEND_URL}/billing?success=true&session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{FRONTEND_URL}/billing?canceled=true",
            metadata={
                "user_id": str(user["_id"]),
                "plan": input.plan,
                "interval": input.interval
            },
            subscription_data={
                "metadata": {
                    "user_id": str(user["_id"]),
                    "plan": input.plan
                }
            }
        )
        
        return CheckoutResponse(success=True, checkout_url=session.url)
        
    except stripe.error.StripeError as e:
        logger.error(f"Stripe error: {e}")
        return CheckoutResponse(success=False, message=str(e))


@router.get("/payments/status/{session_id}")
async def get_payment_status(session_id: str, user: dict = Depends(lambda: require_auth)):
    """Get payment/checkout status"""
    if not STRIPE_SECRET_KEY:
        raise HTTPException(status_code=500, detail="Stripe nicht konfiguriert")
    
    try:
        session = stripe.checkout.Session.retrieve(session_id)
        
        return {
            "status": session.payment_status,
            "subscription_status": session.subscription,
            "customer": session.customer
        }
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=str(e))


# ==================== WEBHOOK ====================

@router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    """Handle Stripe webhooks"""
    if not STRIPE_SECRET_KEY:
        raise HTTPException(status_code=500, detail="Stripe nicht konfiguriert")
    
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")
    
    try:
        if STRIPE_WEBHOOK_SECRET:
            event = stripe.Webhook.construct_event(
                payload, sig_header, STRIPE_WEBHOOK_SECRET
            )
        else:
            import json
            event = json.loads(payload)
    except ValueError as e:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError as e:
        raise HTTPException(status_code=400, detail="Invalid signature")
    
    # Handle events
    event_type = event.get("type", "")
    data = event.get("data", {}).get("object", {})
    
    logger.info(f"Stripe webhook received: {event_type}")
    
    if event_type == "checkout.session.completed":
        await handle_checkout_completed(data)
    elif event_type == "customer.subscription.updated":
        await handle_subscription_updated(data)
    elif event_type == "customer.subscription.deleted":
        await handle_subscription_deleted(data)
    elif event_type == "invoice.paid":
        await handle_invoice_paid(data)
    elif event_type == "invoice.payment_failed":
        await handle_invoice_failed(data)
    
    return {"received": True}


async def handle_checkout_completed(session: Dict):
    """Handle successful checkout"""
    user_id = session.get("metadata", {}).get("user_id")
    plan = session.get("metadata", {}).get("plan", "pro")
    
    if user_id:
        from bson import ObjectId
        await db.users.update_one(
            {"_id": ObjectId(user_id)},
            {
                "$set": {
                    "subscription": plan,
                    "stripe_subscription_id": session.get("subscription"),
                    "subscription_updated_at": datetime.now(timezone.utc)
                }
            }
        )
        logger.info(f"User {user_id} upgraded to {plan}")


async def handle_subscription_updated(subscription: Dict):
    """Handle subscription update"""
    customer_id = subscription.get("customer")
    status = subscription.get("status")
    
    user = await db.users.find_one({"stripe_customer_id": customer_id})
    if user:
        if status == "active":
            # Keep current plan
            pass
        elif status in ["past_due", "unpaid"]:
            # Mark as at risk but don't downgrade yet
            await db.users.update_one(
                {"_id": user["_id"]},
                {"$set": {"subscription_status": status}}
            )


async def handle_subscription_deleted(subscription: Dict):
    """Handle subscription cancellation"""
    customer_id = subscription.get("customer")
    
    user = await db.users.find_one({"stripe_customer_id": customer_id})
    if user:
        await db.users.update_one(
            {"_id": user["_id"]},
            {
                "$set": {
                    "subscription": "free",
                    "stripe_subscription_id": None,
                    "subscription_updated_at": datetime.now(timezone.utc)
                }
            }
        )
        logger.info(f"User {user['_id']} downgraded to free")


async def handle_invoice_paid(invoice: Dict):
    """Handle successful invoice payment"""
    customer_id = invoice.get("customer")
    amount = invoice.get("amount_paid", 0) / 100  # Convert from cents
    
    user = await db.users.find_one({"stripe_customer_id": customer_id})
    if user:
        # Record payment
        await db.payments.insert_one({
            "user_id": str(user["_id"]),
            "amount": amount,
            "currency": invoice.get("currency", "eur"),
            "status": "completed",
            "stripe_invoice_id": invoice.get("id"),
            "created_at": datetime.now(timezone.utc)
        })


async def handle_invoice_failed(invoice: Dict):
    """Handle failed invoice payment"""
    customer_id = invoice.get("customer")
    
    user = await db.users.find_one({"stripe_customer_id": customer_id})
    if user:
        await db.payments.insert_one({
            "user_id": str(user["_id"]),
            "amount": invoice.get("amount_due", 0) / 100,
            "currency": invoice.get("currency", "eur"),
            "status": "failed",
            "stripe_invoice_id": invoice.get("id"),
            "created_at": datetime.now(timezone.utc)
        })


# ==================== BILLING INFO ====================

@router.get("/billing/info")
async def get_billing_info(user: dict = Depends(lambda: require_auth)):
    """Get user billing information"""
    subscription_id = user.get("stripe_subscription_id")
    
    result = {
        "subscription": user.get("subscription", "free"),
        "has_active_subscription": False,
        "current_period_end": None,
        "cancel_at_period_end": False
    }
    
    if subscription_id and STRIPE_SECRET_KEY:
        try:
            subscription = stripe.Subscription.retrieve(subscription_id)
            result["has_active_subscription"] = subscription.status == "active"
            result["current_period_end"] = subscription.current_period_end
            result["cancel_at_period_end"] = subscription.cancel_at_period_end
        except stripe.error.StripeError:
            pass
    
    return result


@router.post("/billing/cancel")
async def cancel_subscription(user: dict = Depends(lambda: require_auth)):
    """Cancel subscription at period end"""
    subscription_id = user.get("stripe_subscription_id")
    
    if not subscription_id:
        raise HTTPException(status_code=400, detail="Kein aktives Abo gefunden")
    
    try:
        subscription = stripe.Subscription.modify(
            subscription_id,
            cancel_at_period_end=True
        )
        return {
            "success": True,
            "message": "Abo wird zum Periodenende gekündigt",
            "cancel_at": subscription.current_period_end
        }
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/billing/portal")
async def get_billing_portal(user: dict = Depends(lambda: require_auth)):
    """Get Stripe customer portal URL"""
    customer_id = user.get("stripe_customer_id")
    
    if not customer_id:
        raise HTTPException(status_code=400, detail="Kein Stripe-Kunde gefunden")
    
    try:
        session = stripe.billing_portal.Session.create(
            customer=customer_id,
            return_url=f"{FRONTEND_URL}/billing"
        )
        return {"url": session.url}
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=str(e))
