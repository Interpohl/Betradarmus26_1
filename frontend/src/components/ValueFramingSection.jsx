import React from 'react';
import { Clock, Activity, Shield, Zap, Target } from 'lucide-react';

export const ValueFramingSection = () => {
  const bulletPoints = [
    { icon: Target, text: 'Ist das Signal noch ausführbar?' },
    { icon: Clock, text: 'Wie lange bleibt das Fenster offen?' },
    { icon: Shield, text: 'Wie stabil ist die Situation?' },
    { icon: Activity, text: 'Wie schnell reagiert der Markt?' }
  ];

  return (
    <section className="py-20 md:py-32 relative overflow-hidden" data-testid="value-framing-section">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-[#39FF14]/5 to-[#0a0a0a]" />
      
      <div className="relative z-10 max-w-4xl mx-auto px-4 md:px-8 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#00C2FF]/10 border border-[#00C2FF]/20 rounded-full mb-8">
          <Zap className="w-4 h-4 text-[#00C2FF]" />
          <span className="font-mono text-sm text-[#00C2FF] uppercase tracking-wider">Der Unterschied</span>
        </div>
        
        {/* Headline */}
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
          Der Unterschied liegt nicht im Signal.<br />
          <span className="text-[#39FF14]">Sondern im Moment.</span>
        </h2>
        
        {/* Main Text */}
        <div className="max-w-3xl mx-auto mb-10">
          <p className="text-lg text-[#A1A1AA] mb-6 leading-relaxed">
            Die meisten Live-Signale sind nicht schlecht.<br />
            <span className="text-white font-medium">Sie kommen nur zu spät.</span>
          </p>
          
          <p className="text-base text-[#A1A1AA] leading-relaxed">
            Ein Signal kann auf dem Papier perfekt sein – doch wenn der Markt bereits reagiert hat, 
            ist die Chance oft verschwunden.
          </p>
          
          <p className="text-lg text-white font-medium mt-6">
            Betradarmus zeigt dir nicht nur, was passiert.<br />
            <span className="text-[#00C2FF]">Sondern ob es jetzt noch sinnvoll ist zu handeln.</span>
          </p>
        </div>
        
        {/* Bullet Points */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto mb-10">
          {bulletPoints.map((item, index) => (
            <div 
              key={index}
              className="flex items-center gap-3 p-4 bg-[#121212] border border-white/10 rounded-xl hover:border-[#39FF14]/30 transition-all group"
            >
              <div className="w-10 h-10 bg-[#39FF14]/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-[#39FF14]/20 transition-colors">
                <item.icon className="w-5 h-5 text-[#39FF14]" />
              </div>
              <span className="text-white text-sm font-medium text-left">{item.text}</span>
            </div>
          ))}
        </div>
        
        {/* Closing Line */}
        <div className="inline-block px-6 py-3 bg-[#39FF14]/10 border border-[#39FF14]/30 rounded-full">
          <p className="text-[#39FF14] font-bold text-lg">
            Timing entscheidet über den Unterschied.
          </p>
        </div>
      </div>
    </section>
  );
};

export default ValueFramingSection;
