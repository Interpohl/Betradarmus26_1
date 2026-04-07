"""
Auth Routes - Authentication and user management endpoints
"""
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
import os
import logging

logger = logging.getLogger(__name__)

# JWT Config
JWT_SECRET = os.environ.get("JWT_SECRET", "your-secret-key-change-in-production")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

security = HTTPBearer(auto_error=False)

router = APIRouter(prefix="/auth", tags=["Authentication"])


# ==================== MODELS ====================

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    name: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class AuthResponse(BaseModel):
    success: bool
    message: str
    token: Optional[str] = None
    user: Optional[dict] = None

class UserResponse(BaseModel):
    id: str
    email: str
    name: Optional[str] = None
    subscription: str
    is_admin: bool
    created_at: datetime


# ==================== HELPERS ====================

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def verify_password(password: str, password_hash: str) -> bool:
    return bcrypt.checkpw(password.encode(), password_hash.encode())

def create_token(user_id: str, email: str) -> str:
    payload = {
        "user_id": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def decode_token(token: str) -> Optional[dict]:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None


# Database reference - will be set from main server
db = None

def set_database(database):
    global db
    db = database


async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> Optional[dict]:
    """Get current user from JWT token, returns None if not authenticated"""
    if not credentials:
        return None
    
    payload = decode_token(credentials.credentials)
    if not payload:
        return None
    
    user = await db.users.find_one({"email": payload["email"]})
    return user


async def require_auth(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """Require authentication, raises 401 if not authenticated"""
    if not credentials:
        raise HTTPException(status_code=401, detail="Nicht authentifiziert")
    
    payload = decode_token(credentials.credentials)
    if not payload:
        raise HTTPException(status_code=401, detail="Token ungültig oder abgelaufen")
    
    user = await db.users.find_one({"email": payload["email"]})
    if not user:
        raise HTTPException(status_code=401, detail="Benutzer nicht gefunden")
    
    return user


async def require_admin(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """Require admin authentication"""
    user = await require_auth(credentials)
    if not user.get("is_admin"):
        raise HTTPException(status_code=403, detail="Admin-Rechte erforderlich")
    return user


# ==================== ROUTES ====================

@router.post("/register", response_model=AuthResponse)
async def register(input: UserRegister):
    """Register a new user"""
    # Check if user exists
    existing = await db.users.find_one({"email": input.email})
    if existing:
        return AuthResponse(
            success=False,
            message="E-Mail ist bereits registriert.",
            token=None,
            user=None
        )
    
    # Create user
    user_doc = {
        "email": input.email,
        "password_hash": hash_password(input.password),
        "name": input.name,
        "subscription": "free",
        "is_admin": False,
        "email_verified": False,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc)
    }
    
    result = await db.users.insert_one(user_doc)
    user_id = str(result.inserted_id)
    
    # Create token
    token = create_token(user_id, input.email)
    
    return AuthResponse(
        success=True,
        message="Registrierung erfolgreich!",
        token=token,
        user={
            "id": user_id,
            "email": input.email,
            "name": input.name,
            "subscription": "free",
            "is_admin": False
        }
    )


@router.post("/login", response_model=AuthResponse)
async def login(input: UserLogin):
    """Login user"""
    user = await db.users.find_one({"email": input.email})
    
    if not user:
        return AuthResponse(
            success=False,
            message="E-Mail oder Passwort falsch.",
            token=None,
            user=None
        )
    
    if not verify_password(input.password, user.get("password_hash", "")):
        return AuthResponse(
            success=False,
            message="E-Mail oder Passwort falsch.",
            token=None,
            user=None
        )
    
    # Create token
    token = create_token(str(user["_id"]), user["email"])
    
    return AuthResponse(
        success=True,
        message="Login erfolgreich!",
        token=token,
        user={
            "id": str(user["_id"]),
            "email": user["email"],
            "name": user.get("name"),
            "subscription": user.get("subscription", "free"),
            "is_admin": user.get("is_admin", False)
        }
    )


@router.get("/me", response_model=UserResponse)
async def get_me(user: dict = Depends(require_auth)):
    """Get current user info"""
    return UserResponse(
        id=str(user["_id"]),
        email=user["email"],
        name=user.get("name"),
        subscription=user.get("subscription", "free"),
        is_admin=user.get("is_admin", False),
        created_at=user.get("created_at", datetime.now(timezone.utc))
    )
