import React from 'react';
import { Shield, X, Check, Database } from 'lucide-react';

export const TrustSection = () => {
  const noItems = [
    'keine Wetten',
    'keine Garantien',
    'keine "sicheren Tipps"'
  ];

  const yesItems = [
    'strukturierte Marktanalyse',
    'nachvollziehbare Bewertungen',
    'transparente Entscheidungsgrundlagen'
  ];

  return (
    <section className="py-20 md:py-32 relative overflow-hidden bg-[#0a0a0a]" data-testid="trust-section">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#39FF14]/5 to-transparent" />
      
      <div className="relative z-10 max-w-4xl mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#39FF14]/10 border border-[#39FF14]/20 rounded-full mb-6">
            <Shield className="w-4 h-4 text-[#39FF14]" />
            <span className="font-mono text-sm text-[#39FF14] uppercase tracking-wider">Transparent</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            Keine Tipps. <span className="text-[#39FF14]">Keine Versprechen.</span>
          </h2>
          
          <p className="text-lg text-[#A1A1AA] max-w-2xl mx-auto">
            Betradarmus ist eine datenbasierte Analyseplattform.
          </p>
        </div>
        
        {/* Two Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {/* What we don't do */}
          <div className="bg-[#121212] border border-[#FF0040]/20 rounded-2xl p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-[#FF0040]/10 rounded-lg flex items-center justify-center">
                <X className="w-5 h-5 text-[#FF0040]" />
              </div>
              <h3 className="text-lg font-bold text-[#FF0040]">Was wir nicht tun</h3>
            </div>
            <ul className="space-y-3">
              {noItems.map((item, index) => (
                <li key={index} className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-[#FF0040]/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <X className="w-3 h-3 text-[#FF0040]" />
                  </div>
                  <span className="text-white/80 text-base">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* What we do */}
          <div className="bg-[#121212] border border-[#39FF14]/20 rounded-2xl p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-[#39FF14]/10 rounded-lg flex items-center justify-center">
                <Database className="w-5 h-5 text-[#39FF14]" />
              </div>
              <h3 className="text-lg font-bold text-[#39FF14]">Stattdessen</h3>
            </div>
            <ul className="space-y-3">
              {yesItems.map((item, index) => (
                <li key={index} className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-[#39FF14]/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-[#39FF14]" />
                  </div>
                  <span className="text-white text-base">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Bottom Statement */}
        <div className="text-center">
          <div className="inline-block px-8 py-4 bg-[#121212] border border-white/10 rounded-xl">
            <p className="text-white text-lg font-medium">
              Du entscheidest – <span className="text-[#00C2FF]">basierend auf Daten, nicht auf Meinungen.</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustSection;
