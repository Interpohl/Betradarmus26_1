import React, { useState, useEffect, useRef } from 'react';
import { 
  Trophy, TrendingUp, Target, Flame, Award, 
  ChevronUp, ChevronDown, Zap, BarChart3, Star,
  CheckCircle2, XCircle, Activity
} from 'lucide-react';
import { 
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, 
  ResponsiveContainer, Tooltip, Cell 
} from 'recharts';

// Animated Counter Component
const AnimatedCounter = ({ value, suffix = '', prefix = '', decimals = 0, duration = 2000 }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const countRef = useRef(null);
  
  useEffect(() => {
    const startTime = Date.now();
    const startValue = 0;
    const endValue = parseFloat(value) || 0;
    
    const animate = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const current = startValue + (endValue - startValue) * easeOutQuart;
      
      setDisplayValue(current);
      
      if (progress < 1) {
        countRef.current = requestAnimationFrame(animate);
      }
    };
    
    countRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (countRef.current) {
        cancelAnimationFrame(countRef.current);
      }
    };
  }, [value, duration]);
  
  return (
    <span>
      {prefix}{displayValue.toFixed(decimals)}{suffix}
    </span>
  );
};

// Streak Badge Component
const StreakBadge = ({ streak, type }) => {
  if (streak < 3) return null;
  
  const isWin = type === 'WIN';
  
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${
      isWin 
        ? 'bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30'
        : 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30'
    }`}>
      <Flame className={`w-4 h-4 ${isWin ? 'text-orange-400' : 'text-blue-400'} animate-pulse`} />
      <span className={`text-sm font-bold ${isWin ? 'text-orange-400' : 'text-blue-400'}`}>
        {streak}er {isWin ? 'HOT STREAK' : 'Serie'}
      </span>
    </div>
  );
};

// Achievement Badge
const AchievementBadge = ({ icon: Icon, title, achieved, color }) => (
  <div className={`relative p-3 rounded-xl border transition-all duration-300 ${
    achieved 
      ? `bg-gradient-to-br ${color} border-white/20 shadow-lg`
      : 'bg-[#1a1a1a] border-gray-800 opacity-40'
  }`}>
    <Icon className={`w-6 h-6 ${achieved ? 'text-white' : 'text-gray-600'}`} />
    {achieved && (
      <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#39FF14] rounded-full animate-pulse" />
    )}
    <p className={`text-xs mt-2 font-medium ${achieved ? 'text-white/90' : 'text-gray-600'}`}>
      {title}
    </p>
  </div>
);

// Main Statistics Component
export const Statistics = () => {
  const [stats, setStats] = useState(null);
  const [leaguePerformance, setLeaguePerformance] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [recentTips, setRecentTips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const API_URL = process.env.REACT_APP_BACKEND_URL || '';

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      
      const [statsRes, leagueRes, monthlyRes, recentRes] = await Promise.all([
        fetch(`${API_URL}/api/statistics`),
        fetch(`${API_URL}/api/statistics/leagues`),
        fetch(`${API_URL}/api/statistics/monthly`),
        fetch(`${API_URL}/api/statistics/recent?limit=10`)
      ]);

      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data);
      }
      
      if (leagueRes.ok) {
        const data = await leagueRes.json();
        setLeaguePerformance(data.leagues || []);
      }
      
      if (monthlyRes.ok) {
        const data = await monthlyRes.json();
        setMonthlyData(data.monthly || []);
      }
      
      if (recentRes.ok) {
        const data = await recentRes.json();
        setRecentTips(data.tips || []);
      }
      
    } catch (err) {
      console.error('Error fetching statistics:', err);
      setError('Statistiken konnten nicht geladen werden');
    } finally {
      setLoading(false);
    }
  };

  // Determine achievements
  const achievements = stats ? [
    { 
      icon: Target, 
      title: '100 Tipps', 
      achieved: stats.total_tips >= 100,
      color: 'from-blue-500/30 to-cyan-500/30'
    },
    { 
      icon: Trophy, 
      title: '60% Rate', 
      achieved: stats.win_rate >= 60,
      color: 'from-yellow-500/30 to-orange-500/30'
    },
    { 
      icon: Flame, 
      title: '5er Streak', 
      achieved: stats.best_streak >= 5,
      color: 'from-red-500/30 to-pink-500/30'
    },
    { 
      icon: TrendingUp, 
      title: '+10% ROI', 
      achieved: stats.roi >= 10,
      color: 'from-green-500/30 to-emerald-500/30'
    },
    { 
      icon: Star, 
      title: '70% Rate', 
      achieved: stats.win_rate >= 70,
      color: 'from-purple-500/30 to-violet-500/30'
    },
    { 
      icon: Award, 
      title: '10er Streak', 
      achieved: stats.best_streak >= 10,
      color: 'from-amber-500/30 to-yellow-500/30'
    }
  ] : [];

  if (loading) {
    return (
      <section className="py-20 bg-[#0a0a0a]" id="statistics">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#39FF14]"></div>
          </div>
        </div>
      </section>
    );
  }

  if (error || !stats) {
    return (
      <section className="py-20 bg-[#0a0a0a]" id="statistics">
        <div className="max-w-7xl mx-auto px-4 md:px-8 text-center">
          <p className="text-gray-400">{error || 'Keine Statistiken verfügbar'}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-[#0a0a0a] relative overflow-hidden" id="statistics" data-testid="statistics-section">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#39FF14]/5 via-transparent to-transparent" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#39FF14]/10 rounded-full blur-[120px] opacity-30" />
      
      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#39FF14]/10 border border-[#39FF14]/20 rounded-full mb-6">
            <BarChart3 className="w-4 h-4 text-[#39FF14]" />
            <span className="text-[#39FF14] text-sm font-medium">Unsere Trefferquote</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            Transparente Performance
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Alle unsere Tipps werden automatisch ausgewertet. Keine versteckten Zahlen - volle Transparenz.
          </p>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Win Rate - Hero Card */}
          <div className="col-span-2 lg:col-span-1 bg-gradient-to-br from-[#39FF14]/20 to-[#39FF14]/5 border border-[#39FF14]/30 rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#39FF14]/20 rounded-full blur-3xl" />
            <div className="relative">
              <p className="text-gray-400 text-sm mb-1">Trefferquote</p>
              <div className="text-5xl md:text-6xl font-bold text-[#39FF14] mb-2">
                <AnimatedCounter value={stats.win_rate} suffix="%" decimals={1} />
              </div>
              <div className="flex items-center gap-1 text-[#39FF14]">
                <ChevronUp className="w-4 h-4" />
                <span className="text-sm font-medium">Überdurchschnittlich</span>
              </div>
            </div>
          </div>

          {/* Total Tips */}
          <div className="bg-[#121212] border border-gray-800 rounded-2xl p-6 hover:border-gray-700 transition-colors">
            <p className="text-gray-400 text-sm mb-1">Gesamte Tipps</p>
            <div className="text-3xl md:text-4xl font-bold text-white mb-2">
              <AnimatedCounter value={stats.total_tips} />
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              <span className="text-green-400">{stats.wins}</span>
              <XCircle className="w-4 h-4 text-red-400 ml-2" />
              <span className="text-red-400">{stats.losses}</span>
            </div>
          </div>

          {/* ROI */}
          <div className="bg-[#121212] border border-gray-800 rounded-2xl p-6 hover:border-gray-700 transition-colors">
            <p className="text-gray-400 text-sm mb-1">ROI</p>
            <div className={`text-3xl md:text-4xl font-bold mb-2 ${stats.roi >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              <AnimatedCounter 
                value={stats.roi} 
                prefix={stats.roi >= 0 ? '+' : ''} 
                suffix="%" 
                decimals={1} 
              />
            </div>
            <p className="text-gray-500 text-sm">
              {stats.roi >= 0 ? 'Positiver Return' : 'Negativer Return'}
            </p>
          </div>

          {/* Current Streak */}
          <div className="bg-[#121212] border border-gray-800 rounded-2xl p-6 hover:border-gray-700 transition-colors">
            <p className="text-gray-400 text-sm mb-1">Aktueller Streak</p>
            <div className="flex items-center gap-3">
              <div className={`text-3xl md:text-4xl font-bold ${
                stats.streak_type === 'WIN' ? 'text-green-400' : 'text-gray-400'
              }`}>
                <AnimatedCounter value={stats.current_streak} />
              </div>
              {stats.current_streak >= 3 && stats.streak_type === 'WIN' && (
                <Flame className="w-8 h-8 text-orange-400 animate-pulse" />
              )}
            </div>
            <p className="text-gray-500 text-sm">
              Bester: {stats.best_streak} Siege
            </p>
          </div>
        </div>

        {/* Streak Badge */}
        {stats.current_streak >= 3 && (
          <div className="flex justify-center mb-8">
            <StreakBadge streak={stats.current_streak} type={stats.streak_type} />
          </div>
        )}

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Monthly Performance Chart */}
          <div className="bg-[#121212] border border-gray-800 rounded-2xl p-6">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#39FF14]" />
              Monatliche Performance
            </h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="winRateGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#39FF14" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#39FF14" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="month" 
                    stroke="#666" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="#666" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    domain={[0, 100]}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1a1a1a', 
                      border: '1px solid #333',
                      borderRadius: '8px'
                    }}
                    labelStyle={{ color: '#fff' }}
                    formatter={(value) => [`${value.toFixed(1)}%`, 'Win Rate']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="win_rate" 
                    stroke="#39FF14" 
                    strokeWidth={2}
                    fill="url(#winRateGradient)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* League Performance */}
          <div className="bg-[#121212] border border-gray-800 rounded-2xl p-6">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              Top Ligen nach Win Rate
            </h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={leaguePerformance.slice(0, 5)} layout="vertical">
                  <XAxis 
                    type="number" 
                    stroke="#666"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    domain={[0, 100]}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <YAxis 
                    type="category" 
                    dataKey="league" 
                    stroke="#666"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    width={100}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1a1a1a', 
                      border: '1px solid #333',
                      borderRadius: '8px'
                    }}
                    formatter={(value, name, props) => [
                      `${value.toFixed(1)}% (${props.payload.wins}/${props.payload.total})`,
                      'Win Rate'
                    ]}
                  />
                  <Bar dataKey="win_rate" radius={[0, 4, 4, 0]}>
                    {leaguePerformance.slice(0, 5).map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.win_rate >= 70 ? '#39FF14' : entry.win_rate >= 60 ? '#22c55e' : '#facc15'} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Achievements */}
        <div className="bg-[#121212] border border-gray-800 rounded-2xl p-6 mb-8">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-purple-400" />
            Achievements
          </h3>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {achievements.map((achievement, index) => (
              <AchievementBadge
                key={index}
                icon={achievement.icon}
                title={achievement.title}
                achieved={achievement.achieved}
                color={achievement.color}
              />
            ))}
          </div>
        </div>

        {/* Recent Tips */}
        <div className="bg-[#121212] border border-gray-800 rounded-2xl p-6">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-cyan-400" />
            Letzte ausgewertete Tipps
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {recentTips.map((tip, index) => (
              <div 
                key={tip.id || index}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  tip.result === 'WIN' 
                    ? 'bg-green-500/10 border border-green-500/20' 
                    : 'bg-red-500/10 border border-red-500/20'
                }`}
              >
                <div className="flex items-center gap-3">
                  {tip.result === 'WIN' ? (
                    <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                  )}
                  <div>
                    <p className="text-white text-sm font-medium">{tip.match}</p>
                    <p className="text-gray-500 text-xs">{tip.market} | {tip.league}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${tip.result === 'WIN' ? 'text-green-400' : 'text-red-400'}`}>
                    {tip.result}
                  </p>
                  <p className="text-gray-500 text-xs">{tip.final_score || '?:?'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-xs">
            Ergebnisse werden automatisch via The Odds API abgerufen und ausgewertet.
            Tägliche Aktualisierung. Historische Performance garantiert keine zukünftigen Ergebnisse.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Statistics;
