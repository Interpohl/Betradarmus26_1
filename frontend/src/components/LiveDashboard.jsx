import React, { useState, useEffect, useCallback } from 'react';
import { Activity, TrendingUp, Clock, AlertTriangle, Radio, Calendar } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const getRiskColor = (risk) => {
  if (risk < 30) return 'text-[#39FF14]';
  if (risk < 60) return 'text-[#FFD60A]';
  return 'text-[#FF3B30]';
};

const getRiskBgColor = (level) => {
  switch (level) {
    case 'LOW': return 'bg-[#39FF14]/10 border-[#39FF14]/20';
    case 'MED': return 'bg-[#FFD60A]/10 border-[#FFD60A]/20';
    case 'HIGH': return 'bg-[#FF3B30]/10 border-[#FF3B30]/20';
    default: return 'bg-white/5 border-white/10';
  }
};

export const LiveDashboard = () => {
  const [liveOpportunities, setLiveOpportunities] = useState([]);
  const [prematchOpportunities, setPrematchOpportunities] = useState([]);
  const [activeTab, setActiveTab] = useState('prematch'); // 'live' or 'prematch'
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState('loading');
  const [stats, setStats] = useState({
    liveCount: 0,
    prematchCount: 0,
    avgConfidence: 0
  });

  const fetchOpportunities = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/analysis/opportunities`);
      const data = response.data;
      
      const live = data.live || [];
      const prematch = data.prematch || [];
      
      setLiveOpportunities(live);
      setPrematchOpportunities(prematch);
      setDataSource(data.data_source || (data.is_simulated ? 'simulation' : 'the-odds-api'));
      
      // If we have live games, switch to live tab
      if (live.length > 0 && liveOpportunities.length === 0) {
        setActiveTab('live');
      }
      
      // Calculate stats
      const allOpps = [...live, ...prematch];
      const avgConf = allOpps.length > 0 
        ? Math.round(allOpps.reduce((sum, o) => sum + o.confidence, 0) / allOpps.length)
        : 0;
      
      setStats({
        liveCount: live.length,
        prematchCount: prematch.length,
        avgConfidence: avgConf
      });
      
    } catch (err) {
      console.error('Failed to fetch opportunities:', err);
      setDataSource('error');
    } finally {
      setLoading(false);
    }
  }, [liveOpportunities.length]);

  useEffect(() => {
    fetchOpportunities();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchOpportunities, 30000);
    
    return () => clearInterval(interval);
  }, [fetchOpportunities]);

  const formatTime = (timestamp) => {
    if (!timestamp) return '--:--';
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '--:--';
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '--';
    try {
      const date = new Date(timestamp);
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      if (date.toDateString() === today.toDateString()) {
        return `Heute ${formatTime(timestamp)}`;
      } else if (date.toDateString() === tomorrow.toDateString()) {
        return `Morgen ${formatTime(timestamp)}`;
      } else {
        return date.toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit' }) + ` ${formatTime(timestamp)}`;
      }
    } catch {
      return '--';
    }
  };

  const currentOpportunities = activeTab === 'live' ? liveOpportunities : prematchOpportunities;

  return (
    <div className="bg-[#121212] border border-white/5 rounded-sm overflow-hidden" data-testid="live-dashboard">
      {/* Dashboard Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-[#0a0a0a]">
        <div className="flex items-center gap-3">
          <div className="live-dot" />
          <span className="font-mono text-xs text-[#39FF14] uppercase tracking-wider">Live Feed</span>
          {dataSource === 'the-odds-api' && (
            <span className="px-2 py-0.5 bg-[#39FF14]/10 border border-[#39FF14]/20 text-[#39FF14] text-xs font-mono rounded-sm">
              LIVE DATA
            </span>
          )}
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <span className="data-label block">Live</span>
            <span className={`font-mono text-lg ${stats.liveCount > 0 ? 'text-[#FF3B30]' : 'text-[#A1A1AA]'}`}>
              {stats.liveCount}
            </span>
          </div>
          <div className="text-right">
            <span className="data-label block">Prematch</span>
            <span className="font-mono text-lg text-[#39FF14]">{stats.prematchCount}</span>
          </div>
          <div className="text-right">
            <span className="data-label block">Ø Confidence</span>
            <span className="font-mono text-lg text-white">{stats.avgConfidence}%</span>
          </div>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex border-b border-white/5 bg-[#0a0a0a]/50">
        <button
          onClick={() => setActiveTab('live')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 font-mono text-xs uppercase tracking-wider transition-all ${
            activeTab === 'live' 
              ? 'bg-[#FF3B30]/10 text-[#FF3B30] border-b-2 border-[#FF3B30]' 
              : 'text-[#A1A1AA] hover:text-white hover:bg-white/5'
          }`}
          data-testid="tab-live"
        >
          <Radio size={14} className={activeTab === 'live' ? 'animate-pulse' : ''} />
          LIVE ({stats.liveCount})
        </button>
        <button
          onClick={() => setActiveTab('prematch')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 font-mono text-xs uppercase tracking-wider transition-all ${
            activeTab === 'prematch' 
              ? 'bg-[#39FF14]/10 text-[#39FF14] border-b-2 border-[#39FF14]' 
              : 'text-[#A1A1AA] hover:text-white hover:bg-white/5'
          }`}
          data-testid="tab-prematch"
        >
          <Calendar size={14} />
          PREMATCH ({stats.prematchCount})
        </button>
      </div>

      {/* Column Headers */}
      <div className="grid grid-cols-12 gap-2 px-4 py-2 border-b border-white/5 bg-[#0a0a0a]/50">
        <div className="col-span-1 data-label">Status</div>
        <div className="col-span-3 data-label">Match</div>
        <div className="col-span-2 data-label">Market</div>
        <div className="col-span-2 data-label text-center">Confidence</div>
        <div className="col-span-2 data-label text-center">Risk</div>
        <div className="col-span-1 data-label text-center">Odds</div>
        <div className="col-span-1 data-label text-right">{activeTab === 'live' ? 'Score' : 'Anstoß'}</div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="p-6 text-center">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-[#39FF14] border-t-transparent" />
          <p className="mt-2 text-xs text-[#A1A1AA]">Lade Live-Daten...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && currentOpportunities.length === 0 && (
        <div className="p-8 text-center">
          {activeTab === 'live' ? (
            <>
              <Radio size={32} className="mx-auto mb-4 text-[#A1A1AA]" />
              <p className="text-[#A1A1AA]">Keine Live-Spiele im Moment</p>
              <p className="text-xs text-[#A1A1AA] mt-2">Wechseln Sie zu PREMATCH für kommende Spiele</p>
            </>
          ) : (
            <>
              <Calendar size={32} className="mx-auto mb-4 text-[#A1A1AA]" />
              <p className="text-[#A1A1AA]">Keine Prematch-Daten verfügbar</p>
            </>
          )}
        </div>
      )}

      {/* Opportunity Rows */}
      {!loading && currentOpportunities.length > 0 && (
        <div className="divide-y divide-white/5" data-testid="live-opportunities">
          {currentOpportunities.map((opp, index) => (
            <div 
              key={opp.id || index}
              className={`grid grid-cols-12 gap-2 px-4 py-3 hover:bg-[#39FF14]/5 transition-colors cursor-pointer animate-fade-in-up ${
                opp.status === 'LIVE' ? 'bg-[#FF3B30]/5' : ''
              }`}
              style={{ animationDelay: `${index * 0.05}s` }}
              data-testid={`opportunity-row-${index}`}
            >
              <div className="col-span-1 flex items-center">
                {opp.status === 'LIVE' ? (
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-[#FF3B30] rounded-full animate-pulse" />
                    <span className="text-[10px] text-[#FF3B30] font-mono">LIVE</span>
                  </div>
                ) : (
                  <div className="live-dot" />
                )}
              </div>
              <div className="col-span-3">
                <p className="text-sm text-white truncate">{opp.match || `${opp.home_team} vs ${opp.away_team}`}</p>
                <p className="text-xs text-[#A1A1AA]">{opp.tournament}</p>
              </div>
              <div className="col-span-2 flex items-center">
                <span className="font-mono text-sm text-white truncate">{opp.market}</span>
              </div>
              <div className="col-span-2 flex items-center justify-center">
                <div className="flex items-center gap-2">
                  <div className="w-12 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#39FF14] rounded-full transition-all duration-500"
                      style={{ width: `${opp.confidence}%` }}
                    />
                  </div>
                  <span className="font-mono text-sm text-[#39FF14]">{opp.confidence}%</span>
                </div>
              </div>
              <div className="col-span-2 flex items-center justify-center">
                <span className={`px-2 py-0.5 font-mono text-xs border rounded-sm ${getRiskBgColor(opp.risk_level)} ${getRiskColor(opp.risk_score)}`}>
                  {opp.risk_level}
                </span>
              </div>
              <div className="col-span-1 flex items-center justify-center">
                <span className="font-mono text-sm text-[#00C2FF]">{opp.odds}</span>
              </div>
              <div className="col-span-1 flex items-center justify-end">
                {opp.status === 'LIVE' && opp.scores ? (
                  <span className="font-mono text-sm text-[#FF3B30]">
                    {opp.scores.find(s => s.name === opp.home_team)?.score || 0} - {opp.scores.find(s => s.name === opp.away_team)?.score || 0}
                  </span>
                ) : (
                  <span className="font-mono text-xs text-[#A1A1AA]">{formatDate(opp.commence_time)}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-white/5 bg-[#0a0a0a]">
        <span className="text-xs text-[#A1A1AA]">
          {activeTab === 'live' ? 'Updates alle 30 Sekunden' : 'Kommende Spiele'}
        </span>
        <div className="flex items-center gap-1 text-xs text-[#39FF14]">
          <Activity size={12} />
          <span className="font-mono">{dataSource === 'the-odds-api' ? 'THE ODDS API' : 'DEMO'}</span>
        </div>
      </div>
    </div>
  );
};

export default LiveDashboard;
