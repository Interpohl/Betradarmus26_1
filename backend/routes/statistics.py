"""
Statistics Routes - Performance statistics and analytics
"""
from fastapi import APIRouter, Depends, HTTPException
from typing import Optional
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/statistics", tags=["Statistics"])

# Database reference
db = None

def set_database(database):
    global db
    db = database

# Auth helpers
get_current_user = None
require_auth = None

def set_auth_helpers(current_user_helper, auth_helper):
    global get_current_user, require_auth
    get_current_user = current_user_helper
    require_auth = auth_helper


@router.get("")
async def get_statistics(user: Optional[dict] = Depends(lambda: get_current_user)):
    """Get overall tip statistics"""
    try:
        from statistics_service import get_statistics_service
        service = get_statistics_service()
        stats = await service.get_overall_statistics()
        return stats
    except Exception as e:
        logger.error(f"Error getting statistics: {e}")
        raise HTTPException(status_code=500, detail="Fehler beim Laden der Statistiken")


@router.get("/leagues")
async def get_league_statistics(user: Optional[dict] = Depends(lambda: get_current_user)):
    """Get performance breakdown by league"""
    try:
        from statistics_service import get_statistics_service
        service = get_statistics_service()
        stats = await service.get_league_breakdown()
        return stats
    except Exception as e:
        logger.error(f"Error getting league statistics: {e}")
        raise HTTPException(status_code=500, detail="Fehler beim Laden der Liga-Statistiken")


@router.get("/monthly")
async def get_monthly_statistics(user: Optional[dict] = Depends(lambda: get_current_user)):
    """Get monthly performance data for charts"""
    try:
        from statistics_service import get_statistics_service
        service = get_statistics_service()
        stats = await service.get_monthly_performance()
        return stats
    except Exception as e:
        logger.error(f"Error getting monthly statistics: {e}")
        raise HTTPException(status_code=500, detail="Fehler beim Laden der monatlichen Statistiken")


@router.get("/recent")
async def get_recent_tips(user: Optional[dict] = Depends(lambda: get_current_user)):
    """Get recent evaluated tips"""
    try:
        from statistics_service import get_statistics_service
        service = get_statistics_service()
        tips = await service.get_recent_evaluated_tips(limit=20)
        return {"tips": tips}
    except Exception as e:
        logger.error(f"Error getting recent tips: {e}")
        raise HTTPException(status_code=500, detail="Fehler beim Laden der Tipps")


@router.post("/process")
async def process_pending_tips(user: dict = Depends(lambda: require_auth)):
    """Process pending tips - ELITE only"""
    if user.get("subscription") != "elite" and not user.get("is_admin"):
        raise HTTPException(status_code=403, detail="ELITE-Abo erforderlich")
    
    try:
        from statistics_service import get_statistics_service
        service = get_statistics_service()
        result = await service.process_pending_results()
        return result
    except Exception as e:
        logger.error(f"Error processing tips: {e}")
        raise HTTPException(status_code=500, detail="Fehler beim Verarbeiten")


@router.post("/record-tip")
async def record_new_tip(tip_data: dict, user: dict = Depends(lambda: require_auth)):
    """Record a new tip - ELITE only"""
    if user.get("subscription") != "elite" and not user.get("is_admin"):
        raise HTTPException(status_code=403, detail="ELITE-Abo erforderlich")
    
    try:
        from statistics_service import get_statistics_service
        service = get_statistics_service()
        result = await service.record_tip(tip_data)
        return result
    except Exception as e:
        logger.error(f"Error recording tip: {e}")
        raise HTTPException(status_code=500, detail="Fehler beim Speichern")
