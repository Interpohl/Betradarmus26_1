import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { toast } from 'sonner';
import { 
  Send, 
  Users, 
  Bell, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Plus,
  Activity,
  BarChart3,
  PieChart,
  Crown,
  Zap,
  Globe,
  Calendar,
  Play,
  Square,
  Cpu
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Available leagues
const LEAGUES = [
  "Bundesliga",
  "Premier League",
  "La Liga",
  "Serie A",
  "Ligue 1",
  "Champions League",
  "Europa League",
  "2. Bundesliga"
];

export const AdminDashboard = () => {
  const { user, isElite } = useAuth();
  const [loading, setLoading] = useState(true);
  const [telegramStatus, setTelegramStatus] = useState(null);
  const [signals, setSignals] = useState([]);
  const [telegramUsers, setTelegramUsers] = useState([]);
  const [showCreateSignal, setShowCreateSignal] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // overview, statistics, signals, users
  const [statistics, setStatistics] = useState({
    subscriptionBreakdown: { free: 0, pro: 0, elite: 0 },
    leagueStats: {},
    signalStats: { total: 0, distributed: 0, totalSent: 0, avgConfidence: 0 },
    dailyActivity: []
  });
  
  // Signal form
  const [signalForm, setSignalForm] = useState({
    league: 'Bundesliga',
    match: '',
    market: '',
    confidence: 0.75,
    risk_score: 30,
    explanation: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [generatorStatus, setGeneratorStatus] = useState({ running: false });
  const [generatingSignals, setGeneratingSignals] = useState(false);

  useEffect(() => {
    if (isElite) {
      fetchData();
    }
  }, [isElite]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statusRes, signalsRes, usersRes, generatorRes] = await Promise.all([
        axios.get(`${API}/telegram/status`),
        axios.get(`${API}/signals?limit=50`),
        axios.get(`${API}/telegram/users?limit=200`),
        axios.get(`${API}/signals/generator/status`).catch(() => ({ data: { running: false } }))
      ]);
      
      setTelegramStatus(statusRes.data);
      setSignals(signalsRes.data.signals || []);
      setTelegramUsers(usersRes.data.users || []);
      
      // Calculate statistics from users
      const users = usersRes.data.users || [];
      const signalsData = signalsRes.data.signals || [];
      
      // Subscription breakdown
      const subscriptionBreakdown = { free: 0, pro: 0, elite: 0 };
      const leagueStats = {};
      
      users.forEach(user => {
        const level = user.subscription_level || 'free';
        subscriptionBreakdown[level] = (subscriptionBreakdown[level] || 0) + 1;
        
        (user.leagues || []).forEach(league => {
          leagueStats[league] = (leagueStats[league] || 0) + 1;
        });
      });
      
      // Signal stats
      const distributedSignals = signalsData.filter(s => s.distributed);
      const totalSent = distributedSignals.reduce((sum, s) => 
        sum + (s.distribution_results?.sent || 0), 0
      );
      const avgConfidence = signalsData.length > 0
        ? signalsData.reduce((sum, s) => sum + (s.confidence || 0), 0) / signalsData.length
        : 0;
      
      setStatistics({
        subscriptionBreakdown,
        leagueStats,
        signalStats: {
          total: signalsData.length,
          distributed: distributedSignals.length,
          totalSent,
          avgConfidence
        },
        dailyActivity: []
      });
      
      setGeneratorStatus(generatorRes.data);
      
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Fehler beim Laden der Daten');
    }
    setLoading(false);
  };

  const handleCreateSignal = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const response = await axios.post(`${API}/signals`, signalForm);
      
      if (response.data.success) {
        toast.success(response.data.message);
        setShowCreateSignal(false);
        setSignalForm({
          league: 'Bundesliga',
          match: '',
          market: '',
          confidence: 0.75,
          risk_score: 30,
          explanation: ''
        });
        fetchData();
      }
    } catch (error) {
      toast.error('Fehler beim Erstellen des Signals');
    }
    
    setSubmitting(false);
  };

  const generateSignalsNow = async () => {
    setGeneratingSignals(true);
    try {
      const res = await axios.post(`${API}/signals/generate`);
      toast.success(`${res.data.signals_generated} Signale generiert!`);
      fetchData();
    } catch (error) {
      toast.error('Fehler bei der Signal-Generierung');
    }
    setGeneratingSignals(false);
  };

  const toggleSignalGenerator = async () => {
    try {
      if (generatorStatus.running) {
        await axios.post(`${API}/signals/generator/stop`);
        toast.success('Signal Generator gestoppt');
      } else {
        await axios.post(`${API}/signals/generator/start`);
        toast.success('Signal Generator gestartet');
      }
      // Refresh status
      const res = await axios.get(`${API}/signals/generator/status`);
      setGeneratorStatus(res.data);
    } catch (error) {
      toast.error('Fehler beim Steuern des Generators');
    }
  };

  if (!isElite) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] pt-24 px-4">
        <div className="max-w-4xl mx-auto text-center py-20">
          <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-white mb-4">Zugriff verweigert</h1>
          <p className="text-gray-400 mb-8">
            Das Admin-Dashboard ist nur für ELITE-Nutzer verfügbar.
          </p>
          <Button 
            onClick={() => window.location.href = '/#pricing'}
            className="bg-gradient-to-r from-cyan-500 to-blue-600"
          >
            Upgrade auf ELITE
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] pt-24 px-4 flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-cyan-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-24 px-4 pb-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
            <p className="text-gray-400">Signal-Verwaltung & Telegram-Statistiken</p>
          </div>
          <div className="flex gap-3 mt-4 md:mt-0">
            <Button 
              onClick={fetchData}
              variant="outline"
              className="border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Aktualisieren
            </Button>
            <Button 
              onClick={() => setShowCreateSignal(true)}
              className="bg-gradient-to-r from-cyan-500 to-blue-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Neues Signal
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-800 pb-4 overflow-x-auto">
          {[
            { id: 'overview', label: 'Übersicht', icon: Activity },
            { id: 'generator', label: 'KI Generator', icon: Cpu },
            { id: 'statistics', label: 'Statistiken', icon: BarChart3 },
            { id: 'signals', label: 'Signale', icon: Zap },
            { id: 'users', label: 'Nutzer', icon: Users }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              {/* Bot Status */}
              <div className="bg-[#121212] border border-gray-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-400 text-sm">Bot Status</span>
                  {telegramStatus?.status === 'active' ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                </div>
                <p className="text-2xl font-bold text-white">
                  {telegramStatus?.status === 'active' ? 'Aktiv' : 'Offline'}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  @{telegramStatus?.bot?.username || 'N/A'}
                </p>
              </div>

              {/* Total Users */}
              <div className="bg-[#121212] border border-gray-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-400 text-sm">Telegram Nutzer</span>
                  <Users className="w-5 h-5 text-cyan-500" />
                </div>
                <p className="text-2xl font-bold text-white">
                  {telegramStatus?.users?.total || 0}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {telegramStatus?.users?.active || 0} aktiv
                </p>
              </div>

              {/* Queue Size */}
              <div className="bg-[#121212] border border-gray-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-400 text-sm">Warteschlange</span>
                  <Bell className="w-5 h-5 text-yellow-500" />
                </div>
                <p className="text-2xl font-bold text-white">
                  {telegramStatus?.queue_size || 0}
                </p>
                <p className="text-sm text-gray-500 mt-1">Nachrichten pending</p>
              </div>

              {/* Total Signals */}
              <div className="bg-[#121212] border border-gray-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-400 text-sm">Signale gesamt</span>
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <p className="text-2xl font-bold text-white">{statistics.signalStats.total}</p>
                <p className="text-sm text-gray-500 mt-1">{statistics.signalStats.totalSent} versendet</p>
              </div>
            </div>

            {/* Quick Overview Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Signals */}
              <div className="bg-[#121212] border border-gray-800 rounded-xl p-6">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-cyan-500" />
                  Letzte Signale
                </h2>
                
                {signals.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Noch keine Signale erstellt</p>
                ) : (
                  <div className="space-y-3">
                    {signals.slice(0, 5).map((signal) => (
                      <div 
                        key={signal.id}
                        className="bg-[#0a0a0a] border border-gray-800 rounded-lg p-4"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="text-white font-medium">{signal.match}</p>
                            <p className="text-gray-500 text-sm">{signal.league}</p>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs ${
                            signal.distributed 
                              ? 'bg-green-500/20 text-green-400' 
                              : 'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {signal.distributed ? 'Verteilt' : 'Pending'}
                          </span>
                        </div>
                        <div className="flex gap-4 text-sm">
                          <span className="text-gray-400">
                            Markt: <span className="text-white">{signal.market}</span>
                          </span>
                          <span className="text-gray-400">
                            Conf: <span className="text-cyan-400">{Math.round(signal.confidence * 100)}%</span>
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick User Stats */}
              <div className="bg-[#121212] border border-gray-800 rounded-xl p-6">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-cyan-500" />
                  Nutzer nach Plan
                </h2>
                
                <div className="space-y-4">
                  {/* FREE */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                      <span className="text-gray-300">FREE</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-32 h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gray-500 rounded-full"
                          style={{ 
                            width: `${telegramUsers.length > 0 ? (statistics.subscriptionBreakdown.free / telegramUsers.length) * 100 : 0}%` 
                          }}
                        ></div>
                      </div>
                      <span className="text-white font-medium w-8 text-right">{statistics.subscriptionBreakdown.free}</span>
                    </div>
                  </div>
                  
                  {/* PRO */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
                      <span className="text-gray-300">PRO</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-32 h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-cyan-500 rounded-full"
                          style={{ 
                            width: `${telegramUsers.length > 0 ? (statistics.subscriptionBreakdown.pro / telegramUsers.length) * 100 : 0}%` 
                          }}
                        ></div>
                      </div>
                      <span className="text-white font-medium w-8 text-right">{statistics.subscriptionBreakdown.pro}</span>
                    </div>
                  </div>
                  
                  {/* ELITE */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                      <span className="text-gray-300">ELITE</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-32 h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-purple-500 rounded-full"
                          style={{ 
                            width: `${telegramUsers.length > 0 ? (statistics.subscriptionBreakdown.elite / telegramUsers.length) * 100 : 0}%` 
                          }}
                        ></div>
                      </div>
                      <span className="text-white font-medium w-8 text-right">{statistics.subscriptionBreakdown.elite}</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 pt-4 border-t border-gray-800">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Gesamt</span>
                    <span className="text-white font-medium">{telegramUsers.length} Nutzer</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* KI Generator Tab */}
        {activeTab === 'generator' && (
          <div className="space-y-6">
            {/* Generator Status */}
            <div className="bg-[#121212] border border-gray-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-cyan-500" />
                  KI Signal Generator
                </h2>
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${
                  generatorStatus.running 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-gray-700 text-gray-400'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${
                    generatorStatus.running ? 'bg-green-400 animate-pulse' : 'bg-gray-500'
                  }`}></div>
                  {generatorStatus.running ? 'Läuft' : 'Gestoppt'}
                </div>
              </div>

              <p className="text-gray-400 mb-6">
                Der KI Signal Generator analysiert automatisch alle 15 Minuten die verfügbaren Spiele 
                und generiert Signale basierend auf statistischen Analysen.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-[#0a0a0a] border border-gray-800 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">Analyse-Intervall</p>
                  <p className="text-white text-xl font-bold">15 Minuten</p>
                </div>
                <div className="bg-[#0a0a0a] border border-gray-800 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">Min. Confidence</p>
                  <p className="text-white text-xl font-bold">65%</p>
                </div>
                <div className="bg-[#0a0a0a] border border-gray-800 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">Märkte</p>
                  <p className="text-white text-xl font-bold">Over/Under, BTTS, 1X2</p>
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={toggleSignalGenerator}
                  className={generatorStatus.running 
                    ? 'bg-red-600 hover:bg-red-700' 
                    : 'bg-green-600 hover:bg-green-700'
                  }
                >
                  {generatorStatus.running ? (
                    <>
                      <Square className="w-4 h-4 mr-2" />
                      Generator stoppen
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Generator starten
                    </>
                  )}
                </Button>
                <Button
                  onClick={generateSignalsNow}
                  disabled={generatingSignals}
                  variant="outline"
                  className="border-cyan-600 text-cyan-400 hover:bg-cyan-600/20"
                >
                  {generatingSignals ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Generiere...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Jetzt analysieren
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* How It Works */}
            <div className="bg-[#121212] border border-gray-800 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-6">So funktioniert die KI-Analyse</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {[
                  { step: 1, title: 'Daten sammeln', desc: 'Spiele von Football-Data.org' },
                  { step: 2, title: 'Teams analysieren', desc: 'Form, H2H, Heim/Auswärts' },
                  { step: 3, title: 'Märkte bewerten', desc: 'Goals, BTTS, Winner' },
                  { step: 4, title: 'Confidence berechnen', desc: 'Statistisches Modell' },
                  { step: 5, title: 'Signal senden', desc: 'Wenn Confidence ≥ 65%' }
                ].map(item => (
                  <div key={item.step} className="relative">
                    <div className="bg-[#0a0a0a] border border-gray-800 rounded-lg p-4 text-center">
                      <div className="w-8 h-8 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-cyan-400 font-bold">{item.step}</span>
                      </div>
                      <p className="text-white font-medium text-sm mb-1">{item.title}</p>
                      <p className="text-gray-500 text-xs">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Elite Channel Info */}
            <div className="bg-gradient-to-r from-cyan-900/30 to-blue-900/30 border border-cyan-700/50 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Crown className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-2">Elite Signal-Kanal</h3>
                  <p className="text-gray-400 text-sm mb-4">
                    Alle automatisch generierten Signale werden direkt in den Elite-Kanal gepostet.
                    Stelle sicher, dass der Bot als Admin im Kanal ist.
                  </p>
                  <a 
                    href="https://t.me/+SODfqorGIt8khC_9" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-cyan-400 hover:text-cyan-300 text-sm flex items-center gap-1"
                  >
                    Zum Elite-Kanal →
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Statistics Tab */}
        {activeTab === 'statistics' && (
          <div className="space-y-6">
            {/* Signal Performance */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-[#121212] border border-gray-800 rounded-xl p-6">
                <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                  <Zap className="w-4 h-4" />
                  Signale erstellt
                </div>
                <p className="text-3xl font-bold text-white">{statistics.signalStats.total}</p>
              </div>
              <div className="bg-[#121212] border border-gray-800 rounded-xl p-6">
                <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                  <Send className="w-4 h-4" />
                  Verteilt
                </div>
                <p className="text-3xl font-bold text-green-400">{statistics.signalStats.distributed}</p>
              </div>
              <div className="bg-[#121212] border border-gray-800 rounded-xl p-6">
                <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                  <Users className="w-4 h-4" />
                  Nachrichten gesendet
                </div>
                <p className="text-3xl font-bold text-cyan-400">{statistics.signalStats.totalSent}</p>
              </div>
              <div className="bg-[#121212] border border-gray-800 rounded-xl p-6">
                <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                  <TrendingUp className="w-4 h-4" />
                  Ø Confidence
                </div>
                <p className="text-3xl font-bold text-yellow-400">
                  {Math.round(statistics.signalStats.avgConfidence * 100)}%
                </p>
              </div>
            </div>

            {/* League Statistics */}
            <div className="bg-[#121212] border border-gray-800 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <Globe className="w-5 h-5 text-cyan-500" />
                Liga-Abonnements
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(statistics.leagueStats)
                  .sort(([,a], [,b]) => b - a)
                  .map(([league, count]) => (
                    <div 
                      key={league}
                      className="bg-[#0a0a0a] border border-gray-800 rounded-lg p-4"
                    >
                      <p className="text-white font-medium mb-1">{league}</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full"
                            style={{ 
                              width: `${telegramUsers.length > 0 ? (count / telegramUsers.length) * 100 : 0}%` 
                            }}
                          ></div>
                        </div>
                        <span className="text-cyan-400 font-medium">{count}</span>
                      </div>
                    </div>
                  ))}
                {Object.keys(statistics.leagueStats).length === 0 && (
                  <p className="text-gray-500 col-span-4 text-center py-4">
                    Noch keine Liga-Abonnements
                  </p>
                )}
              </div>
            </div>

            {/* Subscription Distribution Chart */}
            <div className="bg-[#121212] border border-gray-800 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <Crown className="w-5 h-5 text-cyan-500" />
                Subscription-Verteilung
              </h2>
              
              <div className="flex items-center justify-center gap-8">
                {/* Visual Pie Chart Alternative */}
                <div className="relative w-48 h-48">
                  <svg viewBox="0 0 100 100" className="transform -rotate-90">
                    {(() => {
                      const total = telegramUsers.length || 1;
                      const freePercent = (statistics.subscriptionBreakdown.free / total) * 100;
                      const proPercent = (statistics.subscriptionBreakdown.pro / total) * 100;
                      const elitePercent = (statistics.subscriptionBreakdown.elite / total) * 100;
                      
                      let offset = 0;
                      const segments = [];
                      
                      if (freePercent > 0) {
                        segments.push(
                          <circle
                            key="free"
                            cx="50"
                            cy="50"
                            r="40"
                            fill="none"
                            stroke="#6b7280"
                            strokeWidth="20"
                            strokeDasharray={`${freePercent * 2.51} 251`}
                            strokeDashoffset={-offset * 2.51}
                          />
                        );
                        offset += freePercent;
                      }
                      
                      if (proPercent > 0) {
                        segments.push(
                          <circle
                            key="pro"
                            cx="50"
                            cy="50"
                            r="40"
                            fill="none"
                            stroke="#06b6d4"
                            strokeWidth="20"
                            strokeDasharray={`${proPercent * 2.51} 251`}
                            strokeDashoffset={-offset * 2.51}
                          />
                        );
                        offset += proPercent;
                      }
                      
                      if (elitePercent > 0) {
                        segments.push(
                          <circle
                            key="elite"
                            cx="50"
                            cy="50"
                            r="40"
                            fill="none"
                            stroke="#a855f7"
                            strokeWidth="20"
                            strokeDasharray={`${elitePercent * 2.51} 251`}
                            strokeDashoffset={-offset * 2.51}
                          />
                        );
                      }
                      
                      if (total === 1 && telegramUsers.length === 0) {
                        segments.push(
                          <circle
                            key="empty"
                            cx="50"
                            cy="50"
                            r="40"
                            fill="none"
                            stroke="#1f2937"
                            strokeWidth="20"
                          />
                        );
                      }
                      
                      return segments;
                    })()}
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-white">{telegramUsers.length}</span>
                    <span className="text-sm text-gray-400">Nutzer</span>
                  </div>
                </div>
                
                {/* Legend */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded bg-gray-500"></div>
                    <span className="text-gray-300">FREE</span>
                    <span className="text-white font-bold ml-auto">{statistics.subscriptionBreakdown.free}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded bg-cyan-500"></div>
                    <span className="text-gray-300">PRO</span>
                    <span className="text-white font-bold ml-auto">{statistics.subscriptionBreakdown.pro}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded bg-purple-500"></div>
                    <span className="text-gray-300">ELITE</span>
                    <span className="text-white font-bold ml-auto">{statistics.subscriptionBreakdown.elite}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Signals Tab */}
        {activeTab === 'signals' && (
          <div className="bg-[#121212] border border-gray-800 rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-cyan-500" />
                Alle Signale
              </h2>
              <Button 
                onClick={() => setShowCreateSignal(true)}
                className="bg-gradient-to-r from-cyan-500 to-blue-600"
                size="sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Neues Signal
              </Button>
            </div>
            
            {signals.length === 0 ? (
              <p className="text-gray-500 text-center py-12">Noch keine Signale erstellt</p>
            ) : (
              <div className="space-y-3">
                {signals.map((signal) => (
                  <div 
                    key={signal.id}
                    className="bg-[#0a0a0a] border border-gray-800 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-white font-medium">{signal.match}</p>
                        <p className="text-gray-500 text-sm">{signal.league}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs ${
                        signal.distributed 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {signal.distributed ? 'Verteilt' : 'Pending'}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <span className="text-gray-400">
                        Markt: <span className="text-white">{signal.market}</span>
                      </span>
                      <span className="text-gray-400">
                        Conf: <span className="text-cyan-400">{Math.round(signal.confidence * 100)}%</span>
                      </span>
                      <span className="text-gray-400">
                        Risk: <span className="text-yellow-400">{signal.risk_score}</span>
                      </span>
                    </div>
                    {signal.distribution_results && (
                      <div className="mt-2 text-xs text-gray-500 flex gap-4">
                        <span>Gesendet: <span className="text-green-400">{signal.distribution_results.sent}</span></span>
                        <span>Gefiltert: <span className="text-gray-400">{signal.distribution_results.filtered}</span></span>
                        <span>Fehler: <span className="text-red-400">{signal.distribution_results.failed}</span></span>
                      </div>
                    )}
                    <div className="mt-2 text-xs text-gray-600">
                      {signal.timestamp && new Date(signal.timestamp).toLocaleString('de-DE')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-[#121212] border border-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <Users className="w-5 h-5 text-cyan-500" />
              Telegram Nutzer ({telegramUsers.length})
            </h2>
            
            {telegramUsers.length === 0 ? (
              <p className="text-gray-500 text-center py-12">Noch keine Nutzer registriert</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {telegramUsers.map((tgUser) => (
                  <div 
                    key={tgUser.telegram_id}
                    className="bg-[#0a0a0a] border border-gray-800 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="text-white font-medium">
                          {tgUser.first_name} {tgUser.last_name || ''}
                        </p>
                        <p className="text-gray-500 text-sm">
                          @{tgUser.telegram_username || 'N/A'}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs uppercase ${
                        tgUser.subscription_level === 'elite' 
                          ? 'bg-purple-500/20 text-purple-400'
                          : tgUser.subscription_level === 'pro'
                          ? 'bg-cyan-500/20 text-cyan-400'
                          : 'bg-gray-500/20 text-gray-400'
                      }`}>
                        {tgUser.subscription_level || 'free'}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {(tgUser.leagues || []).map((league) => (
                        <span 
                          key={league}
                          className="px-2 py-0.5 bg-gray-800 rounded text-xs text-gray-300"
                        >
                          {league}
                        </span>
                      ))}
                      {(!tgUser.leagues || tgUser.leagues.length === 0) && (
                        <span className="text-xs text-gray-500">Keine Ligen</span>
                      )}
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 pt-2 border-t border-gray-800">
                      <span>Min. Conf: {Math.round((tgUser.min_confidence || 0.75) * 100)}%</span>
                      <span>Heute: {tgUser.signals_today || 0}</span>
                      <span className={tgUser.alerts_enabled ? 'text-green-400' : 'text-red-400'}>
                        {tgUser.alerts_enabled ? 'Aktiv' : 'Inaktiv'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Create Signal Modal */}
        {showCreateSignal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-[#121212] border border-gray-800 rounded-xl p-6 w-full max-w-lg">
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <Send className="w-5 h-5 text-cyan-500" />
                Neues Signal erstellen
              </h2>
              
              <form onSubmit={handleCreateSignal} className="space-y-4">
                {/* League */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Liga</label>
                  <select
                    value={signalForm.league}
                    onChange={(e) => setSignalForm({...signalForm, league: e.target.value})}
                    className="w-full bg-[#0a0a0a] border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-cyan-500 focus:outline-none"
                  >
                    {LEAGUES.map((league) => (
                      <option key={league} value={league}>{league}</option>
                    ))}
                  </select>
                </div>

                {/* Match */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Spiel</label>
                  <Input
                    value={signalForm.match}
                    onChange={(e) => setSignalForm({...signalForm, match: e.target.value})}
                    placeholder="z.B. Dortmund vs Leipzig"
                    className="bg-[#0a0a0a] border-gray-700 text-white"
                    required
                  />
                </div>

                {/* Market */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Markt</label>
                  <Input
                    value={signalForm.market}
                    onChange={(e) => setSignalForm({...signalForm, market: e.target.value})}
                    placeholder="z.B. Over 2.5, Heimsieg, BTTS"
                    className="bg-[#0a0a0a] border-gray-700 text-white"
                    required
                  />
                </div>

                {/* Confidence & Risk */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      Confidence: {Math.round(signalForm.confidence * 100)}%
                    </label>
                    <input
                      type="range"
                      min="0.5"
                      max="0.99"
                      step="0.01"
                      value={signalForm.confidence}
                      onChange={(e) => setSignalForm({...signalForm, confidence: parseFloat(e.target.value)})}
                      className="w-full accent-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      Risk Score: {signalForm.risk_score}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="1"
                      value={signalForm.risk_score}
                      onChange={(e) => setSignalForm({...signalForm, risk_score: parseInt(e.target.value)})}
                      className="w-full accent-yellow-500"
                    />
                  </div>
                </div>

                {/* Explanation */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Analyse / Erklärung</label>
                  <textarea
                    value={signalForm.explanation}
                    onChange={(e) => setSignalForm({...signalForm, explanation: e.target.value})}
                    placeholder="Kurze Analyse zum Signal..."
                    rows={3}
                    className="w-full bg-[#0a0a0a] border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-cyan-500 focus:outline-none resize-none"
                    required
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    onClick={() => setShowCreateSignal(false)}
                    variant="outline"
                    className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-800"
                  >
                    Abbrechen
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600"
                  >
                    {submitting ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Signal senden
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
