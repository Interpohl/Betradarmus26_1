import React, { useState, useEffect } from 'react';
import { MessageCircle, Send, CheckCheck, Zap, TrendingUp, Shield } from 'lucide-react';

export const TelegramPreview = () => {
  const [currentSignal, setCurrentSignal] = useState(0);
  
  const signals = [
    {
      match: 'Bayern München vs Dortmund',
      league: 'Bundesliga',
      market: 'Over 2.5 Goals',
      confidence: 82,
      risk: 25,
      time: '14:32'
    },
    {
      match: 'Liverpool vs Arsenal',
      league: 'Premier League',
      market: 'Both Teams to Score',
      confidence: 78,
      risk: 35,
      time: '15:45'
    },
    {
      match: 'Real Madrid vs Barcelona',
      league: 'La Liga',
      market: 'Over 1.5 Goals 1st Half',
      confidence: 75,
      risk: 42,
      time: '16:18'
    }
  ];

  // Rotate signals
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSignal(prev => (prev + 1) % signals.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const signal = signals[currentSignal];

  const getConfidenceColor = (conf) => {
    if (conf >= 80) return 'text-[#39FF14]';
    if (conf >= 70) return 'text-[#FFD700]';
    return 'text-[#FF6B00]';
  };

  const getRiskColor = (risk) => {
    if (risk <= 30) return 'text-[#39FF14]';
    if (risk <= 50) return 'text-[#FFD700]';
    return 'text-[#FF3B30]';
  };

  return (
    <section className="py-16 md:py-24 bg-[#121212]/50 relative overflow-hidden" data-testid="telegram-preview-section">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left: Text */}
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#0088CC]/10 border border-[#0088CC]/20 rounded-full mb-6">
              <MessageCircle className="w-4 h-4 text-[#0088CC]" />
              <span className="text-[#0088CC] text-sm font-medium">Live auf Telegram</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
              Signale direkt aufs Handy
            </h2>
            <p className="text-[#A1A1AA] mb-6">
              Erhalte KI-generierte Signale in Echtzeit über unseren Telegram Bot. 
              Keine App nötig, keine Verzögerung.
            </p>
            
            <ul className="space-y-3 mb-8">
              {[
                { icon: Zap, text: 'Sofortige Push-Benachrichtigungen' },
                { icon: TrendingUp, text: 'Confidence & Risk Score pro Signal' },
                { icon: Shield, text: 'Persönliche Liga-Filter' }
              ].map((item, index) => (
                <li key={index} className="flex items-center gap-3">
                  <item.icon className="w-5 h-5 text-[#39FF14]" />
                  <span className="text-white">{item.text}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="https://t.me/+Pb8X_nXzKu41N2Yy"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 h-12 px-6 bg-[#0088CC] text-white font-bold rounded-lg hover:bg-[#0099DD] transition-colors"
                data-testid="telegram-community-btn"
              >
                <MessageCircle className="w-5 h-5" />
                Community beitreten
              </a>
              <a
                href="https://t.me/Betradarmus_bot"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 h-12 px-6 bg-white/10 text-white font-bold rounded-lg hover:bg-white/20 transition-colors border border-white/20"
                data-testid="telegram-bot-btn"
              >
                Bot starten
              </a>
            </div>
          </div>

          {/* Right: Phone Mockup with Signal */}
          <div className="relative flex justify-center">
            {/* Phone Frame */}
            <div className="relative w-[300px] md:w-[340px]">
              {/* Phone body */}
              <div className="bg-[#1a1a1a] rounded-[40px] p-3 shadow-2xl border border-white/10">
                {/* Screen */}
                <div className="bg-[#0e0e0e] rounded-[32px] overflow-hidden">
                  {/* Status bar */}
                  <div className="bg-[#0e0e0e] px-6 py-2 flex items-center justify-between text-white/60 text-xs">
                    <span>9:41</span>
                    <div className="flex items-center gap-1">
                      <div className="w-4 h-2 border border-white/60 rounded-sm">
                        <div className="w-3 h-full bg-[#39FF14] rounded-sm" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Telegram Header */}
                  <div className="bg-[#1c2733] px-4 py-3 flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#39FF14] rounded-full flex items-center justify-center">
                      <span className="text-black font-bold text-sm">B</span>
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">BETRADARMUS Bot</p>
                      <p className="text-[#0088CC] text-xs">online</p>
                    </div>
                  </div>

                  {/* Chat area */}
                  <div className="bg-[#0e1621] p-4 min-h-[320px]">
                    {/* Signal Message */}
                    <div className="bg-[#182533] rounded-xl p-4 max-w-[260px] animate-fade-in-up">
                      <div className="flex items-center gap-2 mb-3">
                        <Zap className="w-4 h-4 text-[#FFD700]" />
                        <span className="text-[#FFD700] font-bold text-xs uppercase">Live Signal</span>
                      </div>
                      
                      <p className="text-white font-semibold text-sm mb-1">{signal.match}</p>
                      <p className="text-[#A1A1AA] text-xs mb-3">{signal.league}</p>
                      
                      <div className="bg-[#0e1621] rounded-lg p-3 mb-3">
                        <p className="text-[#00C2FF] font-bold text-sm">{signal.market}</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div>
                          <p className="text-[#A1A1AA] text-xs mb-1">Confidence</p>
                          <p className={`font-bold ${getConfidenceColor(signal.confidence)}`}>
                            {signal.confidence}%
                          </p>
                        </div>
                        <div>
                          <p className="text-[#A1A1AA] text-xs mb-1">Risk Score</p>
                          <p className={`font-bold ${getRiskColor(signal.risk)}`}>
                            {signal.risk}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-[#A1A1AA]">
                        <span>{signal.time}</span>
                        <CheckCheck className="w-4 h-4 text-[#0088CC]" />
                      </div>
                    </div>

                    {/* Signal indicators */}
                    <div className="flex justify-center gap-2 mt-4">
                      {signals.map((_, index) => (
                        <div
                          key={index}
                          className={`w-2 h-2 rounded-full transition-all ${
                            index === currentSignal ? 'bg-[#39FF14] w-4' : 'bg-white/20'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Input bar */}
                  <div className="bg-[#1c2733] px-4 py-3 flex items-center gap-3">
                    <div className="flex-1 bg-[#0e1621] rounded-full px-4 py-2">
                      <span className="text-[#A1A1AA] text-sm">/subscribe</span>
                    </div>
                    <div className="w-10 h-10 bg-[#0088CC] rounded-full flex items-center justify-center">
                      <Send className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Glow effect */}
              <div className="absolute -inset-4 bg-[#0088CC]/20 blur-3xl -z-10 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TelegramPreview;
