"""
BETRADARMUS Betfair Exchange API Service
Handles authentication and REST API calls to Betfair Exchange
"""
import os
import logging
import requests
import asyncio
from datetime import datetime, timezone, timedelta
from typing import Optional, Dict, List, Any
from dataclasses import dataclass
from enum import Enum

logger = logging.getLogger(__name__)

# Betfair API Configuration
BETFAIR_APP_KEY = os.environ.get('BETFAIR_APP_KEY')
BETFAIR_USERNAME = os.environ.get('BETFAIR_USERNAME')
BETFAIR_PASSWORD = os.environ.get('BETFAIR_PASSWORD')
BETFAIR_CERT_PATH = os.environ.get('BETFAIR_CERT_PATH', '/app/certs/betfair')

# API Endpoints
BETFAIR_LOGIN_URL = "https://identitysso-cert.betfair.com/api/certlogin"
BETFAIR_API_URL = "https://api.betfair.com/exchange/betting/rest/v1.0"
BETFAIR_ACCOUNT_URL = "https://api.betfair.com/exchange/account/rest/v1.0"


class EventType(Enum):
    """Betfair Event Types"""
    SOCCER = "1"
    TENNIS = "2"
    GOLF = "3"
    CRICKET = "4"
    RUGBY_UNION = "5"
    BOXING = "6"
    HORSE_RACING = "7"
    MOTOR_SPORT = "8"
    BASKETBALL = "12"


@dataclass
class MarketBook:
    """Represents a Betfair Market Book with prices"""
    market_id: str
    status: str
    total_matched: float
    total_available: float
    runners: List[Dict]
    last_update: datetime
    
    def get_best_back(self, selection_id: int) -> Optional[Dict]:
        """Get best back price for a selection"""
        for runner in self.runners:
            if runner.get('selectionId') == selection_id:
                backs = runner.get('ex', {}).get('availableToBack', [])
                if backs:
                    return backs[0]  # Best price first
        return None
    
    def get_best_lay(self, selection_id: int) -> Optional[Dict]:
        """Get best lay price for a selection"""
        for runner in self.runners:
            if runner.get('selectionId') == selection_id:
                lays = runner.get('ex', {}).get('availableToLay', [])
                if lays:
                    return lays[0]  # Best price first
        return None
    
    def get_spread(self, selection_id: int) -> Optional[float]:
        """Calculate spread between best back and lay"""
        back = self.get_best_back(selection_id)
        lay = self.get_best_lay(selection_id)
        if back and lay:
            return lay['price'] - back['price']
        return None


@dataclass 
class PriceChange:
    """Represents a price movement"""
    selection_id: int
    selection_name: str
    old_price: float
    new_price: float
    change_percent: float
    volume_at_price: float
    timestamp: datetime
    
    @property
    def direction(self) -> str:
        """Returns 'UP', 'DOWN', or 'STABLE'"""
        if self.change_percent > 0.5:
            return "UP"
        elif self.change_percent < -0.5:
            return "DOWN"
        return "STABLE"


class BetfairService:
    """
    Betfair Exchange API Service
    
    Handles:
    - Authentication (certificate-based)
    - Market discovery
    - Price/odds retrieval
    - Market depth analysis
    """
    
    def __init__(self):
        self.session_token: Optional[str] = None
        self.token_expiry: Optional[datetime] = None
        self._market_cache: Dict[str, MarketBook] = {}
        self._price_history: Dict[str, List[PriceChange]] = {}
        
    async def login(self) -> bool:
        """
        Authenticate with Betfair using certificate
        Returns True if successful
        """
        if not all([BETFAIR_APP_KEY, BETFAIR_USERNAME, BETFAIR_PASSWORD]):
            logger.warning("Betfair credentials not configured")
            return False
            
        try:
            # Certificate-based login
            cert_file = f"{BETFAIR_CERT_PATH}/client-2048.crt"
            key_file = f"{BETFAIR_CERT_PATH}/client-2048.key"
            
            payload = {
                'username': BETFAIR_USERNAME,
                'password': BETFAIR_PASSWORD
            }
            
            headers = {
                'X-Application': BETFAIR_APP_KEY,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
            
            response = await asyncio.to_thread(
                requests.post,
                BETFAIR_LOGIN_URL,
                data=payload,
                headers=headers,
                cert=(cert_file, key_file),
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get('loginStatus') == 'SUCCESS':
                    self.session_token = data.get('sessionToken')
                    self.token_expiry = datetime.now(timezone.utc) + timedelta(hours=8)
                    logger.info("Betfair login successful")
                    return True
                else:
                    logger.error(f"Betfair login failed: {data.get('loginStatus')}")
            else:
                logger.error(f"Betfair login HTTP error: {response.status_code}")
                
        except FileNotFoundError:
            logger.warning("Betfair certificates not found - using delayed API key mode")
            # Fallback: Use delayed key without certificates
            self.session_token = "DELAYED_MODE"
            return True
            
        except Exception as e:
            logger.error(f"Betfair login error: {e}")
            
        return False
    
    def _get_headers(self) -> Dict[str, str]:
        """Get headers for API requests"""
        return {
            'X-Application': BETFAIR_APP_KEY or '',
            'X-Authentication': self.session_token or '',
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    
    async def _api_request(self, endpoint: str, params: Dict) -> Optional[Dict]:
        """Make authenticated API request"""
        if not self.session_token:
            await self.login()
            
        url = f"{BETFAIR_API_URL}/{endpoint}/"
        
        try:
            response = await asyncio.to_thread(
                requests.post,
                url,
                json=params,
                headers=self._get_headers(),
                timeout=15
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                logger.error(f"Betfair API error: {response.status_code} - {response.text}")
                
        except Exception as e:
            logger.error(f"Betfair API request error: {e}")
            
        return None
    
    async def get_football_events(self, hours_ahead: int = 24) -> List[Dict]:
        """
        Get upcoming football events
        
        Args:
            hours_ahead: How many hours ahead to look
            
        Returns:
            List of events with market info
        """
        # First get football event type
        params = {
            'filter': {
                'eventTypeIds': [EventType.SOCCER.value],
                'marketStartTime': {
                    'from': datetime.now(timezone.utc).isoformat(),
                    'to': (datetime.now(timezone.utc) + timedelta(hours=hours_ahead)).isoformat()
                }
            }
        }
        
        result = await self._api_request('listEvents', params)
        
        if result:
            events = []
            for event_data in result:
                event = event_data.get('event', {})
                events.append({
                    'id': event.get('id'),
                    'name': event.get('name'),
                    'country_code': event.get('countryCode'),
                    'timezone': event.get('timezone'),
                    'venue': event.get('venue'),
                    'open_date': event.get('openDate'),
                    'market_count': event_data.get('marketCount', 0)
                })
            return events
            
        return []
    
    async def get_markets_for_event(self, event_id: str, market_types: List[str] = None) -> List[Dict]:
        """
        Get available markets for an event
        
        Args:
            event_id: Betfair event ID
            market_types: Filter by market types (e.g., ['MATCH_ODDS', 'OVER_UNDER_25'])
            
        Returns:
            List of markets with runner info
        """
        params = {
            'filter': {
                'eventIds': [event_id]
            },
            'marketProjection': [
                'COMPETITION',
                'EVENT',
                'EVENT_TYPE',
                'MARKET_START_TIME',
                'MARKET_DESCRIPTION',
                'RUNNER_DESCRIPTION',
                'RUNNER_METADATA'
            ],
            'maxResults': 100
        }
        
        if market_types:
            params['filter']['marketTypeCodes'] = market_types
            
        result = await self._api_request('listMarketCatalogue', params)
        
        if result:
            markets = []
            for market in result:
                markets.append({
                    'market_id': market.get('marketId'),
                    'market_name': market.get('marketName'),
                    'market_type': market.get('description', {}).get('marketType'),
                    'start_time': market.get('marketStartTime'),
                    'total_matched': market.get('totalMatched', 0),
                    'competition': market.get('competition', {}).get('name'),
                    'event': market.get('event', {}).get('name'),
                    'runners': [
                        {
                            'selection_id': r.get('selectionId'),
                            'name': r.get('runnerName'),
                            'sort_priority': r.get('sortPriority'),
                            'metadata': r.get('metadata', {})
                        }
                        for r in market.get('runners', [])
                    ]
                })
            return markets
            
        return []
    
    async def get_market_book(self, market_ids: List[str], price_depth: int = 5) -> List[MarketBook]:
        """
        Get current prices for markets
        
        Args:
            market_ids: List of market IDs
            price_depth: Number of price levels to retrieve
            
        Returns:
            List of MarketBook objects with prices
        """
        params = {
            'marketIds': market_ids,
            'priceProjection': {
                'priceData': ['EX_BEST_OFFERS', 'EX_TRADED'],
                'exBestOffersOverrides': {
                    'bestPricesDepth': price_depth
                },
                'virtualise': False
            },
            'orderProjection': 'EXECUTABLE',
            'matchProjection': 'ROLLED_UP_BY_PRICE'
        }
        
        result = await self._api_request('listMarketBook', params)
        
        if result:
            market_books = []
            for market in result:
                mb = MarketBook(
                    market_id=market.get('marketId'),
                    status=market.get('status'),
                    total_matched=market.get('totalMatched', 0),
                    total_available=market.get('totalAvailable', 0),
                    runners=market.get('runners', []),
                    last_update=datetime.now(timezone.utc)
                )
                market_books.append(mb)
                
                # Update cache
                self._market_cache[mb.market_id] = mb
                
            return market_books
            
        return []
    
    async def get_live_football_markets(self) -> List[Dict]:
        """
        Get all live (in-play) football markets
        
        Returns:
            List of live markets with current prices
        """
        params = {
            'filter': {
                'eventTypeIds': [EventType.SOCCER.value],
                'inPlayOnly': True
            },
            'marketProjection': [
                'COMPETITION',
                'EVENT', 
                'MARKET_START_TIME',
                'RUNNER_DESCRIPTION'
            ],
            'maxResults': 200
        }
        
        result = await self._api_request('listMarketCatalogue', params)
        
        if result:
            # Get prices for these markets
            market_ids = [m.get('marketId') for m in result]
            
            if market_ids:
                market_books = await self.get_market_book(market_ids[:50])  # Limit to 50
                
                # Combine catalogue and book data
                book_map = {mb.market_id: mb for mb in market_books}
                
                live_markets = []
                for market in result:
                    market_id = market.get('marketId')
                    book = book_map.get(market_id)
                    
                    live_markets.append({
                        'market_id': market_id,
                        'event': market.get('event', {}).get('name'),
                        'competition': market.get('competition', {}).get('name'),
                        'market_name': market.get('marketName'),
                        'runners': market.get('runners', []),
                        'prices': book.runners if book else [],
                        'total_matched': book.total_matched if book else 0,
                        'status': book.status if book else 'UNKNOWN'
                    })
                    
                return live_markets
                
        return []
    
    def detect_price_movement(self, market_id: str, current_book: MarketBook) -> List[PriceChange]:
        """
        Detect significant price movements by comparing with cached data
        
        Args:
            market_id: Market ID to check
            current_book: Current market book
            
        Returns:
            List of significant price changes
        """
        changes = []
        previous_book = self._market_cache.get(market_id)
        
        if not previous_book:
            return changes
            
        for current_runner in current_book.runners:
            selection_id = current_runner.get('selectionId')
            
            # Find matching runner in previous book
            prev_runner = None
            for r in previous_book.runners:
                if r.get('selectionId') == selection_id:
                    prev_runner = r
                    break
                    
            if not prev_runner:
                continue
                
            # Compare best back prices
            current_back = current_runner.get('ex', {}).get('availableToBack', [{}])[0]
            prev_back = prev_runner.get('ex', {}).get('availableToBack', [{}])[0]
            
            current_price = current_back.get('price', 0)
            prev_price = prev_back.get('price', 0)
            
            if prev_price > 0 and current_price > 0:
                change_percent = ((current_price - prev_price) / prev_price) * 100
                
                # Significant movement threshold: 2%
                if abs(change_percent) >= 2.0:
                    changes.append(PriceChange(
                        selection_id=selection_id,
                        selection_name=str(selection_id),  # Would need runner name from catalogue
                        old_price=prev_price,
                        new_price=current_price,
                        change_percent=change_percent,
                        volume_at_price=current_back.get('size', 0),
                        timestamp=datetime.now(timezone.utc)
                    ))
                    
        return changes
    
    async def get_market_depth_analysis(self, market_id: str) -> Dict:
        """
        Analyze market depth for a specific market
        
        Returns:
            Analysis including liquidity, spread, and imbalance
        """
        books = await self.get_market_book([market_id], price_depth=10)
        
        if not books:
            return {}
            
        book = books[0]
        analysis = {
            'market_id': market_id,
            'status': book.status,
            'total_matched': book.total_matched,
            'runners': []
        }
        
        for runner in book.runners:
            selection_id = runner.get('selectionId')
            ex = runner.get('ex', {})
            
            backs = ex.get('availableToBack', [])
            lays = ex.get('availableToLay', [])
            
            # Calculate total liquidity
            back_liquidity = sum(b.get('size', 0) for b in backs)
            lay_liquidity = sum(l.get('size', 0) for l in lays)
            
            # Best prices
            best_back = backs[0].get('price', 0) if backs else 0
            best_lay = lays[0].get('price', 0) if lays else 0
            
            # Spread
            spread = best_lay - best_back if best_back > 0 and best_lay > 0 else 0
            spread_percent = (spread / best_back * 100) if best_back > 0 else 0
            
            # Liquidity imbalance (positive = more back liquidity)
            total_liquidity = back_liquidity + lay_liquidity
            imbalance = ((back_liquidity - lay_liquidity) / total_liquidity * 100) if total_liquidity > 0 else 0
            
            analysis['runners'].append({
                'selection_id': selection_id,
                'best_back': best_back,
                'best_lay': best_lay,
                'spread': round(spread, 3),
                'spread_percent': round(spread_percent, 2),
                'back_liquidity': round(back_liquidity, 2),
                'lay_liquidity': round(lay_liquidity, 2),
                'liquidity_imbalance': round(imbalance, 2),
                'last_traded': runner.get('lastPriceTraded', 0),
                'total_matched': runner.get('totalMatched', 0)
            })
            
        return analysis


# Singleton instance
_betfair_service: Optional[BetfairService] = None

def get_betfair_service() -> BetfairService:
    global _betfair_service
    if _betfair_service is None:
        _betfair_service = BetfairService()
    return _betfair_service

async def init_betfair_service() -> BetfairService:
    """Initialize and login to Betfair"""
    service = get_betfair_service()
    await service.login()
    return service
