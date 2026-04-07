/**
 * Admin Overview Tab - Statistics and summary view
 */
import React from 'react';
import { 
  Users, Crown, Zap, Activity, TrendingUp, TrendingDown,
  DollarSign, BarChart3, PieChart
} from 'lucide-react';

export const AdminOverview = ({ 
  statistics, 
  telegramUsers, 
  webUsers,
  payments,
  loading 
}) => {
  const { subscriptionBreakdown, signalStats } = statistics || {};
  
  // Calculate totals
  const totalTelegramUsers = telegramUsers?.length || 0;
  const totalWebUsers = webUsers?.length || 0;
  const totalUsers = totalTelegramUsers + totalWebUsers;
  
  // Calculate revenue
  const totalRevenue = payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
  const monthlyRevenue = payments?.filter(p => {
    const date = new Date(p.created_at);
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }).reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
  
  const StatCard = ({ icon: Icon, label, value, subValue, trend, color = 'text-[#39FF14]' }) => (
    <div className="bg-[#121212] border border-white/10 rounded-xl p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[#A1A1AA] text-sm mb-1">{label}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
          {subValue && (
            <p className="text-sm text-[#A1A1AA] mt-1">{subValue}</p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color.replace('text-', 'bg-')}/10`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
      </div>
      {trend && (
        <div className={`flex items-center gap-1 mt-3 text-sm ${trend > 0 ? 'text-[#39FF14]' : 'text-red-400'}`}>
          {trend > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          <span>{Math.abs(trend)}% vs. letzter Monat</span>
        </div>
      )}
    </div>
  );
  
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          icon={Users}
          label="Gesamtnutzer"
          value={totalUsers.toLocaleString()}
          subValue={`${totalTelegramUsers} Telegram / ${totalWebUsers} Web`}
          color="text-[#39FF14]"
        />
        <StatCard 
          icon={Crown}
          label="Premium Nutzer"
          value={(subscriptionBreakdown?.pro || 0) + (subscriptionBreakdown?.elite || 0)}
          subValue={`${subscriptionBreakdown?.pro || 0} PRO / ${subscriptionBreakdown?.elite || 0} ELITE`}
          color="text-[#FFD60A]"
        />
        <StatCard 
          icon={DollarSign}
          label="Umsatz (Monat)"
          value={`€${monthlyRevenue.toFixed(2)}`}
          subValue={`Gesamt: €${totalRevenue.toFixed(2)}`}
          color="text-[#00C2FF]"
        />
        <StatCard 
          icon={Activity}
          label="Signale heute"
          value={signalStats?.total || 0}
          subValue={`${signalStats?.distributed || 0} verteilt`}
          color="text-[#FF6B6B]"
        />
      </div>
      
      {/* Subscription Breakdown */}
      <div className="bg-[#121212] border border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <PieChart className="w-5 h-5 text-[#39FF14]" />
          Subscription-Verteilung
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-white/5 rounded-lg">
            <p className="text-3xl font-bold text-[#A1A1AA]">{subscriptionBreakdown?.free || 0}</p>
            <p className="text-sm text-[#A1A1AA]">FREE</p>
          </div>
          <div className="text-center p-4 bg-[#00C2FF]/10 rounded-lg border border-[#00C2FF]/30">
            <p className="text-3xl font-bold text-[#00C2FF]">{subscriptionBreakdown?.pro || 0}</p>
            <p className="text-sm text-[#00C2FF]">PRO</p>
          </div>
          <div className="text-center p-4 bg-[#FFD60A]/10 rounded-lg border border-[#FFD60A]/30">
            <p className="text-3xl font-bold text-[#FFD60A]">{subscriptionBreakdown?.elite || 0}</p>
            <p className="text-sm text-[#FFD60A]">ELITE</p>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="mt-4">
          <div className="h-3 bg-white/10 rounded-full overflow-hidden flex">
            {totalUsers > 0 && (
              <>
                <div 
                  className="bg-[#A1A1AA]" 
                  style={{ width: `${((subscriptionBreakdown?.free || 0) / totalUsers) * 100}%` }}
                />
                <div 
                  className="bg-[#00C2FF]" 
                  style={{ width: `${((subscriptionBreakdown?.pro || 0) / totalUsers) * 100}%` }}
                />
                <div 
                  className="bg-[#FFD60A]" 
                  style={{ width: `${((subscriptionBreakdown?.elite || 0) / totalUsers) * 100}%` }}
                />
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Signal Performance */}
        <div className="bg-[#121212] border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#39FF14]" />
            Signal Performance
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[#A1A1AA]">Durchschn. Confidence</span>
              <span className="text-white font-mono">{((signalStats?.avgConfidence || 0) * 100).toFixed(0)}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#A1A1AA]">Signale versendet</span>
              <span className="text-white font-mono">{signalStats?.totalSent || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#A1A1AA]">Ø pro Tag</span>
              <span className="text-white font-mono">{((signalStats?.total || 0) / 30).toFixed(1)}</span>
            </div>
          </div>
        </div>
        
        {/* Recent Activity */}
        <div className="bg-[#121212] border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#39FF14]" />
            Letzte Aktivität
          </h3>
          <div className="space-y-2">
            {loading ? (
              <p className="text-[#A1A1AA] text-sm">Lade...</p>
            ) : (
              <p className="text-[#A1A1AA] text-sm">
                Keine neuen Aktivitäten
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
