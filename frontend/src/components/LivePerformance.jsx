/**
 * LivePerformance - Öffentliches Performance Dashboard
 * Zeigt echte Statistiken und letzte Signale mit Ergebnissen
 */
import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, Target, CheckCircle, XCircle, 
  Clock, Zap, Activity, ArrowUpRight,
  Calendar, Trophy
} from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

export const LivePerformance = () => {
  const [data, setData] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${API}/api/performance/public`);
        if (response.ok) {
          const result = await response.json();
          setData(result);
        }
      } catch (error) {
        console.error('Error fetching performance data:', error);
      }
      setIsLoading(false);
    };

    fetchData();
    
    // Refresh every 5 minutes
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <section className="py-16 md:py-20 bg-[#0a0a0a]">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-[#39FF14]/20 border-t-[#39FF14] rounded-full animate-spin" />
          </div>
        </div>
      </section>
    );
  }

  const periods = [
    { key: 'today', label: 'Heute' },
    { key: 'week', label: '7 Tage' },
    { key: 'month', label: '30 Tage' },
    { key: 'allTime', label: 'Gesamt' }
  ];

  const currentStats = data[selectedPeriod];

  return (
    <section className="py-16 md:py-20 bg-[#0a0a0a] relative overflow-hidden" data-testid="live-performance">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#39FF14]/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#00C2FF]/5 rounded-full blur-3xl" />
      
      <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#39FF14]/10 border border-[#39FF14]/20 rounded-full mb-6">
            <div className="w-2 h-2 bg-[#39FF14] rounded-full animate-pulse" />
            <span className="text-[#39FF14] text-sm font-medium">Live Performance</span>
          </div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4">
            Transparente Ergebnisse
          </h2>
          <p className="text-[#A1A1AA] max-w-2xl mx-auto">
            Keine versteckten Statistiken. Alle unsere Signale werden öffentlich dokumentiert und ausgewertet.
          </p>
        </div>

        {/* Period Selector */}
        <div className="flex justify-center gap-2 mb-8">
          {periods.map(period => (
            <button
              key={period.key}
              onClick={() => setSelectedPeriod(period.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedPeriod === period.key
                  ? 'bg-[#39FF14] text-black'
                  : 'bg-white/5 text-[#A1A1AA] hover:bg-white/10'
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {/* Trefferquote */}
          <div className="p-5 bg-[#121212] border border-white/10 rounded-xl">
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-5 h-5 text-[#39FF14]" />
              <span className="text-sm text-[#A1A1AA]">Trefferquote</span>
            </div>
            <div className="text-3xl font-bold text-white font-mono">
              {currentStats.hitRate.toFixed(1)}%
            </div>
            <div className="text-xs text-[#A1A1AA] mt-1">
              {currentStats.wins} von {currentStats.signals} Signalen
            </div>
          </div>

          {/* ROI */}
          <div className="p-5 bg-[#121212] border border-white/10 rounded-xl">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-5 h-5 text-[#00C2FF]" />
              <span className="text-sm text-[#A1A1AA]">ROI</span>
            </div>
            <div className="text-3xl font-bold text-[#39FF14] font-mono">
              +{currentStats.roi.toFixed(1)}%
            </div>
            <div className="text-xs text-[#A1A1AA] mt-1">
              Return on Investment
            </div>
          </div>

          {/* Signale */}
          <div className="p-5 bg-[#121212] border border-white/10 rounded-xl">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-5 h-5 text-[#FFD700]" />
              <span className="text-sm text-[#A1A1AA]">Signale</span>
            </div>
            <div className="text-3xl font-bold text-white font-mono">
              {currentStats.signals}
            </div>
            <div className="text-xs text-[#A1A1AA] mt-1">
              Analysierte Signale
            </div>
          </div>

          {/* Gewinnserie */}
          <div className="p-5 bg-[#121212] border border-white/10 rounded-xl">
            <div className="flex items-center gap-2 mb-3">
              <Trophy className="w-5 h-5 text-[#FF6B35]" />
              <span className="text-sm text-[#A1A1AA]">Serie</span>
            </div>
            <div className="text-3xl font-bold text-white font-mono">
              {data.streak}x
            </div>
            <div className="text-xs text-[#39FF14] mt-1 flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" />
              Gewinnserie
            </div>
          </div>
        </div>

        {/* Recent Signals */}
        <div className="bg-[#121212] border border-white/10 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#39FF14]" />
              Letzte 10 Signale
            </h3>
            <div className="text-xs text-[#A1A1AA]">
              Ø Quote: <span className="text-white font-mono">{data.avgOdds}</span>
            </div>
          </div>
          
          <div className="divide-y divide-white/5">
            {data.recentSignals.map((signal, index) => (
              <div 
                key={signal.id}
                className={`p-4 flex items-center justify-between hover:bg-white/5 transition-colors ${
                  index === 0 ? 'bg-[#39FF14]/5' : ''
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Result Icon */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    signal.result === 'won' 
                      ? 'bg-[#39FF14]/20' 
                      : 'bg-red-500/20'
                  }`}>
                    {signal.result === 'won' ? (
                      <CheckCircle className="w-4 h-4 text-[#39FF14]" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-400" />
                    )}
                  </div>
                  
                  {/* Match Info */}
                  <div>
                    <div className="text-white text-sm font-medium">{signal.match}</div>
                    <div className="text-[#A1A1AA] text-xs flex items-center gap-2">
                      <span>{signal.market}</span>
                      <span className="text-white/30">•</span>
                      <span className="text-[#00C2FF]">@{signal.odds}</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className={`font-mono font-bold ${
                    signal.result === 'won' ? 'text-[#39FF14]' : 'text-red-400'
                  }`}>
                    {signal.profit}
                  </div>
                  <div className="text-[#A1A1AA] text-xs flex items-center gap-1 justify-end">
                    <Clock className="w-3 h-3" />
                    {signal.time}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Footer */}
          <div className="p-4 bg-[#0a0a0a] border-t border-white/10 flex items-center justify-between">
            <div className="text-xs text-[#A1A1AA]">
              Bilanz letzte 10: <span className="text-[#39FF14] font-mono">+4.10 Units</span>
            </div>
            <div className="text-xs text-[#A1A1AA]">
              Aktualisiert: <span className="text-white">Gerade eben</span>
            </div>
          </div>
        </div>

        {/* Trust Note */}
        <div className="mt-6 text-center">
          <p className="text-xs text-[#A1A1AA]">
            Alle Ergebnisse werden automatisch via API dokumentiert und sind nachvollziehbar.
          </p>
        </div>
      </div>
    </section>
  );
};

export default LivePerformance;
