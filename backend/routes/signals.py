"""
Signals Routes - Signal Engine 2.0 API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException
from typing import Optional, List
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/signals", tags=["Signals"])

# Database reference
db = None

def set_database(database):
    global db
    db = database

# Auth helper
get_current_user = None

def set_auth_helper(auth_helper):
    global get_current_user
    get_current_user = auth_helper


# ==================== SIGNAL ENGINE 2.0 ====================

@router.get("/live")
async def get_live_signals(user: Optional[dict] = Depends(lambda: get_current_user)):
    """Get live trading signals for in-play matches"""
    from oddspapi_service import get_signal_engine
    
    is_premium = user and user.get('subscription') in ['pro', 'elite']
    
    try:
        engine = get_signal_engine()
        signals = engine.analyze_live_matches()
        
        if not signals:
            return {
                "signals": [],
                "count": 0,
                "message": "Keine Live-Spiele mit Quotendaten verfügbar",
                "is_premium": is_premium
            }
        
        # Free users get limited preview
        if not is_premium:
            preview_signals = []
            for signal in signals[:2]:
                preview_signals.append({
                    "fixture_id": signal["fixture_id"],
                    "home_team": signal["home_team"],
                    "away_team": signal["away_team"],
                    "signal_score": signal["signal_score"],
                    "recommendation": "HIDDEN",
                    "recommendation_text": "Upgrade für Details",
                    "suggested_bet": None,
                    "analysis": None,
                    "premium_required": True
                })
            
            return {
                "signals": preview_signals,
                "count": len(signals),
                "total_available": len(signals),
                "message": f"{len(signals)} Signale verfügbar - Upgrade für vollen Zugriff",
                "is_premium": False,
                "premium_required": True
            }
        
        return {
            "signals": signals,
            "count": len(signals),
            "is_premium": True
        }
        
    except Exception as e:
        logger.error(f"Error getting live signals: {e}")
        raise HTTPException(status_code=500, detail="Fehler beim Laden der Signale")


@router.get("/upcoming")
async def get_upcoming_signals(
    tournament_ids: Optional[str] = None,
    user: Optional[dict] = Depends(lambda: get_current_user)
):
    """Get pre-match signals for upcoming matches"""
    from oddspapi_service import get_signal_engine
    
    is_premium = user and user.get('subscription') in ['pro', 'elite']
    is_elite = user and user.get('subscription') == 'elite'
    
    try:
        engine = get_signal_engine()
        
        tournaments = None
        if tournament_ids:
            tournaments = [int(t.strip()) for t in tournament_ids.split(",")]
        
        signals = engine.analyze_upcoming_matches(tournaments)
        
        if not signals:
            return {
                "signals": [],
                "count": 0,
                "message": "Keine bevorstehenden Spiele mit Quotendaten verfügbar",
                "is_premium": is_premium
            }
        
        # Free users get limited preview
        if not is_premium:
            preview_signals = []
            for signal in signals[:3]:
                preview_signals.append({
                    "fixture_id": signal["fixture_id"],
                    "home_team": signal["home_team"],
                    "away_team": signal["away_team"],
                    "start_time": signal["start_time"],
                    "signal_score": signal["signal_score"],
                    "recommendation": "HIDDEN",
                    "premium_required": True
                })
            
            return {
                "signals": preview_signals,
                "count": len(preview_signals),
                "total_available": len(signals),
                "is_premium": False,
                "premium_required": True
            }
        
        # PRO: 10 signals, ELITE: all
        max_signals = 50 if is_elite else 10
        
        return {
            "signals": signals[:max_signals],
            "count": len(signals[:max_signals]),
            "total_available": len(signals),
            "is_premium": True,
            "is_elite": is_elite
        }
        
    except Exception as e:
        logger.error(f"Error getting upcoming signals: {e}")
        raise HTTPException(status_code=500, detail="Fehler beim Laden der Signale")


@router.get("/analyze/{fixture_id}")
async def analyze_fixture(fixture_id: str, user: Optional[dict] = Depends(lambda: get_current_user)):
    """Get detailed analysis for a specific fixture (ELITE only)"""
    from oddspapi_service import get_oddspapi_service, get_signal_engine
    
    is_elite = user and user.get('subscription') == 'elite'
    
    if not is_elite:
        return {
            "fixture_id": fixture_id,
            "premium_required": True,
            "required_plan": "elite",
            "message": "Detaillierte Analyse ist nur für ELITE Nutzer verfügbar"
        }
    
    try:
        service = get_oddspapi_service()
        engine = get_signal_engine()
        
        odds_data = service.get_odds_by_fixture(fixture_id)
        
        if not odds_data:
            raise HTTPException(status_code=404, detail="Spiel nicht gefunden")
        
        analysis = engine.analyze_1x2_market(odds_data)
        
        if not analysis:
            return {
                "fixture_id": fixture_id,
                "message": "Keine Quotendaten für dieses Spiel verfügbar"
            }
        
        signal = engine.generate_signal(odds_data, analysis)
        
        return {
            "fixture_id": fixture_id,
            "signal": signal,
            "detailed_analysis": analysis,
            "is_elite": True
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error analyzing fixture {fixture_id}: {e}")
        raise HTTPException(status_code=500, detail="Fehler bei der Analyse")


@router.get("/tournaments")
async def get_available_tournaments():
    """Get list of available football tournaments/leagues"""
    from oddspapi_service import get_oddspapi_service
    
    try:
        service = get_oddspapi_service()
        tournaments = service.get_tournaments()
        
        active_tournaments = [
            {
                "id": t.get("tournamentId"),
                "name": t.get("tournamentName"),
                "slug": t.get("tournamentSlug"),
                "country": t.get("categoryName"),
                "upcoming_fixtures": t.get("upcomingFixtures", 0),
                "live_fixtures": t.get("liveFixtures", 0)
            }
            for t in tournaments
            if t.get("upcomingFixtures", 0) > 0 or t.get("liveFixtures", 0) > 0
        ]
        
        active_tournaments.sort(key=lambda x: x["upcoming_fixtures"], reverse=True)
        
        return {
            "tournaments": active_tournaments[:50],
            "count": len(active_tournaments)
        }
        
    except Exception as e:
        logger.error(f"Error getting tournaments: {e}")
        return {
            "tournaments": [],
            "count": 0,
            "error": "Fehler beim Laden der Ligen"
        }


@router.get("/account")
async def get_signals_account_info(user: dict = Depends(lambda: get_current_user)):
    """Get OddsPapi account information (Admin only)"""
    from oddspapi_service import get_oddspapi_service
    
    if not user or not user.get('is_admin'):
        raise HTTPException(status_code=403, detail="Admin-Zugriff erforderlich")
    
    try:
        service = get_oddspapi_service()
        account_info = service.get_account_info()
        
        return {
            "account": account_info,
            "service_status": "active" if account_info else "error"
        }
    except Exception as e:
        logger.error(f"Error getting account info: {e}")
        return {
            "account": None,
            "service_status": "error",
            "error": str(e)
        }
