/**
 * Admin Signals Tab - Signal creation and management
 */
import React, { useState } from 'react';
import { 
  Zap, Plus, Send, Play, Square, RefreshCw,
  Activity, CheckCircle, Clock, AlertTriangle
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const LEAGUES = [
  "Bundesliga", "Premier League", "La Liga", "Serie A", "Ligue 1",
  "Champions League", "Europa League", "2. Bundesliga", "-- Andere Liga --"
];

const ANALYSIS_PRESETS = [
  { id: 'goals', name: 'Over Goals', template: 'Basierend auf historischen Daten und aktueller Form erwarten wir mindestens {goals} Tore. Beide Teams zeigen offensive Stärke in den letzten Spielen.' },
  { id: 'btts', name: 'BTTS', template: 'Beide Teams haben in den letzten Spielen getroffen. Die Defensiven zeigen Schwächen, während die Offensive produktiv ist.' },
  { id: 'winner', name: 'Sieger', template: 'Klare Formüberlegenheit spricht für {team}. Starke Heimstärke/Auswärtsbilanz und direkte Vergleiche unterstützen diese Einschätzung.' },
  { id: 'handicap', name: 'Asian Handicap', template: 'Der Favoritenabstand rechtfertigt ein Handicap. Historische H2H-Daten und aktuelle Performance unterstützen diesen Pick.' }
];

export const AdminSignals = ({ 
  signals = [],
  onRefresh,
  loading 
}) => {
  const [showCreateSignal, setShowCreateSignal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [generatingSignals, setGeneratingSignals] = useState(false);
  
  const [signalForm, setSignalForm] = useState({
    league: 'Bundesliga',
    customLeague: '',
    match: '',
    market: '',
    confidence: 0.75,
    risk_score: 30,
    explanation: '',
    analysisPreset: '',
    selectedChannel: 'elite'
  });
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const finalLeague = signalForm.league === '-- Andere Liga --' 
        ? signalForm.customLeague 
        : signalForm.league;
      
      const channelMap = {
        'elite': { elite: true, pro: false, free: false },
        'pro': { elite: true, pro: true, free: false },
        'all': { elite: true, pro: true, free: true }
      };
      
      const signalData = {
        league: finalLeague,
        match: signalForm.match,
        market: signalForm.market,
        confidence: signalForm.confidence,
        risk_score: signalForm.risk_score,
        explanation: signalForm.explanation,
        analysis: signalForm.explanation,
        channels: channelMap[signalForm.selectedChannel] || { elite: true }
      };
      
      const response = await axios.post(`${API}/signals`, signalData);
      
      if (response.data.success) {
        toast.success(response.data.message);
        setShowCreateSignal(false);
        resetForm();
        onRefresh?.();
      }
    } catch (error) {
      toast.error('Fehler beim Erstellen des Signals');
    }
    
    setSubmitting(false);
  };
  
  const resetForm = () => {
    setSignalForm({
      league: 'Bundesliga',
      customLeague: '',
      match: '',
      market: '',
      confidence: 0.75,
      risk_score: 30,
      explanation: '',
      analysisPreset: '',
      selectedChannel: 'elite'
    });
  };
  
  const generateSignals = async () => {
    setGeneratingSignals(true);
    try {
      const res = await axios.post(`${API}/signals/generate`);
      toast.success(`${res.data.signals_generated} Signale generiert!`);
      onRefresh?.();
    } catch (error) {
      toast.error('Fehler bei der Signal-Generierung');
    }
    setGeneratingSignals(false);
  };
  
  const applyPreset = (presetId) => {
    const preset = ANALYSIS_PRESETS.find(p => p.id === presetId);
    if (preset) {
      setSignalForm(prev => ({
        ...prev,
        analysisPreset: presetId,
        explanation: preset.template
      }));
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#39FF14]/10 rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-[#39FF14]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Signal-Verwaltung</h2>
            <p className="text-sm text-[#A1A1AA]">
              {signals.length} Signale erstellt
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={generateSignals}
            disabled={generatingSignals}
            variant="outline"
            className="gap-2"
          >
            {generatingSignals ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            Auto-Generieren
          </Button>
          <Button
            onClick={() => setShowCreateSignal(!showCreateSignal)}
            className="gap-2 bg-[#39FF14] text-black hover:bg-[#39FF14]/90"
          >
            <Plus className="w-4 h-4" />
            Neues Signal
          </Button>
        </div>
      </div>
      
      {/* Create Signal Form */}
      {showCreateSignal && (
        <div className="bg-[#121212] border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Neues Signal erstellen</h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* League */}
              <div>
                <label className="text-sm text-[#A1A1AA] mb-1 block">Liga</label>
                <select
                  value={signalForm.league}
                  onChange={(e) => setSignalForm(prev => ({ ...prev, league: e.target.value }))}
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-2 text-white"
                >
                  {LEAGUES.map(league => (
                    <option key={league} value={league}>{league}</option>
                  ))}
                </select>
              </div>
              
              {signalForm.league === '-- Andere Liga --' && (
                <div>
                  <label className="text-sm text-[#A1A1AA] mb-1 block">Custom Liga</label>
                  <Input
                    value={signalForm.customLeague}
                    onChange={(e) => setSignalForm(prev => ({ ...prev, customLeague: e.target.value }))}
                    placeholder="Liga eingeben..."
                    className="bg-[#0a0a0a] border-white/10"
                  />
                </div>
              )}
              
              {/* Match */}
              <div>
                <label className="text-sm text-[#A1A1AA] mb-1 block">Spiel</label>
                <Input
                  value={signalForm.match}
                  onChange={(e) => setSignalForm(prev => ({ ...prev, match: e.target.value }))}
                  placeholder="Team A vs Team B"
                  className="bg-[#0a0a0a] border-white/10"
                  required
                />
              </div>
              
              {/* Market */}
              <div>
                <label className="text-sm text-[#A1A1AA] mb-1 block">Markt / Tipp</label>
                <Input
                  value={signalForm.market}
                  onChange={(e) => setSignalForm(prev => ({ ...prev, market: e.target.value }))}
                  placeholder="Over 2.5, BTTS, 1X, etc."
                  className="bg-[#0a0a0a] border-white/10"
                  required
                />
              </div>
              
              {/* Confidence */}
              <div>
                <label className="text-sm text-[#A1A1AA] mb-1 block">
                  Confidence: {(signalForm.confidence * 100).toFixed(0)}%
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="0.95"
                  step="0.05"
                  value={signalForm.confidence}
                  onChange={(e) => setSignalForm(prev => ({ ...prev, confidence: parseFloat(e.target.value) }))}
                  className="w-full"
                />
              </div>
              
              {/* Risk Score */}
              <div>
                <label className="text-sm text-[#A1A1AA] mb-1 block">
                  Risk Score: {signalForm.risk_score}
                </label>
                <input
                  type="range"
                  min="10"
                  max="90"
                  step="5"
                  value={signalForm.risk_score}
                  onChange={(e) => setSignalForm(prev => ({ ...prev, risk_score: parseInt(e.target.value) }))}
                  className="w-full"
                />
              </div>
            </div>
            
            {/* Analysis Presets */}
            <div>
              <label className="text-sm text-[#A1A1AA] mb-2 block">Analyse-Vorlage</label>
              <div className="flex flex-wrap gap-2">
                {ANALYSIS_PRESETS.map(preset => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => applyPreset(preset.id)}
                    className={`px-3 py-1 rounded text-sm ${
                      signalForm.analysisPreset === preset.id
                        ? 'bg-[#39FF14]/20 text-[#39FF14] border border-[#39FF14]/30'
                        : 'bg-white/5 text-[#A1A1AA] hover:bg-white/10'
                    }`}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Explanation */}
            <div>
              <label className="text-sm text-[#A1A1AA] mb-1 block">Analyse / Erklärung</label>
              <textarea
                value={signalForm.explanation}
                onChange={(e) => setSignalForm(prev => ({ ...prev, explanation: e.target.value }))}
                rows={3}
                placeholder="Begründung für den Tipp..."
                className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-2 text-white resize-none"
                required
              />
            </div>
            
            {/* Channel Selection */}
            <div>
              <label className="text-sm text-[#A1A1AA] mb-2 block">Kanal</label>
              <div className="flex gap-2">
                {['elite', 'pro', 'all'].map(channel => (
                  <button
                    key={channel}
                    type="button"
                    onClick={() => setSignalForm(prev => ({ ...prev, selectedChannel: channel }))}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      signalForm.selectedChannel === channel
                        ? channel === 'elite' 
                          ? 'bg-[#FFD60A]/20 text-[#FFD60A] border border-[#FFD60A]/30'
                          : channel === 'pro'
                            ? 'bg-[#00C2FF]/20 text-[#00C2FF] border border-[#00C2FF]/30'
                            : 'bg-[#39FF14]/20 text-[#39FF14] border border-[#39FF14]/30'
                        : 'bg-white/5 text-[#A1A1AA] hover:bg-white/10'
                    }`}
                  >
                    {channel === 'elite' ? 'Nur ELITE' : channel === 'pro' ? 'PRO + ELITE' : 'Alle'}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Submit */}
            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateSignal(false)}
              >
                Abbrechen
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="gap-2 bg-[#39FF14] text-black hover:bg-[#39FF14]/90"
              >
                {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Signal senden
              </Button>
            </div>
          </form>
        </div>
      )}
      
      {/* Signals List */}
      <div className="bg-[#121212] border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#A1A1AA] uppercase">Spiel</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#A1A1AA] uppercase">Liga</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#A1A1AA] uppercase">Markt</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#A1A1AA] uppercase">Confidence</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#A1A1AA] uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {signals.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-[#A1A1AA]">
                    Keine Signale vorhanden
                  </td>
                </tr>
              ) : (
                signals.slice(0, 20).map((signal, idx) => (
                  <tr key={signal._id || idx} className="hover:bg-white/5">
                    <td className="px-4 py-3 text-white">{signal.match}</td>
                    <td className="px-4 py-3 text-[#A1A1AA]">{signal.league}</td>
                    <td className="px-4 py-3 text-[#39FF14] font-mono">{signal.market}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-[#39FF14]" 
                            style={{ width: `${(signal.confidence || 0) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm text-white">
                          {((signal.confidence || 0) * 100).toFixed(0)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {signal.distributed ? (
                        <span className="flex items-center gap-1 text-[#39FF14] text-sm">
                          <CheckCircle className="w-4 h-4" />
                          Versendet
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[#A1A1AA] text-sm">
                          <Clock className="w-4 h-4" />
                          Pending
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminSignals;
