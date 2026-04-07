import React from 'react';
import { X, Check, Zap, Clock, TrendingUp, AlertTriangle, Eye, MessageCircle } from 'lucide-react';

const ComparisonCard = ({ title, items, isBetradarmus = false }) => {
  return (
    <div className={`relative group h-full ${isBetradarmus ? '' : ''}`}>
      {/* Glow effect for Betradarmus card */}
      {isBetradarmus && (
        <div className="absolute -inset-1 bg-gradient-to-r from-[#39FF14]/30 to-[#00C2FF]/30 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-500" />
      )}
      
      <div className={`relative h-full backdrop-blur-xl rounded-2xl p-6 border transition-all duration-300 ${
        isBetradarmus 
          ? 'bg-black/80 border-[#39FF14]/30 hover:border-[#39FF14]/60' 
          : 'bg-white/5 border-white/10 hover:border-white/20'
      }`}>
        {/* Header */}
        <div className="mb-6">
          {isBetradarmus && (
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#39FF14]/10 border border-[#39FF14]/20 rounded-full mb-3">
              <Zap className="w-3 h-3 text-[#39FF14]" />
              <span className="font-mono text-xs text-[#39FF14] uppercase tracking-wider">Decision Engine</span>
            </div>
          )}
          <h3 className={`text-xl font-bold ${isBetradarmus ? 'text-white' : 'text-[#A1A1AA]'}`}>
            {title}
          </h3>
        </div>
        
        {/* Items */}
        <div className="space-y-4">
          {items.map((item, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                isBetradarmus 
                  ? 'bg-[#39FF14]/20' 
                  : 'bg-[#FF0040]/20'
              }`}>
                {isBetradarmus ? (
                  <Check className="w-4 h-4 text-[#39FF14]" />
                ) : (
                  <X className="w-4 h-4 text-[#FF0040]" />
                )}
              </div>
              <div>
                <span className={`text-sm ${isBetradarmus ? 'text-white' : 'text-[#A1A1AA]'}`}>
                  {item.text}
                </span>
                {item.subtext && (
                  <span className="block text-xs text-[#A1A1AA]/60 mt-0.5">{item.subtext}</span>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {/* Decorative gradient */}
        {isBetradarmus && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#39FF14] via-[#00C2FF] to-[#39FF14] rounded-b-2xl" />
        )}
      </div>
    </div>
  );
};

export const WhyDifferentSection = () => {
  const typicalChannelItems = [
    { text: 'Signal erkannt', subtext: 'Ohne Kontext oder Timing' },
    { text: 'Keine Restlaufzeit', subtext: 'Unbekannt, ob noch spielbar' },
    { text: 'Keine Bewertung', subtext: 'Rohe Tipps ohne Qualitätsscore' },
    { text: 'Keine Transparenz', subtext: 'Warum dieses Signal?' },
    { text: 'Keine Priorisierung', subtext: 'Alle Signale gleich behandelt' },
    { text: 'Kein Timing-Feedback', subtext: 'Oft schon zu spät' }
  ];
  
  const betradarmusItems = [
    { text: 'Execution Score', subtext: 'Ist das Signal jetzt ausführbar?' },
    { text: 'Lifetime Window', subtext: 'Wie lange noch offen?' },
    { text: 'Confidence Index', subtext: 'Wie belastbar ist das Signal?' },
    { text: 'Risk Score', subtext: 'Wie instabil ist die Situation?' },
    { text: 'Explain Layer', subtext: 'Verständliche Gründe' },
    { text: 'Echtzeit-Timing', subtext: 'Entry Window Status' }
  ];

  return (
    <section className="py-20 md:py-32 relative overflow-hidden" data-testid="why-different-section">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#39FF14]/5 to-transparent" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#FF0040]/10 border border-[#FF0040]/20 rounded-full mb-6">
            <AlertTriangle className="w-4 h-4 text-[#FF0040]" />
            <span className="font-mono text-sm text-[#FF0040] uppercase tracking-wider">Das Problem</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
            Warum die meisten Live-Signale<br />
            <span className="text-[#FF0040]">nicht das eigentliche Problem lösen</span>
          </h2>
          
          <p className="text-lg text-[#A1A1AA] max-w-3xl mx-auto">
            Viele Anbieter liefern nur rohe Tipps ohne Kontext. Betradarmus geht weiter und beantwortet in Echtzeit die wichtigsten Fragen.
          </p>
        </div>
        
        {/* Comparison Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <ComparisonCard 
            title="Typischer Signal-Kanal"
            items={typicalChannelItems}
            isBetradarmus={false}
          />
          <ComparisonCard 
            title="Betradarmus"
            items={betradarmusItems}
            isBetradarmus={true}
          />
        </div>
        
        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <p className="text-[#A1A1AA] mb-4">
            Der Unterschied? <span className="text-[#39FF14] font-semibold">Bessere Entscheidungen im richtigen Moment.</span>
          </p>
        </div>
      </div>
    </section>
  );
};

export default WhyDifferentSection;
