from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

# Early Access Signup Model
class EarlyAccessSignup(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    plan_interest: Optional[str] = "free"
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class EarlyAccessCreate(BaseModel):
    email: EmailStr
    plan_interest: Optional[str] = "free"

class EarlyAccessResponse(BaseModel):
    success: bool
    message: str
    id: Optional[str] = None

# Contact Form Model
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


# Routes
@api_router.get("/")
async def root():
    return {"message": "BETRADARMUS API - Live-Fußball intelligent analysiert"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    _ = await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    
    return status_checks

# Early Access Signup Endpoint
@api_router.post("/early-access", response_model=EarlyAccessResponse)
async def create_early_access_signup(input: EarlyAccessCreate):
    # Check if email already exists
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

# Contact Form Endpoint
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


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
