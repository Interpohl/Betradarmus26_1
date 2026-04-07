import React, { useState, useEffect, useCallback } from 'react';
import { Activity, Clock, TrendingUp, RefreshCw, Zap, Globe, AlertCircle } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// League flag emojis
const getLeagueFlag = (league) => {
  const flags = {
    'Bundesliga': '🇩🇪',
    'Premier League': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    'La Liga': '🇪🇸',
    'Serie A': '🇮🇹',
    'Ligue 1': '🇫🇷',
    'Champions League': '🏆',
    'Europa League': '🏆',
    'Conference League': '🏆',
    'DFB-Pokal': '🇩🇪',
    'FA Cup': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    'Copa del Rey': '🇪🇸',
    'Coppa Italia': '🇮🇹',
    'Coupe de France': '🇫🇷',
    'Eredivisie': '🇳🇱',
    'Primeira Liga': '🇵🇹',
    'Super Lig': '🇹🇷',
    'MLS': '🇺🇸',
    'default': '⚽'
  };
  
  for (const [key, flag] of Object.entries(flags)) {
    if (league?.toLowerCase().includes(key.toLowerCase())) {
      return flag;
    }
  }
  return flags.default;
};

const LiveMatchCard = ({ match }) => {
  const statusText = match.status === 'LIVE' ? `${match.minute}'` : match.status;
  const isLive = match.status === 'LIVE' || match.minute > 0;
  
  return (
    <div className="bg-[#121212] border border-white/10 rounded-xl p-4 hover:border-[#39FF14]/30 transition-all group">
      {/* League & Status */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{getLeagueFlag(match.league)}</span>
          <span className="text-xs text-[#A1A1AA] font-medium">{match.league}</span>
        </div>
        {isLive && (
          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-[#FF0040]/20 rounded-full">
            <div className="w-1.5 h-1.5 bg-[#FF0040] rounded-full animate-pulse" />
            <span className="text-[#FF0040] text-xs font-bold">{statusText}</span>
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
          <span className={`text-lg font-bold ${isLive ? 'text-white' : 'text-[#A1A1AA]'}`}>
            {match.homeScore ?? '-'}
          </span>
        </div>
        
        {/* Away Team */}
        <div className="flex items-center justify-between">
          <span className="text-white text-sm font-medium truncate max-w-[140px]">
            {match.awayTeam}
          </span>
          <span className={`text-lg font-bold ${isLive ? 'text-white' : 'text-[#A1A1AA]'}`}>
            {match.awayScore ?? '-'}
          </span>
        </div>
      </div>
      
      {/* Match Info */}
      {match.startTime && (
        <div className="mt-3 pt-3 border-t border-white/5">
          <div className="flex items-center gap-1.5 text-[#A1A1AA] text-xs">
            <Clock className="w-3 h-3" />
            <span>{match.startTime}</span>
          </div>
        </div>
      )}
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
      const response = await axios.get(`${API}/live/matches`);
      const events = response.data.events || [];
      
      // Transform and sort - live matches first
      const transformed = events.map(event => {
        // Handle both object and string formats for league/tournament
        let league = 'International';
        if (typeof event.tournament === 'string') {
          league = event.tournament;
        } else if (event.tournament?.name) {
          league = event.tournament.name;
        } else if (event.league) {
          league = event.league;
        } else if (event.competition) {
          league = event.competition;
        }
        
        // Parse minute from string like "29'" or number
        let minute = 0;
        if (typeof event.minute === 'string') {
          minute = parseInt(event.minute.replace("'", "")) || 0;
        } else if (typeof event.minute === 'number') {
          minute = event.minute;
        }
        
        return {
          id: event.id || Math.random(),
          league,
          homeTeam: event.homeTeam?.name || event.homeTeam?.shortName || event.home_team || 'Team A',
          awayTeam: event.awayTeam?.name || event.awayTeam?.shortName || event.away_team || 'Team B',
          homeScore: event.homeScore?.current ?? event.homeScore?.display ?? event.home_score ?? 0,
          awayScore: event.awayScore?.current ?? event.awayScore?.display ?? event.away_score ?? 0,
          minute,
          status: event.status?.type === 'inprogress' || event.status === 'Live' || event.status === 'LIVE' ? 'LIVE' : (event.status?.description || event.status || 'LIVE'),
          startTime: event.start_timestamp || event.startTimestamp 
            ? new Date((event.start_timestamp || event.startTimestamp) * 1000).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
            : null
        };
      });
      
      // Sort: Live matches first, then by minute
      transformed.sort((a, b) => {
        if (a.status === 'LIVE' && b.status !== 'LIVE') return -1;
        if (a.status !== 'LIVE' && b.status === 'LIVE') return 1;
        return (b.minute || 0) - (a.minute || 0);
      });
      
      setMatches(transformed.slice(0, 8)); // Show max 8 matches
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
            <Globe className="w-12 h-12 text-[#A1A1AA]/50 mb-4" />
            <p className="text-[#A1A1AA]">Aktuell keine Live-Spiele verfügbar</p>
            <p className="text-[#A1A1AA]/70 text-sm mt-1">Schau später nochmal vorbei!</p>
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
