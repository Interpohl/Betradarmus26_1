/**
 * SignalCountdown - Urgency/FOMO Element
 * Zeigt Countdown bis zum nächsten Signal und aktive Signale
 */
import React, { useState, useEffect } from 'react';
import { Clock, Zap, TrendingUp, AlertCircle, ChevronRight } from 'lucide-react';

export const SignalCountdown = ({ onCtaClick }) => {
  const [countdown, setCountdown] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [activeSignals, setActiveSignals] = useState(3);
  const [pulseActive, setPulseActive] = useState(false);

  // Countdown Timer
  useEffect(() => {
    // Berechne Zeit bis zum nächsten Signal (simuliert: nächste volle Stunde + random)
    const calculateNextSignal = () => {
      const now = new Date();
      const randomMinutes = Math.floor(Math.random() * 45) + 15; // 15-60 Minuten
      const nextSignal = new Date(now.getTime() + randomMinutes * 60000);
      return nextSignal;
    };

    let nextSignalTime = calculateNextSignal();

    const timer = setInterval(() => {
      const now = new Date();
      const diff = nextSignalTime.getTime() - now.getTime();

      if (diff <= 0) {
        // Neues Signal "erscheint"
        setPulseActive(true);
        setActiveSignals(prev => Math.min(prev + 1, 5));
        nextSignalTime = calculateNextSignal();
        
        setTimeout(() => setPulseActive(false), 3000);
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setCountdown({ hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Simuliere aktive Signale die "ablaufen"
  useEffect(() => {
    const decayTimer = setInterval(() => {
      if (Math.random() > 0.7 && activeSignals > 1) {
        setActiveSignals(prev => Math.max(prev - 1, 1));
      }
    }, 30000); // Alle 30 Sekunden Chance auf Abnahme

    return () => clearInterval(decayTimer);
  }, [activeSignals]);

  const formatNumber = (num) => num.toString().padStart(2, '0');

  return (
    <div className="bg-gradient-to-r from-[#121212] to-[#1a1a1a] border-y border-white/10" data-testid="signal-countdown">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <div className="py-4 flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Active Signals - Left */}
          <div className={`flex items-center gap-3 ${pulseActive ? 'animate-pulse' : ''}`}>
            <div className={`relative flex items-center justify-center w-10 h-10 rounded-xl ${
              activeSignals >= 3 ? 'bg-[#39FF14]/20' : 'bg-[#FFD700]/20'
            }`}>
              <Zap className={`w-5 h-5 ${activeSignals >= 3 ? 'text-[#39FF14]' : 'text-[#FFD700]'}`} />
              {pulseActive && (
                <div className="absolute inset-0 rounded-xl bg-[#39FF14]/30 animate-ping" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-2xl font-bold font-mono ${
                  activeSignals >= 3 ? 'text-[#39FF14]' : 'text-[#FFD700]'
                }`}>
                  {activeSignals}
                </span>
                <span className="text-white font-medium">aktive Signale</span>
              </div>
              <div className="text-xs text-[#A1A1AA] flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-[#39FF14] rounded-full animate-pulse" />
                Jetzt verfügbar für PRO/ELITE
              </div>
            </div>
          </div>

          {/* Countdown - Center */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-[#A1A1AA]">
              <Clock className="w-4 h-4" />
              <span className="text-sm">Nächstes Signal in:</span>
            </div>
            <div className="flex items-center gap-1 font-mono">
              {countdown.hours > 0 && (
                <>
                  <div className="bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-2">
                    <span className="text-xl font-bold text-white">{formatNumber(countdown.hours)}</span>
                  </div>
                  <span className="text-[#39FF14] text-xl">:</span>
                </>
              )}
              <div className="bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-2">
                <span className="text-xl font-bold text-white">{formatNumber(countdown.minutes)}</span>
              </div>
              <span className="text-[#39FF14] text-xl">:</span>
              <div className="bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-2">
                <span className="text-xl font-bold text-[#39FF14]">{formatNumber(countdown.seconds)}</span>
              </div>
            </div>
          </div>

          {/* CTA - Right */}
          <button
            onClick={onCtaClick}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#39FF14] text-black font-bold rounded-lg hover:bg-[#2ebb11] hover:shadow-[0_0_20px_rgba(57,255,20,0.4)] transition-all group"
          >
            <span>Zugang sichern</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Urgency Bar */}
        {activeSignals >= 3 && (
          <div className="pb-3">
            <div className="flex items-center justify-center gap-2 text-xs">
              <AlertCircle className="w-3 h-3 text-[#FFD700]" />
              <span className="text-[#FFD700]">
                {activeSignals} Signale warten – Zeitfenster begrenzt
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SignalCountdown;
