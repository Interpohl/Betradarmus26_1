"""
BETRADARMUS Betburger API Service
Integration for Live Surebets, Valuebets and Odds from Betburger.com
"""

import aiohttp
import asyncio
import logging
import os
from typing import Dict, List, Any, Optional
from datetime import datetime, timezone
from functools import lru_cache

logger = logging.getLogger(__name__)

# Betburger API Configuration
BETBURGER_API_TOKEN = os.environ.get('BETBURGER_API_TOKEN')
# Betburger uses different base URLs - the exact path depends on your subscription
BETBURGER_LIVE_URL = "https://rest-api-lv.betburger.com/api/v1"
BETBURGER_PREMATCH_URL = "https://rest-api-pr.betburger.com/api/v1"

# Alternative endpoints (some subscriptions use these)
BETBURGER_LIVE_ALT_URL = "https://rest-api-lv.betburger.com"
BETBURGER_PREMATCH_ALT_URL = "https://rest-api-pr.betburger.com"

# Default filter ID (user needs to create this in their Betburger account)
BETBURGER_FILTER_ID = os.environ.get('BETBURGER_FILTER_ID', '')


class BetburgerService:
    """Service for fetching live surebets, valuebets and odds from Betburger API"""
    
    def __init__(self):
        self.api_token = BETBURGER_API_TOKEN
        self.filter_id = BETBURGER_FILTER_ID
        self.live_url = BETBURGER_LIVE_URL
        self.prematch_url = BETBURGER_PREMATCH_URL
        self.session: Optional[aiohttp.ClientSession] = None
        self._cache: Dict[str, Any] = {}
        self._cache_ttl = 30  # 30 seconds cache for live data
        
    async def _ensure_session(self):
        """Ensure aiohttp session exists"""
        if self.session is None or self.session.closed:
            self.session = aiohttp.ClientSession(
                timeout=aiohttp.ClientTimeout(total=30)
            )
    
    async def close(self):
        """Close the aiohttp session"""
        if self.session and not self.session.closed:
            await self.session.close()
    
    def is_configured(self) -> bool:
        """Check if Betburger API is configured"""
        return bool(self.api_token)
    
    def _get_cache_key(self, endpoint: str, params: Dict) -> str:
        """Generate cache key"""
        param_str = "_".join(f"{k}={v}" for k, v in sorted(params.items()) if k != "access_token")
        return f"{endpoint}_{param_str}"
    
    def _is_cache_valid(self, cache_key: str) -> bool:
        """Check if cache entry is still valid"""
        if cache_key not in self._cache:
            return False
        entry = self._cache[cache_key]
        age = (datetime.now(timezone.utc) - entry["timestamp"]).total_seconds()
        return age < self._cache_ttl
    
    async def _request(self, base_url: str, endpoint: str, params: Dict = None, method: str = "GET") -> Optional[Dict]:
        """Make request to Betburger API"""
        if not self.api_token:
            logger.warning("BETBURGER_API_TOKEN not configured")
            return None
        
        await self._ensure_session()
        
        if params is None:
            params = {}
        params["access_token"] = self.api_token
        
        # Check cache
        cache_key = self._get_cache_key(endpoint, params)
        if self._is_cache_valid(cache_key):
            logger.debug(f"Cache hit for {endpoint}")
            return self._cache[cache_key]["data"]
        
        # Try multiple URL patterns
        urls_to_try = [
            f"{base_url}/{endpoint}",
            f"{base_url}/api/v1/{endpoint}",
            f"{base_url}/v1/{endpoint}",
        ]
        
        last_error = None
        for url in urls_to_try:
            try:
                if method == "POST":
                    async with self.session.post(url, json=params) as resp:
                        if resp.status == 200:
                            data = await resp.json()
                            self._cache[cache_key] = {
                                "data": data,
                                "timestamp": datetime.now(timezone.utc)
                            }
                            logger.info(f"Betburger API success: {url}")
                            return data
                        last_error = f"Status {resp.status}"
                else:
                    async with self.session.get(url, params=params) as resp:
                        if resp.status == 200:
                            data = await resp.json()
                            self._cache[cache_key] = {
                                "data": data,
                                "timestamp": datetime.now(timezone.utc)
                            }
                            logger.info(f"Betburger API success: {url}")
                            return data
                        elif resp.status == 401:
                            return {"error": "Invalid API token - check your Betburger API subscription", "status": 401}
                        elif resp.status == 403:
                            return {"error": "Access forbidden - API subscription may be inactive", "status": 403}
                        last_error = f"Status {resp.status}"
            except Exception as e:
                last_error = str(e)
                continue
        
        logger.error(f"Betburger API failed all endpoints: {last_error}")
        return {"error": f"API request failed: {last_error}"}
    
    # ==================== LIVE SUREBETS ====================
    
    async def get_live_surebets(self, filter_id: str = None, limit: int = 30) -> Dict:
        """
        Get live surebets (arbitrage opportunities)
        
        Args:
            filter_id: Multifilter ID from Betburger account
            limit: Max results (up to 30)
            
        Returns:
            List of live surebet opportunities
        """
        params = {
            "per_page": min(limit, 30)
        }
        
        if filter_id or self.filter_id:
            params["search_filter"] = filter_id or self.filter_id
        
        data = await self._request(self.live_url, "arbs", params)
        
        if data and "error" not in data:
            return self._format_surebets(data, is_live=True)
        return data or {"arbs": [], "count": 0}
    
    async def get_prematch_surebets(self, filter_id: str = None, limit: int = 30) -> Dict:
        """
        Get prematch surebets (arbitrage opportunities)
        
        Args:
            filter_id: Multifilter ID from Betburger account
            limit: Max results (up to 30)
            
        Returns:
            List of prematch surebet opportunities
        """
        params = {
            "per_page": min(limit, 30)
        }
        
        if filter_id or self.filter_id:
            params["search_filter"] = filter_id or self.filter_id
        
        data = await self._request(self.prematch_url, "arbs", params)
        
        if data and "error" not in data:
            return self._format_surebets(data, is_live=False)
        return data or {"arbs": [], "count": 0}
    
    # ==================== LIVE VALUEBETS ====================
    
    async def get_live_valuebets(self, filter_id: str = None, limit: int = 30) -> Dict:
        """
        Get live valuebets (+EV opportunities)
        
        Args:
            filter_id: Multifilter ID from Betburger account
            limit: Max results (up to 30)
            
        Returns:
            List of live valuebet opportunities
        """
        params = {
            "per_page": min(limit, 30)
        }
        
        if filter_id or self.filter_id:
            params["search_filter"] = filter_id or self.filter_id
        
        data = await self._request(self.live_url, "valuebets", params)
        
        if data and "error" not in data:
            return self._format_valuebets(data, is_live=True)
        return data or {"valuebets": [], "count": 0}
    
    async def get_prematch_valuebets(self, filter_id: str = None, limit: int = 30) -> Dict:
        """
        Get prematch valuebets (+EV opportunities)
        
        Args:
            filter_id: Multifilter ID from Betburger account
            limit: Max results (up to 30)
            
        Returns:
            List of prematch valuebet opportunities
        """
        params = {
            "per_page": min(limit, 30)
        }
        
        if filter_id or self.filter_id:
            params["search_filter"] = filter_id or self.filter_id
        
        data = await self._request(self.prematch_url, "valuebets", params)
        
        if data and "error" not in data:
            return self._format_valuebets(data, is_live=False)
        return data or {"valuebets": [], "count": 0}
    
    # ==================== COMBINED DATA ====================
    
    async def get_all_live_opportunities(self) -> Dict:
        """Get all live opportunities (surebets + valuebets)"""
        surebets_task = self.get_live_surebets()
        valuebets_task = self.get_live_valuebets()
        
        surebets, valuebets = await asyncio.gather(surebets_task, valuebets_task)
        
        return {
            "surebets": surebets.get("arbs", []),
            "surebets_count": surebets.get("count", 0),
            "valuebets": valuebets.get("valuebets", []),
            "valuebets_count": valuebets.get("count", 0),
            "is_live": True,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
    
    async def get_football_live_events(self, sport_id: int = 1) -> Dict:
        """
        Get live football events with odds
        Sport IDs: 1=Football, 2=Tennis, 3=Basketball, etc.
        """
        params = {
            "sport": sport_id,
            "per_page": 30
        }
        
        if self.filter_id:
            params["search_filter"] = self.filter_id
        
        # Get both surebets and valuebets for football
        surebets = await self._request(self.live_url, "arbs", params)
        valuebets = await self._request(self.live_url, "valuebets", params)
        
        # Extract unique events
        events = {}
        
        if surebets and "arbs" in surebets:
            for arb in surebets.get("arbs", []):
                event_id = arb.get("event_id")
                if event_id and event_id not in events:
                    events[event_id] = self._extract_event_info(arb, "surebet")
        
        if valuebets and "valuebets" in valuebets:
            for vb in valuebets.get("valuebets", []):
                event_id = vb.get("event_id")
                if event_id and event_id not in events:
                    events[event_id] = self._extract_event_info(vb, "valuebet")
        
        return {
            "events": list(events.values()),
            "count": len(events),
            "sport": "Football",
            "is_live": True,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
    
    # ==================== FORMATTING HELPERS ====================
    
    def _format_surebets(self, data: Dict, is_live: bool) -> Dict:
        """Format surebet response"""
        arbs = data.get("arbs", [])
        formatted_arbs = []
        
        for arb in arbs:
            formatted_arbs.append({
                "id": arb.get("id"),
                "event_id": arb.get("event_id"),
                "sport": arb.get("sport_name", "Unknown"),
                "league": arb.get("league_name", ""),
                "home_team": arb.get("home", ""),
                "away_team": arb.get("away", ""),
                "market": arb.get("market_name", ""),
                "profit_percent": arb.get("percent", 0),
                "bookmakers": self._extract_bookmakers(arb),
                "start_time": arb.get("started_at"),
                "is_live": is_live,
                "age_seconds": arb.get("age", 0)
            })
        
        return {
            "arbs": formatted_arbs,
            "count": len(formatted_arbs),
            "is_live": is_live
        }
    
    def _format_valuebets(self, data: Dict, is_live: bool) -> Dict:
        """Format valuebet response"""
        valuebets = data.get("valuebets", [])
        formatted_vbs = []
        
        for vb in valuebets:
            formatted_vbs.append({
                "id": vb.get("id"),
                "event_id": vb.get("event_id"),
                "sport": vb.get("sport_name", "Unknown"),
                "league": vb.get("league_name", ""),
                "home_team": vb.get("home", ""),
                "away_team": vb.get("away", ""),
                "market": vb.get("market_name", ""),
                "outcome": vb.get("outcome_name", ""),
                "bookmaker": vb.get("bookmaker_name", ""),
                "odds": vb.get("koef", 0),
                "true_odds": vb.get("average_koef", 0),
                "value_percent": vb.get("percent", 0),
                "start_time": vb.get("started_at"),
                "is_live": is_live,
                "age_seconds": vb.get("age", 0)
            })
        
        return {
            "valuebets": formatted_vbs,
            "count": len(formatted_vbs),
            "is_live": is_live
        }
    
    def _extract_bookmakers(self, arb: Dict) -> List[Dict]:
        """Extract bookmaker info from arbitrage"""
        bookmakers = []
        bets = arb.get("bets", [])
        
        for bet in bets:
            bookmakers.append({
                "name": bet.get("bookmaker_name", ""),
                "outcome": bet.get("outcome_name", ""),
                "odds": bet.get("koef", 0),
                "url": bet.get("url", "")
            })
        
        return bookmakers
    
    def _extract_event_info(self, data: Dict, source_type: str) -> Dict:
        """Extract event information"""
        return {
            "event_id": data.get("event_id"),
            "sport": data.get("sport_name", "Football"),
            "league": data.get("league_name", ""),
            "home_team": data.get("home", ""),
            "away_team": data.get("away", ""),
            "start_time": data.get("started_at"),
            "source_type": source_type,
            "market": data.get("market_name", ""),
            "is_live": True
        }
    
    # ==================== STATUS ====================
    
    async def test_connection(self) -> Dict:
        """Test API connection and return status"""
        if not self.api_token:
            return {
                "connected": False,
                "error": "BETBURGER_API_TOKEN not configured",
                "configured": False,
                "help": "Add BETBURGER_API_TOKEN to your .env file"
            }
        
        # Try to fetch live surebets as connection test
        result = await self.get_live_surebets(limit=1)
        
        if result and "error" not in result:
            return {
                "connected": True,
                "configured": True,
                "filter_id": self.filter_id or "Not set",
                "message": "Betburger API connected successfully",
                "surebets_found": result.get("count", 0)
            }
        else:
            error_msg = result.get("error", "Unknown error") if result else "No response"
            
            # Provide helpful guidance
            help_text = ""
            if "404" in str(error_msg):
                help_text = """
API-Zugang muss aktiviert werden:
1. Gehe zu betburger.com/api/live
2. Klicke auf 'API-Zugang anfordern' (orangener Button)
3. Warte auf Freischaltung (bis 48h)
4. Erstelle einen Multifilter unter 'Mein Konto' -> 'Multifilter'
5. Trage die Filter-ID in BETBURGER_FILTER_ID ein
"""
            elif "401" in str(error_msg) or "403" in str(error_msg):
                help_text = "API-Token ungültig oder Subscription inaktiv. Prüfe dein Betburger-Konto."
            
            return {
                "connected": False,
                "configured": True,
                "error": error_msg,
                "message": "API token configured but connection failed",
                "help": help_text.strip() if help_text else "Check your Betburger subscription status"
            }


# Singleton instance
_betburger_service: Optional[BetburgerService] = None


def get_betburger_service() -> BetburgerService:
    """Get the Betburger service singleton"""
    global _betburger_service
    if _betburger_service is None:
        _betburger_service = BetburgerService()
    return _betburger_service


# ==================== TEST ====================

async def test_betburger_api():
    """Test Betburger API connectivity"""
    service = get_betburger_service()
    
    print("Testing Betburger API...")
    print(f"API Token configured: {service.is_configured()}")
    
    if not service.is_configured():
        print("❌ BETBURGER_API_TOKEN not set in environment")
        return
    
    # Test connection
    status = await service.test_connection()
    print(f"\nConnection test: {status}")
    
    if status.get("connected"):
        # Get live surebets
        print("\n1. Fetching live surebets...")
        surebets = await service.get_live_surebets(limit=5)
        print(f"   Found {surebets.get('count', 0)} surebets")
        
        # Get live valuebets
        print("\n2. Fetching live valuebets...")
        valuebets = await service.get_live_valuebets(limit=5)
        print(f"   Found {valuebets.get('count', 0)} valuebets")
        
        # Get football events
        print("\n3. Fetching live football events...")
        football = await service.get_football_live_events()
        print(f"   Found {football.get('count', 0)} football events")
    
    await service.close()
    print("\n✅ Betburger API test complete!")


if __name__ == "__main__":
    asyncio.run(test_betburger_api())
