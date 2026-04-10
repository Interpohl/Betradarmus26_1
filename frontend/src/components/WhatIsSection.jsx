/**
 * WhatIsSection - Klar und transparent erklären, worum es bei BETRADARMUS geht
 */
import React from 'react';
import { Target, TrendingUp, Clock, Shield, Brain, Zap } from 'lucide-react';

export const WhatIsSection = () => {
  return (
    <section className="py-16 md:py-20 bg-[#0a0a0a] relative" data-testid="what-is-section">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        {/* Main Intro */}
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-6">
            Was ist BETRADARMUS?
          </h2>
          <p className="text-lg md:text-xl text-[#A1A1AA] max-w-3xl mx-auto leading-relaxed">
            <span className="text-white font-semibold">BETRADARMUS</span> ist eine KI-gestützte Plattform, 
            die Fußballmärkte in <span className="text-[#39FF14]">Echtzeit</span> analysiert und dir mitteilt, 
            <span className="text-white"> wann ein Tipp spielbar ist</span> – und wann nicht.
          </p>
        </div>

        {/* 3 Key Points */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Point 1 */}
          <div className="p-6 bg-[#121212] border border-white/10 rounded-xl hover:border-[#39FF14]/30 transition-all group">
            <div className="w-12 h-12 bg-[#39FF14]/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#39FF14]/20 transition-colors">
              <Brain className="w-6 h-6 text-[#39FF14]" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">KI-Analyse</h3>
            <p className="text-[#A1A1AA] text-sm leading-relaxed">
              Unsere KI analysiert Quoten, Marktbewegungen und historische Daten aus über 50+ Ligen weltweit.
            </p>
          </div>

          {/* Point 2 */}
          <div className="p-6 bg-[#121212] border border-white/10 rounded-xl hover:border-[#00C2FF]/30 transition-all group">
            <div className="w-12 h-12 bg-[#00C2FF]/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#00C2FF]/20 transition-colors">
              <Target className="w-6 h-6 text-[#00C2FF]" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Klare Signale</h3>
            <p className="text-[#A1A1AA] text-sm leading-relaxed">
              Du erhältst konkrete Signale mit Confidence-Score, Risk-Level und Zeitfenster – keine vagen Tipps.
            </p>
          </div>

          {/* Point 3 */}
          <div className="p-6 bg-[#121212] border border-white/10 rounded-xl hover:border-[#FFD700]/30 transition-all group">
            <div className="w-12 h-12 bg-[#FFD700]/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#FFD700]/20 transition-colors">
              <Clock className="w-6 h-6 text-[#FFD700]" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Echtzeit-Updates</h3>
            <p className="text-[#A1A1AA] text-sm leading-relaxed">
              Signale werden live über Telegram und Web gesendet – du verpasst keine Gelegenheit.
            </p>
          </div>
        </div>

        {/* Transparency Box */}
        <div className="p-6 md:p-8 bg-gradient-to-r from-[#39FF14]/5 to-[#00C2FF]/5 border border-white/10 rounded-xl">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="w-16 h-16 bg-[#39FF14]/10 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Shield className="w-8 h-8 text-[#39FF14]" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-white mb-2">100% Transparenz</h3>
              <p className="text-[#A1A1AA] leading-relaxed">
                Alle unsere Tipps werden öffentlich dokumentiert und ausgewertet. 
                Du kannst unsere <span className="text-white">Trefferquote</span>, 
                <span className="text-white"> Gewinn/Verlust-Bilanz</span> und 
                <span className="text-white"> historische Performance</span> jederzeit einsehen.
                Keine versteckten Statistiken, keine geschönten Zahlen.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Facts */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          {[
            { value: "50+", label: "Ligen", icon: TrendingUp },
            { value: "24/7", label: "Live-Analyse", icon: Clock },
            { value: "81%", label: "Avg. Confidence", icon: Target },
            { value: "~50s", label: "Signal-Fenster", icon: Zap }
          ].map((stat, index) => (
            <div 
              key={index}
              className="p-4 bg-[#121212]/50 border border-white/5 rounded-xl text-center"
            >
              <stat.icon className="w-5 h-5 text-[#39FF14] mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-xs text-[#A1A1AA] uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhatIsSection;
