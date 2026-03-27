"""
BETRADARMUS Market Analyzer - Signal Engine 2.0
Advanced signal generation based on market data including Polymarket
"""
import logging
from datetime import datetime, timezone, timedelta
from typing import Optional, Dict, List, Any
from dataclasses import dataclass, field
from enum import Enum
import statistics

# Import Polymarket service for prediction market data
try:
    from polymarket_service import polymarket_service, PolymarketService
    POLYMARKET_AVAILABLE = True
except ImportError:
    POLYMARKET_AVAILABLE = False

logger = logging.getLogger(__name__)


class SignalType(Enum):
    """Types of trading signals"""
    MARKET_DISLOCATION = "market_dislocation"      # A: Anbieter hängt hinterher
    MOMENTUM_SHIFT = "momentum_shift"              # B: Quoten bewegen sich schnell
    EVENT_LAG = "event_lag"                        # C: Spiel geändert, Markt reagiert nicht
    VOLATILITY_SPIKE = "volatility_spike"          # D: Ungewöhnlich hohe Bewegung
    CONSENSUS_DIVERGENCE = "consensus_divergence"  # E: Ein Anbieter weicht stark ab
    PERSISTENCE_SIGNAL = "persistence_signal"      # F: Stabile Fehlbewertung
    POLYMARKET_VALUE = "polymarket_value"          # G: Value vs Polymarket crowd wisdom
    CROWD_MOMENTUM = "crowd_momentum"              # H: Polymarket price movement


class SignalPriority(Enum):
    """Signal priority levels"""
    HIGH = "high"       # Sofort pushen
    MEDIUM = "medium"   # Gutes Signal, aber instabil
    LOW = "low"         # Interessantes Muster, eher Analyse


@dataclass
class ExplainToken:
    """A single explanation for why the signal exists"""
    reason: str
    value: Any
    importance: float  # 0-1


@dataclass
class Signal:
    """
    Complete signal with all analysis data
    
    This is the core output of the Signal Engine
    """
    # Identification
    signal_id: str
    market_id: str
    event_name: str
    competition: str
    market_type: str
    selection_id: int
    selection_name: str
    
    # Signal Classification
    signal_type: SignalType
    priority: SignalPriority
    
    # Scores (0-100)
    signal_score: int           # Overall usefulness
    confidence: float           # 0.00-1.00 - How likely it's real
    risk_score: int             # 0-100 - How dangerous
    
    # Timing
    lifetime_seconds: int       # How long the signal is likely valid
    lifetime_label: str         # "Short-lived", "Medium", "Stable"
    created_at: datetime
    
    # Price Data
    current_price: float
    fair_value: float           # Estimated true price
    edge_percent: float         # Difference from fair value
    
    # Explanations
    explain_tokens: List[ExplainToken] = field(default_factory=list)
    
    # Metadata
    raw_data: Dict = field(default_factory=dict)
    
    def to_dict(self) -> Dict:
        """Convert to dictionary for storage/API"""
        return {
            'signal_id': self.signal_id,
            'market_id': self.market_id,
            'event_name': self.event_name,
            'competition': self.competition,
            'market_type': self.market_type,
            'selection_id': self.selection_id,
            'selection_name': self.selection_name,
            'signal_type': self.signal_type.value,
            'priority': self.priority.value,
            'signal_score': self.signal_score,
            'confidence': self.confidence,
            'risk_score': self.risk_score,
            'lifetime_seconds': self.lifetime_seconds,
            'lifetime_label': self.lifetime_label,
            'current_price': self.current_price,
            'fair_value': self.fair_value,
            'edge_percent': self.edge_percent,
            'explain_tokens': [
                {'reason': e.reason, 'value': e.value, 'importance': e.importance}
                for e in self.explain_tokens
            ],
            'created_at': self.created_at.isoformat()
        }
    
    def get_telegram_message(self) -> str:
        """Format signal for Telegram"""
        # Priority emoji
        priority_emoji = {
            SignalPriority.HIGH: "🔴",
            SignalPriority.MEDIUM: "🟡",
            SignalPriority.LOW: "🟢"
        }
        
        # Signal type label
        type_labels = {
            SignalType.MARKET_DISLOCATION: "📊 Market Dislocation",
            SignalType.MOMENTUM_SHIFT: "📈 Momentum Shift",
            SignalType.EVENT_LAG: "⚡ Event Lag",
            SignalType.VOLATILITY_SPIKE: "💥 Volatility Spike",
            SignalType.CONSENSUS_DIVERGENCE: "🔀 Consensus Divergence",
            SignalType.PERSISTENCE_SIGNAL: "🎯 Persistence Signal"
        }
        
        # Confidence indicator
        if self.confidence >= 0.80:
            conf_indicator = "🟢🟢🟢"
        elif self.confidence >= 0.70:
            conf_indicator = "🟢🟢"
        else:
            conf_indicator = "🟢"
        
        # Build explanation text
        explanations = "\n".join([
            f"• {e.reason}: {e.value}" 
            for e in sorted(self.explain_tokens, key=lambda x: -x.importance)[:4]
        ])
        
        message = f"""
{priority_emoji.get(self.priority, "⚪")} *BETRADARMUS ELITE SIGNAL*

⚽ *{self.event_name}*
🏆 {self.competition}

━━━━━━━━━━━━━━━━━━━━━

{type_labels.get(self.signal_type, "📊 Signal")}

📌 *Selection:* {self.selection_name}
💰 *Preis:* {self.current_price:.2f}
📊 *Fair Value:* {self.fair_value:.2f}
📈 *Edge:* {self.edge_percent:+.1f}%

━━━━━━━━━━━━━━━━━━━━━

{conf_indicator} *Confidence:* {int(self.confidence * 100)}%
⚠️ *Risk Score:* {self.risk_score}/100
⏱️ *Lifetime:* {self.lifetime_label} (~{self.lifetime_seconds}s)

━━━━━━━━━━━━━━━━━━━━━

📝 *Analyse:*
{explanations}

━━━━━━━━━━━━━━━━━━━━━

🎯 *Signal Score:* {self.signal_score}/100
🕐 {self.created_at.strftime('%H:%M:%S')} UTC

_ELITE Signal by BETRADARMUS KI_
_Keine Wettempfehlung - Nur Analyse_
"""
        return message


class MarketAnalyzer:
    """
    Advanced market analyzer for generating signals
    
    Uses Betfair market data to detect:
    - Price movements
    - Volume anomalies
    - Market inefficiencies
    - Smart money flow
    """
    
    def __init__(self):
        self._price_history: Dict[str, List[Dict]] = {}  # market_id -> price snapshots
        self._volume_history: Dict[str, List[float]] = {}
        self._signal_history: List[Signal] = []
        
        # Configuration
        self.config = {
            'min_confidence': 0.65,
            'min_signal_score': 50,
            'price_movement_threshold': 2.0,  # percent
            'volume_spike_multiplier': 2.5,
            'max_signals_per_market': 3,
            'signal_cooldown_seconds': 120
        }
        
        # League volatility profiles (historical data)
        self.league_profiles = {
            'Premier League': {'avg_movement': 3.2, 'reaction_speed': 'fast'},
            'Bundesliga': {'avg_movement': 2.8, 'reaction_speed': 'fast'},
            'La Liga': {'avg_movement': 2.5, 'reaction_speed': 'medium'},
            'Serie A': {'avg_movement': 2.4, 'reaction_speed': 'medium'},
            'Ligue 1': {'avg_movement': 2.9, 'reaction_speed': 'medium'},
            'Champions League': {'avg_movement': 3.5, 'reaction_speed': 'fast'},
            'default': {'avg_movement': 2.5, 'reaction_speed': 'medium'}
        }
    
    def record_price_snapshot(self, market_id: str, snapshot: Dict):
        """Record a price snapshot for historical analysis"""
        if market_id not in self._price_history:
            self._price_history[market_id] = []
            
        self._price_history[market_id].append({
            'timestamp': datetime.now(timezone.utc),
            'data': snapshot
        })
        
        # Keep last 100 snapshots
        if len(self._price_history[market_id]) > 100:
            self._price_history[market_id] = self._price_history[market_id][-100:]
    
    def analyze_market(self, market_data: Dict, depth_analysis: Dict) -> List[Signal]:
        """
        Analyze a market and generate signals
        
        Args:
            market_data: Market catalogue data
            depth_analysis: Market depth analysis from BetfairService
            
        Returns:
            List of generated signals
        """
        signals = []
        market_id = market_data.get('market_id')
        
        # Record snapshot
        self.record_price_snapshot(market_id, depth_analysis)
        
        # Run all signal detection algorithms
        for runner in depth_analysis.get('runners', []):
            # 1. Momentum Shift Detection
            momentum_signal = self._detect_momentum_shift(market_data, runner)
            if momentum_signal:
                signals.append(momentum_signal)
                
            # 2. Volatility Spike Detection
            volatility_signal = self._detect_volatility_spike(market_data, runner)
            if volatility_signal:
                signals.append(volatility_signal)
                
            # 3. Liquidity Imbalance (Smart Money)
            imbalance_signal = self._detect_liquidity_imbalance(market_data, runner)
            if imbalance_signal:
                signals.append(imbalance_signal)
                
            # 4. Spread Analysis
            spread_signal = self._detect_spread_anomaly(market_data, runner)
            if spread_signal:
                signals.append(spread_signal)
        
        # Filter and prioritize signals
        filtered_signals = self._filter_and_prioritize(signals)
        
        # Store in history
        self._signal_history.extend(filtered_signals)
        
        return filtered_signals
    
    def _detect_momentum_shift(self, market_data: Dict, runner: Dict) -> Optional[Signal]:
        """
        Detect rapid price movement in one direction
        
        Signal Type: MOMENTUM_SHIFT
        """
        market_id = market_data.get('market_id')
        history = self._price_history.get(market_id, [])
        
        if len(history) < 5:
            return None
            
        selection_id = runner.get('selection_id')
        current_price = runner.get('best_back', 0)
        
        if current_price <= 0:
            return None
            
        # Get price 30 seconds ago
        old_snapshot = None
        for snap in reversed(history[:-1]):
            age = (datetime.now(timezone.utc) - snap['timestamp']).total_seconds()
            if age >= 30:
                old_snapshot = snap
                break
                
        if not old_snapshot:
            return None
            
        # Find old price for this runner
        old_price = None
        for r in old_snapshot['data'].get('runners', []):
            if r.get('selection_id') == selection_id:
                old_price = r.get('best_back', 0)
                break
                
        if not old_price or old_price <= 0:
            return None
            
        # Calculate movement
        price_change = ((current_price - old_price) / old_price) * 100
        
        # Check if significant
        threshold = self.config['price_movement_threshold']
        if abs(price_change) < threshold:
            return None
            
        # Calculate scores
        confidence = min(0.90, 0.60 + (abs(price_change) - threshold) * 0.05)
        signal_score = self._calculate_signal_score(
            edge_strength=abs(price_change) * 3,
            market_divergence=0,
            persistence=0.5,
            execution_feasibility=0.8,
            context_quality=0.7,
            historical_winrate=0.65
        )
        risk_score = self._calculate_risk_score(
            price_volatility=abs(price_change) * 2,
            spread=runner.get('spread_percent', 0),
            liquidity=runner.get('back_liquidity', 0)
        )
        
        # Estimate lifetime
        lifetime = self._estimate_lifetime(
            market_data.get('competition', ''),
            SignalType.MOMENTUM_SHIFT,
            abs(price_change)
        )
        
        # Build explanations
        explain_tokens = [
            ExplainToken(
                reason="Preisbewegung in 30 Sekunden",
                value=f"{price_change:+.1f}%",
                importance=0.9
            ),
            ExplainToken(
                reason="Richtung",
                value="STEIGEND" if price_change > 0 else "FALLEND",
                importance=0.8
            ),
            ExplainToken(
                reason="Aktuelles Volumen",
                value=f"€{runner.get('total_matched', 0):,.0f}",
                importance=0.6
            )
        ]
        
        # Determine priority
        priority = SignalPriority.LOW
        if confidence >= 0.80 and risk_score < 50:
            priority = SignalPriority.HIGH
        elif confidence >= 0.70:
            priority = SignalPriority.MEDIUM
            
        return Signal(
            signal_id=f"mom_{market_id}_{selection_id}_{int(datetime.now().timestamp())}",
            market_id=market_id,
            event_name=market_data.get('event', 'Unknown'),
            competition=market_data.get('competition', 'Unknown'),
            market_type=market_data.get('market_name', 'Match Odds'),
            selection_id=selection_id,
            selection_name=str(selection_id),  # Would need runner name
            signal_type=SignalType.MOMENTUM_SHIFT,
            priority=priority,
            signal_score=signal_score,
            confidence=round(confidence, 2),
            risk_score=risk_score,
            lifetime_seconds=lifetime,
            lifetime_label=self._get_lifetime_label(lifetime),
            current_price=current_price,
            fair_value=old_price,  # Previous price as reference
            edge_percent=price_change,
            explain_tokens=explain_tokens,
            created_at=datetime.now(timezone.utc)
        )
    
    def _detect_volatility_spike(self, market_data: Dict, runner: Dict) -> Optional[Signal]:
        """
        Detect unusually high price volatility
        
        Signal Type: VOLATILITY_SPIKE
        """
        market_id = market_data.get('market_id')
        history = self._price_history.get(market_id, [])
        
        if len(history) < 10:
            return None
            
        selection_id = runner.get('selection_id')
        
        # Calculate recent price changes
        price_changes = []
        for i in range(1, min(len(history), 10)):
            current = None
            previous = None
            
            for r in history[-i]['data'].get('runners', []):
                if r.get('selection_id') == selection_id:
                    current = r.get('best_back', 0)
                    
            for r in history[-i-1]['data'].get('runners', []):
                if r.get('selection_id') == selection_id:
                    previous = r.get('best_back', 0)
                    
            if current and previous and previous > 0:
                change = abs((current - previous) / previous) * 100
                price_changes.append(change)
                
        if len(price_changes) < 5:
            return None
            
        # Calculate volatility
        avg_volatility = statistics.mean(price_changes)
        current_volatility = price_changes[0] if price_changes else 0
        
        # Check for spike
        if current_volatility < avg_volatility * self.config['volume_spike_multiplier']:
            return None
            
        # Calculate scores
        confidence = min(0.85, 0.55 + (current_volatility / avg_volatility - 1) * 0.1)
        signal_score = self._calculate_signal_score(
            edge_strength=current_volatility * 2,
            market_divergence=current_volatility - avg_volatility,
            persistence=0.3,  # Volatility spikes are usually short
            execution_feasibility=0.6,
            context_quality=0.6,
            historical_winrate=0.55
        )
        risk_score = min(90, self._calculate_risk_score(
            price_volatility=current_volatility * 3,
            spread=runner.get('spread_percent', 0),
            liquidity=runner.get('back_liquidity', 0)
        ))
        
        lifetime = self._estimate_lifetime(
            market_data.get('competition', ''),
            SignalType.VOLATILITY_SPIKE,
            current_volatility
        )
        
        explain_tokens = [
            ExplainToken(
                reason="Aktuelle Volatilität",
                value=f"{current_volatility:.1f}%",
                importance=0.9
            ),
            ExplainToken(
                reason="Durchschnitts-Volatilität",
                value=f"{avg_volatility:.1f}%",
                importance=0.7
            ),
            ExplainToken(
                reason="Spike-Faktor",
                value=f"{current_volatility/avg_volatility:.1f}x",
                importance=0.8
            )
        ]
        
        # Volatility spikes are usually medium priority (risky)
        priority = SignalPriority.MEDIUM
        if risk_score > 70:
            priority = SignalPriority.LOW
            
        return Signal(
            signal_id=f"vol_{market_id}_{selection_id}_{int(datetime.now().timestamp())}",
            market_id=market_id,
            event_name=market_data.get('event', 'Unknown'),
            competition=market_data.get('competition', 'Unknown'),
            market_type=market_data.get('market_name', 'Match Odds'),
            selection_id=selection_id,
            selection_name=str(selection_id),
            signal_type=SignalType.VOLATILITY_SPIKE,
            priority=priority,
            signal_score=signal_score,
            confidence=round(confidence, 2),
            risk_score=risk_score,
            lifetime_seconds=lifetime,
            lifetime_label=self._get_lifetime_label(lifetime),
            current_price=runner.get('best_back', 0),
            fair_value=runner.get('best_back', 0),  # Unclear in volatility
            edge_percent=0,
            explain_tokens=explain_tokens,
            created_at=datetime.now(timezone.utc)
        )
    
    def _detect_liquidity_imbalance(self, market_data: Dict, runner: Dict) -> Optional[Signal]:
        """
        Detect significant imbalance between back and lay liquidity
        Indicates potential smart money positioning
        
        Signal Type: CONSENSUS_DIVERGENCE (smart money flow)
        """
        imbalance = runner.get('liquidity_imbalance', 0)
        
        # Need significant imbalance (>30%)
        if abs(imbalance) < 30:
            return None
            
        back_liquidity = runner.get('back_liquidity', 0)
        lay_liquidity = runner.get('lay_liquidity', 0)
        
        # Need minimum liquidity
        if back_liquidity + lay_liquidity < 1000:
            return None
            
        # Calculate scores
        confidence = min(0.85, 0.60 + abs(imbalance) / 100 * 0.3)
        signal_score = self._calculate_signal_score(
            edge_strength=abs(imbalance) / 2,
            market_divergence=abs(imbalance) / 3,
            persistence=0.7,  # Imbalances tend to persist
            execution_feasibility=0.8,
            context_quality=0.7,
            historical_winrate=0.60
        )
        risk_score = self._calculate_risk_score(
            price_volatility=abs(imbalance) / 5,
            spread=runner.get('spread_percent', 0),
            liquidity=back_liquidity + lay_liquidity
        )
        
        lifetime = self._estimate_lifetime(
            market_data.get('competition', ''),
            SignalType.CONSENSUS_DIVERGENCE,
            abs(imbalance)
        )
        
        # Determine direction
        direction = "BACK" if imbalance > 0 else "LAY"
        
        explain_tokens = [
            ExplainToken(
                reason="Liquiditäts-Imbalance",
                value=f"{imbalance:+.1f}%",
                importance=0.9
            ),
            ExplainToken(
                reason="Smart Money Richtung",
                value=f"Mehr {direction} Liquidität",
                importance=0.85
            ),
            ExplainToken(
                reason="Back Liquidität",
                value=f"€{back_liquidity:,.0f}",
                importance=0.6
            ),
            ExplainToken(
                reason="Lay Liquidität",
                value=f"€{lay_liquidity:,.0f}",
                importance=0.6
            )
        ]
        
        priority = SignalPriority.MEDIUM
        if confidence >= 0.75 and risk_score < 40:
            priority = SignalPriority.HIGH
            
        return Signal(
            signal_id=f"liq_{market_data.get('market_id')}_{runner.get('selection_id')}_{int(datetime.now().timestamp())}",
            market_id=market_data.get('market_id'),
            event_name=market_data.get('event', 'Unknown'),
            competition=market_data.get('competition', 'Unknown'),
            market_type=market_data.get('market_name', 'Match Odds'),
            selection_id=runner.get('selection_id'),
            selection_name=str(runner.get('selection_id')),
            signal_type=SignalType.CONSENSUS_DIVERGENCE,
            priority=priority,
            signal_score=signal_score,
            confidence=round(confidence, 2),
            risk_score=risk_score,
            lifetime_seconds=lifetime,
            lifetime_label=self._get_lifetime_label(lifetime),
            current_price=runner.get('best_back', 0),
            fair_value=runner.get('best_lay', 0),  # Use lay as reference
            edge_percent=imbalance / 10,
            explain_tokens=explain_tokens,
            created_at=datetime.now(timezone.utc)
        )
    
    def _detect_spread_anomaly(self, market_data: Dict, runner: Dict) -> Optional[Signal]:
        """
        Detect unusually tight or wide spreads
        
        Signal Type: PERSISTENCE_SIGNAL (if spread is persistently different)
        """
        spread_percent = runner.get('spread_percent', 0)
        
        # Need data
        if spread_percent <= 0:
            return None
            
        # Get league profile
        competition = market_data.get('competition', 'default')
        profile = self.league_profiles.get(competition, self.league_profiles['default'])
        
        # Check if spread is anomalous
        # Normal spread is roughly 1-3% for liquid markets
        if spread_percent < 0.5:
            # Very tight spread - rare, good execution window
            signal_type = SignalType.PERSISTENCE_SIGNAL
            edge = 2.0
        elif spread_percent > 5:
            # Wide spread - market uncertainty
            signal_type = SignalType.MARKET_DISLOCATION
            edge = spread_percent - 3
        else:
            return None
            
        confidence = min(0.80, 0.55 + abs(spread_percent - 2) * 0.05)
        signal_score = self._calculate_signal_score(
            edge_strength=edge * 5,
            market_divergence=abs(spread_percent - 2) * 3,
            persistence=0.8,
            execution_feasibility=0.9 if spread_percent < 1 else 0.5,
            context_quality=0.7,
            historical_winrate=0.58
        )
        risk_score = self._calculate_risk_score(
            price_volatility=spread_percent * 5,
            spread=spread_percent,
            liquidity=runner.get('back_liquidity', 0)
        )
        
        lifetime = self._estimate_lifetime(
            competition,
            signal_type,
            spread_percent
        )
        
        explain_tokens = [
            ExplainToken(
                reason="Spread",
                value=f"{spread_percent:.2f}%",
                importance=0.9
            ),
            ExplainToken(
                reason="Spread-Typ",
                value="Sehr eng" if spread_percent < 1 else "Sehr weit",
                importance=0.8
            ),
            ExplainToken(
                reason="Best Back",
                value=f"{runner.get('best_back', 0):.2f}",
                importance=0.6
            ),
            ExplainToken(
                reason="Best Lay",
                value=f"{runner.get('best_lay', 0):.2f}",
                importance=0.6
            )
        ]
        
        priority = SignalPriority.LOW
        if spread_percent < 1 and confidence >= 0.70:
            priority = SignalPriority.MEDIUM
            
        return Signal(
            signal_id=f"spr_{market_data.get('market_id')}_{runner.get('selection_id')}_{int(datetime.now().timestamp())}",
            market_id=market_data.get('market_id'),
            event_name=market_data.get('event', 'Unknown'),
            competition=market_data.get('competition', 'Unknown'),
            market_type=market_data.get('market_name', 'Match Odds'),
            selection_id=runner.get('selection_id'),
            selection_name=str(runner.get('selection_id')),
            signal_type=signal_type,
            priority=priority,
            signal_score=signal_score,
            confidence=round(confidence, 2),
            risk_score=risk_score,
            lifetime_seconds=lifetime,
            lifetime_label=self._get_lifetime_label(lifetime),
            current_price=runner.get('best_back', 0),
            fair_value=(runner.get('best_back', 0) + runner.get('best_lay', 0)) / 2,
            edge_percent=edge,
            explain_tokens=explain_tokens,
            created_at=datetime.now(timezone.utc)
        )
    
    def _calculate_signal_score(
        self,
        edge_strength: float,
        market_divergence: float,
        persistence: float,
        execution_feasibility: float,
        context_quality: float,
        historical_winrate: float
    ) -> int:
        """
        Calculate overall signal score using weighted formula
        
        Signal Score =
          (Edge Strength * 0.30)
        + (Market Divergence * 0.20)
        + (Persistence * 0.15)
        + (Execution Feasibility * 0.15)
        + (Context Quality * 0.10)
        + (Historical Similarity Winrate * 0.10)
        """
        # Normalize inputs to 0-100 scale
        normalized = {
            'edge': min(100, max(0, edge_strength * 5)),
            'divergence': min(100, max(0, market_divergence * 5)),
            'persistence': min(100, max(0, persistence * 100)),
            'execution': min(100, max(0, execution_feasibility * 100)),
            'context': min(100, max(0, context_quality * 100)),
            'winrate': min(100, max(0, historical_winrate * 100))
        }
        
        score = (
            normalized['edge'] * 0.30 +
            normalized['divergence'] * 0.20 +
            normalized['persistence'] * 0.15 +
            normalized['execution'] * 0.15 +
            normalized['context'] * 0.10 +
            normalized['winrate'] * 0.10
        )
        
        return int(min(100, max(0, score)))
    
    def _calculate_risk_score(
        self,
        price_volatility: float,
        spread: float,
        liquidity: float
    ) -> int:
        """
        Calculate risk score based on market conditions
        
        Higher = more risky
        """
        # Base risk from volatility
        volatility_risk = min(50, price_volatility * 5)
        
        # Spread risk (wider = riskier)
        spread_risk = min(30, spread * 5)
        
        # Liquidity risk (less = riskier)
        if liquidity > 10000:
            liquidity_risk = 5
        elif liquidity > 1000:
            liquidity_risk = 15
        else:
            liquidity_risk = 30
            
        total_risk = volatility_risk + spread_risk + liquidity_risk
        
        return int(min(100, max(0, total_risk)))
    
    def _estimate_lifetime(
        self,
        competition: str,
        signal_type: SignalType,
        signal_strength: float
    ) -> int:
        """
        Estimate how long the signal will remain valid (in seconds)
        """
        # Base lifetime by signal type
        base_lifetimes = {
            SignalType.MARKET_DISLOCATION: 30,
            SignalType.MOMENTUM_SHIFT: 45,
            SignalType.EVENT_LAG: 20,
            SignalType.VOLATILITY_SPIKE: 15,
            SignalType.CONSENSUS_DIVERGENCE: 90,
            SignalType.PERSISTENCE_SIGNAL: 180
        }
        
        base = base_lifetimes.get(signal_type, 60)
        
        # Adjust by league reaction speed
        profile = self.league_profiles.get(competition, self.league_profiles['default'])
        speed_multipliers = {
            'fast': 0.7,
            'medium': 1.0,
            'slow': 1.5
        }
        multiplier = speed_multipliers.get(profile.get('reaction_speed', 'medium'), 1.0)
        
        # Stronger signals tend to be corrected faster
        strength_adjustment = 1.0 - (min(signal_strength, 20) / 100)
        
        lifetime = int(base * multiplier * strength_adjustment)
        
        return max(10, min(300, lifetime))  # Between 10s and 5min
    
    def _get_lifetime_label(self, seconds: int) -> str:
        """Get human-readable lifetime label"""
        if seconds < 30:
            return "Short-lived"
        elif seconds < 90:
            return "Medium"
        else:
            return "Stable"
    
    def _filter_and_prioritize(self, signals: List[Signal]) -> List[Signal]:
        """
        Filter out low-quality signals and enforce limits
        """
        # Filter by minimum thresholds
        filtered = [
            s for s in signals
            if s.confidence >= self.config['min_confidence']
            and s.signal_score >= self.config['min_signal_score']
        ]
        
        # Check cooldown
        now = datetime.now(timezone.utc)
        cooldown = timedelta(seconds=self.config['signal_cooldown_seconds'])
        
        final_signals = []
        for signal in filtered:
            # Check if we recently sent a signal for this market/selection
            recent = any(
                h.market_id == signal.market_id 
                and h.selection_id == signal.selection_id
                and (now - h.created_at) < cooldown
                for h in self._signal_history[-50:]
            )
            
            if not recent:
                final_signals.append(signal)
                
        # Sort by priority and score
        priority_order = {SignalPriority.HIGH: 0, SignalPriority.MEDIUM: 1, SignalPriority.LOW: 2}
        final_signals.sort(key=lambda s: (priority_order[s.priority], -s.signal_score))
        
        return final_signals[:10]  # Max 10 signals per analysis run


# Singleton instance
_market_analyzer: Optional[MarketAnalyzer] = None

def get_market_analyzer() -> MarketAnalyzer:
    global _market_analyzer
    if _market_analyzer is None:
        _market_analyzer = MarketAnalyzer()
    return _market_analyzer



# ==================== POLYMARKET INTEGRATION ====================

class PolymarketAnalyzer:
    """
    Analyzes Polymarket prediction markets for value signals
    """
    
    def __init__(self):
        self.service = polymarket_service if POLYMARKET_AVAILABLE else None
    
    async def find_value_signals(
        self, 
        bookmaker_odds: Dict[str, float],
        search_terms: List[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Find value opportunities by comparing Polymarket prices to bookmaker odds
        
        Args:
            bookmaker_odds: Dict of {selection_name: decimal_odds}
            search_terms: Optional terms to search in Polymarket
            
        Returns:
            List of value signals
        """
        if not self.service:
            logger.warning("Polymarket service not available")
            return []
        
        signals = []
        
        # Search for relevant markets
        for term in (search_terms or list(bookmaker_odds.keys())):
            markets = await self.service.search_markets(term, limit=10)
            
            for market in markets:
                question = market.get("question", "")
                prices = market.get("outcomePrices", [])
                
                if len(prices) >= 2:
                    yes_price = float(prices[0])
                    
                    # Find matching bookmaker selection
                    for selection, bookie_odds in bookmaker_odds.items():
                        if selection.lower() in question.lower():
                            value_analysis = self.service.find_value(
                                polymarket_price=yes_price,
                                bookmaker_odds=bookie_odds
                            )
                            
                            if value_analysis["has_value"]:
                                signals.append({
                                    "type": SignalType.POLYMARKET_VALUE,
                                    "market": market.get("question"),
                                    "polymarket_price": yes_price,
                                    "polymarket_probability": value_analysis["polymarket_probability"],
                                    "bookmaker_odds": bookie_odds,
                                    "edge_percentage": value_analysis["edge_percentage"],
                                    "signal_strength": value_analysis["signal_strength"],
                                    "volume": market.get("volume", 0),
                                    "liquidity": market.get("liquidity", 0)
                                })
        
        return signals
    
    async def get_trending_sports(self, limit: int = 10) -> List[Dict[str, Any]]:
        """
        Get trending sports events from Polymarket
        
        Returns:
            List of high-volume sports events
        """
        if not self.service:
            return []
        
        events = await self.service.get_sport_events(limit=limit)
        
        trending = []
        for event in events:
            if event.get("volume24hr", 0) > 10000:  # Min $10k volume
                trending.append({
                    "title": event.get("title"),
                    "volume_24h": event.get("volume24hr", 0),
                    "liquidity": event.get("liquidity", 0),
                    "markets": len(event.get("markets", [])),
                    "slug": event.get("slug")
                })
        
        return sorted(trending, key=lambda x: x["volume_24h"], reverse=True)
    
    async def analyze_crowd_sentiment(self, event_slug: str) -> Dict[str, Any]:
        """
        Analyze crowd sentiment for a specific event
        
        Returns:
            Sentiment analysis with price movements
        """
        if not self.service:
            return {"error": "Polymarket not available"}
        
        event = await self.service.get_event_by_slug(event_slug)
        if not event:
            return {"error": "Event not found"}
        
        markets = event.get("markets", [])
        analysis = {
            "event": event.get("title"),
            "total_volume": event.get("volume", 0),
            "volume_24h": event.get("volume24hr", 0),
            "outcomes": []
        }
        
        for market in markets:
            prices = market.get("outcomePrices", [])
            if prices:
                yes_price = float(prices[0]) if prices else 0
                analysis["outcomes"].append({
                    "question": market.get("question"),
                    "probability": f"{yes_price * 100:.1f}%",
                    "implied_odds": round(1 / yes_price, 2) if yes_price > 0 else 0,
                    "price_change_24h": market.get("oneDayPriceChange", 0),
                    "price_change_7d": market.get("oneWeekPriceChange", 0)
                })
        
        return analysis


# Polymarket analyzer singleton
_polymarket_analyzer: Optional[PolymarketAnalyzer] = None

def get_polymarket_analyzer() -> PolymarketAnalyzer:
    global _polymarket_analyzer
    if _polymarket_analyzer is None:
        _polymarket_analyzer = PolymarketAnalyzer()
    return _polymarket_analyzer
