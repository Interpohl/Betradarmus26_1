import React from 'react';
import { Quote, TrendingUp } from 'lucide-react';

export const KostolanyQuote = () => {
  return (
    <section className="py-12 md:py-16 bg-gradient-to-b from-[#0a0a0a] to-[#121212] relative overflow-hidden" data-testid="kostolany-quote">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-[#FFD700] rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-[#39FF14] rounded-full blur-3xl" />
      </div>
      
      <div className="max-w-4xl mx-auto px-4 md:px-8 relative z-10">
        <div className="text-center">
          {/* Quote Icon */}
          <div className="inline-flex items-center justify-center w-12 h-12 bg-[#FFD700]/10 border border-[#FFD700]/20 rounded-full mb-6">
            <Quote className="w-5 h-5 text-[#FFD700]" />
          </div>
          
          {/* Original Quote */}
          <blockquote className="mb-6">
            <p className="text-xl md:text-2xl lg:text-3xl text-[#A1A1AA] italic leading-relaxed mb-4">
              „Wenn man an der Börse zu <span className="text-white font-semibold">51%</span> richtig liegt, 
              reicht das völlig aus, um reich zu werden."
            </p>
            <footer className="text-[#FFD700] font-medium">
              — André Kostolany
            </footer>
          </blockquote>
          
          {/* Divider */}
          <div className="flex items-center justify-center gap-4 my-8">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-[#39FF14]/50" />
            <TrendingUp className="w-5 h-5 text-[#39FF14]" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-[#39FF14]/50" />
          </div>
          
          {/* Our Statement */}
          <div className="bg-[#39FF14]/5 border border-[#39FF14]/20 rounded-xl p-6 md:p-8 inline-block">
            <p className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2">
              Wir liefern <span className="text-[#39FF14]">71%</span>.
            </p>
            <p className="text-[#A1A1AA] text-sm md:text-base">
              Verifiziert. Transparent. Nachweisbar.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default KostolanyQuote;
