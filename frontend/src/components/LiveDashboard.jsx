import React, { useState, useEffect, useCallback } from 'react';
import { Activity, TrendingUp, Clock, AlertTriangle, ChevronRight } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

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
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState('loading');
  const [stats, setStats] = useState({
    activeMatches: 0,
    opportunities: 0,
    avgConfidence: 0
  });

  const fetchOpportunities = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/analysis/opportunities`);
      const data = response.data;
      
      const opps = data.opportunities || [];
      setOpportunities(opps.slice(0, 5)); // Show top 5
      setDataSource(data.data_source || (data.is_simulated ? 'simulation' : 'the-odds-api'));
      
      // Calculate stats
      const avgConf = opps.length > 0 
        ? Math.round(opps.reduce((sum, o) => sum + o.confidence, 0) / opps.length)
        : 0;
      
      setStats({
        activeMatches: data.total || opps.length,
        opportunities: opps.length,
        avgConfidence: avgConf
      });
      
    } catch (err) {
      console.error('Failed to fetch opportunities:', err);
      setDataSource('error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOpportunities();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchOpportunities, 30000);
    
    return () => clearInterval(interval);
  }, [fetchOpportunities]);

  const formatTime = (timestamp) => {
    if (!timestamp) return '--:--:--';
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return '--:--:--';
    }
  };

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

      {/* Loading State */}
      {loading && (
        <div className="p-6 text-center">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-[#39FF14] border-t-transparent" />
          <p className="mt-2 text-xs text-[#A1A1AA]">Lade Live-Daten...</p>
        </div>
      )}

      {/* Opportunity Rows */}
      {!loading && (
        <div className="divide-y divide-white/5" data-testid="live-opportunities">
          {opportunities.map((opp, index) => (
            <div 
              key={opp.id || index}
              className="grid grid-cols-12 gap-2 px-4 py-3 hover:bg-[#39FF14]/5 transition-colors cursor-pointer animate-fade-in-up"
              style={{ animationDelay: `${index * 0.05}s` }}
              data-testid={`opportunity-row-${index}`}
            >
              <div className="col-span-1 flex items-center">
                <div className="live-dot" />
              </div>
              <div className="col-span-3">
                <p className="text-sm text-white truncate">{opp.match || `${opp.home_team} vs ${opp.away_team}`}</p>
                <p className="text-xs text-[#A1A1AA]">{opp.tournament}</p>
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
                <span className={`font-mono text-sm ${getRiskColor(opp.risk_score)}`}>
                  {opp.risk_level || getRiskLabel(opp.risk_score)} ({opp.risk_score})
                </span>
              </div>
              <div className="col-span-1 flex items-center justify-center">
                <span className="font-mono text-sm text-[#00C2FF]">+{opp.ev}%</span>
              </div>
              <div className="col-span-1 flex items-center justify-end">
                <span className="font-mono text-xs text-[#A1A1AA]">{formatTime(opp.timestamp)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

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
