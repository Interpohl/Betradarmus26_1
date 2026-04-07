import React from 'react';
import { Check, X, BarChart3 } from 'lucide-react';

export const SignalComparisonTable = () => {
  const features = [
    { name: 'Signal-Erkennung', typical: true, betradarmus: true },
    { name: 'Timing-Bewertung', typical: false, betradarmus: true },
    { name: 'Execution Score', typical: false, betradarmus: true },
    { name: 'Signal-Lebensdauer', typical: false, betradarmus: true },
    { name: 'Risikoanalyse', typical: false, betradarmus: true },
    { name: 'Erklärbarkeit', typical: false, betradarmus: true },
    { name: 'Marktverständnis', typical: 'begrenzt', betradarmus: 'hoch' }
  ];

  const renderCheck = (value) => {
    if (value === true) {
      return (
        <div className="flex items-center justify-center">
          <div className="w-6 h-6 bg-[#39FF14]/20 rounded-full flex items-center justify-center">
            <Check className="w-4 h-4 text-[#39FF14]" />
          </div>
        </div>
      );
    }
    if (value === false) {
      return (
        <div className="flex items-center justify-center">
          <div className="w-6 h-6 bg-[#FF0040]/20 rounded-full flex items-center justify-center">
            <X className="w-4 h-4 text-[#FF0040]" />
          </div>
        </div>
      );
    }
    return (
      <span className={`text-sm font-medium ${value === 'hoch' ? 'text-[#39FF14]' : 'text-[#A1A1AA]'}`}>
        {value}
      </span>
    );
  };

  return (
    <section className="py-20 md:py-32 relative overflow-hidden bg-[#0a0a0a]" data-testid="signal-comparison-table-section">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#00C2FF]/5 to-transparent" />
      
      <div className="relative z-10 max-w-5xl mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#00C2FF]/10 border border-[#00C2FF]/20 rounded-full mb-6">
            <BarChart3 className="w-4 h-4 text-[#00C2FF]" />
            <span className="font-mono text-sm text-[#00C2FF] uppercase tracking-wider">Vergleich</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            Signal oder <span className="text-[#39FF14]">Entscheidung</span>?
          </h2>
        </div>
        
        {/* Comparison Table */}
        <div className="bg-[#121212] border border-white/10 rounded-2xl overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-3 gap-4 p-4 md:p-6 border-b border-white/10 bg-white/5">
            <div className="text-left">
              <span className="text-[#A1A1AA] text-sm font-medium uppercase tracking-wider">Feature</span>
            </div>
            <div className="text-center">
              <span className="text-[#A1A1AA] text-sm font-medium">Typische Anbieter</span>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#39FF14]/10 border border-[#39FF14]/30 rounded-full">
                <span className="text-[#39FF14] text-sm font-bold">Betradarmus</span>
              </div>
            </div>
          </div>
          
          {/* Table Body */}
          <div className="divide-y divide-white/5">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="grid grid-cols-3 gap-4 p-4 md:p-6 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center">
                  <span className="text-white text-sm md:text-base font-medium">{feature.name}</span>
                </div>
                <div className="flex items-center justify-center">
                  {renderCheck(feature.typical)}
                </div>
                <div className="flex items-center justify-center">
                  {renderCheck(feature.betradarmus)}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Microcopy */}
        <div className="text-center mt-8">
          <p className="text-[#A1A1AA] text-base">
            Die meisten Systeme zeigen dir, was passiert ist.
          </p>
          <p className="text-white font-medium text-lg mt-1">
            Betradarmus zeigt dir, <span className="text-[#39FF14]">was jetzt sinnvoll ist.</span>
          </p>
        </div>
      </div>
    </section>
  );
};

export default SignalComparisonTable;
