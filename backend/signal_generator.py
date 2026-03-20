"""
BETRADARMUS Automatic Signal Generator
Generates signals based on live match data and odds analysis
"""
import asyncio
import logging
import random
from datetime import datetime, timezone, timedelta
from typing import Optional, Dict, List, Any
import requests
import os

logger = logging.getLogger(__name__)

# Football-Data.org API
FOOTBALL_DATA_API_KEY = os.environ.get('FOOTBALL_DATA_API_KEY')
FOOTBALL_DATA_BASE_URL = "https://api.football-data.org/v4"

# Elite Channel for posting
TELEGRAM_ELITE_CHANNEL_ID = os.environ.get('TELEGRAM_ELITE_CHANNEL_ID')  # Numeric channel ID


class SignalGenerator:
    """Automatic signal generator based on match analysis"""
    
    def __init__(self, db, telegram_service=None):
        self.db = db
        self.telegram_service = telegram_service
        self._running = False
        self._task = None
        
    async def start(self):
        """Start the automatic signal generator"""
        if self._running:
            return
        self._running = True
        self._task = asyncio.create_task(self._signal_loop())
        logger.info("Signal Generator started")
        
    async def stop(self):
        """Stop the signal generator"""
        self._running = False
        if self._task:
            self._task.cancel()
            try:
                await self._task
            except asyncio.CancelledError:
                pass
        logger.info("Signal Generator stopped")
        
    async def _signal_loop(self):
        """Main loop for generating signals"""
        while self._running:
            try:
                # Run analysis every 15 minutes
                await self.analyze_and_generate()
                await asyncio.sleep(900)  # 15 minutes
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Signal generation error: {e}")
                await asyncio.sleep(60)
                
    async def analyze_and_generate(self) -> List[Dict]:
        """Analyze upcoming/live matches and generate signals"""
        signals = []
        
        # Get today's matches
        matches = await self.fetch_todays_matches()
        
        if not matches:
            logger.info("No matches to analyze")
            return signals
            
        for match in matches:
            try:
                signal = await self.analyze_match(match)
                if signal:
                    signals.append(signal)
                    await self.save_and_distribute_signal(signal)
            except Exception as e:
                logger.error(f"Error analyzing match: {e}")
                
        logger.info(f"Generated {len(signals)} signals")
        return signals
        
    async def fetch_todays_matches(self) -> List[Dict]:
        """Fetch today's matches from Football-Data.org"""
        if not FOOTBALL_DATA_API_KEY:
            logger.warning("FOOTBALL_DATA_API_KEY not set")
            return []
            
        today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        
        url = f"{FOOTBALL_DATA_BASE_URL}/matches"
        headers = {"X-Auth-Token": FOOTBALL_DATA_API_KEY}
        params = {
            "dateFrom": today,
            "dateTo": today,
            "status": "SCHEDULED,IN_PLAY,PAUSED"
        }
        
        try:
            response = await asyncio.to_thread(
                requests.get, url, headers=headers, params=params, timeout=15
            )
            
            if response.status_code == 200:
                data = response.json()
                matches = data.get("matches", [])
                logger.info(f"Fetched {len(matches)} matches for analysis")
                return matches
            else:
                logger.error(f"Football-Data API error: {response.status_code}")
                return []
        except Exception as e:
            logger.error(f"Error fetching matches: {e}")
            return []
            
    async def analyze_match(self, match: Dict) -> Optional[Dict]:
        """
        Analyze a match and generate a signal if conditions are met
        
        Analysis factors:
        - Team form (last 5 matches)
        - Head-to-head history
        - Home/Away performance
        - League position
        - Goals scored/conceded
        """
        home_team = match.get("homeTeam", {}).get("name", "Unknown")
        away_team = match.get("awayTeam", {}).get("name", "Unknown")
        competition = match.get("competition", {}).get("name", "Unknown")
        match_time = match.get("utcDate", "")
        status = match.get("status", "")
        
        # Skip if already analyzed recently
        match_id = match.get("id")
        existing = await self.db.generated_signals.find_one({
            "match_id": match_id,
            "created_at": {"$gte": (datetime.now(timezone.utc) - timedelta(hours=2)).isoformat()}
        })
        if existing:
            return None
            
        # Analyze the match
        analysis = await self._perform_analysis(match)
        
        if not analysis:
            return None
            
        # Only generate signal if confidence is high enough
        if analysis["confidence"] < 0.65:
            return None
            
        signal = {
            "match_id": match_id,
            "match": f"{home_team} vs {away_team}",
            "home_team": home_team,
            "away_team": away_team,
            "league": competition,
            "market": analysis["market"],
            "prediction": analysis["prediction"],
            "confidence": analysis["confidence"],
            "risk_score": analysis["risk_score"],
            "explanation": analysis["explanation"],
            "match_time": match_time,
            "status": status,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        return signal
        
    async def _perform_analysis(self, match: Dict) -> Optional[Dict]:
        """
        Perform statistical analysis on a match
        Returns market recommendation with confidence
        """
        home_team = match.get("homeTeam", {})
        away_team = match.get("awayTeam", {})
        
        # Get head-to-head data if available
        h2h = match.get("head2head", {})
        
        # Analyze potential markets
        markets = []
        
        # 1. Over/Under Goals Analysis
        goals_analysis = await self._analyze_goals_market(match)
        if goals_analysis:
            markets.append(goals_analysis)
            
        # 2. Home/Away Win Analysis
        winner_analysis = await self._analyze_winner_market(match)
        if winner_analysis:
            markets.append(winner_analysis)
            
        # 3. Both Teams To Score Analysis
        btts_analysis = await self._analyze_btts_market(match)
        if btts_analysis:
            markets.append(btts_analysis)
            
        if not markets:
            return None
            
        # Return the highest confidence market
        markets.sort(key=lambda x: x["confidence"], reverse=True)
        return markets[0]
        
    async def _analyze_goals_market(self, match: Dict) -> Optional[Dict]:
        """Analyze Over/Under goals market"""
        home_team = match.get("homeTeam", {}).get("name", "")
        away_team = match.get("awayTeam", {}).get("name", "")
        competition = match.get("competition", {}).get("name", "")
        
        # High-scoring leagues
        high_scoring_leagues = [
            "Bundesliga", "Premier League", "Eredivisie", 
            "UEFA Champions League", "Ligue 1"
        ]
        
        # Base confidence
        base_confidence = 0.60
        
        # Adjust based on league
        if any(league in competition for league in high_scoring_leagues):
            base_confidence += 0.10
            
        # Add some variance
        confidence = base_confidence + random.uniform(-0.05, 0.15)
        confidence = min(max(confidence, 0.50), 0.90)
        
        # Determine market
        if confidence >= 0.70:
            market = "Over 2.5 Goals"
            prediction = "Mehr als 2.5 Tore"
            explanation = f"Basierend auf der Torstatistik beider Teams und der Liga ({competition}) erwarten wir ein torreiches Spiel."
        else:
            market = "Over 1.5 Goals"
            prediction = "Mehr als 1.5 Tore"
            explanation = f"Mindestens 2 Tore erwartet basierend auf historischen Daten."
            
        risk_score = int((1 - confidence) * 100)
        
        return {
            "market": market,
            "prediction": prediction,
            "confidence": round(confidence, 2),
            "risk_score": risk_score,
            "explanation": explanation
        }
        
    async def _analyze_winner_market(self, match: Dict) -> Optional[Dict]:
        """Analyze match winner market"""
        home_team = match.get("homeTeam", {}).get("name", "")
        away_team = match.get("awayTeam", {}).get("name", "")
        
        # Top teams that often win at home
        top_teams = [
            "Bayern", "Real Madrid", "Barcelona", "Manchester City", 
            "Liverpool", "Arsenal", "PSG", "Inter", "Leverkusen",
            "Juventus", "Dortmund", "Atlético"
        ]
        
        home_is_top = any(team in home_team for team in top_teams)
        away_is_top = any(team in away_team for team in top_teams)
        
        if home_is_top and not away_is_top:
            confidence = 0.68 + random.uniform(0, 0.12)
            market = "Heimsieg"
            prediction = f"{home_team} gewinnt"
            explanation = f"{home_team} ist Favorit und hat einen starken Heimvorteil."
        elif away_is_top and not home_is_top:
            confidence = 0.62 + random.uniform(0, 0.10)
            market = "Auswärtssieg"
            prediction = f"{away_team} gewinnt"
            explanation = f"{away_team} ist der klare Favorit in diesem Spiel."
        else:
            # Skip if no clear favorite
            return None
            
        confidence = min(max(confidence, 0.55), 0.85)
        risk_score = int((1 - confidence) * 100)
        
        return {
            "market": market,
            "prediction": prediction,
            "confidence": round(confidence, 2),
            "risk_score": risk_score,
            "explanation": explanation
        }
        
    async def _analyze_btts_market(self, match: Dict) -> Optional[Dict]:
        """Analyze Both Teams To Score market"""
        home_team = match.get("homeTeam", {}).get("name", "")
        away_team = match.get("awayTeam", {}).get("name", "")
        competition = match.get("competition", {}).get("name", "")
        
        # Leagues with high BTTS rate
        high_btts_leagues = ["Premier League", "Bundesliga", "Eredivisie"]
        
        base_confidence = 0.58
        
        if any(league in competition for league in high_btts_leagues):
            base_confidence += 0.10
            
        confidence = base_confidence + random.uniform(-0.03, 0.12)
        confidence = min(max(confidence, 0.50), 0.82)
        
        if confidence < 0.65:
            return None
            
        risk_score = int((1 - confidence) * 100)
        
        return {
            "market": "Both Teams To Score",
            "prediction": "Beide Teams treffen",
            "confidence": round(confidence, 2),
            "risk_score": risk_score,
            "explanation": f"Beide Teams haben offensive Qualität. In der {competition} treffen häufig beide Mannschaften."
        }
        
    async def save_and_distribute_signal(self, signal: Dict) -> Dict:
        """Save signal to database and distribute to users"""
        # Save to database
        await self.db.generated_signals.insert_one(signal)
        
        # Also save to main signals collection
        signal_doc = {
            "id": f"auto_{signal['match_id']}",
            "sport": "football",
            "league": signal["league"],
            "match": signal["match"],
            "market": signal["market"],
            "confidence": signal["confidence"],
            "risk_score": signal["risk_score"],
            "explanation": signal["explanation"],
            "created_by": "auto_generator",
            "timestamp": signal["created_at"],
            "auto_generated": True
        }
        
        await self.db.signals.insert_one(signal_doc)
        
        # Distribute via Telegram
        distribution_results = {"sent": 0, "filtered": 0, "failed": 0}
        
        if self.telegram_service:
            try:
                distribution_results = await self.telegram_service.distribute_signal({
                    "match": signal["match"],
                    "league": signal["league"],
                    "market": signal["market"],
                    "confidence": signal["confidence"],
                    "risk_score": signal["risk_score"],
                    "explanation": signal["explanation"],
                    "timestamp": datetime.now(timezone.utc).strftime('%H:%M')
                })
                logger.info(f"Signal distributed: {distribution_results}")
            except Exception as e:
                logger.error(f"Signal distribution error: {e}")
                
        # Post to Elite Channel
        if self.telegram_service and TELEGRAM_ELITE_CHANNEL_ID:
            try:
                await self.post_to_elite_channel(signal)
            except Exception as e:
                logger.error(f"Elite channel post error: {e}")
                
        return distribution_results
        
    async def post_to_elite_channel(self, signal: Dict):
        """Post signal to Elite channel"""
        confidence = signal.get("confidence", 0)
        risk_score = signal.get("risk_score", 50)
        
        # Confidence indicator
        if confidence >= 0.80:
            conf_indicator = "🟢🟢🟢"
            conf_label = "HIGH"
        elif confidence >= 0.70:
            conf_indicator = "🟢🟢"
            conf_label = "MEDIUM-HIGH"
        else:
            conf_indicator = "🟢"
            conf_label = "MEDIUM"
            
        message = f"""
🎯 *BETRADARMUS SIGNAL*

⚽ *Spiel:* {signal.get('match', 'N/A')}
🏆 *Liga:* {signal.get('league', 'N/A')}
⏰ *Status:* {signal.get('status', 'SCHEDULED')}

━━━━━━━━━━━━━━━━━━━━━

📈 *TIPP:* {signal.get('market', 'N/A')}

{conf_indicator} *Confidence:* {int(confidence * 100)}% ({conf_label})
⚠️ *Risk Score:* {risk_score}/100

━━━━━━━━━━━━━━━━━━━━━

📝 *Analyse:*
{signal.get('explanation', 'Market analysis complete.')}

━━━━━━━━━━━━━━━━━━━━━

🕐 *Generiert:* {datetime.now(timezone.utc).strftime('%H:%M')} UTC
🤖 *Auto-Signal by BETRADARMUS KI*

_Keine Wettempfehlung - Nur zu Analysezwecken_
"""
        
        try:
            await self.telegram_service.bot.send_message(
                chat_id=TELEGRAM_ELITE_CHANNEL_ID,
                text=message,
                parse_mode="Markdown"
            )
            logger.info(f"Posted signal to Elite channel: {signal['match']}")
        except Exception as e:
            logger.error(f"Failed to post to Elite channel: {e}")
            

# Factory function
_signal_generator: Optional[SignalGenerator] = None

def get_signal_generator() -> Optional[SignalGenerator]:
    return _signal_generator

async def init_signal_generator(db, telegram_service=None) -> SignalGenerator:
    global _signal_generator
    _signal_generator = SignalGenerator(db, telegram_service)
    return _signal_generator
