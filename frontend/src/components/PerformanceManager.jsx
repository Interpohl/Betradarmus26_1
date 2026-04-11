/**
 * PerformanceManager - Admin Tool für manuelle Performance-Dateneingabe
 * Erlaubt das Hinzufügen, Bearbeiten und Löschen von Signal-Ergebnissen
 */
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, Edit2, Trash2, CheckCircle, XCircle, Save, X, 
  Calendar, Trophy, TrendingUp, TrendingDown, Loader2, RefreshCw,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { Input } from './ui/input';
import { Button } from './ui/button';

const API = process.env.REACT_APP_BACKEND_URL;

// Vordefinierte Wettarten
const MARKET_OPTIONS = [
  "Over 2.5", "Under 2.5", "Over 1.5", "Under 3.5",
  "BTTS", "1", "X", "2", "1X", "X2", "12",
  "Handicap", "DNB", "Sonstiges"
];

export const PerformanceManager = () => {
  const { token } = useAuth();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const limit = 20;

  // Form state
  const [formData, setFormData] = useState({
    date: new Date().toISOString().slice(0, 16),
    match: '',
    market: 'Over 2.5',
    odds: '',
    won: true,
    units: '',
    roi: ''
  });

  // Load entries
  const loadEntries = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${API}/api/performance/entries?limit=${limit}&skip=${page * limit}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await response.json();
      setEntries(data.entries || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error('Error loading entries:', error);
      toast.error('Fehler beim Laden der Einträge');
    }
    setLoading(false);
  }, [token, page]);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  // Reset form
  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().slice(0, 16),
      match: '',
      market: 'Over 2.5',
      odds: '',
      won: true,
      units: '',
      roi: ''
    });
    setShowAddForm(false);
    setEditingId(null);
  };

  // Calculate units from odds and won status
  const calculateUnits = (odds, won) => {
    if (!odds) return 0;
    const oddsNum = parseFloat(odds);
    if (won) {
      return (oddsNum - 1).toFixed(2); // Gewinn = (Quote - 1) bei 1 Unit Einsatz
    } else {
      return (-1).toFixed(2); // Verlust = -1 Unit
    }
  };

  // Handle form changes
  const handleFormChange = (field, value) => {
    const newData = { ...formData, [field]: value };
    
    // Auto-calculate units when odds or won changes
    if (field === 'odds' || field === 'won') {
      const odds = field === 'odds' ? value : formData.odds;
      const won = field === 'won' ? value : formData.won;
      newData.units = calculateUnits(odds, won);
    }
    
    setFormData(newData);
  };

  // Add new entry
  const handleAdd = async () => {
    if (!formData.match || !formData.odds) {
      toast.error('Bitte Spiel und Quote eingeben');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`${API}/api/performance/entries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          units: parseFloat(formData.units) || 0,
          roi: parseFloat(formData.roi) || 0
        })
      });

      if (response.ok) {
        toast.success('Eintrag hinzugefügt');
        resetForm();
        loadEntries();
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Fehler beim Hinzufügen');
      }
    } catch (error) {
      toast.error('Fehler beim Hinzufügen');
    }
    setSaving(false);
  };

  // Update entry
  const handleUpdate = async () => {
    if (!editingId) return;

    setSaving(true);
    try {
      const response = await fetch(`${API}/api/performance/entries/${editingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          units: parseFloat(formData.units) || 0,
          roi: parseFloat(formData.roi) || 0
        })
      });

      if (response.ok) {
        toast.success('Eintrag aktualisiert');
        resetForm();
        loadEntries();
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Fehler beim Aktualisieren');
      }
    } catch (error) {
      toast.error('Fehler beim Aktualisieren');
    }
    setSaving(false);
  };

  // Delete entry
  const handleDelete = async (id) => {
    if (!window.confirm('Eintrag wirklich löschen?')) return;

    try {
      const response = await fetch(`${API}/api/performance/entries/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        toast.success('Eintrag gelöscht');
        loadEntries();
      } else {
        toast.error('Fehler beim Löschen');
      }
    } catch (error) {
      toast.error('Fehler beim Löschen');
    }
  };

  // Start editing
  const startEdit = (entry) => {
    setFormData({
      date: entry.date ? entry.date.slice(0, 16) : '',
      match: entry.match || '',
      market: entry.market || 'Over 2.5',
      odds: entry.odds?.toString() || '',
      won: entry.won ?? true,
      units: entry.units?.toString() || '',
      roi: entry.roi?.toString() || ''
    });
    setEditingId(entry.id);
    setShowAddForm(true);
  };

  // Stats summary
  const stats = entries.reduce((acc, entry) => {
    acc.total++;
    if (entry.won) acc.wins++;
    acc.units += entry.units || 0;
    return acc;
  }, { total: 0, wins: 0, units: 0 });

  return (
    <div className="space-y-6" data-testid="performance-manager">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-[#39FF14]" />
            Performance Daten
          </h2>
          <p className="text-sm text-[#A1A1AA] mt-1">
            Manuelle Eingabe von Signal-Ergebnissen
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={loadEntries}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Aktualisieren
          </Button>
          {!showAddForm && (
            <Button
              onClick={() => {
                resetForm();
                setShowAddForm(true);
              }}
              className="bg-[#39FF14] text-black hover:bg-[#2ebb11]"
            >
              <Plus className="w-4 h-4 mr-2" />
              Neuer Eintrag
            </Button>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="p-4 bg-[#0a0a0a] border border-white/10 rounded-xl">
          <div className="text-sm text-[#A1A1AA]">Einträge (Seite)</div>
          <div className="text-2xl font-bold text-white">{entries.length}</div>
        </div>
        <div className="p-4 bg-[#0a0a0a] border border-white/10 rounded-xl">
          <div className="text-sm text-[#A1A1AA]">Gewonnen</div>
          <div className="text-2xl font-bold text-[#39FF14]">{stats.wins}</div>
        </div>
        <div className="p-4 bg-[#0a0a0a] border border-white/10 rounded-xl">
          <div className="text-sm text-[#A1A1AA]">Trefferquote</div>
          <div className="text-2xl font-bold text-white">
            {stats.total > 0 ? ((stats.wins / stats.total) * 100).toFixed(1) : 0}%
          </div>
        </div>
        <div className="p-4 bg-[#0a0a0a] border border-white/10 rounded-xl">
          <div className="text-sm text-[#A1A1AA]">Units (Seite)</div>
          <div className={`text-2xl font-bold ${stats.units >= 0 ? 'text-[#39FF14]' : 'text-red-400'}`}>
            {stats.units >= 0 ? '+' : ''}{stats.units.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="p-6 bg-[#121212] border border-white/10 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">
              {editingId ? 'Eintrag bearbeiten' : 'Neuer Eintrag'}
            </h3>
            <button
              onClick={resetForm}
              className="p-2 text-[#A1A1AA] hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Datum */}
            <div>
              <label className="block text-sm text-[#A1A1AA] mb-2">Datum & Zeit</label>
              <Input
                type="datetime-local"
                value={formData.date}
                onChange={(e) => handleFormChange('date', e.target.value)}
                className="bg-[#0a0a0a] border-gray-700 text-white"
              />
            </div>

            {/* Spiel */}
            <div>
              <label className="block text-sm text-[#A1A1AA] mb-2">Spiel</label>
              <Input
                placeholder="z.B. Bayern vs Dortmund"
                value={formData.match}
                onChange={(e) => handleFormChange('match', e.target.value)}
                className="bg-[#0a0a0a] border-gray-700 text-white"
              />
            </div>

            {/* Wettart */}
            <div>
              <label className="block text-sm text-[#A1A1AA] mb-2">Wettart</label>
              <select
                value={formData.market}
                onChange={(e) => handleFormChange('market', e.target.value)}
                className="w-full h-10 px-3 bg-[#0a0a0a] border border-gray-700 rounded-md text-white"
              >
                {MARKET_OPTIONS.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            {/* Quote */}
            <div>
              <label className="block text-sm text-[#A1A1AA] mb-2">Quote</label>
              <Input
                type="number"
                step="0.01"
                placeholder="z.B. 1.85"
                value={formData.odds}
                onChange={(e) => handleFormChange('odds', e.target.value)}
                className="bg-[#0a0a0a] border-gray-700 text-white"
              />
            </div>

            {/* Gewonnen/Verloren */}
            <div>
              <label className="block text-sm text-[#A1A1AA] mb-2">Ergebnis</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleFormChange('won', true)}
                  className={`flex-1 h-10 rounded-md flex items-center justify-center gap-2 transition-colors ${
                    formData.won 
                      ? 'bg-[#39FF14]/20 border border-[#39FF14] text-[#39FF14]' 
                      : 'bg-[#0a0a0a] border border-gray-700 text-[#A1A1AA]'
                  }`}
                >
                  <CheckCircle className="w-4 h-4" />
                  Gewonnen
                </button>
                <button
                  type="button"
                  onClick={() => handleFormChange('won', false)}
                  className={`flex-1 h-10 rounded-md flex items-center justify-center gap-2 transition-colors ${
                    !formData.won 
                      ? 'bg-red-500/20 border border-red-500 text-red-400' 
                      : 'bg-[#0a0a0a] border border-gray-700 text-[#A1A1AA]'
                  }`}
                >
                  <XCircle className="w-4 h-4" />
                  Verloren
                </button>
              </div>
            </div>

            {/* Units */}
            <div>
              <label className="block text-sm text-[#A1A1AA] mb-2">Units +/-</label>
              <Input
                type="number"
                step="0.01"
                placeholder="Auto-berechnet"
                value={formData.units}
                onChange={(e) => handleFormChange('units', e.target.value)}
                className="bg-[#0a0a0a] border-gray-700 text-white"
              />
            </div>

            {/* ROI */}
            <div>
              <label className="block text-sm text-[#A1A1AA] mb-2">ROI %</label>
              <Input
                type="number"
                step="0.1"
                placeholder="z.B. 5.5"
                value={formData.roi}
                onChange={(e) => handleFormChange('roi', e.target.value)}
                className="bg-[#0a0a0a] border-gray-700 text-white"
              />
            </div>

            {/* Submit Button */}
            <div className="flex items-end">
              <Button
                onClick={editingId ? handleUpdate : handleAdd}
                disabled={saving}
                className="w-full bg-[#39FF14] text-black hover:bg-[#2ebb11]"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {editingId ? 'Aktualisieren' : 'Speichern'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Entries Table */}
      <div className="bg-[#121212] border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 bg-[#0a0a0a]">
                <th className="px-4 py-3 text-left text-xs font-medium text-[#A1A1AA] uppercase">Datum</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#A1A1AA] uppercase">Spiel</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#A1A1AA] uppercase">Wettart</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#A1A1AA] uppercase">Quote</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-[#A1A1AA] uppercase">Ergebnis</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-[#A1A1AA] uppercase">Units</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-[#A1A1AA] uppercase">ROI</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-[#A1A1AA] uppercase">Aktionen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-4 py-8 text-center text-[#A1A1AA]">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                  </td>
                </tr>
              ) : entries.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-4 py-8 text-center text-[#A1A1AA]">
                    Keine Einträge vorhanden
                  </td>
                </tr>
              ) : (
                entries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-white/5">
                    <td className="px-4 py-3 text-sm text-white">
                      {entry.date ? new Date(entry.date).toLocaleString('de-DE', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-white font-medium">{entry.match}</td>
                    <td className="px-4 py-3 text-sm text-[#00C2FF]">{entry.market}</td>
                    <td className="px-4 py-3 text-sm text-white font-mono">{entry.odds?.toFixed(2)}</td>
                    <td className="px-4 py-3 text-center">
                      {entry.won ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-[#39FF14]/20 text-[#39FF14]">
                          <CheckCircle className="w-3 h-3" />
                          Gewonnen
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-red-500/20 text-red-400">
                          <XCircle className="w-3 h-3" />
                          Verloren
                        </span>
                      )}
                    </td>
                    <td className={`px-4 py-3 text-sm text-right font-mono ${
                      (entry.units || 0) >= 0 ? 'text-[#39FF14]' : 'text-red-400'
                    }`}>
                      {(entry.units || 0) >= 0 ? '+' : ''}{(entry.units || 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-mono text-white">
                      {entry.roi ? `${entry.roi.toFixed(1)}%` : '-'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => startEdit(entry)}
                          className="p-1.5 text-[#A1A1AA] hover:text-[#00C2FF] transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(entry.id)}
                          className="p-1.5 text-[#A1A1AA] hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {total > limit && (
          <div className="px-4 py-3 border-t border-white/10 flex items-center justify-between">
            <div className="text-sm text-[#A1A1AA]">
              Zeige {page * limit + 1} - {Math.min((page + 1) * limit, total)} von {total}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => p + 1)}
                disabled={(page + 1) * limit >= total}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PerformanceManager;
