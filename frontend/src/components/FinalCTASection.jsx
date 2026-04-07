import React from 'react';
import { Zap, MessageCircle, ArrowRight, Clock } from 'lucide-react';

export const FinalCTASection = ({ onGetStarted }) => {
  return (
    <section className="py-20 md:py-32 relative overflow-hidden" data-testid="final-cta-section">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-[#39FF14]/10 to-[#0a0a0a]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#39FF14]/10 rounded-full blur-[100px]" />
      
      {/* Animated Border */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#39FF14]/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#39FF14]/50 to-transparent" />
      </div>
      
      <div className="relative z-10 max-w-4xl mx-auto px-4 md:px-8 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#39FF14]/10 border border-[#39FF14]/20 rounded-full mb-8 animate-pulse">
          <Clock className="w-4 h-4 text-[#39FF14]" />
          <span className="font-mono text-sm text-[#39FF14] uppercase tracking-wider">Jetzt starten</span>
        </div>
        
        {/* Headline */}
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
          Der Unterschied liegt<br />
          <span className="text-[#39FF14]">im Moment.</span>
        </h2>
        
        {/* Description */}
        <div className="max-w-2xl mx-auto mb-10">
          <p className="text-lg text-[#A1A1AA] mb-4">
            Nicht jedes Signal ist wertvoll.
          </p>
          <p className="text-xl text-white font-medium">
            Nur das richtige Signal zur richtigen Zeit.
          </p>
          <p className="text-lg text-[#00C2FF] mt-4">
            Betradarmus hilft dir, genau diesen Moment zu erkennen.
          </p>
        </div>
        
        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
          <button
            onClick={onGetStarted}
            className="group relative flex items-center justify-center gap-3 px-10 py-5 bg-[#39FF14] hover:bg-[#39FF14]/90 text-black font-bold text-lg rounded-xl transition-all duration-300 hover:shadow-[0_0_40px_rgba(57,255,20,0.4)] w-full sm:w-auto overflow-hidden"
            data-testid="final-cta-start-btn"
          >
            {/* Shine effect */}
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
            <Zap className="w-6 h-6" />
            <span>Jetzt starten</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          
          <a
            href="https://t.me/betradarmus_bot"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-center gap-3 px-10 py-5 bg-transparent border-2 border-[#0088cc] hover:bg-[#0088cc]/10 text-[#0088cc] font-bold text-lg rounded-xl transition-all duration-300 w-full sm:w-auto"
            data-testid="final-cta-telegram-btn"
          >
            <MessageCircle className="w-6 h-6" />
            <span>Live-Bot aktivieren</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
        
        {/* Microcopy */}
        <p className="text-[#39FF14] font-mono text-sm tracking-wider">
          Sekunden entscheiden über den Unterschied.
        </p>
      </div>
    </section>
  );
};

export default FinalCTASection;
