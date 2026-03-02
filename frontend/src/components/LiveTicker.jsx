import React from 'react';
import { Activity, TrendingUp, AlertTriangle, Zap } from 'lucide-react';

const tickerItems = [
  { type: 'match', text: 'Bayern vs Dortmund', league: 'BL', confidence: 87, market: 'Over 2.5' },
  { type: 'match', text: 'Liverpool vs Arsenal', league: 'PL', confidence: 92, market: 'BTTS' },
  { type: 'match', text: 'Real vs Atlético', league: 'LL', confidence: 78, market: 'U3.5' },
  { type: 'alert', text: 'Neue High-EV Opportunity erkannt', icon: Zap },
  { type: 'match', text: 'PSG vs Monaco', league: 'L1', confidence: 84, market: 'Heimsieg' },
  { type: 'match', text: 'Inter vs Juventus', league: 'SA', confidence: 89, market: 'Over 1.5' },
  { type: 'match', text: 'Man City vs Chelsea', league: 'PL', confidence: 76, market: 'BTTS' },
  { type: 'alert', text: 'Risk Score Update: Bundesliga', icon: AlertTriangle },
];

export const LiveTicker = () => {
  return (
    <div className="w-full bg-[#0a0a0a] border-y border-white/5 py-3 overflow-hidden" data-testid="live-ticker">
      <div className="ticker-wrapper">
        <div className="ticker-content animate-marquee">
          {[...tickerItems, ...tickerItems].map((item, index) => (
            <div key={index} className="flex items-center gap-3 px-4">
              {item.type === 'match' ? (
                <>
                  <div className="live-dot" />
                  <span className="font-mono text-xs text-[#39FF14] uppercase">{item.league}</span>
                  <span className="text-sm text-white">{item.text}</span>
                  <span className="font-mono text-xs text-[#A1A1AA]">{item.market}</span>
                  <span className="font-mono text-xs text-[#00C2FF]">{item.confidence}%</span>
                </>
              ) : (
                <>
                  <item.icon size={14} className="text-[#FFD60A]" />
                  <span className="text-sm text-[#FFD60A]">{item.text}</span>
                </>
              )}
              <span className="text-white/20">|</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LiveTicker;
