import React, { useState, useEffect, useCallback } from 'react';
import { Activity, TrendingUp, AlertTriangle, Zap, RefreshCw } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Fallback items when no live signals available
const fallbackItems = [
  { type: 'alert', text: 'Signal Engine 2.0 aktiv - Analysiere Märkte...', icon: Zap },
  { type: 'info', text: 'Powered by Pinnacle Sharp Odds', icon: Activity },
];

export const LiveTicker = () => {
  const [tickerItems, setTickerItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);

  const fetchSignals = useCallback(async () => {
    try {
      // Try live signals first
      const liveResponse = await axios.get(`${API}/signals/live`);
      let signals = liveResponse.data.signals || [];
      
      // If no live signals, get upcoming signals
      if (signals.length === 0) {
        const upcomingResponse = await axios.get(`${API}/signals/upcoming`);
        signals = upcomingResponse.data.signals || [];
      }
      
      if (signals.length > 0) {
        // Transform signals to ticker format
        const items = signals.slice(0, 8).map(signal => {
          const score = signal.signal_score || 0;
          const home = signal.home_team || '?';
          const away = signal.away_team || '?';
          
          // Determine recommendation text
          let recText = '';
          if (signal.recommendation === 'STRONG_BUY') recText = 'STARK';
          else if (signal.recommendation === 'BUY') recText = 'GUT';
          else if (signal.recommendation === 'HOLD') recText = 'HOLD';
          else recText = 'SIGNAL';
          
          // Get selection if available (for premium preview)
          const selection = signal.suggested_bet?.selection || '';
          const odds = signal.suggested_bet?.odds || '';
          
          return {
            type: 'signal',
            home,
            away,
            score: Math.round(score),
            recommendation: recText,
            selection: selection ? `${selection}` : '',
            odds: odds ? `@${odds}` : '',
            isLive: signal.status === 'live' || liveResponse.data.signals?.length > 0
          };
        });
        
        // Add status alert
        const alertItem = {
          type: 'alert',
          text: signals.length > 3 
            ? `${signals.length} Signale aktiv - Signal Engine 2.0` 
            : 'Signal Engine 2.0 analysiert Märkte',
          icon: Zap
        };
        
        setTickerItems([alertItem, ...items]);
      } else {
        // No signals - show fallback
        setTickerItems(fallbackItems);
      }
      
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to fetch signals for ticker:', error);
      setTickerItems(fallbackItems);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSignals();
    
    // Refresh every 60 seconds
    const interval = setInterval(fetchSignals, 60000);
    return () => clearInterval(interval);
  }, [fetchSignals]);

  // Show loading state briefly
  if (loading && tickerItems.length === 0) {
    return (
      <div className="w-full bg-[#0a0a0a] border-y border-white/5 py-3 overflow-hidden" data-testid="live-ticker">
        <div className="flex items-center justify-center gap-2 text-[#A1A1AA]">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span className="text-sm">Lade Signale...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#0a0a0a] border-y border-white/5 py-3 overflow-hidden" data-testid="live-ticker">
      <div className="ticker-wrapper">
        <div className="ticker-content animate-marquee">
          {/* Duplicate items for seamless loop */}
          {[...tickerItems, ...tickerItems, ...tickerItems].map((item, index) => (
            <div key={index} className="flex items-center gap-3 px-4 whitespace-nowrap">
              {item.type === 'signal' ? (
                <>
                  {/* Live indicator */}
                  <div className={`w-2 h-2 rounded-full ${item.isLive ? 'bg-[#FF0040] animate-pulse' : 'bg-[#39FF14]'}`} />
                  
                  {/* Teams */}
                  <span className="text-sm text-white font-medium">
                    {item.home} <span className="text-[#A1A1AA]">vs</span> {item.away}
                  </span>
                  
                  {/* Score Badge */}
                  <span className={`font-mono text-xs px-1.5 py-0.5 rounded ${
                    item.score >= 70 
                      ? 'bg-[#39FF14]/20 text-[#39FF14]' 
                      : item.score >= 50 
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-red-500/20 text-red-400'
                  }`}>
                    {item.score}
                  </span>
                  
                  {/* Recommendation */}
                  <span className={`font-mono text-xs ${
                    item.recommendation === 'STARK' ? 'text-[#39FF14]' :
                    item.recommendation === 'GUT' ? 'text-[#00C2FF]' :
                    'text-[#A1A1AA]'
                  }`}>
                    {item.recommendation}
                  </span>
                  
                  {/* Selection & Odds (if available) */}
                  {item.selection && (
                    <span className="font-mono text-xs text-[#FFD60A]">
                      {item.selection} {item.odds}
                    </span>
                  )}
                </>
              ) : item.type === 'alert' ? (
                <>
                  <item.icon size={14} className="text-[#39FF14]" />
                  <span className="text-sm text-[#39FF14] font-medium">{item.text}</span>
                </>
              ) : (
                <>
                  <item.icon size={14} className="text-[#A1A1AA]" />
                  <span className="text-sm text-[#A1A1AA]">{item.text}</span>
                </>
              )}
              <span className="text-white/20 ml-2">|</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LiveTicker;
