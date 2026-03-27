"""
BETRADARMUS Polymarket Service
Fetches prediction market data from Polymarket for Signal Engine 2.0
"""

import aiohttp
import asyncio
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime, timezone

logger = logging.getLogger(__name__)

# Polymarket API Base URLs
GAMMA_API = "https://gamma-api.polymarket.com"
CLOB_API = "https://clob.polymarket.com"
DATA_API = "https://data-api.polymarket.com"


class PolymarketService:
    """Service for interacting with Polymarket prediction markets"""
    
    def __init__(self):
        self.session: Optional[aiohttp.ClientSession] = None
        self._sport_tags: Dict[str, int] = {}
        
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
    
    # ==================== MARKET DATA ====================
    
    async def get_active_events(
        self, 
        limit: int = 50, 
        order_by: str = "volume24hr",
        tag_id: Optional[int] = None
    ) -> List[Dict[str, Any]]:
        """
        Fetch active events from Polymarket
        
        Args:
            limit: Maximum number of events to return
            order_by: Sort field (volume24hr, volume, liquidity)
            tag_id: Optional tag ID to filter by (e.g., sports)
            
        Returns:
            List of active events with their markets
        """
        await self._ensure_session()
        
        params = {
            "active": "true",
            "closed": "false",
            "limit": str(limit),
            "order": order_by,
            "ascending": "false"
        }
        
        if tag_id:
            params["tag_id"] = str(tag_id)
        
        try:
            async with self.session.get(f"{GAMMA_API}/events", params=params) as resp:
                if resp.status == 200:
                    data = await resp.json()
                    logger.info(f"Fetched {len(data)} active events from Polymarket")
                    return data
                else:
                    error_text = await resp.text()
                    logger.error(f"Polymarket API error: {resp.status} - {error_text[:200]}")
                    return []
        except Exception as e:
            logger.error(f"Error fetching Polymarket events: {e}")
            return []
    
    async def get_sport_events(self, sport: str = None, limit: int = 50) -> List[Dict[str, Any]]:
        """
        Fetch sport-specific events
        
        Args:
            sport: Sport name (e.g., 'nfl', 'nba', 'soccer', 'ufc')
            limit: Maximum events to return
            
        Returns:
            List of sport events
        """
        await self._ensure_session()
        
        # First get sport tags if not cached
        if not self._sport_tags:
            await self._load_sport_tags()
        
        tag_id = None
        if sport and sport.lower() in self._sport_tags:
            tag_id = self._sport_tags[sport.lower()]
        
        return await self.get_active_events(limit=limit, tag_id=tag_id)
    
    async def _load_sport_tags(self):
        """Load sport tag IDs from Polymarket"""
        try:
            async with self.session.get(f"{GAMMA_API}/sports") as resp:
                if resp.status == 200:
                    sports = await resp.json()
                    for sport in sports:
                        name = sport.get("name", "").lower()
                        tag_id = sport.get("tag_id")
                        if name and tag_id:
                            self._sport_tags[name] = tag_id
                    logger.info(f"Loaded {len(self._sport_tags)} sport tags")
        except Exception as e:
            logger.error(f"Error loading sport tags: {e}")
    
    async def get_event_by_slug(self, slug: str) -> Optional[Dict[str, Any]]:
        """
        Fetch a specific event by its slug
        
        Args:
            slug: Event slug (from URL)
            
        Returns:
            Event data or None
        """
        await self._ensure_session()
        
        try:
            async with self.session.get(f"{GAMMA_API}/events/slug/{slug}") as resp:
                if resp.status == 200:
                    return await resp.json()
                return None
        except Exception as e:
            logger.error(f"Error fetching event {slug}: {e}")
            return None
    
    async def search_markets(self, query: str, limit: int = 20) -> List[Dict[str, Any]]:
        """
        Search for markets matching a query
        
        Args:
            query: Search term (e.g., "Bayern", "Champions League")
            limit: Maximum results
            
        Returns:
            List of matching markets
        """
        await self._ensure_session()
        
        try:
            params = {"q": query, "limit": limit}
            async with self.session.get(f"{GAMMA_API}/search", params=params) as resp:
                if resp.status == 200:
                    data = await resp.json()
                    return data.get("markets", [])
                return []
        except Exception as e:
            logger.error(f"Error searching Polymarket: {e}")
            return []
    
    # ==================== PRICE DATA ====================
    
    async def get_market_price(self, token_id: str) -> Optional[Dict[str, Any]]:
        """
        Get current price for a market token
        
        Args:
            token_id: CLOB token ID
            
        Returns:
            Price data including bid, ask, mid
        """
        await self._ensure_session()
        
        try:
            async with self.session.get(f"{CLOB_API}/price", params={"token_id": token_id}) as resp:
                if resp.status == 200:
                    return await resp.json()
                return None
        except Exception as e:
            logger.error(f"Error fetching price: {e}")
            return None
    
    async def get_orderbook(self, token_id: str) -> Optional[Dict[str, Any]]:
        """
        Get orderbook for a market
        
        Args:
            token_id: CLOB token ID
            
        Returns:
            Orderbook with bids and asks
        """
        await self._ensure_session()
        
        try:
            async with self.session.get(f"{CLOB_API}/book", params={"token_id": token_id}) as resp:
                if resp.status == 200:
                    return await resp.json()
                return None
        except Exception as e:
            logger.error(f"Error fetching orderbook: {e}")
            return None
    
    async def get_spread(self, token_id: str) -> Optional[Dict[str, Any]]:
        """
        Get bid-ask spread for a market
        
        Returns:
            Spread data
        """
        await self._ensure_session()
        
        try:
            async with self.session.get(f"{CLOB_API}/spread", params={"token_id": token_id}) as resp:
                if resp.status == 200:
                    return await resp.json()
                return None
        except Exception as e:
            logger.error(f"Error fetching spread: {e}")
            return None
    
    # ==================== ANALYTICS ====================
    
    async def get_market_volume(self, market_id: str) -> Optional[Dict[str, Any]]:
        """
        Get volume data for a market
        """
        await self._ensure_session()
        
        try:
            async with self.session.get(f"{DATA_API}/markets/{market_id}/volume") as resp:
                if resp.status == 200:
                    return await resp.json()
                return None
        except Exception as e:
            logger.error(f"Error fetching volume: {e}")
            return None
    
    async def get_open_interest(self, market_ids: List[str]) -> Dict[str, Any]:
        """
        Get open interest for multiple markets
        """
        await self._ensure_session()
        
        try:
            params = {"market_ids": ",".join(market_ids)}
            async with self.session.get(f"{DATA_API}/open-interest", params=params) as resp:
                if resp.status == 200:
                    return await resp.json()
                return {}
        except Exception as e:
            logger.error(f"Error fetching open interest: {e}")
            return {}
    
    # ==================== SIGNAL GENERATION HELPERS ====================
    
    def calculate_implied_probability(self, price: float) -> float:
        """
        Convert Polymarket price to implied probability
        Price ranges from 0 to 1 (e.g., 0.65 = 65% probability)
        """
        return price * 100
    
    def price_to_odds(self, price: float) -> float:
        """
        Convert Polymarket price to decimal odds
        E.g., 0.65 → 1.54 odds
        """
        if price <= 0 or price >= 1:
            return 0
        return round(1 / price, 2)
    
    def find_value(
        self, 
        polymarket_price: float, 
        bookmaker_odds: float
    ) -> Dict[str, Any]:
        """
        Calculate value between Polymarket and bookmaker odds
        
        Args:
            polymarket_price: Polymarket price (0-1)
            bookmaker_odds: Decimal odds from bookmaker
            
        Returns:
            Value analysis with edge percentage
        """
        pm_probability = polymarket_price
        pm_odds = self.price_to_odds(polymarket_price)
        
        # Bookmaker implied probability (with margin)
        bookie_probability = 1 / bookmaker_odds
        
        # Value = (True Prob × Odds) - 1
        # Using Polymarket as "true probability" proxy
        expected_value = (pm_probability * bookmaker_odds) - 1
        edge_percentage = expected_value * 100
        
        return {
            "polymarket_price": polymarket_price,
            "polymarket_probability": f"{pm_probability * 100:.1f}%",
            "polymarket_odds": pm_odds,
            "bookmaker_odds": bookmaker_odds,
            "bookmaker_probability": f"{bookie_probability * 100:.1f}%",
            "expected_value": round(expected_value, 4),
            "edge_percentage": round(edge_percentage, 2),
            "has_value": edge_percentage > 0,
            "signal_strength": self._calculate_signal_strength(edge_percentage)
        }
    
    def _calculate_signal_strength(self, edge_percentage: float) -> str:
        """Determine signal strength based on edge"""
        if edge_percentage >= 15:
            return "VERY_STRONG"
        elif edge_percentage >= 10:
            return "STRONG"
        elif edge_percentage >= 5:
            return "MODERATE"
        elif edge_percentage > 0:
            return "WEAK"
        else:
            return "NO_VALUE"
    
    async def analyze_market_momentum(self, token_id: str) -> Dict[str, Any]:
        """
        Analyze market momentum based on orderbook
        
        Returns:
            Momentum indicators (buy/sell pressure, volume imbalance)
        """
        orderbook = await self.get_orderbook(token_id)
        if not orderbook:
            return {"error": "Could not fetch orderbook"}
        
        bids = orderbook.get("bids", [])
        asks = orderbook.get("asks", [])
        
        total_bid_size = sum(float(b.get("size", 0)) for b in bids[:10])
        total_ask_size = sum(float(a.get("size", 0)) for a in asks[:10])
        
        if total_bid_size + total_ask_size == 0:
            imbalance = 0
        else:
            imbalance = (total_bid_size - total_ask_size) / (total_bid_size + total_ask_size)
        
        return {
            "bid_volume": total_bid_size,
            "ask_volume": total_ask_size,
            "imbalance": round(imbalance, 3),
            "pressure": "BUY" if imbalance > 0.1 else "SELL" if imbalance < -0.1 else "NEUTRAL",
            "momentum_score": abs(imbalance) * 100
        }


# Singleton instance
polymarket_service = PolymarketService()


# ==================== TEST ====================

async def test_polymarket():
    """Test Polymarket API connectivity"""
    service = PolymarketService()
    
    print("Testing Polymarket API...")
    
    # Test 1: Get active events
    events = await service.get_active_events(limit=5)
    print(f"\n1. Active Events: {len(events)}")
    for event in events[:3]:
        print(f"   - {event.get('title', 'N/A')}")
        print(f"     Volume 24h: ${event.get('volume24hr', 0):,.0f}")
    
    # Test 2: Search for football
    print("\n2. Searching for 'football'...")
    results = await service.search_markets("football", limit=5)
    print(f"   Found {len(results)} markets")
    for r in results[:3]:
        print(f"   - {r.get('question', 'N/A')}")
    
    # Test 3: Value calculation
    print("\n3. Value Calculation Example:")
    value = service.find_value(
        polymarket_price=0.65,  # 65% on Polymarket
        bookmaker_odds=1.80    # 1.80 at bookmaker
    )
    print(f"   Polymarket: {value['polymarket_probability']} = {value['polymarket_odds']} odds")
    print(f"   Bookmaker: {value['bookmaker_probability']} = {value['bookmaker_odds']} odds")
    print(f"   Edge: {value['edge_percentage']}%")
    print(f"   Signal: {value['signal_strength']}")
    
    await service.close()
    print("\n✅ Polymarket API test complete!")


if __name__ == "__main__":
    asyncio.run(test_polymarket())
