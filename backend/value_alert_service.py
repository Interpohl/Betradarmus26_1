"""
BETRADARMUS Value Alert Service
Automatic detection of value opportunities by comparing Polymarket with bookmaker odds
"""

import asyncio
import logging
from datetime import datetime, timezone, timedelta
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, asdict
import os

logger = logging.getLogger(__name__)

# Minimum thresholds for alerts
MIN_EDGE_PERCENTAGE = 5.0  # Minimum 5% edge to trigger alert
MIN_VOLUME = 10000  # Minimum $10k volume on Polymarket
MIN_LIQUIDITY = 5000  # Minimum $5k liquidity


@dataclass
class ValueAlert:
    """Represents a value alert opportunity"""
    id: str
    created_at: str
    event_title: str
    market_question: str
    polymarket_price: float
    polymarket_probability: str
    polymarket_odds: float
    bookmaker_name: str
    bookmaker_odds: float
    bookmaker_probability: str
    edge_percentage: float
    signal_strength: str
    volume_24h: float
    liquidity: float
    sport: str
    status: str = "new"  # new, viewed, converted, dismissed
    
    def to_dict(self) -> dict:
        return asdict(self)


class ValueAlertService:
    """
    Service for detecting and managing value alerts
    Compares Polymarket prediction markets with traditional bookmaker odds
    """
    
    def __init__(self, db=None):
        self.db = db
        self._running = False
        self._task = None
        self._check_interval = 300  # Check every 5 minutes
        self._alerts: List[ValueAlert] = []
        
    async def start(self):
        """Start the value alert monitoring"""
        if self._running:
            logger.warning("Value Alert Service already running")
            return
        
        self._running = True
        self._task = asyncio.create_task(self._monitor_loop())
        logger.info("Value Alert Service started")
    
    async def stop(self):
        """Stop the value alert monitoring"""
        self._running = False
        if self._task:
            self._task.cancel()
            try:
                await self._task
            except asyncio.CancelledError:
                pass
        logger.info("Value Alert Service stopped")
    
    async def _monitor_loop(self):
        """Main monitoring loop"""
        while self._running:
            try:
                await self.scan_for_value()
            except Exception as e:
                logger.error(f"Error in value alert scan: {e}")
            
            await asyncio.sleep(self._check_interval)
    
    async def scan_for_value(self) -> List[ValueAlert]:
        """
        Scan Polymarket and compare with bookmaker odds to find value
        """
        alerts = []
        
        try:
            from polymarket_service import polymarket_service
            from odds_api_service import get_odds_for_sport
        except ImportError as e:
            logger.warning(f"Required services not available: {e}")
            return alerts
        
        # Get trending Polymarket events
        events = await polymarket_service.get_active_events(limit=30)
        
        for event in events:
            title = event.get("title", "")
            volume_24h = event.get("volume24hr", 0)
            liquidity = event.get("liquidity", 0)
            
            # Skip low volume events
            if volume_24h < MIN_VOLUME or liquidity < MIN_LIQUIDITY:
                continue
            
            markets = event.get("markets", [])
            
            for market in markets:
                question = market.get("question", "")
                prices = market.get("outcomePrices", [])
                
                if not prices or len(prices) < 1:
                    continue
                
                pm_price = float(prices[0])
                
                # Skip extreme prices
                if pm_price < 0.05 or pm_price > 0.95:
                    continue
                
                # Try to find matching bookmaker odds
                # This is a simplified version - in production you'd match more precisely
                bookmaker_odds = await self._find_matching_odds(title, question)
                
                if bookmaker_odds:
                    value_analysis = polymarket_service.find_value(pm_price, bookmaker_odds["odds"])
                    
                    if value_analysis["edge_percentage"] >= MIN_EDGE_PERCENTAGE:
                        alert = ValueAlert(
                            id=f"va_{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}_{len(alerts)}",
                            created_at=datetime.now(timezone.utc).isoformat(),
                            event_title=title,
                            market_question=question,
                            polymarket_price=pm_price,
                            polymarket_probability=value_analysis["polymarket_probability"],
                            polymarket_odds=value_analysis["polymarket_odds"],
                            bookmaker_name=bookmaker_odds.get("bookmaker", "Unknown"),
                            bookmaker_odds=bookmaker_odds["odds"],
                            bookmaker_probability=value_analysis["bookmaker_probability"],
                            edge_percentage=value_analysis["edge_percentage"],
                            signal_strength=value_analysis["signal_strength"],
                            volume_24h=volume_24h,
                            liquidity=liquidity,
                            sport=self._detect_sport(title)
                        )
                        
                        alerts.append(alert)
                        logger.info(f"Value alert found: {title} - {value_analysis['edge_percentage']}% edge")
        
        # Store alerts
        if alerts:
            await self._store_alerts(alerts)
        
        self._alerts = alerts
        return alerts
    
    async def _find_matching_odds(self, event_title: str, market_question: str) -> Optional[Dict]:
        """
        Try to find matching bookmaker odds for a Polymarket market
        Uses The Odds API for real bookmaker data with fallback to simulation
        """
        # Try to get real odds from The Odds API
        try:
            from odds_api_service import odds_api_service
            
            # Extract team names from title/question
            home_team = None
            away_team = None
            
            # Common patterns: "Team A vs Team B", "Team A to win"
            title_lower = event_title.lower()
            question_lower = market_question.lower()
            
            # Try to find real bookmaker odds
            real_odds = await odds_api_service.find_matching_odds(
                event_title=event_title,
                home_team=home_team,
                away_team=away_team,
                sport_hint=self._detect_sport(event_title)
            )
            
            if real_odds:
                # Use home_odds as primary, fall back to away_odds
                best_odds = real_odds.get("home_odds") or real_odds.get("away_odds")
                if best_odds and best_odds > 1.0:
                    logger.info(f"Found real odds for '{event_title}': {best_odds} from {real_odds.get('bookmaker')}")
                    return {
                        "bookmaker": real_odds.get("bookmaker", "The Odds API"),
                        "odds": best_odds,
                        "source": "the_odds_api",
                        "event_id": real_odds.get("event_id"),
                        "home_team": real_odds.get("home_team"),
                        "away_team": real_odds.get("away_team")
                    }
        except ImportError:
            logger.warning("odds_api_service not available, using fallback")
        except Exception as e:
            logger.warning(f"Error fetching real odds: {e}")
        
        # Fallback to simulated odds for known event types
        keywords_to_odds = {
            "world cup": {"bookmaker": "bet365 (sim)", "odds": 2.10},
            "super bowl": {"bookmaker": "DraftKings (sim)", "odds": 1.95},
            "champions league": {"bookmaker": "Unibet (sim)", "odds": 2.25},
            "nfl": {"bookmaker": "FanDuel (sim)", "odds": 1.85},
            "nba": {"bookmaker": "BetMGM (sim)", "odds": 1.90},
            "ufc": {"bookmaker": "bet365 (sim)", "odds": 2.00},
            "bundesliga": {"bookmaker": "bwin (sim)", "odds": 1.75},
            "premier league": {"bookmaker": "bet365 (sim)", "odds": 1.80},
            "la liga": {"bookmaker": "Unibet (sim)", "odds": 1.85},
            "serie a": {"bookmaker": "Betfair (sim)", "odds": 1.90},
        }
        
        for keyword, odds_data in keywords_to_odds.items():
            if keyword in title_lower or keyword in question_lower:
                import random
                variance = random.uniform(-0.15, 0.15)
                return {
                    "bookmaker": odds_data["bookmaker"],
                    "odds": round(odds_data["odds"] + variance, 2),
                    "source": "simulation"
                }
        
        return None
    
    def _detect_sport(self, title: str) -> str:
        """Detect sport from event title"""
        title_lower = title.lower()
        
        sport_keywords = {
            "soccer": ["world cup", "champions league", "premier league", "la liga", "bundesliga", "serie a"],
            "nfl": ["nfl", "super bowl", "football"],
            "nba": ["nba", "basketball"],
            "ufc": ["ufc", "mma"],
            "hockey": ["nhl", "hockey"],
            "baseball": ["mlb", "baseball"],
            "tennis": ["tennis", "wimbledon", "us open"],
        }
        
        for sport, keywords in sport_keywords.items():
            for keyword in keywords:
                if keyword in title_lower:
                    return sport
        
        return "other"
    
    async def _store_alerts(self, alerts: List[ValueAlert]):
        """Store alerts in database"""
        if self.db is None:
            return
        
        try:
            for alert in alerts:
                await self.db.value_alerts.update_one(
                    {"id": alert.id},
                    {"$set": alert.to_dict()},
                    upsert=True
                )
        except Exception as e:
            logger.error(f"Error storing alerts: {e}")
    
    async def get_alerts(
        self, 
        status: str = None, 
        min_edge: float = None,
        limit: int = 50
    ) -> List[Dict]:
        """Get alerts from database"""
        if self.db is None:
            return [a.to_dict() for a in self._alerts[:limit]]
        
        try:
            query = {}
            if status:
                query["status"] = status
            if min_edge:
                query["edge_percentage"] = {"$gte": min_edge}
            
            cursor = self.db.value_alerts.find(query).sort("created_at", -1).limit(limit)
            return await cursor.to_list(length=limit)
        except Exception as e:
            logger.error(f"Error fetching alerts: {e}")
            return []
    
    async def update_alert_status(self, alert_id: str, status: str) -> bool:
        """Update alert status"""
        if self.db is None:
            return False
        
        try:
            result = await self.db.value_alerts.update_one(
                {"id": alert_id},
                {"$set": {"status": status, "updated_at": datetime.now(timezone.utc).isoformat()}}
            )
            return result.modified_count > 0
        except Exception as e:
            logger.error(f"Error updating alert: {e}")
            return False
    
    async def convert_to_signal(self, alert_id: str) -> Optional[Dict]:
        """
        Convert a value alert to a trading signal
        """
        if self.db is None:
            return None
        
        try:
            alert = await self.db.value_alerts.find_one({"id": alert_id})
            if not alert:
                return None
            
            # Create signal data
            signal_data = {
                "sport": alert.get("sport", "soccer"),
                "league": alert.get("sport", "Unknown").upper(),
                "match": alert.get("event_title", "Unknown Event"),
                "market": alert.get("market_question", "Unknown Market"),
                "confidence": min(0.95, 0.5 + (alert.get("edge_percentage", 0) / 100)),
                "risk_score": max(10, 50 - int(alert.get("edge_percentage", 0))),
                "explanation": f"Polymarket Value Alert: {alert.get('edge_percentage', 0)}% Edge detected. "
                              f"Polymarket {alert.get('polymarket_probability', 'N/A')} vs "
                              f"{alert.get('bookmaker_name', 'Bookmaker')} {alert.get('bookmaker_probability', 'N/A')}",
                "source": "polymarket_value_alert",
                "alert_id": alert_id
            }
            
            # Update alert status
            await self.update_alert_status(alert_id, "converted")
            
            return signal_data
            
        except Exception as e:
            logger.error(f"Error converting alert to signal: {e}")
            return None
    
    def get_stats(self) -> Dict:
        """Get alert statistics"""
        return {
            "running": self._running,
            "check_interval_seconds": self._check_interval,
            "min_edge_threshold": MIN_EDGE_PERCENTAGE,
            "min_volume_threshold": MIN_VOLUME,
            "min_liquidity_threshold": MIN_LIQUIDITY,
            "active_alerts_count": len(self._alerts)
        }


# Singleton instance
_value_alert_service: Optional[ValueAlertService] = None

def get_value_alert_service(db=None) -> ValueAlertService:
    global _value_alert_service
    if _value_alert_service is None:
        _value_alert_service = ValueAlertService(db)
    elif db is not None and _value_alert_service.db is None:
        _value_alert_service.db = db
    return _value_alert_service


# ==================== TEST ====================

async def test_value_alerts():
    """Test value alert service"""
    print("Testing Value Alert Service...")
    
    service = ValueAlertService()
    
    # Scan for value
    print("\nScanning for value opportunities...")
    alerts = await service.scan_for_value()
    
    print(f"\nFound {len(alerts)} value alerts:")
    for alert in alerts[:5]:
        print(f"\n  📊 {alert.event_title}")
        print(f"     Market: {alert.market_question}")
        print(f"     Polymarket: {alert.polymarket_probability} = {alert.polymarket_odds} odds")
        print(f"     {alert.bookmaker_name}: {alert.bookmaker_probability} = {alert.bookmaker_odds} odds")
        print(f"     Edge: +{alert.edge_percentage}%")
        print(f"     Signal: {alert.signal_strength}")
    
    print("\n✅ Value Alert Service test complete!")


if __name__ == "__main__":
    asyncio.run(test_value_alerts())
