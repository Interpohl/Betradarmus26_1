import React, { useState, useEffect, useCallback } from 'react';
import { Activity, TrendingUp, Clock, AlertTriangle, Radio, Calendar, Zap } from 'lucide-react';
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
  const [startingSoonOpportunities, setStartingSoonOpportunities] = useState([]);
  const [prematchOpportunities, setPrematchOpportunities] = useState([]);
  const [activeTab, setActiveTab] = useState('prematch');
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState('loading');
  const [stats, setStats] = useState({
    liveCount: 0,
    startingSoonCount: 0,
    prematchCount: 0,
    avgConfidence: 0
  });

  const fetchOpportunities = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/analysis/opportunities`);
      const data = response.data;
      
      const live = data.live || [];
      const startingSoon = data.starting_soon || [];
      const prematch = data.prematch || [];
      
      setLiveOpportunities(live);
      setStartingSoonOpportunities(startingSoon);
      setPrematchOpportunities(prematch);
      setDataSource(data.data_source || (data.is_simulated ? 'simulation' : 'the-odds-api'));
      
      // Auto-switch to live tab if we have live games
      if (live.length > 0 && liveOpportunities.length === 0) {
        setActiveTab('live');
      } else if (startingSoon.length > 0 && live.length === 0 && activeTab === 'live') {
        setActiveTab('starting_soon');
      }
      
      // Calculate stats
      const allOpps = [...live, ...startingSoon, ...prematch];
      const avgConf = allOpps.length > 0 
        ? Math.round(allOpps.reduce((sum, o) => sum + o.confidence, 0) / allOpps.length)
        : 0;
      
      setStats({
        liveCount: live.length,
        startingSoonCount: startingSoon.length,
        prematchCount: prematch.length,
        avgConfidence: avgConf
      });
      
    } catch (err) {
      console.error('Failed to fetch opportunities:', err);
      setDataSource('error');
    } finally {
      setLoading(false);
    }
  }, [liveOpportunities.length, activeTab]);

  useEffect(() => {
    fetchOpportunities();
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

  const formatDate = (timestamp, minutesUntil) => {
    if (minutesUntil !== undefined && minutesUntil > 0 && minutesUntil <= 60) {
      return `in ${minutesUntil} Min`;
    }
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

  const getCurrentOpportunities = () => {
    switch (activeTab) {
      case 'live': return liveOpportunities;
      case 'starting_soon': return startingSoonOpportunities;
      default: return prematchOpportunities;
    }
  };

  const currentOpportunities = getCurrentOpportunities();

  return (
    <div className="bg-[#121212] border border-white/5 rounded-sm overflow-hidden" data-testid="live-dashboard">
      {/* Dashboard Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-[#0a0a0a]">
        <div className="flex items-center gap-3">
          <div className="live-dot" />
          <span className="font-mono text-xs text-[#39FF14] uppercase tracking-wider">Live Feed</span>
          {dataSource === 'the-odds-api' && (
            <span className="px-2 py-0.5 bg-[#39FF14]/10 border border-[#39FF14]/20 text-[#39FF14] text-xs font-mono rounded-sm">
              MULTI-LIGA
            </span>
          )}
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="text-right">
            <span className="data-label block">Live</span>
            <span className={`font-mono text-base ${stats.liveCount > 0 ? 'text-[#FF3B30]' : 'text-[#A1A1AA]'}`}>
              {stats.liveCount}
            </span>
          </div>
          <div className="text-right">
            <span className="data-label block">Bald</span>
            <span className={`font-mono text-base ${stats.startingSoonCount > 0 ? 'text-[#FFD60A]' : 'text-[#A1A1AA]'}`}>
              {stats.startingSoonCount}
            </span>
          </div>
          <div className="text-right">
            <span className="data-label block">Pre</span>
            <span className="font-mono text-base text-[#39FF14]">{stats.prematchCount}</span>
          </div>
          <div className="text-right">
            <span className="data-label block">Ø Conf</span>
            <span className="font-mono text-base text-white">{stats.avgConfidence}%</span>
          </div>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex border-b border-white/5 bg-[#0a0a0a]/50">
        <button
          onClick={() => setActiveTab('live')}
          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 font-mono text-[10px] uppercase tracking-wider transition-all ${
            activeTab === 'live' 
              ? 'bg-[#FF3B30]/10 text-[#FF3B30] border-b-2 border-[#FF3B30]' 
              : 'text-[#A1A1AA] hover:text-white hover:bg-white/5'
          }`}
          data-testid="tab-live"
        >
          <Radio size={12} className={activeTab === 'live' && stats.liveCount > 0 ? 'animate-pulse' : ''} />
          LIVE ({stats.liveCount})
        </button>
        <button
          onClick={() => setActiveTab('starting_soon')}
          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 font-mono text-[10px] uppercase tracking-wider transition-all ${
            activeTab === 'starting_soon' 
              ? 'bg-[#FFD60A]/10 text-[#FFD60A] border-b-2 border-[#FFD60A]' 
              : 'text-[#A1A1AA] hover:text-white hover:bg-white/5'
          }`}
          data-testid="tab-starting-soon"
        >
          <Zap size={12} />
          BALD ({stats.startingSoonCount})
        </button>
        <button
          onClick={() => setActiveTab('prematch')}
          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 font-mono text-[10px] uppercase tracking-wider transition-all ${
            activeTab === 'prematch' 
              ? 'bg-[#39FF14]/10 text-[#39FF14] border-b-2 border-[#39FF14]' 
              : 'text-[#A1A1AA] hover:text-white hover:bg-white/5'
          }`}
          data-testid="tab-prematch"
        >
          <Calendar size={12} />
          PREMATCH ({stats.prematchCount})
        </button>
      </div>

      {/* Column Headers */}
      <div className="grid grid-cols-12 gap-2 px-4 py-2 border-b border-white/5 bg-[#0a0a0a]/50 text-[10px]">
        <div className="col-span-1 data-label">Status</div>
        <div className="col-span-3 data-label">Match</div>
        <div className="col-span-2 data-label">Market</div>
        <div className="col-span-2 data-label text-center">Confidence</div>
        <div className="col-span-2 data-label text-center">Risk</div>
        <div className="col-span-1 data-label text-center">Odds</div>
        <div className="col-span-1 data-label text-right">
          {activeTab === 'live' ? 'Score' : activeTab === 'starting_soon' ? 'Start' : 'Anstoß'}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="p-6 text-center">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-[#39FF14] border-t-transparent" />
          <p className="mt-2 text-xs text-[#A1A1AA]">Lade Multi-Liga Daten...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && currentOpportunities.length === 0 && (
        <div className="p-6 text-center">
          {activeTab === 'live' ? (
            <>
              <Radio size={28} className="mx-auto mb-3 text-[#A1A1AA]" />
              <p className="text-sm text-[#A1A1AA]">Keine Live-Spiele im Moment</p>
              <p className="text-xs text-[#A1A1AA]/70 mt-1">Wechseln Sie zu "BALD" oder "PREMATCH"</p>
            </>
          ) : activeTab === 'starting_soon' ? (
            <>
              <Zap size={28} className="mx-auto mb-3 text-[#A1A1AA]" />
              <p className="text-sm text-[#A1A1AA]">Keine Spiele in den nächsten 60 Min</p>
              <p className="text-xs text-[#A1A1AA]/70 mt-1">Schauen Sie unter "PREMATCH"</p>
            </>
          ) : (
            <>
              <Calendar size={28} className="mx-auto mb-3 text-[#A1A1AA]" />
              <p className="text-sm text-[#A1A1AA]">Keine Prematch-Daten</p>
            </>
          )}
        </div>
      )}

      {/* Opportunity Rows */}
      {!loading && currentOpportunities.length > 0 && (
        <div className="divide-y divide-white/5 max-h-[320px] overflow-y-auto" data-testid="live-opportunities">
          {currentOpportunities.map((opp, index) => (
            <div 
              key={opp.id || index}
              className={`grid grid-cols-12 gap-2 px-4 py-2.5 hover:bg-[#39FF14]/5 transition-colors cursor-pointer animate-fade-in-up ${
                opp.status === 'LIVE' ? 'bg-[#FF3B30]/5' : opp.status === 'STARTING_SOON' ? 'bg-[#FFD60A]/5' : ''
              }`}
              style={{ animationDelay: `${index * 0.03}s` }}
              data-testid={`opportunity-row-${index}`}
            >
              <div className="col-span-1 flex items-center">
                {opp.status === 'LIVE' ? (
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-[#FF3B30] rounded-full animate-pulse" />
                  </div>
                ) : opp.status === 'STARTING_SOON' ? (
                  <div className="flex items-center gap-1">
                    <Zap size={12} className="text-[#FFD60A]" />
                  </div>
                ) : (
                  <div className="live-dot" />
                )}
              </div>
              <div className="col-span-3">
                <p className="text-xs text-white truncate">{opp.match || `${opp.home_team} vs ${opp.away_team}`}</p>
                <p className="text-[10px] text-[#A1A1AA] truncate">{opp.tournament}</p>
              </div>
              <div className="col-span-2 flex items-center">
                <span className="font-mono text-xs text-white truncate">{opp.market}</span>
              </div>
              <div className="col-span-2 flex items-center justify-center">
                <div className="flex items-center gap-1.5">
                  <div className="w-10 h-1 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#39FF14] rounded-full transition-all duration-500"
                      style={{ width: `${opp.confidence}%` }}
                    />
                  </div>
                  <span className="font-mono text-xs text-[#39FF14]">{opp.confidence}%</span>
                </div>
              </div>
              <div className="col-span-2 flex items-center justify-center">
                <span className={`px-1.5 py-0.5 font-mono text-[10px] border rounded-sm ${getRiskBgColor(opp.risk_level)} ${getRiskColor(opp.risk_score)}`}>
                  {opp.risk_level}
                </span>
              </div>
              <div className="col-span-1 flex items-center justify-center">
                <span className="font-mono text-xs text-[#00C2FF]">{opp.odds}</span>
              </div>
              <div className="col-span-1 flex items-center justify-end">
                {opp.status === 'LIVE' && opp.scores ? (
                  <span className="font-mono text-xs text-[#FF3B30]">
                    {opp.scores.find(s => s.name === opp.home_team)?.score || 0}-{opp.scores.find(s => s.name === opp.away_team)?.score || 0}
                  </span>
                ) : opp.status === 'STARTING_SOON' ? (
                  <span className="font-mono text-[10px] text-[#FFD60A]">{opp.minutes_until_start}min</span>
                ) : (
                  <span className="font-mono text-[10px] text-[#A1A1AA]">{formatDate(opp.commence_time)}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-white/5 bg-[#0a0a0a]">
        <span className="text-[10px] text-[#A1A1AA]">
          BL, EPL, La Liga, Serie A, Türkei, CL
        </span>
        <div className="flex items-center gap-1 text-[10px] text-[#39FF14]">
          <Activity size={10} />
          <span className="font-mono">{dataSource === 'the-odds-api' ? 'THE ODDS API' : 'DEMO'}</span>
        </div>
      </div>
    </div>
  );
};

export default LiveDashboard;
