import React, { useState, useEffect } from 'react';
import { Send, Zap, TrendingUp, Clock, Trophy, Activity } from 'lucide-react';

// Fiktive Live-Spiele
const DEMO_MATCHES = [
  {
    id: 1,
    league: "Bundesliga",
    homeTeam: "Bayern München",
    awayTeam: "Borussia Dortmund",
    homeScore: 2,
    awayScore: 1,
    minute: 67,
    status: "LIVE"
  },
  {
    id: 2,
    league: "Premier League",
    homeTeam: "Manchester City",
    awayTeam: "Liverpool FC",
    homeScore: 1,
    awayScore: 1,
    minute: 45,
    status: "LIVE"
  },
  {
    id: 3,
    league: "La Liga",
    homeTeam: "Real Madrid",
    awayTeam: "FC Barcelona",
    homeScore: 0,
    awayScore: 0,
    minute: 23,
    status: "LIVE"
  },
  {
    id: 4,
    league: "Champions League",
    homeTeam: "PSG",
    awayTeam: "Inter Mailand",
    homeScore: 3,
    awayScore: 2,
    minute: 78,
    status: "LIVE"
  }
];

// Fiktive Signale
const DEMO_SIGNALS = [
  {
    id: 1,
    match: "Bayern München vs Dortmund",
    league: "Bundesliga",
    market: "Over 3.5 Goals",
    confidence: 0.82,
    risk_score: 35,
    explanation: "Hohe Torwahrscheinlichkeit erkannt. Beide Teams offensiv stark, 2:1 in Minute 67.",
    timestamp: "19:47"
  },
  {
    id: 2,
    match: "Man City vs Liverpool",
    league: "Premier League", 
    market: "Both Teams To Score",
    confidence: 0.78,
    risk_score: 28,
    explanation: "BTTS-Wahrscheinlichkeit erhöht. Offensive Spielweise beider Mannschaften.",
    timestamp: "19:45"
  },
  {
    id: 3,
    match: "Real Madrid vs Barcelona",
    league: "La Liga",
    market: "Under 2.5 Goals",
    confidence: 0.71,
    risk_score: 42,
    explanation: "Defensive Taktik erkannt. Niedrige xG-Werte in den ersten 23 Minuten.",
    timestamp: "19:43"
  },
  {
    id: 4,
    match: "PSG vs Inter",
    league: "Champions League",
    market: "Over 5.5 Goals",
    confidence: 0.85,
    risk_score: 31,
    explanation: "Torreiches Spiel! 5 Tore in 78 Min. Beide Defensiven instabil.",
    timestamp: "19:48"
  }
];

const LiveMatchCard = ({ match, isActive }) => {
  const [minute, setMinute] = useState(match.minute);
  
  useEffect(() => {
    if (isActive) {
      const interval = setInterval(() => {
        setMinute(prev => prev < 90 ? prev + 1 : prev);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [isActive]);

  return (
    <div className={`bg-[#0a0a0a] border rounded-lg p-4 transition-all duration-500 ${
      isActive ? 'border-[#39FF14]/50 shadow-lg shadow-[#39FF14]/10' : 'border-gray-800'
    }`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-gray-500 font-mono">{match.league}</span>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
          <span className="text-xs text-red-400 font-mono">{minute}'</span>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-white text-sm font-medium">{match.homeTeam}</p>
          <p className="text-gray-400 text-sm">{match.awayTeam}</p>
        </div>
        <div className="text-right">
          <p className="text-white text-lg font-bold">{match.homeScore}</p>
          <p className="text-gray-400 text-lg font-bold">{match.awayScore}</p>
        </div>
      </div>
    </div>
  );
};

const TelegramSignalCard = ({ signal, isNew }) => {
  const getConfidenceColor = (conf) => {
    if (conf >= 0.8) return 'text-green-400';
    if (conf >= 0.7) return 'text-yellow-400';
    return 'text-orange-400';
  };

  const getRiskColor = (risk) => {
    if (risk <= 30) return 'text-green-400';
    if (risk <= 50) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className={`relative bg-[#1a1a2e] border border-[#2d2d44] rounded-lg overflow-hidden transition-all duration-700 ${
      isNew ? 'animate-slide-in-right ring-2 ring-[#39FF14]/50' : ''
    }`}>
      {/* Telegram-style header */}
      <div className="bg-[#2d2d44] px-4 py-2 flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
          <Zap className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-white text-sm font-medium">BETRADARMUS</p>
          <p className="text-gray-400 text-xs">Signal Bot</p>
        </div>
        <span className="ml-auto text-xs text-gray-500">{signal.timestamp}</span>
      </div>
      
      {/* Signal content */}
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-[#39FF14]" />
          <span className="text-[#39FF14] font-bold text-sm">LIVE SIGNAL</span>
        </div>
        
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-gray-400" />
            <span className="text-white text-sm">{signal.match}</span>
          </div>
          <p className="text-gray-500 text-xs ml-6">{signal.league}</p>
        </div>
        
        <div className="bg-[#0a0a0a] rounded-lg p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-xs">Markt</span>
            <span className="text-white text-sm font-medium">{signal.market}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-xs">Confidence</span>
            <span className={`text-sm font-bold ${getConfidenceColor(signal.confidence)}`}>
              {Math.round(signal.confidence * 100)}%
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-xs">Risk Score</span>
            <span className={`text-sm font-bold ${getRiskColor(signal.risk_score)}`}>
              {signal.risk_score}
            </span>
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-3">
          <p className="text-gray-400 text-xs leading-relaxed">
            <span className="text-gray-500">Analyse: </span>
            {signal.explanation}
          </p>
        </div>
      </div>
      
      {/* New badge */}
      {isNew && (
        <div className="absolute top-2 right-2">
          <span className="px-2 py-0.5 bg-[#39FF14] text-black text-xs font-bold rounded animate-pulse">
            NEU
          </span>
        </div>
      )}
    </div>
  );
};

export const LiveDemo = () => {
  const [activeMatchIndex, setActiveMatchIndex] = useState(0);
  const [signals, setSignals] = useState([DEMO_SIGNALS[0]]);
  const [newSignalIndex, setNewSignalIndex] = useState(0);

  // Rotate active match
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveMatchIndex(prev => (prev + 1) % DEMO_MATCHES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Add new signals periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setSignals(prev => {
        const nextIndex = prev.length % DEMO_SIGNALS.length;
        const newSignal = { ...DEMO_SIGNALS[nextIndex], id: Date.now() };
        setNewSignalIndex(newSignal.id);
        
        // Keep only last 3 signals
        const updated = [newSignal, ...prev].slice(0, 3);
        return updated;
      });
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  // Clear "new" status after animation
  useEffect(() => {
    if (newSignalIndex) {
      const timeout = setTimeout(() => {
        setNewSignalIndex(null);
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [newSignalIndex]);

  return (
    <section className="py-20 bg-[#0a0a0a] relative overflow-hidden" id="live-demo">
      {/* Background effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent" />
      
      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full mb-6">
            <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span className="text-cyan-400 text-sm font-medium">Live Demo</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Erlebe BETRADARMUS in Aktion
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            So sehen unsere Live-Signale aus. Echtzeit-Analysen direkt auf dein Telegram.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Left: Live Matches */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
              <h3 className="text-white font-semibold">Live Spiele</h3>
              <span className="text-gray-500 text-sm">({DEMO_MATCHES.length} aktiv)</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {DEMO_MATCHES.map((match, index) => (
                <LiveMatchCard 
                  key={match.id} 
                  match={match} 
                  isActive={index === activeMatchIndex}
                />
              ))}
            </div>
            
            <div className="mt-6 p-4 bg-[#121212] border border-gray-800 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <TrendingUp className="w-5 h-5 text-[#39FF14]" />
                <span className="text-white font-medium">Marktanalyse aktiv</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Analysierte Märkte</span>
                  <span className="text-white font-mono">247</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Erkannte Ineffizienzen</span>
                  <span className="text-[#39FF14] font-mono">12</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Latenz</span>
                  <span className="text-cyan-400 font-mono">&lt;50ms</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Telegram Signals */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Send className="w-4 h-4 text-cyan-400" />
              <h3 className="text-white font-semibold">Telegram Signale</h3>
              <span className="text-gray-500 text-sm">(Live-Vorschau)</span>
            </div>
            
            <div className="space-y-4">
              {signals.map((signal) => (
                <TelegramSignalCard 
                  key={signal.id} 
                  signal={signal} 
                  isNew={signal.id === newSignalIndex}
                />
              ))}
            </div>
            
            <div className="text-center pt-4">
              <a 
                href="https://t.me/Betradarmus_bot" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium rounded-lg hover:opacity-90 transition-opacity"
              >
                <Send className="w-4 h-4" />
                Telegram Bot starten
              </a>
              <p className="text-gray-500 text-xs mt-2">Kostenlos testen mit FREE Plan</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* CSS for animations */}
      <style jsx>{`
        @keyframes slide-in-right {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.5s ease-out;
        }
      `}</style>
    </section>
  );
};

export default LiveDemo;
