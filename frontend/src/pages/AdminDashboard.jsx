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
  Activity
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

  useEffect(() => {
    if (isElite) {
      fetchData();
    }
  }, [isElite]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statusRes, signalsRes, usersRes] = await Promise.all([
        axios.get(`${API}/telegram/status`),
        axios.get(`${API}/signals?limit=10`),
        axios.get(`${API}/telegram/users?limit=50`)
      ]);
      
      setTelegramStatus(statusRes.data);
      setSignals(signalsRes.data.signals || []);
      setTelegramUsers(usersRes.data.users || []);
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
            <p className="text-2xl font-bold text-white">{signals.length}</p>
            <p className="text-sm text-gray-500 mt-1">letzte 10 angezeigt</p>
          </div>
        </div>

        {/* Main Content Grid */}
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
                    <div className="flex gap-4 text-sm">
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
                      <div className="mt-2 text-xs text-gray-500">
                        Gesendet: {signal.distribution_results.sent} | 
                        Gefiltert: {signal.distribution_results.filtered}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Telegram Users */}
          <div className="bg-[#121212] border border-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-cyan-500" />
              Telegram Nutzer
            </h2>
            
            {telegramUsers.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Noch keine Nutzer registriert</p>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {telegramUsers.map((tgUser) => (
                  <div 
                    key={tgUser.telegram_id}
                    className="bg-[#0a0a0a] border border-gray-800 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start mb-2">
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
                    <div className="flex flex-wrap gap-1 mt-2">
                      {(tgUser.leagues || []).map((league) => (
                        <span 
                          key={league}
                          className="px-2 py-0.5 bg-gray-800 rounded text-xs text-gray-300"
                        >
                          {league}
                        </span>
                      ))}
                      {(!tgUser.leagues || tgUser.leagues.length === 0) && (
                        <span className="text-xs text-gray-500">Keine Ligen abonniert</span>
                      )}
                    </div>
                    <div className="flex gap-4 mt-2 text-xs text-gray-500">
                      <span>Min. Conf: {Math.round((tgUser.min_confidence || 0.75) * 100)}%</span>
                      <span>Signale heute: {tgUser.signals_today || 0}</span>
                      <span className={tgUser.alerts_enabled ? 'text-green-400' : 'text-red-400'}>
                        {tgUser.alerts_enabled ? 'Aktiv' : 'Inaktiv'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

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
