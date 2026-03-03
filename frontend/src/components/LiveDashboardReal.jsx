import React, { useState, useEffect, useCallback } from 'react';
import { Activity, TrendingUp, AlertTriangle, Shield, Brain, Lock } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const getRiskColor = (level) => {
  switch (level) {
    case 'LOW': return 'text-[#39FF14]';
    case 'MED': return 'text-[#FFD60A]';
    case 'HIGH': return 'text-[#FF3B30]';
    default: return 'text-[#A1A1AA]';
  }
};

const getRiskBgColor = (level) => {
  switch (level) {
    case 'LOW': return 'bg-[#39FF14]/10 border-[#39FF14]/20';
    case 'MED': return 'bg-[#FFD60A]/10 border-[#FFD60A]/20';
    case 'HIGH': return 'bg-[#FF3B30]/10 border-[#FF3B30]/20';
    default: return 'bg-white/5 border-white/10';
  }
};

export const LiveDashboardReal = ({ onUpgradeClick }) => {
  const { isAuthenticated, isPremium, isElite } = useAuth();
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    avgConfidence: 0,
    highEV: 0
  });

  const fetchOpportunities = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/analysis/opportunities`);
      const data = response.data;
      
      setOpportunities(data.opportunities || []);
      
      // Calculate stats
      const opps = data.opportunities || [];
      const avgConf = opps.length > 0 
        ? Math.round(opps.reduce((sum, o) => sum + o.confidence, 0) / opps.length)
        : 0;
      const highEV = opps.filter(o => o.ev > 10).length;
      
      setStats({
        total: opps.length,
        avgConfidence: avgConf,
        highEV
      });
      
      setError(null);
    } catch (err) {
      console.error('Failed to fetch opportunities:', err);
      setError('Fehler beim Laden der Daten');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOpportunities();
    
    // Refresh every 10 seconds
    const interval = setInterval(fetchOpportunities, 10000);
    
    return () => clearInterval(interval);
  }, [fetchOpportunities]);

  return (
    <div className="bg-[#121212] border border-white/5 rounded-sm overflow-hidden" data-testid="live-dashboard-real">
      {/* Dashboard Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-[#0a0a0a]">
        <div className="flex items-center gap-3">
          <div className="live-dot" />
          <span className="font-mono text-xs text-[#39FF14] uppercase tracking-wider">
            Live Analysis {isPremium ? '(Premium)' : '(Free)'}
          </span>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <span className="data-label block">Opportunities</span>
            <span className="font-mono text-lg text-[#39FF14]">{stats.total}</span>
          </div>
          <div className="text-right">
            <span className="data-label block">Ø Confidence</span>
            <span className="font-mono text-lg text-white">{stats.avgConfidence}%</span>
          </div>
          <div className="text-right">
            <span className="data-label block">High EV</span>
            <span className="font-mono text-lg text-[#00C2FF]">{stats.highEV}</span>
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
        <div className="col-span-1 data-label text-right">Odds</div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-[#39FF14] border-t-transparent" />
          <p className="mt-4 text-[#A1A1AA]">Lade Live-Daten...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="p-8 text-center">
          <AlertTriangle size={32} className="mx-auto mb-4 text-[#FFD60A]" />
          <p className="text-[#A1A1AA]">{error}</p>
          <button 
            onClick={fetchOpportunities}
            className="mt-4 px-4 py-2 bg-white/5 border border-white/10 text-white text-sm rounded-sm hover:bg-white/10"
          >
            Erneut versuchen
          </button>
        </div>
      )}

      {/* Opportunity Rows */}
      {!loading && !error && (
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
                <p className="text-sm text-white truncate">{opp.match}</p>
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
                <span className={`px-2 py-0.5 font-mono text-xs border rounded-sm ${getRiskBgColor(opp.risk_level)} ${getRiskColor(opp.risk_level)}`}>
                  {opp.risk_level} ({opp.risk_score})
                </span>
              </div>
              <div className="col-span-1 flex items-center justify-center">
                <span className="font-mono text-sm text-[#00C2FF]">+{opp.ev}%</span>
              </div>
              <div className="col-span-1 flex items-center justify-end">
                {opp.odds ? (
                  <span className="font-mono text-sm text-white">{opp.odds}</span>
                ) : isPremium ? (
                  <TrendingUp size={16} className="text-[#39FF14]" />
                ) : (
                  <Lock size={14} className="text-[#A1A1AA]" />
                )}
              </div>
            </div>
          ))}

          {/* Premium Features Preview */}
          {opportunities.length > 0 && isPremium && opportunities[0].detailed_stats && (
            <div className="p-4 bg-[#0a0a0a]/50 border-t border-white/5">
              <div className="flex items-center gap-2 mb-3">
                <Shield size={16} className="text-[#39FF14]" />
                <span className="text-sm font-semibold text-white uppercase tracking-wide">Premium Insights</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <span className="data-label block">Heim Impl. Wahrsch.</span>
                  <span className="font-mono text-sm text-white">{opportunities[0].detailed_stats.home_implied_prob}%</span>
                </div>
                <div>
                  <span className="data-label block">Unent. Impl. Wahrsch.</span>
                  <span className="font-mono text-sm text-white">{opportunities[0].detailed_stats.draw_implied_prob}%</span>
                </div>
                <div>
                  <span className="data-label block">Ausw. Impl. Wahrsch.</span>
                  <span className="font-mono text-sm text-[#00C2FF]">{opportunities[0].detailed_stats.away_implied_prob}%</span>
                </div>
                <div>
                  <span className="data-label block">Markt-Marge</span>
                  <span className="font-mono text-sm text-[#39FF14]">{opportunities[0].detailed_stats.market_margin}%</span>
                </div>
              </div>
            </div>
          )}

          {/* All Markets for Premium */}
          {opportunities.length > 0 && isPremium && opportunities[0].all_markets && (
            <div className="p-4 bg-[#0a0a0a]/30 border-t border-white/5">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp size={16} className="text-[#00C2FF]" />
                <span className="text-sm font-semibold text-white uppercase tracking-wide">Alle Märkte - {opportunities[0].match}</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {opportunities[0].all_markets.map((market, i) => (
                  <div key={i} className="p-3 bg-white/5 border border-white/10 rounded-sm">
                    <p className="text-xs text-[#A1A1AA] mb-1">{market.market}</p>
                    <p className="font-mono text-lg text-white">{market.odds}</p>
                    <p className="text-xs text-[#39FF14]">{market.confidence}% Conf.</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Elite AI Explainer */}
          {isElite && opportunities.length > 0 && opportunities[0].explainable_ai && (
            <div className="p-4 bg-gradient-to-r from-[#00C2FF]/5 to-transparent border-t border-[#00C2FF]/20">
              <div className="flex items-center gap-2 mb-3">
                <Brain size={16} className="text-[#00C2FF]" />
                <span className="text-sm font-semibold text-white uppercase tracking-wide">Explainable AI</span>
              </div>
              <div className="flex flex-wrap gap-3">
                {opportunities[0].explainable_ai.factors.map((factor, i) => (
                  <span key={i} className="px-3 py-1 bg-[#00C2FF]/10 border border-[#00C2FF]/20 text-[#00C2FF] text-xs font-mono rounded-sm">
                    {factor}
                  </span>
                ))}
                <span className="px-3 py-1 bg-[#39FF14]/10 border border-[#39FF14]/20 text-[#39FF14] text-xs font-mono rounded-sm">
                  Model Confidence: {(opportunities[0].explainable_ai.model_confidence * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Upgrade Banner for Free Users */}
      {!isPremium && !loading && opportunities.length > 0 && (
        <div className="p-4 bg-gradient-to-r from-[#39FF14]/10 to-transparent border-t border-[#39FF14]/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white font-semibold">Mehr Opportunities freischalten</p>
              <p className="text-xs text-[#A1A1AA]">Upgrade auf Pro für vollen Zugriff</p>
            </div>
            <button
              onClick={onUpgradeClick}
              className="px-4 py-2 bg-[#39FF14] text-black font-bold uppercase tracking-wide text-xs rounded-sm hover:bg-[#2ebb11] transition-all"
              data-testid="upgrade-banner-btn"
            >
              Jetzt upgraden
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-white/5 bg-[#0a0a0a]">
        <span className="text-xs text-[#A1A1AA]">
          {isPremium ? 'Echtzeit-Updates alle 10 Sekunden' : 'Begrenzte Updates im Free-Plan'}
        </span>
        <div className="flex items-center gap-1 text-xs text-[#39FF14]">
          <Activity size={12} />
          <span className="font-mono">LIVE</span>
        </div>
      </div>
    </div>
  );
};

export default LiveDashboardReal;
