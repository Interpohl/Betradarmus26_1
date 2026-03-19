"""
Statistics Service for BETRADARMUS
Handles tip results tracking and performance statistics using The Odds API
"""
import os
import logging
import asyncio
from datetime import datetime, timezone, timedelta
from typing import Optional, Dict, List, Any
import requests
from motor.motor_asyncio import AsyncIOMotorDatabase

logger = logging.getLogger(__name__)

ODDS_API_KEY = os.environ.get('ODDS_API_KEY')
ODDS_API_BASE_URL = "https://api.the-odds-api.com/v4"


class StatisticsService:
    """Service for tracking tip performance and calculating statistics"""
    
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        
    async def fetch_completed_scores(self, sport: str = "soccer_germany_bundesliga", days_from: int = 3) -> List[Dict]:
        """Fetch completed match scores from The Odds API"""
        url = f"{ODDS_API_BASE_URL}/sports/{sport}/scores"
        params = {
            "apiKey": ODDS_API_KEY,
            "daysFrom": days_from
        }
        
        try:
            response = await asyncio.to_thread(
                requests.get, url, params=params, timeout=15
            )
            
            if response.status_code == 200:
                data = response.json()
                # Filter only completed matches
                completed = [m for m in data if m.get("completed", False)]
                logger.info(f"Fetched {len(completed)} completed matches for {sport}")
                return completed
            else:
                logger.error(f"Odds API error: {response.status_code}")
                return []
        except Exception as e:
            logger.error(f"Error fetching scores: {e}")
            return []
    
    async def evaluate_tip(self, tip: Dict, match_result: Dict) -> Optional[bool]:
        """
        Evaluate if a tip was correct based on match result
        
        Returns:
            True = Tip correct (WIN)
            False = Tip incorrect (LOSS)
            None = Cannot evaluate
        """
        scores = match_result.get("scores", [])
        if not scores or len(scores) < 2:
            return None
        
        home_score = scores[0].get("score")
        away_score = scores[1].get("score")
        
        if home_score is None or away_score is None:
            return None
        
        home_score = int(home_score)
        away_score = int(away_score)
        total_goals = home_score + away_score
        
        market = tip.get("market", "").lower()
        predicted_outcome = tip.get("predicted_outcome", "").lower()
        
        # Evaluate different market types
        if "over" in market and "goals" in market:
            # Over X.5 Goals
            try:
                line = float(market.split()[-2])
                return total_goals > line
            except:
                # Default to Over 2.5
                return total_goals > 2.5
        
        elif "under" in market and "goals" in market:
            # Under X.5 Goals
            try:
                line = float(market.split()[-2])
                return total_goals < line
            except:
                return total_goals < 2.5
        
        elif "btts" in market or "both teams" in market:
            # Both Teams To Score
            both_scored = home_score > 0 and away_score > 0
            if "yes" in predicted_outcome or "ja" in predicted_outcome:
                return both_scored
            else:
                return not both_scored
        
        elif "heimsieg" in market or "home win" in market or match_result.get("home_team", "").lower() in market:
            return home_score > away_score
        
        elif "auswärtssieg" in market or "away win" in market or match_result.get("away_team", "").lower() in market:
            return away_score > home_score
        
        elif "unentschieden" in market or "draw" in market:
            return home_score == away_score
        
        return None
    
    async def process_pending_tips(self) -> Dict:
        """Process all pending tips and update their results"""
        # Get pending tips (not yet evaluated)
        pending_tips = await self.db.tip_results.find({
            "result": None,
            "evaluated": False
        }).to_list(length=100)
        
        if not pending_tips:
            logger.info("No pending tips to process")
            return {"processed": 0, "wins": 0, "losses": 0}
        
        # Fetch completed matches from multiple leagues
        leagues = [
            "soccer_germany_bundesliga",
            "soccer_germany_bundesliga2",
            "soccer_epl",
            "soccer_spain_la_liga",
            "soccer_italy_serie_a",
            "soccer_france_ligue_one",
            "soccer_uefa_champs_league"
        ]
        
        all_completed = []
        for league in leagues:
            completed = await self.fetch_completed_scores(league, days_from=3)
            all_completed.extend(completed)
        
        # Build lookup by match name (fuzzy matching)
        match_results = {}
        for match in all_completed:
            home = match.get("home_team", "").lower()
            away = match.get("away_team", "").lower()
            match_results[f"{home}_{away}"] = match
            # Also store by first word of team name for fuzzy matching
            home_first = home.split()[0] if home else ""
            away_first = away.split()[0] if away else ""
            if home_first and away_first:
                match_results[f"{home_first}_{away_first}"] = match
        
        processed = 0
        wins = 0
        losses = 0
        
        for tip in pending_tips:
            tip_match = tip.get("match", "").lower()
            
            # Try to find matching result
            match_result = None
            for key, result in match_results.items():
                if key in tip_match.replace(" vs ", "_").replace(" ", "_"):
                    match_result = result
                    break
                # Fuzzy match
                home = result.get("home_team", "").lower()
                away = result.get("away_team", "").lower()
                if (home.split()[0] in tip_match or away.split()[0] in tip_match):
                    match_result = result
                    break
            
            if match_result:
                is_win = await self.evaluate_tip(tip, match_result)
                
                if is_win is not None:
                    scores = match_result.get("scores", [])
                    final_score = f"{scores[0].get('score', '?')}:{scores[1].get('score', '?')}" if len(scores) >= 2 else "?"
                    
                    await self.db.tip_results.update_one(
                        {"id": tip["id"]},
                        {"$set": {
                            "result": "WIN" if is_win else "LOSS",
                            "evaluated": True,
                            "evaluated_at": datetime.now(timezone.utc).isoformat(),
                            "final_score": final_score,
                            "home_score": scores[0].get('score') if scores else None,
                            "away_score": scores[1].get('score') if len(scores) > 1 else None
                        }}
                    )
                    
                    processed += 1
                    if is_win:
                        wins += 1
                    else:
                        losses += 1
        
        return {"processed": processed, "wins": wins, "losses": losses}
    
    async def record_tip(self, tip_data: Dict) -> str:
        """Record a new tip for tracking"""
        tip_doc = {
            "id": tip_data.get("id", str(datetime.now().timestamp())),
            "match": tip_data.get("match"),
            "league": tip_data.get("league"),
            "market": tip_data.get("market"),
            "predicted_outcome": tip_data.get("predicted_outcome"),
            "confidence": tip_data.get("confidence", 0.7),
            "odds": tip_data.get("odds", 1.85),
            "stake": tip_data.get("stake", 1.0),  # Unit stake
            "result": None,  # WIN, LOSS, PUSH, or None (pending)
            "evaluated": False,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "match_date": tip_data.get("match_date", datetime.now(timezone.utc).date().isoformat())
        }
        
        await self.db.tip_results.insert_one(tip_doc)
        return tip_doc["id"]
    
    async def get_statistics(self) -> Dict[str, Any]:
        """Get overall statistics for all tips"""
        pipeline = [
            {"$match": {"evaluated": True}},
            {"$group": {
                "_id": None,
                "total_tips": {"$sum": 1},
                "wins": {"$sum": {"$cond": [{"$eq": ["$result", "WIN"]}, 1, 0]}},
                "losses": {"$sum": {"$cond": [{"$eq": ["$result", "LOSS"]}, 1, 0]}},
                "total_odds": {"$sum": "$odds"},
                "total_stake": {"$sum": "$stake"}
            }}
        ]
        
        results = await self.db.tip_results.aggregate(pipeline).to_list(length=1)
        
        if not results:
            return {
                "total_tips": 0,
                "wins": 0,
                "losses": 0,
                "win_rate": 0,
                "roi": 0,
                "avg_odds": 0,
                "profit": 0,
                "current_streak": 0,
                "best_streak": 0
            }
        
        stats = results[0]
        total = stats.get("total_tips", 0)
        wins = stats.get("wins", 0)
        losses = stats.get("losses", 0)
        
        win_rate = (wins / total * 100) if total > 0 else 0
        avg_odds = stats.get("total_odds", 0) / total if total > 0 else 0
        
        # Calculate profit (assuming unit stake with average odds)
        profit = (wins * (avg_odds - 1)) - losses
        roi = (profit / total * 100) if total > 0 else 0
        
        # Get streak info
        streaks = await self._calculate_streaks()
        
        return {
            "total_tips": total,
            "wins": wins,
            "losses": losses,
            "win_rate": round(win_rate, 1),
            "roi": round(roi, 1),
            "avg_odds": round(avg_odds, 2),
            "profit": round(profit, 2),
            "current_streak": streaks["current"],
            "best_streak": streaks["best"],
            "streak_type": streaks["type"]
        }
    
    async def _calculate_streaks(self) -> Dict:
        """Calculate current and best win/loss streaks"""
        tips = await self.db.tip_results.find(
            {"evaluated": True},
            {"result": 1, "evaluated_at": 1}
        ).sort("evaluated_at", -1).to_list(length=500)
        
        if not tips:
            return {"current": 0, "best": 0, "type": "none"}
        
        # Calculate current streak
        current_streak = 0
        current_type = tips[0].get("result") if tips else None
        
        for tip in tips:
            if tip.get("result") == current_type:
                current_streak += 1
            else:
                break
        
        # Calculate best win streak
        best_win_streak = 0
        temp_streak = 0
        
        for tip in reversed(tips):
            if tip.get("result") == "WIN":
                temp_streak += 1
                best_win_streak = max(best_win_streak, temp_streak)
            else:
                temp_streak = 0
        
        return {
            "current": current_streak,
            "best": best_win_streak,
            "type": "WIN" if current_type == "WIN" else "LOSS" if current_type == "LOSS" else "none"
        }
    
    async def get_league_performance(self) -> List[Dict]:
        """Get performance breakdown by league"""
        pipeline = [
            {"$match": {"evaluated": True}},
            {"$group": {
                "_id": "$league",
                "total": {"$sum": 1},
                "wins": {"$sum": {"$cond": [{"$eq": ["$result", "WIN"]}, 1, 0]}},
                "losses": {"$sum": {"$cond": [{"$eq": ["$result", "LOSS"]}, 1, 0]}}
            }},
            {"$project": {
                "league": "$_id",
                "total": 1,
                "wins": 1,
                "losses": 1,
                "win_rate": {
                    "$cond": [
                        {"$gt": ["$total", 0]},
                        {"$multiply": [{"$divide": ["$wins", "$total"]}, 100]},
                        0
                    ]
                }
            }},
            {"$sort": {"win_rate": -1}},
            {"$limit": 10}
        ]
        
        results = await self.db.tip_results.aggregate(pipeline).to_list(length=10)
        return [
            {
                "league": r.get("league", "Unbekannt"),
                "total": r.get("total", 0),
                "wins": r.get("wins", 0),
                "losses": r.get("losses", 0),
                "win_rate": round(r.get("win_rate", 0), 1)
            }
            for r in results
        ]
    
    async def get_recent_tips(self, limit: int = 20) -> List[Dict]:
        """Get recent evaluated tips"""
        tips = await self.db.tip_results.find(
            {"evaluated": True},
            {"_id": 0}
        ).sort("evaluated_at", -1).limit(limit).to_list(length=limit)
        
        return tips
    
    async def get_monthly_performance(self, months: int = 6) -> List[Dict]:
        """Get monthly performance data for charts"""
        start_date = datetime.now(timezone.utc) - timedelta(days=months * 30)
        
        pipeline = [
            {"$match": {
                "evaluated": True,
                "evaluated_at": {"$gte": start_date.isoformat()}
            }},
            {"$addFields": {
                "month": {"$substr": ["$evaluated_at", 0, 7]}  # YYYY-MM
            }},
            {"$group": {
                "_id": "$month",
                "total": {"$sum": 1},
                "wins": {"$sum": {"$cond": [{"$eq": ["$result", "WIN"]}, 1, 0]}}
            }},
            {"$project": {
                "month": "$_id",
                "total": 1,
                "wins": 1,
                "win_rate": {
                    "$cond": [
                        {"$gt": ["$total", 0]},
                        {"$multiply": [{"$divide": ["$wins", "$total"]}, 100]},
                        0
                    ]
                }
            }},
            {"$sort": {"month": 1}}
        ]
        
        results = await self.db.tip_results.aggregate(pipeline).to_list(length=12)
        
        # German month names
        month_names = {
            "01": "Jan", "02": "Feb", "03": "Mär", "04": "Apr",
            "05": "Mai", "06": "Jun", "07": "Jul", "08": "Aug",
            "09": "Sep", "10": "Okt", "11": "Nov", "12": "Dez"
        }
        
        return [
            {
                "month": month_names.get(r.get("month", "")[-2:], r.get("month", "")),
                "total": r.get("total", 0),
                "wins": r.get("wins", 0),
                "win_rate": round(r.get("win_rate", 0), 1)
            }
            for r in results
        ]
    
    async def seed_demo_data(self) -> int:
        """Seed demo statistics data for display"""
        # Check if we already have data
        count = await self.db.tip_results.count_documents({})
        if count > 0:
            logger.info(f"Already have {count} tips, skipping seed")
            return count
        
        import random
        
        leagues = [
            "Bundesliga", "Premier League", "La Liga", 
            "Serie A", "Ligue 1", "Champions League"
        ]
        
        markets = [
            "Over 2.5 Goals", "Under 2.5 Goals", "Both Teams To Score",
            "Heimsieg", "Auswärtssieg", "Over 1.5 Goals"
        ]
        
        matches = [
            ("Bayern München", "Borussia Dortmund"),
            ("RB Leipzig", "Eintracht Frankfurt"),
            ("Liverpool", "Manchester City"),
            ("Real Madrid", "Barcelona"),
            ("PSG", "Marseille"),
            ("Inter Mailand", "AC Milan"),
            ("Juventus", "Napoli"),
            ("Arsenal", "Chelsea"),
            ("Bayer Leverkusen", "VfB Stuttgart"),
            ("Wolfsburg", "Union Berlin")
        ]
        
        demo_tips = []
        base_date = datetime.now(timezone.utc) - timedelta(days=90)
        
        # Generate 150 demo tips with ~68% win rate
        for i in range(150):
            home, away = random.choice(matches)
            league = random.choice(leagues)
            market = random.choice(markets)
            
            is_win = random.random() < 0.68  # 68% win rate
            confidence = random.uniform(0.65, 0.92)
            odds = random.uniform(1.5, 2.5)
            
            tip_date = base_date + timedelta(days=i * 0.6)
            
            home_score = random.randint(0, 4)
            away_score = random.randint(0, 3)
            
            demo_tips.append({
                "id": f"demo_{i}",
                "match": f"{home} vs {away}",
                "league": league,
                "market": market,
                "predicted_outcome": market,
                "confidence": round(confidence, 2),
                "odds": round(odds, 2),
                "stake": 1.0,
                "result": "WIN" if is_win else "LOSS",
                "evaluated": True,
                "created_at": tip_date.isoformat(),
                "evaluated_at": (tip_date + timedelta(hours=2)).isoformat(),
                "match_date": tip_date.date().isoformat(),
                "final_score": f"{home_score}:{away_score}",
                "home_score": home_score,
                "away_score": away_score
            })
        
        if demo_tips:
            await self.db.tip_results.insert_many(demo_tips)
            logger.info(f"Seeded {len(demo_tips)} demo tips")
        
        return len(demo_tips)


# Global instance
_statistics_service: Optional[StatisticsService] = None


def get_statistics_service() -> Optional[StatisticsService]:
    return _statistics_service


async def init_statistics_service(db: AsyncIOMotorDatabase) -> StatisticsService:
    global _statistics_service
    _statistics_service = StatisticsService(db)
    
    # Seed demo data on first run
    await _statistics_service.seed_demo_data()
    
    return _statistics_service
