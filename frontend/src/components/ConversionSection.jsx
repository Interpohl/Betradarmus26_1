import React from 'react';
import { Zap, MessageCircle, ArrowRight, CheckCircle } from 'lucide-react';

export const ConversionSection = ({ onGetStarted }) => {
  return (
    <section className="py-20 md:py-32 relative overflow-hidden" data-testid="conversion-section">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#39FF14]/5 to-transparent" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#39FF14]/10 rounded-full blur-3xl" />
      
      <div className="relative z-10 max-w-4xl mx-auto px-4 md:px-8 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#39FF14]/10 border border-[#39FF14]/20 rounded-full mb-8">
          <Zap className="w-4 h-4 text-[#39FF14]" />
          <span className="font-mono text-sm text-[#39FF14] uppercase tracking-wider">Start Now</span>
        </div>
        
        {/* Headline */}
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
          Vom Signal zum<br />
          <span className="text-[#39FF14]">richtigen Moment</span>
        </h2>
        
        {/* Description */}
        <p className="text-lg md:text-xl text-[#A1A1AA] mb-10 max-w-2xl mx-auto leading-relaxed">
          Betradarmus will nicht möglichst viele Hinweise senden, sondern die 
          <span className="text-white"> Qualität und Umsetzbarkeit</span> eines Signals 
          im richtigen Moment sichtbar machen.
        </p>
        
        {/* Trust points */}
        <div className="flex flex-wrap justify-center gap-6 mb-10">
          <div className="flex items-center gap-2 text-sm text-[#A1A1AA]">
            <CheckCircle className="w-4 h-4 text-[#39FF14]" />
            <span>Kostenloser Einstieg</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-[#A1A1AA]">
            <CheckCircle className="w-4 h-4 text-[#39FF14]" />
            <span>Keine Kreditkarte</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-[#A1A1AA]">
            <CheckCircle className="w-4 h-4 text-[#39FF14]" />
            <span>Sofort starten</span>
          </div>
        </div>
        
        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onGetStarted}
            className="group flex items-center justify-center gap-3 px-8 py-4 bg-[#39FF14] hover:bg-[#39FF14]/90 text-black font-bold rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-[#39FF14]/25 w-full sm:w-auto"
          >
            <Zap className="w-5 h-5" />
            <span>Jetzt kostenlos starten</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          
          <a
            href="https://t.me/betradarmus_bot"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-center gap-3 px-8 py-4 bg-transparent border-2 border-[#0088cc] hover:bg-[#0088cc]/10 text-[#0088cc] font-bold rounded-xl transition-all duration-300 w-full sm:w-auto"
          >
            <MessageCircle className="w-5 h-5" />
            <span>@betradarmus_bot</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
        
        {/* Bottom note */}
        <p className="mt-8 text-xs text-[#666]">
          Betradarmus ist eine datenbasierte Analyse-Plattform. Keine Wettempfehlung.
        </p>
      </div>
    </section>
  );
};

export default ConversionSection;
