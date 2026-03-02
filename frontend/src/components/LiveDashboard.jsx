import React, { useState, useEffect } from 'react';
import { Activity, TrendingUp, Clock, AlertTriangle, ChevronRight } from 'lucide-react';

const generateOpportunity = () => {
  const matches = [
    { home: 'Bayern München', away: 'Dortmund', league: 'Bundesliga' },
    { home: 'Liverpool', away: 'Man City', league: 'Premier League' },
    { home: 'Real Madrid', away: 'Barcelona', league: 'La Liga' },
    { home: 'PSG', away: 'Marseille', league: 'Ligue 1' },
    { home: 'Inter', away: 'AC Milan', league: 'Serie A' },
    { home: 'Leipzig', away: 'Frankfurt', league: 'Bundesliga' },
    { home: 'Arsenal', away: 'Chelsea', league: 'Premier League' },
  ];
  
  const markets = ['Over 2.5', 'BTTS Ja', 'Heimsieg', 'Auswärtssieg', 'Under 3.5', 'Draw'];
  const match = matches[Math.floor(Math.random() * matches.length)];
  const market = markets[Math.floor(Math.random() * markets.length)];
  const confidence = Math.floor(Math.random() * 30) + 70;
  const risk = Math.floor(Math.random() * 100);
  const ev = (Math.random() * 15 + 2).toFixed(1);
  
  return {
    id: Date.now() + Math.random(),
    match,
    market,
    confidence,
    risk,
    ev,
    timestamp: new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  };
};

const getRiskColor = (risk) => {
  if (risk < 30) return 'text-[#39FF14]';
  if (risk < 60) return 'text-[#FFD60A]';
  return 'text-[#FF3B30]';
};

const getRiskLabel = (risk) => {
  if (risk < 30) return 'LOW';
  if (risk < 60) return 'MED';
  return 'HIGH';
};

export const LiveDashboard = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [stats, setStats] = useState({
    activeMatches: 47,
    opportunities: 12,
    avgConfidence: 78
  });

  useEffect(() => {
    // Initialize with some opportunities
    const initial = Array.from({ length: 5 }, () => generateOpportunity());
    setOpportunities(initial);

    // Add new opportunities periodically
    const interval = setInterval(() => {
      setOpportunities(prev => {
        const newOpp = generateOpportunity();
        const updated = [newOpp, ...prev.slice(0, 4)];
        return updated;
      });
      
      // Update stats
      setStats(prev => ({
        activeMatches: Math.floor(Math.random() * 20) + 40,
        opportunities: Math.floor(Math.random() * 10) + 8,
        avgConfidence: Math.floor(Math.random() * 15) + 75
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-[#121212] border border-white/5 rounded-sm overflow-hidden" data-testid="live-dashboard">
      {/* Dashboard Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-[#0a0a0a]">
        <div className="flex items-center gap-3">
          <div className="live-dot" />
          <span className="font-mono text-xs text-[#39FF14] uppercase tracking-wider">Live Feed</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <span className="data-label block">Aktive Spiele</span>
            <span className="font-mono text-lg text-white">{stats.activeMatches}</span>
          </div>
          <div className="text-right">
            <span className="data-label block">Opportunities</span>
            <span className="font-mono text-lg text-[#39FF14]">{stats.opportunities}</span>
          </div>
          <div className="text-right">
            <span className="data-label block">Ø Confidence</span>
            <span className="font-mono text-lg text-white">{stats.avgConfidence}%</span>
          </div>
        </div>
      </div>

      {/* Column Headers */}
      <div className="grid grid-cols-12 gap-2 px-4 py-2 border-b border-white/5 bg-[#0a0a0a]/50">
        <div className="col-span-1 data-label">Status</div>
        <div className="col-span-3 data-label">Match</div>
        <div className="col-span-2 data-label">Market</div>
        <div className="col-span-2 data-label text-center">Confidence</div>
        <div className="col-span-2 data-label text-center">Risk Score</div>
        <div className="col-span-1 data-label text-center">EV</div>
        <div className="col-span-1 data-label text-right">Zeit</div>
      </div>

      {/* Opportunity Rows */}
      <div className="divide-y divide-white/5">
        {opportunities.map((opp, index) => (
          <div 
            key={opp.id}
            className="grid grid-cols-12 gap-2 px-4 py-3 hover:bg-[#39FF14]/5 transition-colors cursor-pointer animate-fade-in-up"
            style={{ animationDelay: `${index * 0.05}s` }}
            data-testid={`opportunity-row-${index}`}
          >
            <div className="col-span-1 flex items-center">
              <div className="live-dot" />
            </div>
            <div className="col-span-3">
              <p className="text-sm text-white truncate">{opp.match.home} vs {opp.match.away}</p>
              <p className="text-xs text-[#A1A1AA]">{opp.match.league}</p>
            </div>
            <div className="col-span-2 flex items-center">
              <span className="font-mono text-sm text-white">{opp.market}</span>
            </div>
            <div className="col-span-2 flex items-center justify-center">
              <div className="flex items-center gap-2">
                <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#39FF14] rounded-full transition-all duration-500"
                    style={{ width: `${opp.confidence}%` }}
                  />
                </div>
                <span className="font-mono text-sm text-[#39FF14]">{opp.confidence}%</span>
              </div>
            </div>
            <div className="col-span-2 flex items-center justify-center">
              <span className={`font-mono text-sm ${getRiskColor(opp.risk)}`}>
                {getRiskLabel(opp.risk)} ({opp.risk})
              </span>
            </div>
            <div className="col-span-1 flex items-center justify-center">
              <span className="font-mono text-sm text-[#00C2FF]">+{opp.ev}%</span>
            </div>
            <div className="col-span-1 flex items-center justify-end">
              <span className="font-mono text-xs text-[#A1A1AA]">{opp.timestamp}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-white/5 bg-[#0a0a0a]">
        <span className="text-xs text-[#A1A1AA]">Aktualisiert in Echtzeit</span>
        <div className="flex items-center gap-1 text-xs text-[#39FF14]">
          <Activity size={12} />
          <span className="font-mono">LIVE</span>
        </div>
      </div>
    </div>
  );
};

export default LiveDashboard;
