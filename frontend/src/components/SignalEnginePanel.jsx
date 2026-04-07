import React, { useState, useEffect, useCallback } from 'react';
import { 
  Activity, TrendingUp, AlertTriangle, Lock, Zap, RefreshCw, 
  ChevronRight, Target, Shield, BarChart3, Clock, ArrowUpRight,
  ArrowDownRight, Minus
} from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Signal Score Badge
const SignalScoreBadge = ({ score }) => {
  const getScoreColor = () => {
    if (score >= 70) return { bg: 'bg-[#39FF14]/20', text: 'text-[#39FF14]', border: 'border-[#39FF14]/30' };
    if (score >= 50) return { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30' };
    return { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' };
  };
  
  const colors = getScoreColor();
  
  return (
    <div className={`px-3 py-1 rounded-full ${colors.bg} border ${colors.border}`}>
      <span className={`text-sm font-bold ${colors.text}`}>{Math.round(score)}</span>
    </div>
  );
};

// Risk Indicator
const RiskIndicator = ({ risk }) => {
  const getRiskLevel = () => {
    if (risk <= 30) return { label: 'Niedrig', color: 'text-[#39FF14]', icon: Shield };
    if (risk <= 60) return { label: 'Mittel', color: 'text-yellow-400', icon: AlertTriangle };
    return { label: 'Hoch', color: 'text-red-400', icon: AlertTriangle };
  };
  
  const { label, color, icon: Icon } = getRiskLevel();
  
  return (
    <div className="flex items-center gap-1">
      <Icon className={`w-3 h-3 ${color}`} />
      <span className={`text-xs ${color}`}>{label}</span>
    </div>
  );
};

// Recommendation Badge
const RecommendationBadge = ({ recommendation, text }) => {
  const getStyle = () => {
    switch (recommendation) {
      case 'STRONG_BUY':
        return 'bg-[#39FF14] text-black';
      case 'BUY':
        return 'bg-[#39FF14]/80 text-black';
      case 'HOLD':
        return 'bg-yellow-500 text-black';
      case 'AVOID':
        return 'bg-red-500 text-white';
      default:
        return 'bg-white/10 text-[#A1A1AA]';
    }
  };
  
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-bold ${getStyle()}`}>
      {text || recommendation}
    </span>
  );
};

// Signal Card Component
const SignalCard = ({ signal, isPremium, onClick }) => {
  const isLocked = signal.premium_required;
  
  return (
    <div 
      className={`bg-[#121212] border border-white/10 rounded-xl p-4 transition-all ${
        isLocked ? 'opacity-75' : 'hover:border-[#39FF14]/30 cursor-pointer'
      }`}
      onClick={isLocked ? undefined : onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-white font-medium text-sm">{signal.home_team}</span>
            <span className="text-[#A1A1AA] text-xs">vs</span>
            <span className="text-white font-medium text-sm">{signal.away_team}</span>
          </div>
          {signal.start_time && (
            <div className="flex items-center gap-1 text-[#A1A1AA] text-xs">
              <Clock className="w-3 h-3" />
              <span>{new Date(signal.start_time).toLocaleString('de-DE', { 
                day: '2-digit', 
                month: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
              })}</span>
            </div>
          )}
        </div>
        <SignalScoreBadge score={signal.signal_score} />
      </div>
      
      {/* Content */}
      {isLocked ? (
        <div className="flex items-center justify-center py-4">
          <div className="flex items-center gap-2 text-[#A1A1AA]">
            <Lock className="w-4 h-4" />
            <span className="text-sm">Upgrade für Details</span>
          </div>
        </div>
      ) : (
        <>
          {/* Recommendation & Risk */}
          <div className="flex items-center justify-between mb-3">
            <RecommendationBadge 
              recommendation={signal.recommendation} 
              text={signal.recommendation_text}
            />
            <RiskIndicator risk={signal.risk_score} />
          </div>
          
          {/* Suggested Bet */}
          {signal.suggested_bet && (
            <div className="bg-white/5 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[#A1A1AA] text-xs">Empfehlung</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-white font-bold">
                      {signal.suggested_bet.selection === 'HOME' ? signal.home_team : 
                       signal.suggested_bet.selection === 'AWAY' ? signal.away_team : 'Unentschieden'}
                    </span>
                    <span className="text-[#39FF14] font-mono text-sm">
                      @{signal.suggested_bet.odds}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[#A1A1AA] text-xs">Wahrscheinlichkeit</span>
                  <div className="text-white font-bold mt-1">
                    {signal.suggested_bet.implied_probability}%
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Analysis Info */}
          {signal.analysis && (
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5 text-xs text-[#A1A1AA]">
              <span>{signal.analysis.bookmaker_count} Buchmacher</span>
              {signal.analysis.has_sharp_data && (
                <span className="flex items-center gap-1 text-[#39FF14]">
                  <Target className="w-3 h-3" />
                  Sharp-Daten
                </span>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

// Empty State
const EmptyState = ({ message, apiKeyMissing }) => (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    {apiKeyMissing ? (
      <>
        <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mb-4">
          <AlertTriangle className="w-8 h-8 text-yellow-400" />
        </div>
        <h3 className="text-white text-lg font-bold mb-2">API-Key erforderlich</h3>
        <p className="text-[#A1A1AA] text-sm max-w-sm">
          Für die Signal Engine 2.0 wird ein OddsPapi API-Key benötigt. 
          Kontaktiere den Administrator.
        </p>
      </>
    ) : (
      <>
        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
          <Activity className="w-8 h-8 text-[#A1A1AA]" />
        </div>
        <h3 className="text-white text-lg font-bold mb-2">Keine Signale verfügbar</h3>
        <p className="text-[#A1A1AA] text-sm max-w-sm">{message}</p>
      </>
    )}
  </div>
);

// Main Component
export const SignalEnginePanel = ({ compact = false }) => {
  const [signals, setSignals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPremium, setIsPremium] = useState(false);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [lastUpdate, setLastUpdate] = useState(null);
  
  const token = localStorage.getItem('token');
  
  const fetchSignals = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const endpoint = activeTab === 'live' ? '/signals/live' : '/signals/upcoming';
      
      const response = await axios.get(`${API}${endpoint}`, { headers });
      const data = response.data;
      
      setSignals(data.signals || []);
      setIsPremium(data.is_premium || false);
      setLastUpdate(new Date());
      
      if (data.error) {
        setError(data.error);
      }
    } catch (err) {
      console.error('Failed to fetch signals:', err);
      setError('Fehler beim Laden der Signale');
      setSignals([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab, token]);
  
  useEffect(() => {
    fetchSignals();
    
    // Auto-refresh every 60 seconds for live signals
    if (activeTab === 'live') {
      const interval = setInterval(fetchSignals, 60000);
      return () => clearInterval(interval);
    }
  }, [fetchSignals, activeTab]);
  
  if (compact) {
    // Compact version for sidebar or widgets
    return (
      <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#39FF14]/10 rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-[#39FF14]" />
            </div>
            <span className="text-white font-bold">Signal Engine</span>
          </div>
          <span className="text-xs text-[#39FF14] bg-[#39FF14]/10 px-2 py-0.5 rounded">2.0</span>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-5 h-5 text-[#39FF14] animate-spin" />
          </div>
        ) : signals.length > 0 ? (
          <div className="space-y-2">
            {signals.slice(0, 3).map((signal, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                <span className="text-white text-sm truncate max-w-[150px]">
                  {signal.home_team} - {signal.away_team}
                </span>
                <SignalScoreBadge score={signal.signal_score} />
              </div>
            ))}
            <a 
              href="#signals"
              className="flex items-center justify-center gap-1 text-[#39FF14] text-sm hover:underline mt-2"
            >
              Alle anzeigen <ChevronRight className="w-4 h-4" />
            </a>
          </div>
        ) : (
          <p className="text-[#A1A1AA] text-sm text-center py-4">
            Keine Signale verfügbar
          </p>
        )}
      </div>
    );
  }
  
  // Full version
  return (
    <section id="signals" className="py-16 px-4" data-testid="signal-engine-section">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-[#39FF14]/10 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-[#39FF14]" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  Signal Engine
                  <span className="text-xs bg-[#39FF14] text-black px-2 py-0.5 rounded font-bold">2.0</span>
                </h2>
                <p className="text-[#A1A1AA] text-sm">
                  KI-gestützte Wett-Signale basierend auf Sharp-Bookmaker-Quoten
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {lastUpdate && (
              <span className="text-xs text-[#A1A1AA]">
                Aktualisiert: {lastUpdate.toLocaleTimeString('de-DE')}
              </span>
            )}
            <button
              onClick={fetchSignals}
              disabled={loading}
              className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 text-[#A1A1AA] ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'upcoming'
                ? 'bg-[#39FF14]/20 text-[#39FF14] border border-[#39FF14]/30'
                : 'bg-white/5 text-[#A1A1AA] hover:bg-white/10'
            }`}
          >
            <Clock className="w-4 h-4 inline mr-2" />
            Bevorstehend
          </button>
          <button
            onClick={() => setActiveTab('live')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'live'
                ? 'bg-[#FF0040]/20 text-[#FF0040] border border-[#FF0040]/30'
                : 'bg-white/5 text-[#A1A1AA] hover:bg-white/10'
            }`}
          >
            <Activity className="w-4 h-4 inline mr-2" />
            Live
          </button>
        </div>
        
        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <RefreshCw className="w-8 h-8 text-[#39FF14] animate-spin" />
            <span className="ml-3 text-[#A1A1AA]">Analysiere Quoten...</span>
          </div>
        ) : error ? (
          <EmptyState message={error} apiKeyMissing={error.includes('API')} />
        ) : signals.length === 0 ? (
          <EmptyState 
            message={activeTab === 'live' 
              ? 'Aktuell keine Live-Spiele mit Quotendaten' 
              : 'Keine bevorstehenden Spiele mit Quotendaten'
            } 
          />
        ) : (
          <>
            {/* Premium Banner for Free Users */}
            {!isPremium && (
              <div className="mb-6 p-4 bg-gradient-to-r from-[#39FF14]/10 to-transparent border border-[#39FF14]/20 rounded-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Lock className="w-5 h-5 text-[#39FF14]" />
                    <div>
                      <p className="text-white font-medium">Vollzugriff freischalten</p>
                      <p className="text-[#A1A1AA] text-sm">
                        Upgrade auf PRO oder ELITE für alle Signale und detaillierte Analysen
                      </p>
                    </div>
                  </div>
                  <a
                    href="#pricing"
                    className="px-4 py-2 bg-[#39FF14] text-black font-bold text-sm rounded-lg hover:bg-[#39FF14]/90 transition-colors whitespace-nowrap"
                  >
                    Upgraden
                  </a>
                </div>
              </div>
            )}
            
            {/* Signals Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {signals.map((signal, idx) => (
                <SignalCard 
                  key={signal.fixture_id || idx} 
                  signal={signal} 
                  isPremium={isPremium}
                />
              ))}
            </div>
            
            {/* Legend */}
            <div className="mt-8 p-4 bg-[#121212] border border-white/10 rounded-xl">
              <h4 className="text-white font-medium mb-3">Legende</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#39FF14]" />
                  <span className="text-[#A1A1AA]">Signal Score 70+</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <span className="text-[#A1A1AA]">Signal Score 50-69</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="w-3 h-3 text-[#39FF14]" />
                  <span className="text-[#A1A1AA]">Sharp-Bookmaker-Daten</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-3 h-3 text-[#39FF14]" />
                  <span className="text-[#A1A1AA]">Niedriges Risiko</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default SignalEnginePanel;
