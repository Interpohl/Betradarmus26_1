import React, { useState, useEffect } from 'react';
import { Users, Clock, Zap } from 'lucide-react';

export const LiveCounter = () => {
  const [usersOnline, setUsersOnline] = useState(127);
  const [nextSignal, setNextSignal] = useState(180); // seconds
  const [signalsToday, setSignalsToday] = useState(23);

  // Simulate users online fluctuation
  useEffect(() => {
    const interval = setInterval(() => {
      setUsersOnline(prev => {
        const change = Math.floor(Math.random() * 7) - 3; // -3 to +3
        const newValue = prev + change;
        return Math.max(85, Math.min(200, newValue)); // Keep between 85-200
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Countdown for next signal
  useEffect(() => {
    const interval = setInterval(() => {
      setNextSignal(prev => {
        if (prev <= 1) {
          // Reset countdown and increment signals
          setSignalsToday(s => s + 1);
          return Math.floor(Math.random() * 180) + 120; // 2-5 minutes
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 py-4 px-4 bg-[#121212]/80 border-y border-white/5" data-testid="live-counter">
      {/* Users Online */}
      <div className="flex items-center gap-2">
        <div className="relative">
          <Users className="w-4 h-4 text-[#39FF14]" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#39FF14] rounded-full animate-pulse" />
        </div>
        <span className="text-white font-mono text-sm">
          <span className="text-[#39FF14] font-bold">{usersOnline}</span>
          {' '}Nutzer online
        </span>
      </div>

      {/* Divider */}
      <div className="hidden md:block w-px h-6 bg-white/10" />

      {/* Next Signal Countdown */}
      <div className="flex items-center gap-2">
        <Clock className="w-4 h-4 text-[#00C2FF]" />
        <span className="text-white font-mono text-sm">
          Nächstes Signal in{' '}
          <span className="text-[#00C2FF] font-bold">{formatTime(nextSignal)}</span>
        </span>
      </div>

      {/* Divider */}
      <div className="hidden md:block w-px h-6 bg-white/10" />

      {/* Signals Today */}
      <div className="flex items-center gap-2">
        <Zap className="w-4 h-4 text-[#FFD700]" />
        <span className="text-white font-mono text-sm">
          <span className="text-[#FFD700] font-bold">{signalsToday}</span>
          {' '}Signale heute
        </span>
      </div>
    </div>
  );
};

export default LiveCounter;
