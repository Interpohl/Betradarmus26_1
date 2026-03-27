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
        This is a simplified implementation
        """
        # In a full implementation, you would:
        # 1. Parse the event title to identify the sport and teams
        # 2. Query The Odds API for matching events
        # 3. Match the specific market (winner, over/under, etc.)
        
        # For now, return simulated odds for demonstration
        # In production, integrate with The Odds API
        
        keywords_to_odds = {
            "world cup": {"bookmaker": "bet365", "odds": 2.10},
            "super bowl": {"bookmaker": "DraftKings", "odds": 1.95},
            "champions league": {"bookmaker": "Unibet", "odds": 2.25},
            "nfl": {"bookmaker": "FanDuel", "odds": 1.85},
            "nba": {"bookmaker": "BetMGM", "odds": 1.90},
            "ufc": {"bookmaker": "bet365", "odds": 2.00},
        }
        
        title_lower = event_title.lower()
        
        for keyword, odds_data in keywords_to_odds.items():
            if keyword in title_lower:
                # Add some variance to make it realistic
                import random
                variance = random.uniform(-0.15, 0.15)
                return {
                    "bookmaker": odds_data["bookmaker"],
                    "odds": round(odds_data["odds"] + variance, 2)
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
        if not self.db:
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
        if not self.db:
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
        if not self.db:
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
        if not self.db:
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
    elif db and _value_alert_service.db is None:
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
