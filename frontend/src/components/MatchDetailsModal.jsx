import React, { useState, useEffect } from 'react';
import { X, Activity, Users, Clock, Target, AlertTriangle, RefreshCw, Lock, Zap } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Stat bar component
const StatBar = ({ label, homeValue, awayValue, homeTeam, awayTeam }) => {
  const homeNum = parseFloat(homeValue) || 0;
  const awayNum = parseFloat(awayValue) || 0;
  const total = homeNum + awayNum || 1;
  const homePercent = (homeNum / total) * 100;
  
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-[#A1A1AA]">
        <span>{homeValue}</span>
        <span className="text-white font-medium">{label}</span>
        <span>{awayValue}</span>
      </div>
      <div className="flex h-1.5 rounded-full overflow-hidden bg-white/10">
        <div 
          className="bg-[#39FF14] transition-all duration-500"
          style={{ width: `${homePercent}%` }}
        />
        <div 
          className="bg-[#FF6B6B] transition-all duration-500"
          style={{ width: `${100 - homePercent}%` }}
        />
      </div>
    </div>
  );
};

// Incident timeline item
const IncidentItem = ({ incident, homeTeam, awayTeam }) => {
  const isHome = incident.is_home;
  const team = isHome ? homeTeam : awayTeam;
  
  const getIcon = () => {
    switch (incident.type) {
      case 'goal':
        return <span className="text-lg">⚽</span>;
      case 'card':
        return incident.card_type === 'red' 
          ? <div className="w-3 h-4 bg-red-500 rounded-sm" />
          : <div className="w-3 h-4 bg-yellow-400 rounded-sm" />;
      case 'substitution':
        return <span className="text-lg">🔄</span>;
      case 'period':
        return <Clock className="w-4 h-4 text-[#A1A1AA]" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };
  
  const getText = () => {
    switch (incident.type) {
      case 'goal':
        return (
          <div>
            <span className="font-medium text-[#39FF14]">{incident.player}</span>
            {incident.assist && (
              <span className="text-[#A1A1AA]"> (Vorlage: {incident.assist})</span>
            )}
            {incident.goal_type === 'penalty' && <span className="text-[#A1A1AA]"> (Elfmeter)</span>}
            {incident.goal_type === 'owngoal' && <span className="text-red-400"> (Eigentor)</span>}
          </div>
        );
      case 'card':
        return (
          <span className={incident.card_type === 'red' ? 'text-red-400' : 'text-yellow-400'}>
            {incident.player}
          </span>
        );
      case 'substitution':
        return (
          <div className="text-xs">
            <span className="text-[#39FF14]">↑ {incident.player_in}</span>
            <span className="text-red-400"> ↓ {incident.player_out}</span>
          </div>
        );
      case 'period':
        return <span className="text-[#A1A1AA] italic">{incident.text}</span>;
      default:
        return null;
    }
  };
  
  if (incident.type === 'period') {
    return (
      <div className="flex items-center justify-center py-2">
        <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full">
          {getIcon()}
          {getText()}
        </div>
      </div>
    );
  }
  
  return (
    <div className={`flex items-center gap-3 py-2 ${isHome ? '' : 'flex-row-reverse'}`}>
      <div className="w-10 text-center">
        <span className="text-xs font-mono text-[#A1A1AA]">
          {incident.time}'
          {incident.added_time > 0 && <span>+{incident.added_time}</span>}
        </span>
      </div>
      <div className="flex-shrink-0">{getIcon()}</div>
      <div className={`text-sm ${isHome ? 'text-left' : 'text-right'}`}>
        {getText()}
      </div>
    </div>
  );
};

// Team color generator (same as LiveMatchesFeed)
const getTeamColor = (name) => {
  if (!name) return '#39FF14';
  const hash = name.split('').reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0);
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', 
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
    '#F8B500', '#00CED1', '#FF6347', '#7B68EE', '#3CB371'
  ];
  return colors[Math.abs(hash) % colors.length];
};

const getInitials = (name) => {
  if (!name) return '?';
  const words = name.split(' ').filter(w => w.length > 0);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

const TeamBadge = ({ name, size = 'md' }) => {
  const color = getTeamColor(name);
  const initials = getInitials(name);
  const sizeClasses = size === 'lg' ? 'w-12 h-12 text-lg' : 'w-8 h-8 text-sm';
  
  return (
    <div 
      className={`${sizeClasses} rounded-lg flex items-center justify-center flex-shrink-0`}
      style={{ 
        background: `linear-gradient(135deg, ${color}40 0%, ${color}20 100%)`,
        border: `2px solid ${color}50`
      }}
    >
      <span className="font-bold" style={{ color }}>{initials}</span>
    </div>
  );
};

export const MatchDetailsModal = ({ match, onClose, token }) => {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('stats');
  
  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const response = await axios.get(`${API}/sofascore/match/${match.id}`, { headers });
        setDetails(response.data);
      } catch (err) {
        console.error('Failed to fetch match details:', err);
        setError('Fehler beim Laden der Spieldaten');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDetails();
  }, [match.id, token]);
  
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);
  
  const homeTeam = details?.home_team?.name || match.homeTeam;
  const awayTeam = details?.away_team?.name || match.awayTeam;
  const homeScore = details?.score?.home ?? match.homeScore;
  const awayScore = details?.score?.away ?? match.awayScore;
  
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="bg-[#0a0a0a] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative p-6 border-b border-white/10 bg-gradient-to-b from-[#39FF14]/5 to-transparent">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-[#A1A1AA]" />
          </button>
          
          {/* Tournament */}
          <div className="text-center mb-4">
            <span className="text-xs text-[#A1A1AA] uppercase tracking-wider">
              {details?.tournament?.country || match.country} • {details?.tournament?.name || match.league}
            </span>
          </div>
          
          {/* Score */}
          <div className="flex items-center justify-center gap-6">
            <div className="flex flex-col items-center gap-2">
              <TeamBadge name={homeTeam} size="lg" />
              <span className="text-white font-medium text-sm text-center max-w-[100px] truncate">
                {homeTeam}
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-4xl font-bold text-white">{homeScore}</span>
              <span className="text-2xl text-[#A1A1AA]">-</span>
              <span className="text-4xl font-bold text-white">{awayScore}</span>
            </div>
            
            <div className="flex flex-col items-center gap-2">
              <TeamBadge name={awayTeam} size="lg" />
              <span className="text-white font-medium text-sm text-center max-w-[100px] truncate">
                {awayTeam}
              </span>
            </div>
          </div>
          
          {/* Status */}
          <div className="flex justify-center mt-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-[#FF0040]/20 border border-[#FF0040]/30 rounded-full">
              <div className="w-2 h-2 bg-[#FF0040] rounded-full animate-pulse" />
              <span className="text-[#FF0040] text-sm font-bold">
                {details?.status?.description || match.status || 'LIVE'}
              </span>
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-6 h-6 text-[#39FF14] animate-spin" />
              <span className="ml-3 text-[#A1A1AA]">Lade Spieldaten...</span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertTriangle className="w-8 h-8 text-red-400 mb-3" />
              <span className="text-[#A1A1AA]">{error}</span>
            </div>
          ) : details?.premium_required ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 bg-[#39FF14]/10 rounded-full flex items-center justify-center mb-4">
                <Lock className="w-8 h-8 text-[#39FF14]" />
              </div>
              <h3 className="text-white text-lg font-bold mb-2">PRO/ELITE Feature</h3>
              <p className="text-[#A1A1AA] text-sm max-w-xs mb-6">
                Detaillierte Spielstatistiken, Live-Ereignisse und Aufstellungen sind nur für PRO und ELITE Nutzer verfügbar.
              </p>
              <a
                href="#pricing"
                onClick={onClose}
                className="px-6 py-3 bg-[#39FF14] text-black font-bold rounded-lg hover:bg-[#39FF14]/90 transition-colors flex items-center gap-2"
              >
                <Zap className="w-4 h-4" />
                Jetzt upgraden
              </a>
            </div>
          ) : (
            <>
              {/* Tabs */}
              <div className="flex gap-2 mb-6">
                {['stats', 'events', 'lineups'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === tab
                        ? 'bg-[#39FF14]/20 text-[#39FF14] border border-[#39FF14]/30'
                        : 'bg-white/5 text-[#A1A1AA] hover:bg-white/10'
                    }`}
                  >
                    {tab === 'stats' && 'Statistiken'}
                    {tab === 'events' && 'Ereignisse'}
                    {tab === 'lineups' && 'Aufstellung'}
                  </button>
                ))}
              </div>
              
              {/* Stats Tab */}
              {activeTab === 'stats' && details?.statistics && (
                <div className="space-y-4">
                  {/* Team Headers */}
                  <div className="flex justify-between items-center px-4 py-2 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-2">
                      <TeamBadge name={homeTeam} size="sm" />
                      <span className="text-white text-sm font-medium">{homeTeam}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-white text-sm font-medium">{awayTeam}</span>
                      <TeamBadge name={awayTeam} size="sm" />
                    </div>
                  </div>
                  
                  {/* Stats List */}
                  <div className="space-y-3">
                    {details.statistics.ball_possession && (
                      <StatBar 
                        label="Ballbesitz" 
                        homeValue={details.statistics.ball_possession.home}
                        awayValue={details.statistics.ball_possession.away}
                        homeTeam={homeTeam}
                        awayTeam={awayTeam}
                      />
                    )}
                    {details.statistics.total_shots && (
                      <StatBar 
                        label="Torschüsse" 
                        homeValue={details.statistics.total_shots.home}
                        awayValue={details.statistics.total_shots.away}
                        homeTeam={homeTeam}
                        awayTeam={awayTeam}
                      />
                    )}
                    {details.statistics.shots_on_target && (
                      <StatBar 
                        label="Schüsse aufs Tor" 
                        homeValue={details.statistics.shots_on_target.home}
                        awayValue={details.statistics.shots_on_target.away}
                        homeTeam={homeTeam}
                        awayTeam={awayTeam}
                      />
                    )}
                    {details.statistics.corner_kicks && (
                      <StatBar 
                        label="Eckbälle" 
                        homeValue={details.statistics.corner_kicks.home}
                        awayValue={details.statistics.corner_kicks.away}
                        homeTeam={homeTeam}
                        awayTeam={awayTeam}
                      />
                    )}
                    {details.statistics.fouls && (
                      <StatBar 
                        label="Fouls" 
                        homeValue={details.statistics.fouls.home}
                        awayValue={details.statistics.fouls.away}
                        homeTeam={homeTeam}
                        awayTeam={awayTeam}
                      />
                    )}
                    {details.statistics.yellow_cards && (
                      <StatBar 
                        label="Gelbe Karten" 
                        homeValue={details.statistics.yellow_cards.home}
                        awayValue={details.statistics.yellow_cards.away}
                        homeTeam={homeTeam}
                        awayTeam={awayTeam}
                      />
                    )}
                    {details.statistics.passes && (
                      <StatBar 
                        label="Pässe" 
                        homeValue={details.statistics.passes.home}
                        awayValue={details.statistics.passes.away}
                        homeTeam={homeTeam}
                        awayTeam={awayTeam}
                      />
                    )}
                    
                    {/* If no specific stats, show all available */}
                    {!details.statistics.ball_possession && Object.entries(details.statistics).slice(0, 8).map(([key, stat]) => (
                      <StatBar 
                        key={key}
                        label={stat.name || key.replace(/_/g, ' ')} 
                        homeValue={stat.home}
                        awayValue={stat.away}
                        homeTeam={homeTeam}
                        awayTeam={awayTeam}
                      />
                    ))}
                  </div>
                </div>
              )}
              
              {/* Events Tab */}
              {activeTab === 'events' && (
                <div className="space-y-1">
                  {details?.incidents && details.incidents.length > 0 ? (
                    details.incidents.map((incident, idx) => (
                      <IncidentItem 
                        key={idx} 
                        incident={incident} 
                        homeTeam={homeTeam}
                        awayTeam={awayTeam}
                      />
                    ))
                  ) : (
                    <div className="text-center py-8 text-[#A1A1AA]">
                      <Activity className="w-8 h-8 mx-auto mb-3 opacity-50" />
                      <p>Noch keine Ereignisse</p>
                    </div>
                  )}
                </div>
              )}
              
              {/* Lineups Tab */}
              {activeTab === 'lineups' && (
                <div className="grid grid-cols-2 gap-4">
                  {/* Home Team */}
                  <div>
                    <div className="flex items-center gap-2 mb-3 p-2 bg-white/5 rounded-lg">
                      <TeamBadge name={homeTeam} size="sm" />
                      <div>
                        <span className="text-white text-sm font-medium block">{homeTeam}</span>
                        {details?.lineups?.home?.formation && (
                          <span className="text-[#A1A1AA] text-xs">{details.lineups.home.formation}</span>
                        )}
                      </div>
                    </div>
                    {details?.lineups?.home?.players ? (
                      <div className="space-y-1">
                        {details.lineups.home.players.map((player, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm py-1">
                            <span className="w-6 text-center text-[#A1A1AA] font-mono text-xs">
                              {player.shirt_number || '-'}
                            </span>
                            <span className="text-white">{player.name}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[#A1A1AA] text-sm text-center py-4">
                        Aufstellung nicht verfügbar
                      </p>
                    )}
                  </div>
                  
                  {/* Away Team */}
                  <div>
                    <div className="flex items-center gap-2 mb-3 p-2 bg-white/5 rounded-lg">
                      <TeamBadge name={awayTeam} size="sm" />
                      <div>
                        <span className="text-white text-sm font-medium block">{awayTeam}</span>
                        {details?.lineups?.away?.formation && (
                          <span className="text-[#A1A1AA] text-xs">{details.lineups.away.formation}</span>
                        )}
                      </div>
                    </div>
                    {details?.lineups?.away?.players ? (
                      <div className="space-y-1">
                        {details.lineups.away.players.map((player, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm py-1">
                            <span className="w-6 text-center text-[#A1A1AA] font-mono text-xs">
                              {player.shirt_number || '-'}
                            </span>
                            <span className="text-white">{player.name}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[#A1A1AA] text-sm text-center py-4">
                        Aufstellung nicht verfügbar
                      </p>
                    )}
                  </div>
                </div>
              )}
              
              {/* No data fallback */}
              {activeTab === 'stats' && !details?.statistics && (
                <div className="text-center py-8 text-[#A1A1AA]">
                  <Target className="w-8 h-8 mx-auto mb-3 opacity-50" />
                  <p>Statistiken werden geladen oder sind noch nicht verfügbar</p>
                </div>
              )}
            </>
          )}
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-[#0a0a0a]">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#A1A1AA]">
              Daten von SofaScore
            </span>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-sm rounded-lg transition-colors"
            >
              Schließen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchDetailsModal;
