import React, { useState, useEffect, useCallback } from 'react';
import { Activity, TrendingUp, RefreshCw, Zap, Globe, AlertCircle, Calendar } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Country flag emojis
const getCountryFlag = (country) => {
  const flags = {
    'Germany': '🇩🇪',
    'Deutschland': '🇩🇪',
    'England': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    'Spain': '🇪🇸',
    'Spanien': '🇪🇸',
    'Italy': '🇮🇹',
    'Italien': '🇮🇹',
    'France': '🇫🇷',
    'Frankreich': '🇫🇷',
    'Netherlands': '🇳🇱',
    'Portugal': '🇵🇹',
    'Turkey': '🇹🇷',
    'Türkei': '🇹🇷',
    'Belgium': '🇧🇪',
    'Belgien': '🇧🇪',
    'Austria': '🇦🇹',
    'Österreich': '🇦🇹',
    'Switzerland': '🇨🇭',
    'Schweiz': '🇨🇭',
    'Scotland': '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
    'USA': '🇺🇸',
    'Brazil': '🇧🇷',
    'Brasilien': '🇧🇷',
    'Argentina': '🇦🇷',
    'Argentinien': '🇦🇷',
    'Mexico': '🇲🇽',
    'Japan': '🇯🇵',
    'South Korea': '🇰🇷',
    'Korea': '🇰🇷',
    'Australia': '🇦🇺',
    'Saudi Arabia': '🇸🇦',
    'UAE': '🇦🇪',
    'Ghana': '🇬🇭',
    'Nigeria': '🇳🇬',
    'Egypt': '🇪🇬',
    'South Africa': '🇿🇦',
    'Morocco': '🇲🇦',
    'Tunisia': '🇹🇳',
    'Algeria': '🇩🇿',
    'Poland': '🇵🇱',
    'Polen': '🇵🇱',
    'Czech Republic': '🇨🇿',
    'Czechia': '🇨🇿',
    'Greece': '🇬🇷',
    'Griechenland': '🇬🇷',
    'Russia': '🇷🇺',
    'Ukraine': '🇺🇦',
    'Croatia': '🇭🇷',
    'Serbia': '🇷🇸',
    'Romania': '🇷🇴',
    'Denmark': '🇩🇰',
    'Dänemark': '🇩🇰',
    'Sweden': '🇸🇪',
    'Schweden': '🇸🇪',
    'Norway': '🇳🇴',
    'Norwegen': '🇳🇴',
    'Finland': '🇫🇮',
    'China': '🇨🇳',
    'India': '🇮🇳',
    'Indonesia': '🇮🇩',
    'Thailand': '🇹🇭',
    'Vietnam': '🇻🇳',
    'Malaysia': '🇲🇾',
    'Singapore': '🇸🇬',
    'Colombia': '🇨🇴',
    'Chile': '🇨🇱',
    'Peru': '🇵🇪',
    'Ecuador': '🇪🇨',
    'Uruguay': '🇺🇾',
    'Paraguay': '🇵🇾',
    'Bolivia': '🇧🇴',
    'Venezuela': '🇻🇪',
    'International': '🌍',
    'Europe': '🇪🇺',
    'World': '🌍',
    'default': '⚽'
  };
  
  if (!country) return flags.default;
  
  for (const [key, flag] of Object.entries(flags)) {
    if (country.toLowerCase().includes(key.toLowerCase())) {
      return flag;
    }
  }
  return flags.default;
};

const LiveMatchCard = ({ match }) => {
  // Parse minute - could be "45'", "HT", "Int.", "90+2", etc.
  const getStatusDisplay = () => {
    const minute = match.minute;
    const status = match.status;
    
    if (status === 'HT' || minute === 'HT' || minute === 'Int.') {
      return { text: 'HZ', isLive: true, isHalftime: true };
    }
    if (status === 'FT' || minute === 'FT') {
      return { text: 'Ende', isLive: false, isHalftime: false };
    }
    if (minute && minute !== '') {
      return { text: minute, isLive: true, isHalftime: false };
    }
    return { text: 'LIVE', isLive: true, isHalftime: false };
  };
  
  const statusDisplay = getStatusDisplay();
  
  return (
    <div className="bg-[#121212] border border-white/10 rounded-xl p-4 hover:border-[#39FF14]/30 transition-all group">
      {/* League & Status */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{getCountryFlag(match.country)}</span>
          <div className="flex flex-col">
            <span className="text-xs text-white font-medium">{match.league}</span>
            {match.country && match.country !== match.league && (
              <span className="text-[10px] text-[#A1A1AA]">{match.country}</span>
            )}
          </div>
        </div>
        {statusDisplay.isLive && (
          <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full ${
            statusDisplay.isHalftime 
              ? 'bg-[#FFD700]/20' 
              : 'bg-[#FF0040]/20'
          }`}>
            <div className={`w-1.5 h-1.5 rounded-full ${
              statusDisplay.isHalftime 
                ? 'bg-[#FFD700]' 
                : 'bg-[#FF0040] animate-pulse'
            }`} />
            <span className={`text-xs font-bold ${
              statusDisplay.isHalftime 
                ? 'text-[#FFD700]' 
                : 'text-[#FF0040]'
            }`}>{statusDisplay.text}</span>
          </div>
        )}
      </div>
      
      {/* Teams & Score */}
      <div className="space-y-2">
        {/* Home Team */}
        <div className="flex items-center justify-between">
          <span className="text-white text-sm font-medium truncate max-w-[140px]">
            {match.homeTeam}
          </span>
          <span className={`text-lg font-bold ${statusDisplay.isLive ? 'text-white' : 'text-[#A1A1AA]'}`}>
            {match.homeScore ?? '-'}
          </span>
        </div>
        
        {/* Away Team */}
        <div className="flex items-center justify-between">
          <span className="text-white text-sm font-medium truncate max-w-[140px]">
            {match.awayTeam}
          </span>
          <span className={`text-lg font-bold ${statusDisplay.isLive ? 'text-white' : 'text-[#A1A1AA]'}`}>
            {match.awayScore ?? '-'}
          </span>
        </div>
      </div>
    </div>
  );
};

export const LiveMatchesFeed = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchMatches = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setIsRefreshing(true);
    
    try {
      // Use the livescore.com API for real live matches
      const response = await axios.get(`${API}/livescore/live`);
      const liveMatches = response.data.live_matches || [];
      
      // Transform the data
      const transformed = liveMatches.map(match => ({
        id: match.id || Math.random(),
        league: match.league || match.tournament || 'International',
        country: match.country || '',
        homeTeam: match.home_team || 'Team A',
        awayTeam: match.away_team || 'Team B',
        homeScore: match.home_score ?? 0,
        awayScore: match.away_score ?? 0,
        minute: match.minute || '',
        status: match.status || 'LIVE',
        startTime: null
      }));
      
      setMatches(transformed.slice(0, 12)); // Show max 12 matches
      setLastUpdate(new Date());
      setError(null);
    } catch (err) {
      console.error('Failed to fetch live matches:', err);
      setError('Fehler beim Laden');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchMatches();
    
    // Refresh every 30 seconds
    const interval = setInterval(() => fetchMatches(), 30000);
    
    return () => clearInterval(interval);
  }, [fetchMatches]);

  const liveCount = matches.filter(m => m.status === 'LIVE' || m.minute > 0).length;

  return (
    <section className="py-16 md:py-24 relative overflow-hidden bg-[#0a0a0a]" data-testid="live-matches-feed">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#39FF14]/5 via-transparent to-transparent" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-[#FF0040]/20 border border-[#FF0040]/30 rounded-full">
                <div className="w-2 h-2 bg-[#FF0040] rounded-full animate-pulse" />
                <span className="text-[#FF0040] text-sm font-bold uppercase tracking-wider">Live</span>
              </div>
              {liveCount > 0 && (
                <span className="text-[#A1A1AA] text-sm">
                  {liveCount} {liveCount === 1 ? 'Spiel' : 'Spiele'} aktiv
                </span>
              )}
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white">
              Aktuelle Live-Spiele
            </h2>
            <p className="text-[#A1A1AA] text-sm mt-1">
              Echtzeit-Daten aus den Top-Ligen weltweit
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {lastUpdate && (
              <span className="text-[#A1A1AA] text-xs">
                Aktualisiert: {lastUpdate.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
            <button
              onClick={() => fetchMatches(true)}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 text-[#39FF14] ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="text-white text-sm">Aktualisieren</span>
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex items-center gap-3">
              <RefreshCw className="w-6 h-6 text-[#39FF14] animate-spin" />
              <span className="text-[#A1A1AA]">Lade Live-Spiele...</span>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex items-center gap-3 text-[#A1A1AA]">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
              <button
                onClick={() => fetchMatches()}
                className="text-[#39FF14] hover:underline ml-2"
              >
                Erneut versuchen
              </button>
            </div>
          </div>
        ) : matches.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Calendar className="w-12 h-12 text-[#A1A1AA]/50 mb-4" />
            <p className="text-white font-medium mb-2">Aktuell keine Live-Spiele</p>
            <p className="text-[#A1A1AA] text-sm max-w-md">
              Die meisten Spiele finden nachmittags und abends statt. 
              Schau später nochmal vorbei oder aktiviere Benachrichtigungen!
            </p>
            <button
              onClick={() => fetchMatches(true)}
              className="mt-4 flex items-center gap-2 px-4 py-2 bg-[#39FF14]/10 border border-[#39FF14]/30 rounded-lg text-[#39FF14] hover:bg-[#39FF14]/20 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Jetzt aktualisieren</span>
            </button>
          </div>
        ) : (
          <>
            {/* Matches Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {matches.map((match) => (
                <LiveMatchCard key={match.id} match={match} />
              ))}
            </div>
            
            {/* Info Banner */}
            <div className="mt-8 p-4 bg-[#121212] border border-white/10 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#39FF14]/10 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-[#39FF14]" />
                </div>
                <div>
                  <p className="text-white font-medium">Betradarmus analysiert diese Spiele in Echtzeit</p>
                  <p className="text-[#A1A1AA] text-sm">Erhalte Signale basierend auf Live-Marktdaten</p>
                </div>
              </div>
              <a
                href="#pricing"
                className="px-4 py-2 bg-[#39FF14] text-black font-bold text-sm rounded-lg hover:bg-[#39FF14]/90 transition-colors whitespace-nowrap"
              >
                Signale aktivieren
              </a>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default LiveMatchesFeed;
