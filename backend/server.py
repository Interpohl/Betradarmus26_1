from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import asyncio
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict
import uuid
from datetime import datetime, timezone, timedelta
import jwt
import bcrypt
import requests

# Stripe integration
from emergentintegrations.payments.stripe.checkout import (
    StripeCheckout, 
    CheckoutSessionResponse, 
    CheckoutStatusResponse, 
    CheckoutSessionRequest
)

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Settings
JWT_SECRET = os.environ.get('JWT_SECRET_KEY', 'fallback-secret-key')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

# Stripe Settings
STRIPE_API_KEY = os.environ.get('STRIPE_API_KEY')

# SofaScore API Settings
SOFASCORE_API_KEY = os.environ.get('SOFASCORE_API_KEY')
SOFASCORE_HOST = "sofascore.p.rapidapi.com"

# The Odds API Settings
ODDS_API_KEY = os.environ.get('ODDS_API_KEY')
ODDS_API_BASE_URL = "https://api.the-odds-api.com/v4"

# Subscription Plans (server-side only - never accept amounts from frontend)
SUBSCRIPTION_PLANS = {
    "free": {"price": 0.0, "name": "Free", "features": ["Begrenzter Live-Zugriff", "Basis-Analyse"]},
    "pro": {"price": 19.0, "name": "Pro", "stripe_price_id": None, "features": ["Voller Live-Zugriff", "Risk Score", "Confidence Index"]},
    "elite": {"price": 39.0, "name": "Elite", "stripe_price_id": None, "features": ["Priorisierte Updates", "Historische Analyse", "API-Zugang"]}
}

# Create the main app
app = FastAPI(title="BETRADARMUS API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Security
security = HTTPBearer(auto_error=False)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ==================== MODELS ====================

# User Models
class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    password_hash: str
    name: str
    subscription: str = "free"
    subscription_status: str = "active"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    subscription: str
    subscription_status: str

class AuthResponse(BaseModel):
    success: bool
    message: str
    token: Optional[str] = None
    user: Optional[UserResponse] = None

# Payment Models
class PaymentTransaction(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    user_email: str
    session_id: str
    plan: str
    amount: float
    currency: str = "eur"
    payment_status: str = "pending"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CheckoutRequest(BaseModel):
    plan: str
    origin_url: str

class CheckoutResponse(BaseModel):
    success: bool
    checkout_url: Optional[str] = None
    session_id: Optional[str] = None
    message: Optional[str] = None

# Early Access & Contact Models
class EarlyAccessSignup(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    plan_interest: Optional[str] = "free"
    email_verified: bool = False
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class EarlyAccessCreate(BaseModel):
    email: EmailStr
    plan_interest: Optional[str] = "free"

class EarlyAccessResponse(BaseModel):
    success: bool
    message: str
    id: Optional[str] = None

class ContactMessage(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: EmailStr
    subject: str
    message: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ContactCreate(BaseModel):
    name: str
    email: EmailStr
    subject: str
    message: str

class ContactResponse(BaseModel):
    success: bool
    message: str

# ==================== AUTH HELPERS ====================

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, password_hash: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), password_hash.encode('utf-8'))

def create_token(user_id: str, email: str) -> str:
    payload = {
        "user_id": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def decode_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> Optional[dict]:
    if not credentials:
        return None
    
    payload = decode_token(credentials.credentials)
    if not payload:
        return None
    
    user = await db.users.find_one({"id": payload["user_id"]}, {"_id": 0})
    return user

async def require_auth(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    if not credentials:
        raise HTTPException(status_code=401, detail="Nicht authentifiziert")
    
    payload = decode_token(credentials.credentials)
    if not payload:
        raise HTTPException(status_code=401, detail="Token ungültig oder abgelaufen")
    
    user = await db.users.find_one({"id": payload["user_id"]}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="Benutzer nicht gefunden")
    
    return user

# ==================== AUTH ROUTES ====================

@api_router.post("/auth/register", response_model=AuthResponse)
async def register(input: UserRegister):
    # Check if email exists
    existing = await db.users.find_one({"email": input.email}, {"_id": 0})
    if existing:
        return AuthResponse(success=False, message="Diese E-Mail-Adresse ist bereits registriert.")
    
    # Validate password
    if len(input.password) < 8:
        return AuthResponse(success=False, message="Passwort muss mindestens 8 Zeichen lang sein.")
    
    # Create user
    user = User(
        email=input.email,
        password_hash=hash_password(input.password),
        name=input.name
    )
    
    doc = user.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.users.insert_one(doc)
    
    # Create token
    token = create_token(user.id, user.email)
    
    return AuthResponse(
        success=True,
        message="Registrierung erfolgreich!",
        token=token,
        user=UserResponse(
            id=user.id,
            email=user.email,
            name=user.name,
            subscription=user.subscription,
            subscription_status=user.subscription_status
        )
    )

@api_router.post("/auth/login", response_model=AuthResponse)
async def login(input: UserLogin):
    # Find user
    user = await db.users.find_one({"email": input.email}, {"_id": 0})
    if not user:
        return AuthResponse(success=False, message="E-Mail oder Passwort falsch.")
    
    # Verify password
    if not verify_password(input.password, user['password_hash']):
        return AuthResponse(success=False, message="E-Mail oder Passwort falsch.")
    
    # Create token
    token = create_token(user['id'], user['email'])
    
    return AuthResponse(
        success=True,
        message="Anmeldung erfolgreich!",
        token=token,
        user=UserResponse(
            id=user['id'],
            email=user['email'],
            name=user['name'],
            subscription=user.get('subscription', 'free'),
            subscription_status=user.get('subscription_status', 'active')
        )
    )

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(user: dict = Depends(require_auth)):
    return UserResponse(
        id=user['id'],
        email=user['email'],
        name=user['name'],
        subscription=user.get('subscription', 'free'),
        subscription_status=user.get('subscription_status', 'active')
    )

# ==================== STRIPE PAYMENT ROUTES ====================

@api_router.post("/payments/checkout", response_model=CheckoutResponse)
async def create_checkout(input: CheckoutRequest, request: Request, user: dict = Depends(require_auth)):
    # Validate plan
    if input.plan not in SUBSCRIPTION_PLANS or input.plan == "free":
        return CheckoutResponse(success=False, message="Ungültiger Plan ausgewählt.")
    
    plan = SUBSCRIPTION_PLANS[input.plan]
    amount = plan["price"]
    
    # Create Stripe checkout
    try:
        host_url = str(request.base_url).rstrip('/')
        webhook_url = f"{host_url}/api/webhook/stripe"
        
        stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
        
        success_url = f"{input.origin_url}/payment/success?session_id={{CHECKOUT_SESSION_ID}}"
        cancel_url = f"{input.origin_url}/pricing"
        
        checkout_request = CheckoutSessionRequest(
            amount=float(amount),
            currency="eur",
            success_url=success_url,
            cancel_url=cancel_url,
            metadata={
                "user_id": user['id'],
                "user_email": user['email'],
                "plan": input.plan
            }
        )
        
        session: CheckoutSessionResponse = await stripe_checkout.create_checkout_session(checkout_request)
        
        # Create payment transaction record
        transaction = PaymentTransaction(
            user_id=user['id'],
            user_email=user['email'],
            session_id=session.session_id,
            plan=input.plan,
            amount=amount,
            payment_status="pending"
        )
        
        doc = transaction.model_dump()
        doc['created_at'] = doc['created_at'].isoformat()
        await db.payment_transactions.insert_one(doc)
        
        return CheckoutResponse(
            success=True,
            checkout_url=session.url,
            session_id=session.session_id
        )
        
    except Exception as e:
        logger.error(f"Stripe checkout error: {str(e)}")
        return CheckoutResponse(success=False, message=f"Fehler beim Erstellen der Checkout-Session: {str(e)}")

@api_router.get("/payments/status/{session_id}")
async def get_payment_status(session_id: str, request: Request, user: dict = Depends(require_auth)):
    try:
        host_url = str(request.base_url).rstrip('/')
        webhook_url = f"{host_url}/api/webhook/stripe"
        
        stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
        status: CheckoutStatusResponse = await stripe_checkout.get_checkout_status(session_id)
        
        # Update transaction in database
        if status.payment_status == "paid":
            # Check if already processed
            transaction = await db.payment_transactions.find_one(
                {"session_id": session_id}, 
                {"_id": 0}
            )
            
            if transaction and transaction.get('payment_status') != 'paid':
                # Update transaction status
                await db.payment_transactions.update_one(
                    {"session_id": session_id},
                    {"$set": {"payment_status": "paid"}}
                )
                
                # Update user subscription
                plan = transaction.get('plan', 'pro')
                await db.users.update_one(
                    {"id": user['id']},
                    {"$set": {"subscription": plan, "subscription_status": "active"}}
                )
        
        return {
            "status": status.status,
            "payment_status": status.payment_status,
            "amount_total": status.amount_total,
            "currency": status.currency
        }
        
    except Exception as e:
        logger.error(f"Payment status error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    try:
        body = await request.body()
        signature = request.headers.get("Stripe-Signature")
        
        host_url = str(request.base_url).rstrip('/')
        webhook_url = f"{host_url}/api/webhook/stripe"
        
        stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
        webhook_response = await stripe_checkout.handle_webhook(body, signature)
        
        if webhook_response.payment_status == "paid":
            session_id = webhook_response.session_id
            metadata = webhook_response.metadata
            
            # Update transaction
            await db.payment_transactions.update_one(
                {"session_id": session_id},
                {"$set": {"payment_status": "paid"}}
            )
            
            # Update user subscription
            if metadata:
                user_id = metadata.get("user_id")
                plan = metadata.get("plan", "pro")
                if user_id:
                    await db.users.update_one(
                        {"id": user_id},
                        {"$set": {"subscription": plan, "subscription_status": "active"}}
                    )
        
        return {"status": "received"}
        
    except Exception as e:
        logger.error(f"Webhook error: {str(e)}")
        return {"status": "error", "message": str(e)}

# ==================== SOFASCORE LIVE DATA ROUTES ====================

def sofascore_request(endpoint: str, params: dict = None) -> dict:
    """Make request to SofaScore API"""
    url = f"https://{SOFASCORE_HOST}/{endpoint}"
    headers = {
        "x-rapidapi-host": SOFASCORE_HOST,
        "x-rapidapi-key": SOFASCORE_API_KEY
    }
    
    try:
        response = requests.get(url, headers=headers, params=params, timeout=10)
        if response.status_code == 200:
            return response.json()
        else:
            logger.error(f"SofaScore API error: {response.status_code}")
            return None
    except Exception as e:
        logger.error(f"SofaScore request error: {str(e)}")
        return None

@api_router.get("/live/matches")
async def get_live_matches(user: Optional[dict] = Depends(get_current_user)):
    """Get live football matches"""
    # Check subscription for full access
    is_premium = user and user.get('subscription') in ['pro', 'elite']
    
    data = await asyncio.to_thread(sofascore_request, "sport/football/events/live")
    
    if not data:
        # Return simulated data as fallback
        return {"events": generate_simulated_matches(limit=5 if not is_premium else 20), "source": "simulation"}
    
    events = data.get("events", [])
    
    # Limit for free users
    if not is_premium:
        events = events[:5]
    
    # Transform data for our format
    transformed = []
    for event in events[:20]:  # Max 20 events
        tournament = event.get("tournament", {})
        home_team = event.get("homeTeam", {})
        away_team = event.get("awayTeam", {})
        home_score = event.get("homeScore", {})
        away_score = event.get("awayScore", {})
        status = event.get("status", {})
        
        transformed.append({
            "id": event.get("id"),
            "tournament": tournament.get("name", "Unknown"),
            "home_team": home_team.get("name", "Home"),
            "away_team": away_team.get("name", "Away"),
            "home_score": home_score.get("current", 0),
            "away_score": away_score.get("current", 0),
            "status": status.get("description", "Live"),
            "minute": status.get("description", ""),
            "start_timestamp": event.get("startTimestamp")
        })
    
    return {"events": transformed, "source": "sofascore", "is_premium": is_premium}

@api_router.get("/live/match/{match_id}")
async def get_match_details(match_id: int, user: dict = Depends(require_auth)):
    """Get detailed match statistics (requires auth)"""
    is_premium = user.get('subscription') in ['pro', 'elite']
    
    if not is_premium:
        raise HTTPException(status_code=403, detail="Premium-Abo erforderlich für detaillierte Statistiken.")
    
    data = await asyncio.to_thread(sofascore_request, f"event/{match_id}")
    
    if not data:
        raise HTTPException(status_code=404, detail="Match nicht gefunden")
    
    return data

@api_router.get("/live/leagues")
async def get_live_leagues():
    """Get available leagues/tournaments"""
    data = await asyncio.to_thread(sofascore_request, "sport/football/categories")
    
    if not data:
        # Return popular leagues as fallback
        return {
            "categories": [
                {"id": 1, "name": "Deutschland", "slug": "germany"},
                {"id": 2, "name": "England", "slug": "england"},
                {"id": 3, "name": "Spanien", "slug": "spain"},
                {"id": 4, "name": "Italien", "slug": "italy"},
                {"id": 5, "name": "Frankreich", "slug": "france"}
            ],
            "source": "fallback"
        }
    
    return {"categories": data.get("categories", [])[:20], "source": "sofascore"}

@api_router.get("/live/scheduled")
async def get_scheduled_matches(date: Optional[str] = None):
    """Get scheduled matches for a date"""
    if not date:
        date = datetime.now().strftime("%Y-%m-%d")
    
    data = await asyncio.to_thread(sofascore_request, f"sport/football/scheduled-events/{date}")
    
    if not data:
        return {"events": [], "date": date, "source": "fallback"}
    
    events = data.get("events", [])[:30]
    
    transformed = []
    for event in events:
        tournament = event.get("tournament", {})
        home_team = event.get("homeTeam", {})
        away_team = event.get("awayTeam", {})
        
        transformed.append({
            "id": event.get("id"),
            "tournament": tournament.get("name", "Unknown"),
            "home_team": home_team.get("name", "Home"),
            "away_team": away_team.get("name", "Away"),
            "start_timestamp": event.get("startTimestamp")
        })
    
    return {"events": transformed, "date": date, "source": "sofascore"}

def generate_simulated_matches(limit: int = 5) -> list:
    """Generate simulated match data for fallback/demo"""
    import random
    
    matches = [
        {"home": "Bayern München", "away": "Borussia Dortmund", "tournament": "Bundesliga"},
        {"home": "Liverpool", "away": "Manchester City", "tournament": "Premier League"},
        {"home": "Real Madrid", "away": "Barcelona", "tournament": "La Liga"},
        {"home": "PSG", "away": "Olympique Marseille", "tournament": "Ligue 1"},
        {"home": "Inter Mailand", "away": "AC Mailand", "tournament": "Serie A"},
        {"home": "RB Leipzig", "away": "Eintracht Frankfurt", "tournament": "Bundesliga"},
        {"home": "Arsenal", "away": "Chelsea", "tournament": "Premier League"},
        {"home": "Atlético Madrid", "away": "Sevilla", "tournament": "La Liga"},
        {"home": "Juventus", "away": "AS Roma", "tournament": "Serie A"},
        {"home": "Borussia M'gladbach", "away": "VfB Stuttgart", "tournament": "Bundesliga"},
    ]
    
    result = []
    for i, match in enumerate(matches[:limit]):
        result.append({
            "id": 1000 + i,
            "tournament": match["tournament"],
            "home_team": match["home"],
            "away_team": match["away"],
            "home_score": random.randint(0, 3),
            "away_score": random.randint(0, 3),
            "status": "Live",
            "minute": f"{random.randint(1, 90)}'",
            "start_timestamp": int(datetime.now().timestamp())
        })
    
    return result

# ==================== THE ODDS API ROUTES ====================

def odds_api_request(endpoint: str, params: dict = None) -> dict:
    """Make request to The Odds API"""
    url = f"{ODDS_API_BASE_URL}/{endpoint}"
    
    if params is None:
        params = {}
    params["apiKey"] = ODDS_API_KEY
    
    try:
        response = requests.get(url, params=params, timeout=15)
        
        # Log quota usage
        remaining = response.headers.get("x-requests-remaining", "N/A")
        used = response.headers.get("x-requests-used", "N/A")
        logger.info(f"Odds API - Used: {used}, Remaining: {remaining}")
        
        if response.status_code == 200:
            return {"data": response.json(), "remaining": remaining, "used": used}
        elif response.status_code == 401:
            logger.error("Odds API: Invalid API key")
            return None
        elif response.status_code == 429:
            logger.error("Odds API: Rate limit exceeded")
            return None
        else:
            logger.error(f"Odds API error: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        logger.error(f"Odds API request error: {str(e)}")
        return None

@api_router.get("/odds/sports")
async def get_odds_sports():
    """Get all available sports from The Odds API"""
    result = await asyncio.to_thread(odds_api_request, "sports")
    
    if not result:
        return {"sports": [], "source": "error", "message": "API nicht erreichbar"}
    
    # Filter for soccer/football
    all_sports = result["data"]
    soccer_sports = [s for s in all_sports if "soccer" in s.get("key", "").lower() or "football" in s.get("group", "").lower()]
    
    return {
        "sports": soccer_sports,
        "all_sports": all_sports,
        "remaining_credits": result["remaining"],
        "source": "the-odds-api"
    }

@api_router.get("/odds/live")
async def get_live_odds(
    sport: str = "soccer_germany_bundesliga",
    regions: str = "eu",
    markets: str = "h2h,spreads,totals",
    user: Optional[dict] = Depends(get_current_user)
):
    """Get live odds for a sport"""
    is_premium = user and user.get('subscription') in ['pro', 'elite']
    
    params = {
        "regions": regions,
        "markets": markets,
        "oddsFormat": "decimal"
    }
    
    result = await asyncio.to_thread(odds_api_request, f"sports/{sport}/odds", params)
    
    if not result:
        # Return simulated fallback
        return {
            "events": generate_simulated_odds(limit=5 if not is_premium else 15),
            "source": "simulation",
            "is_premium": is_premium,
            "message": "Live-Daten nicht verfügbar, Simulationsdaten werden angezeigt"
        }
    
    events = result["data"]
    
    # Transform for frontend
    transformed = []
    for event in events:
        transformed_event = {
            "id": event.get("id"),
            "sport_key": event.get("sport_key"),
            "sport_title": event.get("sport_title"),
            "commence_time": event.get("commence_time"),
            "home_team": event.get("home_team"),
            "away_team": event.get("away_team"),
            "bookmakers": []
        }
        
        # Process bookmakers and odds
        for bookmaker in event.get("bookmakers", []):
            bm = {
                "key": bookmaker.get("key"),
                "title": bookmaker.get("title"),
                "markets": []
            }
            
            for market in bookmaker.get("markets", []):
                m = {
                    "key": market.get("key"),
                    "outcomes": market.get("outcomes", [])
                }
                bm["markets"].append(m)
            
            transformed_event["bookmakers"].append(bm)
        
        transformed.append(transformed_event)
    
    # Limit for free users
    if not is_premium:
        transformed = transformed[:5]
    
    return {
        "events": transformed,
        "total": len(transformed),
        "remaining_credits": result["remaining"],
        "source": "the-odds-api",
        "is_premium": is_premium
    }

@api_router.get("/odds/event/{event_id}")
async def get_event_odds(
    event_id: str,
    sport: str = "soccer_germany_bundesliga",
    regions: str = "eu",
    markets: str = "h2h,spreads,totals",
    user: dict = Depends(require_auth)
):
    """Get detailed odds for a specific event"""
    is_premium = user.get('subscription') in ['pro', 'elite']
    
    if not is_premium:
        raise HTTPException(status_code=403, detail="Premium-Abo erforderlich für detaillierte Odds.")
    
    params = {
        "regions": regions,
        "markets": markets,
        "oddsFormat": "decimal"
    }
    
    result = await asyncio.to_thread(odds_api_request, f"sports/{sport}/events/{event_id}/odds", params)
    
    if not result:
        raise HTTPException(status_code=404, detail="Event nicht gefunden oder API nicht erreichbar")
    
    return {
        "event": result["data"],
        "remaining_credits": result["remaining"],
        "source": "the-odds-api"
    }

def generate_simulated_odds(limit: int = 5) -> list:
    """Generate simulated odds data for fallback/demo"""
    import random
    
    matches = [
        {"home": "Bayern München", "away": "Borussia Dortmund", "sport": "Bundesliga"},
        {"home": "Liverpool", "away": "Manchester City", "sport": "Premier League"},
        {"home": "Real Madrid", "away": "Barcelona", "sport": "La Liga"},
        {"home": "PSG", "away": "Olympique Marseille", "sport": "Ligue 1"},
        {"home": "Inter Mailand", "away": "AC Mailand", "sport": "Serie A"},
        {"home": "RB Leipzig", "away": "Eintracht Frankfurt", "sport": "Bundesliga"},
        {"home": "Arsenal", "away": "Chelsea", "sport": "Premier League"},
        {"home": "Atlético Madrid", "away": "Sevilla", "sport": "La Liga"},
        {"home": "Juventus", "away": "AS Roma", "sport": "Serie A"},
        {"home": "Wolfsburg", "away": "Union Berlin", "sport": "Bundesliga"},
        {"home": "Tottenham", "away": "Newcastle", "sport": "Premier League"},
        {"home": "Valencia", "away": "Villarreal", "sport": "La Liga"},
        {"home": "Napoli", "away": "Lazio", "sport": "Serie A"},
        {"home": "Monaco", "away": "Lyon", "sport": "Ligue 1"},
        {"home": "Bayer Leverkusen", "away": "Freiburg", "sport": "Bundesliga"},
    ]
    
    result = []
    for i, match in enumerate(matches[:limit]):
        home_odds = round(random.uniform(1.4, 3.5), 2)
        draw_odds = round(random.uniform(2.8, 4.2), 2)
        away_odds = round(random.uniform(1.6, 4.5), 2)
        
        result.append({
            "id": f"sim_{1000 + i}",
            "sport_key": f"soccer_{match['sport'].lower().replace(' ', '_')}",
            "sport_title": match["sport"],
            "commence_time": (datetime.now(timezone.utc) + timedelta(hours=random.randint(1, 48))).isoformat(),
            "home_team": match["home"],
            "away_team": match["away"],
            "bookmakers": [
                {
                    "key": "simulated",
                    "title": "Demo Buchmacher",
                    "markets": [
                        {
                            "key": "h2h",
                            "outcomes": [
                                {"name": match["home"], "price": home_odds},
                                {"name": "Draw", "price": draw_odds},
                                {"name": match["away"], "price": away_odds}
                            ]
                        },
                        {
                            "key": "totals",
                            "outcomes": [
                                {"name": "Over", "point": 2.5, "price": round(random.uniform(1.7, 2.1), 2)},
                                {"name": "Under", "point": 2.5, "price": round(random.uniform(1.7, 2.1), 2)}
                            ]
                        }
                    ]
                }
            ]
        })
    
    return result

# ==================== ANALYSIS ROUTES (BETRADARMUS CORE) ====================

@api_router.get("/analysis/opportunities")
async def get_opportunities(user: Optional[dict] = Depends(get_current_user)):
    """Get live market opportunities with risk analysis - NOW WITH REAL ODDS DATA"""
    import random
    
    is_premium = user and user.get('subscription') in ['pro', 'elite']
    is_elite = user and user.get('subscription') == 'elite'
    
    # Try to get real odds from The Odds API
    odds_result = await asyncio.to_thread(
        odds_api_request, 
        "sports/soccer_germany_bundesliga/odds",
        {"regions": "eu", "markets": "h2h,totals", "oddsFormat": "decimal"}
    )
    
    is_simulated = False
    events = []
    
    if odds_result and odds_result.get("data"):
        events = odds_result["data"]
        logger.info(f"Fetched {len(events)} real events from The Odds API")
    else:
        # Fallback to simulation
        is_simulated = True
        events = generate_simulated_odds(limit=15)
        logger.info("Using simulated odds data")
    
    opportunities = []
    
    for i, event in enumerate(events):
        home_team = event.get("home_team", "Home")
        away_team = event.get("away_team", "Away")
        sport_title = event.get("sport_title", "Fußball")
        commence_time = event.get("commence_time", datetime.now(timezone.utc).isoformat())
        
        # Extract best odds from bookmakers
        best_home_odds = None
        best_draw_odds = None
        best_away_odds = None
        best_over_odds = None
        best_under_odds = None
        bookmaker_count = 0
        
        for bookmaker in event.get("bookmakers", []):
            bookmaker_count += 1
            for market in bookmaker.get("markets", []):
                if market.get("key") == "h2h":
                    for outcome in market.get("outcomes", []):
                        price = outcome.get("price", 0)
                        name = outcome.get("name", "")
                        if name == home_team:
                            if best_home_odds is None or price > best_home_odds:
                                best_home_odds = price
                        elif name == away_team:
                            if best_away_odds is None or price > best_away_odds:
                                best_away_odds = price
                        elif name.lower() == "draw":
                            if best_draw_odds is None or price > best_draw_odds:
                                best_draw_odds = price
                elif market.get("key") == "totals":
                    for outcome in market.get("outcomes", []):
                        price = outcome.get("price", 0)
                        name = outcome.get("name", "")
                        if name.lower() == "over":
                            if best_over_odds is None or price > best_over_odds:
                                best_over_odds = price
                        elif name.lower() == "under":
                            if best_under_odds is None or price > best_under_odds:
                                best_under_odds = price
        
        # Calculate opportunity based on odds
        if best_home_odds and best_draw_odds and best_away_odds:
            # Calculate implied probabilities
            implied_home = 1 / best_home_odds if best_home_odds > 0 else 0
            implied_draw = 1 / best_draw_odds if best_draw_odds > 0 else 0
            implied_away = 1 / best_away_odds if best_away_odds > 0 else 0
            total_implied = implied_home + implied_draw + implied_away
            
            # Margin/Overround (lower is better for bettors)
            margin = (total_implied - 1) * 100
            
            # Determine best market and confidence
            markets_analysis = []
            
            if best_home_odds:
                confidence = min(95, int((1 / best_home_odds) * 100 + random.randint(10, 30)))
                markets_analysis.append({
                    "market": f"Heimsieg ({home_team})",
                    "odds": best_home_odds,
                    "confidence": confidence,
                    "implied_prob": round(implied_home * 100, 1)
                })
            
            if best_away_odds:
                confidence = min(95, int((1 / best_away_odds) * 100 + random.randint(10, 30)))
                markets_analysis.append({
                    "market": f"Auswärtssieg ({away_team})",
                    "odds": best_away_odds,
                    "confidence": confidence,
                    "implied_prob": round(implied_away * 100, 1)
                })
            
            if best_over_odds:
                confidence = min(95, int((1 / best_over_odds) * 100 + random.randint(15, 35)))
                markets_analysis.append({
                    "market": "Over 2.5 Tore",
                    "odds": best_over_odds,
                    "confidence": confidence,
                    "implied_prob": round((1/best_over_odds)*100, 1) if best_over_odds > 0 else 0
                })
            
            if best_under_odds:
                confidence = min(95, int((1 / best_under_odds) * 100 + random.randint(15, 35)))
                markets_analysis.append({
                    "market": "Under 2.5 Tore",
                    "odds": best_under_odds,
                    "confidence": confidence,
                    "implied_prob": round((1/best_under_odds)*100, 1) if best_under_odds > 0 else 0
                })
            
            # Pick best opportunity
            if markets_analysis:
                best_market = max(markets_analysis, key=lambda x: x["confidence"])
                
                # Calculate risk score based on margin and odds variance
                risk_score = min(90, max(10, int(margin * 3 + random.randint(0, 20))))
                
                # Calculate expected value
                ev_value = round((best_market["odds"] - 1) * (best_market["confidence"] / 100) * 10, 1)
                
                opportunity = {
                    "id": event.get("id", f"event_{i}"),
                    "match": f"{home_team} vs {away_team}",
                    "home_team": home_team,
                    "away_team": away_team,
                    "tournament": sport_title,
                    "commence_time": commence_time,
                    "market": best_market["market"],
                    "odds": best_market["odds"],
                    "confidence": best_market["confidence"],
                    "risk_score": risk_score,
                    "risk_level": "LOW" if risk_score < 30 else "MED" if risk_score < 60 else "HIGH",
                    "ev": ev_value,
                    "margin": round(margin, 2),
                    "bookmaker_count": bookmaker_count,
                    "timestamp": datetime.now(timezone.utc).isoformat()
                }
                
                # Premium features - show all markets
                if is_premium:
                    opportunity["all_markets"] = markets_analysis
                    opportunity["detailed_stats"] = {
                        "home_implied_prob": round(implied_home * 100, 1),
                        "draw_implied_prob": round(implied_draw * 100, 1),
                        "away_implied_prob": round(implied_away * 100, 1),
                        "market_margin": round(margin, 2)
                    }
                
                # Elite features - explainable AI
                if is_elite:
                    opportunity["explainable_ai"] = {
                        "factors": [
                            f"Markt-Margin: {round(margin, 1)}% (niedrig = gut)",
                            f"Buchmacher-Konsens: {bookmaker_count} Anbieter",
                            f"Odds-Differenz: {round(max(best_home_odds or 0, best_away_odds or 0) - min(best_home_odds or 99, best_away_odds or 99), 2)}"
                        ],
                        "model_confidence": round(best_market["confidence"] / 100, 2),
                        "recommendation": "STARK" if best_market["confidence"] > 75 else "MODERAT" if best_market["confidence"] > 60 else "SCHWACH"
                    }
                
                opportunities.append(opportunity)
    
    # Sort by confidence descending
    opportunities.sort(key=lambda x: x["confidence"], reverse=True)
    
    # Limit for free users
    if not is_premium:
        opportunities = opportunities[:5]
    
    return {
        "opportunities": opportunities,
        "total": len(opportunities),
        "is_premium": is_premium,
        "is_elite": is_elite,
        "is_simulated": is_simulated,
        "data_source": "simulation" if is_simulated else "the-odds-api",
        "remaining_credits": odds_result.get("remaining") if odds_result else "N/A",
        "updated_at": datetime.now(timezone.utc).isoformat()
    }

# ==================== EXISTING ROUTES ====================

@api_router.get("/")
async def root():
    return {"message": "BETRADARMUS API - Live-Fußball intelligent analysiert"}

@api_router.post("/early-access", response_model=EarlyAccessResponse)
async def create_early_access_signup(input: EarlyAccessCreate):
    existing = await db.early_access.find_one({"email": input.email}, {"_id": 0})
    if existing:
        return EarlyAccessResponse(
            success=False,
            message="Diese E-Mail-Adresse ist bereits für den Early Access registriert."
        )
    
    signup_obj = EarlyAccessSignup(
        email=input.email,
        plan_interest=input.plan_interest
    )
    
    doc = signup_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    await db.early_access.insert_one(doc)
    
    return EarlyAccessResponse(
        success=True,
        message="Erfolgreich registriert! Wir melden uns bald bei Ihnen.",
        id=signup_obj.id
    )

@api_router.get("/early-access/count")
async def get_early_access_count():
    count = await db.early_access.count_documents({})
    return {"count": count}

@api_router.post("/contact", response_model=ContactResponse)
async def create_contact_message(input: ContactCreate):
    contact_obj = ContactMessage(
        name=input.name,
        email=input.email,
        subject=input.subject,
        message=input.message
    )
    
    doc = contact_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    await db.contact_messages.insert_one(doc)
    
    return ContactResponse(
        success=True,
        message="Ihre Nachricht wurde erfolgreich gesendet. Wir melden uns in Kürze bei Ihnen."
    )

@api_router.get("/plans")
async def get_subscription_plans():
    """Get available subscription plans"""
    return {
        "plans": [
            {"id": "free", "name": "Free", "price": 0, "currency": "EUR", "features": SUBSCRIPTION_PLANS["free"]["features"]},
            {"id": "pro", "name": "Pro", "price": 19, "currency": "EUR", "features": SUBSCRIPTION_PLANS["pro"]["features"]},
            {"id": "elite", "name": "Elite", "price": 39, "currency": "EUR", "features": SUBSCRIPTION_PLANS["elite"]["features"]}
        ]
    }

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
