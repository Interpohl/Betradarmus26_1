"""
OddsPapi Service - Live Betting Odds API Integration
Provides real-time odds data from 300+ bookmakers including Betfair Exchange
"""

import os
import logging
import requests
from datetime import datetime, timezone
from typing import Optional, Dict, List, Any
from functools import lru_cache
import time

logger = logging.getLogger(__name__)

# API Configuration
ODDSPAPI_BASE_URL = "https://api.oddspapi.io/v4"
ODDSPAPI_KEY = os.environ.get("ODDSPAPI_KEY", "")

# Sport IDs
SPORT_FOOTBALL = 10

# Market IDs (OddsPapi uses numeric IDs)
MARKET_1X2 = "101"  # Match Winner (1X2)
MARKET_OVER_UNDER = "104"  # Over/Under Goals
MARKET_BTTS = "107"  # Both Teams To Score
MARKET_DOUBLE_CHANCE = "110"  # Double Chance

# Outcome IDs for 1X2
OUTCOME_HOME = "101"
OUTCOME_DRAW = "102"
OUTCOME_AWAY = "103"

# Sharp bookmakers for value detection
SHARP_BOOKMAKERS = ["pinnacle", "betfair", "sbobet", "singbet", "isn"]
SOFT_BOOKMAKERS = ["bet365", "unibet", "williamhill", "betway", "bwin"]

# Cache for API responses
_cache = {}
_cache_ttl = 60  # 60 seconds cache


class OddsPapiService:
    """Service for interacting with OddsPapi API"""
    
    def __init__(self, api_key: str = None):
        self.api_key = api_key or ODDSPAPI_KEY
        self.base_url = ODDSPAPI_BASE_URL
        self._participants_cache = {}
        self._participants_cache_time = 0
        
    def _make_request(self, endpoint: str, params: Dict = None) -> Optional[Dict]:
        """Make API request with error handling"""
        if not self.api_key:
            logger.warning("OddsPapi API key not configured")
            return None
            
        url = f"{self.base_url}/{endpoint}"
        
        if params is None:
            params = {}
        params["apiKey"] = self.api_key
        
        try:
            response = requests.get(url, params=params, timeout=15)
            
            if response.status_code == 200:
                return response.json()
            elif response.status_code == 401:
                logger.error("OddsPapi: Invalid API key")
            elif response.status_code == 429:
                logger.warning("OddsPapi: Rate limit exceeded")
            else:
                logger.error(f"OddsPapi error: {response.status_code} - {response.text[:200]}")
                
            return None
        except Exception as e:
            logger.error(f"OddsPapi request error: {str(e)}")
            return None
    
    def get_account_info(self) -> Optional[Dict]:
        """Get account information including remaining requests"""
        return self._make_request("account")
    
    def get_tournaments(self, sport_id: int = SPORT_FOOTBALL) -> List[Dict]:
        """Get available tournaments/leagues for a sport"""
        data = self._make_request("tournaments", {"sportId": sport_id})
        return data if isinstance(data, list) else []
    
    def get_participants(self, sport_id: int = SPORT_FOOTBALL) -> Dict[str, str]:
        """Get participant ID to name mapping (cached for 1 hour)"""
        current_time = time.time()
        
        # Return cached data if still valid (1 hour cache)
        if self._participants_cache and (current_time - self._participants_cache_time) < 3600:
            return self._participants_cache
        
        data = self._make_request("participants", {"sportId": sport_id})
        
        if isinstance(data, dict) and not data.get('error'):
            self._participants_cache = data
            self._participants_cache_time = current_time
            return data
        
        return self._participants_cache or {}
    
    def get_participant_name(self, participant_id: int, sport_id: int = SPORT_FOOTBALL) -> str:
        """Get participant name by ID"""
        participants = self.get_participants(sport_id)
        return participants.get(str(participant_id), f"Team {participant_id}")
    
    def get_live_fixtures(self, sport_id: int = SPORT_FOOTBALL) -> List[Dict]:
        """Get currently live fixtures"""
        data = self._make_request("fixtures", {
            "sportId": sport_id,
            "status": "live"
        })
        return data if isinstance(data, list) else []
    
    def get_upcoming_fixtures(self, sport_id: int = SPORT_FOOTBALL, hours: int = 24) -> List[Dict]:
        """Get upcoming fixtures within specified hours"""
        data = self._make_request("fixtures", {
            "sportId": sport_id,
            "status": "upcoming",
            "hours": hours
        })
        return data if isinstance(data, list) else []
    
    def get_odds_by_fixture(self, fixture_id: str, bookmaker: str = "pinnacle") -> Optional[Dict]:
        """Get odds for a specific fixture from a single bookmaker (Free tier limit)"""
        params = {
            "fixtureId": fixture_id,
            "bookmaker": bookmaker  # Free tier: only 1 bookmaker allowed
        }
            
        return self._make_request("odds", params)
    
    def get_odds_by_tournaments(self, tournament_ids: List[int], bookmaker: str = "pinnacle") -> List[Dict]:
        """Get odds for fixtures in specified tournaments from a single bookmaker"""
        params = {
            "tournamentIds": ",".join(str(t) for t in tournament_ids),
            "bookmaker": bookmaker  # Free tier: only 1 bookmaker allowed
        }
            
        data = self._make_request("odds-by-tournaments", params)
        return data if isinstance(data, list) else []
    
    def get_live_odds(self, bookmaker: str = "pinnacle") -> List[Dict]:
        """Get live odds for in-play matches from a single bookmaker"""
        params = {
            "sportId": SPORT_FOOTBALL,
            "status": "live",
            "bookmaker": bookmaker  # Free tier: only 1 bookmaker allowed
        }
            
        data = self._make_request("odds", params)
        return data if isinstance(data, list) else []


class SignalEngine:
    """
    Signal Engine 2.0 - Advanced betting signal analysis
    Uses sharp bookmaker odds to detect value and momentum
    """
    
    def __init__(self, oddspapi_service: OddsPapiService = None):
        self.odds_service = oddspapi_service or OddsPapiService()
        
    def calculate_implied_probability(self, decimal_odds: float) -> float:
        """Convert decimal odds to implied probability"""
        if decimal_odds <= 1:
            return 100.0
        return round((1 / decimal_odds) * 100, 2)
    
    def calculate_value(self, true_prob: float, bookmaker_odds: float) -> float:
        """
        Calculate expected value (EV)
        Positive EV = value bet
        """
        implied_prob = self.calculate_implied_probability(bookmaker_odds)
        ev = (true_prob / 100 * bookmaker_odds) - 1
        return round(ev * 100, 2)  # Return as percentage
    
    def detect_sharp_soft_discrepancy(self, sharp_odds: float, soft_odds: float) -> Dict:
        """
        Detect discrepancy between sharp and soft bookmaker odds
        Large discrepancies often indicate value
        """
        sharp_prob = self.calculate_implied_probability(sharp_odds)
        soft_prob = self.calculate_implied_probability(soft_odds)
        
        discrepancy = soft_prob - sharp_prob
        
        return {
            "sharp_odds": sharp_odds,
            "soft_odds": soft_odds,
            "sharp_probability": sharp_prob,
            "soft_probability": soft_prob,
            "discrepancy": round(discrepancy, 2),
            "has_value": discrepancy > 2.0,  # >2% discrepancy indicates potential value
            "value_rating": "HIGH" if discrepancy > 5 else "MEDIUM" if discrepancy > 2 else "LOW"
        }
    
    def calculate_margin(self, odds_list: List[float]) -> float:
        """Calculate bookmaker margin (overround)"""
        if not odds_list or len(odds_list) < 2:
            return 0.0
        
        total_prob = sum(self.calculate_implied_probability(o) for o in odds_list)
        margin = total_prob - 100
        return round(margin, 2)
    
    def analyze_1x2_market(self, fixture_odds: Dict) -> Optional[Dict]:
        """
        Analyze 1X2 (Match Winner) market for a fixture
        Returns signal analysis with confidence and value metrics
        """
        bookmaker_odds = fixture_odds.get("bookmakerOdds", {})
        
        if not bookmaker_odds:
            return None
        
        # Collect odds from all available bookmakers
        home_odds_list = []
        draw_odds_list = []
        away_odds_list = []
        
        sharp_home = None
        sharp_draw = None
        sharp_away = None
        
        for bookmaker, data in bookmaker_odds.items():
            markets = data.get("markets", {})
            market_1x2 = markets.get(MARKET_1X2, {})
            outcomes = market_1x2.get("outcomes", {})
            
            home_data = outcomes.get(OUTCOME_HOME, {}).get("players", {}).get("0", {})
            draw_data = outcomes.get(OUTCOME_DRAW, {}).get("players", {}).get("0", {})
            away_data = outcomes.get(OUTCOME_AWAY, {}).get("players", {}).get("0", {})
            
            if home_data.get("price"):
                home_odds_list.append({"bookmaker": bookmaker, "odds": home_data["price"]})
                if bookmaker in SHARP_BOOKMAKERS and not sharp_home:
                    sharp_home = home_data["price"]
                    
            if draw_data.get("price"):
                draw_odds_list.append({"bookmaker": bookmaker, "odds": draw_data["price"]})
                if bookmaker in SHARP_BOOKMAKERS and not sharp_draw:
                    sharp_draw = draw_data["price"]
                    
            if away_data.get("price"):
                away_odds_list.append({"bookmaker": bookmaker, "odds": away_data["price"]})
                if bookmaker in SHARP_BOOKMAKERS and not sharp_away:
                    sharp_away = away_data["price"]
        
        if not home_odds_list:
            return None
        
        # Calculate average and best odds
        avg_home = sum(o["odds"] for o in home_odds_list) / len(home_odds_list)
        avg_draw = sum(o["odds"] for o in draw_odds_list) / len(draw_odds_list) if draw_odds_list else 0
        avg_away = sum(o["odds"] for o in away_odds_list) / len(away_odds_list) if away_odds_list else 0
        
        best_home = max(home_odds_list, key=lambda x: x["odds"])
        best_draw = max(draw_odds_list, key=lambda x: x["odds"]) if draw_odds_list else None
        best_away = max(away_odds_list, key=lambda x: x["odds"]) if away_odds_list else None
        
        # Determine favorite
        if sharp_home and sharp_draw and sharp_away:
            favorite = "home" if sharp_home < sharp_away else "away" if sharp_away < sharp_home else "draw"
            favorite_odds = min(sharp_home, sharp_away)
        else:
            favorite = "home" if avg_home < avg_away else "away"
            favorite_odds = min(avg_home, avg_away)
        
        # Calculate confidence based on odds spread
        odds_spread = max(avg_home, avg_away) - min(avg_home, avg_away)
        confidence = min(95, 50 + (odds_spread * 10))
        
        # Calculate margin
        margin = self.calculate_margin([avg_home, avg_draw, avg_away]) if avg_draw else self.calculate_margin([avg_home, avg_away])
        
        return {
            "market": "1X2",
            "analysis_time": datetime.now(timezone.utc).isoformat(),
            "odds": {
                "home": {
                    "average": round(avg_home, 3),
                    "best": best_home,
                    "sharp": sharp_home,
                    "implied_prob": self.calculate_implied_probability(sharp_home or avg_home)
                },
                "draw": {
                    "average": round(avg_draw, 3) if avg_draw else None,
                    "best": best_draw,
                    "sharp": sharp_draw,
                    "implied_prob": self.calculate_implied_probability(sharp_draw or avg_draw) if avg_draw else None
                },
                "away": {
                    "average": round(avg_away, 3),
                    "best": best_away,
                    "sharp": sharp_away,
                    "implied_prob": self.calculate_implied_probability(sharp_away or avg_away)
                }
            },
            "favorite": favorite,
            "favorite_odds": round(favorite_odds, 3),
            "confidence": round(confidence, 1),
            "margin": margin,
            "bookmaker_count": len(home_odds_list),
            "has_sharp_data": bool(sharp_home)
        }
    
    def generate_signal(self, fixture: Dict, analysis: Dict) -> Dict:
        """
        Generate a trading signal based on market analysis
        """
        if not analysis:
            return None
        
        confidence = analysis.get("confidence", 50)
        margin = analysis.get("margin", 5)
        has_sharp = analysis.get("has_sharp_data", False)
        favorite = analysis.get("favorite", "home")
        favorite_odds = analysis.get("favorite_odds", 1.5)
        
        # Calculate signal score (0-100)
        signal_score = 50
        
        # Higher confidence = higher score
        signal_score += (confidence - 50) * 0.3
        
        # Lower margin = better value = higher score
        signal_score += max(0, (10 - margin) * 2)
        
        # Sharp data available = higher score
        if has_sharp:
            signal_score += 10
        
        # Favorable odds range (1.5 - 2.5) = higher score
        if 1.5 <= favorite_odds <= 2.5:
            signal_score += 10
        elif 1.3 <= favorite_odds <= 3.0:
            signal_score += 5
        
        signal_score = max(0, min(100, signal_score))
        
        # Calculate risk score (0-100, higher = riskier)
        risk_score = 50
        
        # Low odds = lower risk
        if favorite_odds < 1.5:
            risk_score -= 15
        elif favorite_odds > 3.0:
            risk_score += 20
        
        # High margin = higher risk
        risk_score += margin * 2
        
        # Low confidence = higher risk
        risk_score += (100 - confidence) * 0.3
        
        risk_score = max(0, min(100, risk_score))
        
        # Determine recommendation
        if signal_score >= 70 and risk_score <= 40:
            recommendation = "STRONG_BUY"
            recommendation_text = "Starkes Signal"
        elif signal_score >= 60 and risk_score <= 50:
            recommendation = "BUY"
            recommendation_text = "Gutes Signal"
        elif signal_score >= 50:
            recommendation = "HOLD"
            recommendation_text = "Abwarten"
        else:
            recommendation = "AVOID"
            recommendation_text = "Vermeiden"
        
        # Extract fixture info - use participant IDs to get names
        home_team = fixture.get("participant1Name")
        away_team = fixture.get("participant2Name")
        
        # If names not in fixture, look them up via participant IDs
        if not home_team or home_team == "Home":
            participant1_id = fixture.get("participant1Id")
            if participant1_id:
                home_team = self.odds_service.get_participant_name(participant1_id)
            else:
                home_team = "Heim"
                
        if not away_team or away_team == "Away":
            participant2_id = fixture.get("participant2Id")
            if participant2_id:
                away_team = self.odds_service.get_participant_name(participant2_id)
            else:
                away_team = "Auswärts"
        
        return {
            "fixture_id": fixture.get("fixtureId", ""),
            "home_team": home_team,
            "away_team": away_team,
            "start_time": fixture.get("startTime"),
            "signal_score": round(signal_score, 1),
            "risk_score": round(risk_score, 1),
            "confidence": round(confidence, 1),
            "recommendation": recommendation,
            "recommendation_text": recommendation_text,
            "suggested_bet": {
                "type": "1X2",
                "selection": favorite.upper(),
                "odds": round(favorite_odds, 2),
                "implied_probability": analysis["odds"][favorite]["implied_prob"]
            },
            "analysis": {
                "margin": margin,
                "bookmaker_count": analysis.get("bookmaker_count", 0),
                "has_sharp_data": has_sharp,
                "best_odds": analysis["odds"][favorite]["best"]
            },
            "generated_at": datetime.now(timezone.utc).isoformat()
        }
    
    def analyze_live_matches(self) -> List[Dict]:
        """
        Analyze all live matches and generate signals
        Returns list of signals sorted by signal score
        """
        live_odds = self.odds_service.get_live_odds()
        
        if not live_odds:
            logger.info("No live matches with odds available")
            return []
        
        signals = []
        
        for fixture in live_odds:
            try:
                analysis = self.analyze_1x2_market(fixture)
                if analysis:
                    signal = self.generate_signal(fixture, analysis)
                    if signal:
                        signals.append(signal)
            except Exception as e:
                logger.error(f"Error analyzing fixture: {e}")
                continue
        
        # Sort by signal score (highest first)
        signals.sort(key=lambda x: x["signal_score"], reverse=True)
        
        return signals
    
    def analyze_upcoming_matches(self, tournament_ids: List[int] = None) -> List[Dict]:
        """
        Analyze upcoming matches and generate pre-match signals
        """
        if tournament_ids:
            fixtures = self.odds_service.get_odds_by_tournaments(tournament_ids)
        else:
            # Get tournaments with upcoming fixtures dynamically
            all_tournaments = self.odds_service.get_tournaments()
            
            if all_tournaments:
                # Sort by upcoming fixtures count and take top tournaments
                active_tournaments = [
                    t for t in all_tournaments 
                    if t.get('upcomingFixtures', 0) > 0
                ]
                active_tournaments.sort(key=lambda x: x.get('upcomingFixtures', 0), reverse=True)
                
                # Take top 5 most active tournaments (Free tier limit)
                tournament_ids = [t.get('tournamentId') for t in active_tournaments[:5]]
                
                if tournament_ids:
                    fixtures = self.odds_service.get_odds_by_tournaments(tournament_ids)
                else:
                    fixtures = []
            else:
                # Fallback to top European leagues
                default_tournaments = [17, 8, 35, 23, 34]  # EPL, La Liga, Bundesliga, Serie A, Ligue 1
                fixtures = self.odds_service.get_odds_by_tournaments(default_tournaments)
        
        if not fixtures:
            logger.info("No upcoming matches with odds available")
            return []
        
        signals = []
        
        for fixture in fixtures:
            try:
                analysis = self.analyze_1x2_market(fixture)
                if analysis:
                    signal = self.generate_signal(fixture, analysis)
                    if signal:
                        signals.append(signal)
            except Exception as e:
                logger.error(f"Error analyzing fixture: {e}")
                continue
        
        # Sort by signal score
        signals.sort(key=lambda x: x["signal_score"], reverse=True)
        
        return signals


# Singleton instance
_oddspapi_service = None
_signal_engine = None


def get_oddspapi_service() -> OddsPapiService:
    """Get singleton OddsPapi service instance"""
    global _oddspapi_service
    if _oddspapi_service is None:
        _oddspapi_service = OddsPapiService()
    return _oddspapi_service


def get_signal_engine() -> SignalEngine:
    """Get singleton Signal Engine instance"""
    global _signal_engine
    if _signal_engine is None:
        _signal_engine = SignalEngine(get_oddspapi_service())
    return _signal_engine
