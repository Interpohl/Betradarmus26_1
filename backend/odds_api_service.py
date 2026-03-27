"""
BETRADARMUS Odds API Service
Fetches real bookmaker odds from The Odds API for Value Alert comparisons
"""

import aiohttp
import asyncio
import logging
import os
from typing import Dict, List, Any, Optional
from datetime import datetime, timezone
from functools import lru_cache

logger = logging.getLogger(__name__)

# The Odds API Settings
ODDS_API_KEY = os.environ.get('ODDS_API_KEY')
ODDS_API_BASE_URL = "https://api.the-odds-api.com/v4"

# Sport key mappings for football/soccer
SOCCER_SPORTS = [
    "soccer_germany_bundesliga",
    "soccer_germany_bundesliga2",
    "soccer_epl",
    "soccer_spain_la_liga",
    "soccer_italy_serie_a",
    "soccer_france_ligue_one",
    "soccer_uefa_champs_league",
    "soccer_uefa_europa_league",
    "soccer_turkey_super_league",
    "soccer_netherlands_eredivisie",
    "soccer_portugal_primeira_liga",
]

# Other popular sports
OTHER_SPORTS = [
    "americanfootball_nfl",
    "basketball_nba",
    "mma_mixed_martial_arts",
    "baseball_mlb",
    "icehockey_nhl",
]


class OddsAPIService:
    """Service for fetching real bookmaker odds from The Odds API"""
    
    def __init__(self):
        self.api_key = ODDS_API_KEY
        self.base_url = ODDS_API_BASE_URL
        self.session: Optional[aiohttp.ClientSession] = None
        self._remaining_credits = None
        self._cache: Dict[str, Any] = {}
        self._cache_ttl = 300  # 5 minutes cache
        
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
    
    def _get_cache_key(self, endpoint: str, params: Dict) -> str:
        """Generate cache key"""
        param_str = "_".join(f"{k}={v}" for k, v in sorted(params.items()) if k != "apiKey")
        return f"{endpoint}_{param_str}"
    
    def _is_cache_valid(self, cache_key: str) -> bool:
        """Check if cache entry is still valid"""
        if cache_key not in self._cache:
            return False
        entry = self._cache[cache_key]
        age = (datetime.now(timezone.utc) - entry["timestamp"]).total_seconds()
        return age < self._cache_ttl
    
    async def _request(self, endpoint: str, params: Dict = None) -> Optional[Dict]:
        """Make request to The Odds API"""
        if not self.api_key:
            logger.warning("ODDS_API_KEY not configured")
            return None
        
        await self._ensure_session()
        
        if params is None:
            params = {}
        params["apiKey"] = self.api_key
        
        # Check cache
        cache_key = self._get_cache_key(endpoint, params)
        if self._is_cache_valid(cache_key):
            logger.debug(f"Cache hit for {endpoint}")
            return self._cache[cache_key]["data"]
        
        url = f"{self.base_url}/{endpoint}"
        
        try:
            async with self.session.get(url, params=params) as resp:
                # Track remaining credits
                self._remaining_credits = resp.headers.get("x-requests-remaining", "N/A")
                used = resp.headers.get("x-requests-used", "N/A")
                logger.info(f"Odds API - Used: {used}, Remaining: {self._remaining_credits}")
                
                if resp.status == 200:
                    data = await resp.json()
                    # Cache the response
                    self._cache[cache_key] = {
                        "data": data,
                        "timestamp": datetime.now(timezone.utc)
                    }
                    return data
                elif resp.status == 401:
                    logger.error("Odds API: Invalid API key")
                    return None
                elif resp.status == 429:
                    logger.error("Odds API: Rate limit exceeded")
                    return None
                else:
                    error_text = await resp.text()
                    logger.error(f"Odds API error: {resp.status} - {error_text[:200]}")
                    return None
                    
        except Exception as e:
            logger.error(f"Odds API request error: {e}")
            return None
    
    @property
    def remaining_credits(self) -> str:
        """Get remaining API credits"""
        return self._remaining_credits or "N/A"
    
    # ==================== PUBLIC METHODS ====================
    
    async def get_sports(self) -> List[Dict]:
        """Get all available sports"""
        data = await self._request("sports")
        return data if data else []
    
    async def get_odds_for_sport(
        self,
        sport: str = "soccer_germany_bundesliga",
        regions: str = "eu",
        markets: str = "h2h",
        odds_format: str = "decimal"
    ) -> List[Dict]:
        """
        Get odds for a specific sport
        
        Args:
            sport: Sport key (e.g., soccer_germany_bundesliga)
            regions: Comma-separated regions (eu, uk, us, au)
            markets: Comma-separated markets (h2h, totals, spreads)
            odds_format: decimal or american
            
        Returns:
            List of events with odds
        """
        params = {
            "regions": regions,
            "markets": markets,
            "oddsFormat": odds_format
        }
        
        data = await self._request(f"sports/{sport}/odds", params)
        return data if data else []
    
    async def get_all_football_odds(
        self,
        regions: str = "eu",
        markets: str = "h2h"
    ) -> List[Dict]:
        """
        Get odds for all football/soccer leagues
        
        Returns:
            Combined list of events from all soccer sports
        """
        all_events = []
        
        for sport in SOCCER_SPORTS:
            try:
                events = await self.get_odds_for_sport(
                    sport=sport,
                    regions=regions,
                    markets=markets
                )
                if events:
                    for event in events:
                        event["sport_key"] = sport
                    all_events.extend(events)
            except Exception as e:
                logger.warning(f"Failed to fetch odds for {sport}: {e}")
                continue
        
        return all_events
    
    async def find_matching_odds(
        self,
        event_title: str,
        home_team: str = None,
        away_team: str = None,
        sport_hint: str = None
    ) -> Optional[Dict]:
        """
        Find bookmaker odds that match a Polymarket event
        
        Args:
            event_title: Polymarket event title
            home_team: Optional home team name
            away_team: Optional away team name
            sport_hint: Optional sport hint (nfl, nba, soccer, etc.)
            
        Returns:
            Best matching odds data or None
        """
        # Determine which sports to search
        sports_to_search = []
        title_lower = event_title.lower()
        
        if sport_hint:
            hint_lower = sport_hint.lower()
            if "soccer" in hint_lower or "football" in hint_lower:
                sports_to_search = SOCCER_SPORTS[:5]  # Limit API calls
            elif "nfl" in hint_lower:
                sports_to_search = ["americanfootball_nfl"]
            elif "nba" in hint_lower:
                sports_to_search = ["basketball_nba"]
            elif "ufc" in hint_lower or "mma" in hint_lower:
                sports_to_search = ["mma_mixed_martial_arts"]
        else:
            # Auto-detect from title
            if any(kw in title_lower for kw in ["bundesliga", "premier league", "la liga", "champions", "serie a", "ligue 1"]):
                sports_to_search = SOCCER_SPORTS[:5]
            elif "nfl" in title_lower or "super bowl" in title_lower:
                sports_to_search = ["americanfootball_nfl"]
            elif "nba" in title_lower:
                sports_to_search = ["basketball_nba"]
            elif "ufc" in title_lower:
                sports_to_search = ["mma_mixed_martial_arts"]
            else:
                # Default to top football leagues + other sports
                sports_to_search = SOCCER_SPORTS[:3] + OTHER_SPORTS[:2]
        
        # Search for matching events
        best_match = None
        best_score = 0
        
        for sport in sports_to_search:
            events = await self.get_odds_for_sport(sport=sport, markets="h2h")
            
            for event in events:
                event_home = event.get("home_team", "").lower()
                event_away = event.get("away_team", "").lower()
                
                # Calculate match score
                score = 0
                
                # Check home team
                if home_team:
                    home_lower = home_team.lower()
                    if home_lower in event_home or event_home in home_lower:
                        score += 50
                    elif any(word in event_home for word in home_lower.split()[:2]):
                        score += 25
                
                # Check away team
                if away_team:
                    away_lower = away_team.lower()
                    if away_lower in event_away or event_away in away_lower:
                        score += 50
                    elif any(word in event_away for word in away_lower.split()[:2]):
                        score += 25
                
                # Check title keywords
                title_words = event_title.lower().split()
                for word in title_words:
                    if len(word) > 3 and (word in event_home or word in event_away):
                        score += 10
                
                if score > best_score:
                    best_score = score
                    best_match = event
        
        if best_match and best_score >= 25:
            # Extract best odds from bookmakers
            return self._extract_best_odds(best_match)
        
        return None
    
    def _extract_best_odds(self, event: Dict) -> Dict:
        """Extract best odds from an event's bookmakers"""
        bookmakers = event.get("bookmakers", [])
        
        if not bookmakers:
            return None
        
        best_home_odds = None
        best_away_odds = None
        best_draw_odds = None
        best_bookmaker = None
        
        home_team = event.get("home_team", "")
        away_team = event.get("away_team", "")
        
        for bookmaker in bookmakers:
            bookie_name = bookmaker.get("title", "Unknown")
            
            for market in bookmaker.get("markets", []):
                if market.get("key") != "h2h":
                    continue
                
                for outcome in market.get("outcomes", []):
                    name = outcome.get("name", "")
                    price = outcome.get("price", 0)
                    
                    if name == home_team:
                        if best_home_odds is None or price > best_home_odds:
                            best_home_odds = price
                            if price > (best_home_odds or 0):
                                best_bookmaker = bookie_name
                    elif name == away_team:
                        if best_away_odds is None or price > best_away_odds:
                            best_away_odds = price
                    elif name.lower() == "draw":
                        if best_draw_odds is None or price > best_draw_odds:
                            best_draw_odds = price
        
        return {
            "event_id": event.get("id"),
            "home_team": home_team,
            "away_team": away_team,
            "sport": event.get("sport_title", ""),
            "sport_key": event.get("sport_key", ""),
            "commence_time": event.get("commence_time"),
            "bookmaker": best_bookmaker or bookmakers[0].get("title", "Unknown"),
            "home_odds": best_home_odds,
            "away_odds": best_away_odds,
            "draw_odds": best_draw_odds,
            "all_bookmakers": len(bookmakers),
            "remaining_credits": self._remaining_credits
        }
    
    async def get_event_odds_details(
        self,
        event_id: str,
        sport: str,
        markets: str = "h2h,totals,spreads"
    ) -> Optional[Dict]:
        """Get detailed odds for a specific event"""
        params = {
            "regions": "eu,uk",
            "markets": markets,
            "oddsFormat": "decimal"
        }
        
        data = await self._request(f"sports/{sport}/events/{event_id}/odds", params)
        return data


# Singleton instance
odds_api_service = OddsAPIService()


# Helper function for external use
async def get_odds_for_sport(sport: str = "soccer_germany_bundesliga") -> List[Dict]:
    """Helper function to get odds for a sport"""
    return await odds_api_service.get_odds_for_sport(sport)


async def find_bookmaker_odds(
    event_title: str,
    home_team: str = None,
    away_team: str = None
) -> Optional[Dict]:
    """Helper function to find matching bookmaker odds"""
    return await odds_api_service.find_matching_odds(
        event_title=event_title,
        home_team=home_team,
        away_team=away_team
    )


# ==================== TEST ====================

async def test_odds_api():
    """Test The Odds API connectivity"""
    service = OddsAPIService()
    
    print("Testing The Odds API...")
    
    # Test 1: Get sports
    print("\n1. Getting available sports...")
    sports = await service.get_sports()
    soccer_sports = [s for s in sports if "soccer" in s.get("key", "")]
    print(f"   Found {len(soccer_sports)} soccer sports:")
    for s in soccer_sports[:5]:
        print(f"   - {s.get('title')}")
    
    # Test 2: Get Bundesliga odds
    print("\n2. Getting Bundesliga odds...")
    events = await service.get_odds_for_sport("soccer_germany_bundesliga")
    print(f"   Found {len(events)} events")
    for event in events[:3]:
        print(f"   - {event.get('home_team')} vs {event.get('away_team')}")
        bookmakers = event.get("bookmakers", [])
        if bookmakers:
            for market in bookmakers[0].get("markets", []):
                if market.get("key") == "h2h":
                    outcomes = market.get("outcomes", [])
                    odds_str = ', '.join(f"{o.get('name')}: {o.get('price')}" for o in outcomes)
                    print(f"     Odds: {odds_str}")
    
    # Test 3: Find matching odds
    print("\n3. Testing match finder...")
    result = await service.find_matching_odds(
        event_title="Bayern Munich to win Bundesliga",
        home_team="Bayern München"
    )
    if result:
        print(f"   Found match: {result.get('home_team')} vs {result.get('away_team')}")
        print(f"   Best odds: Home {result.get('home_odds')}, Away {result.get('away_odds')}")
    else:
        print("   No matching odds found")
    
    print(f"\n   Remaining API credits: {service.remaining_credits}")
    
    await service.close()
    print("\n✅ The Odds API test complete!")


if __name__ == "__main__":
    asyncio.run(test_odds_api())
