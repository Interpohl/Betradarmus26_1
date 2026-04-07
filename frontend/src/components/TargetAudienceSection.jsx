import React from 'react';
import { BarChart3, Zap, Target, TrendingUp, Users } from 'lucide-react';

const AudienceCard = ({ icon: Icon, title, description, features, color, delay = 0 }) => {
  return (
    <div 
      className="group relative h-full"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Hover glow */}
      <div 
        className="absolute -inset-1 rounded-2xl blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500"
        style={{ backgroundColor: color }}
      />
      
      <div className="relative h-full backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 transition-all duration-300 hover:border-white/20 group-hover:translate-y-[-4px]">
        {/* Icon */}
        <div 
          className="w-14 h-14 rounded-xl flex items-center justify-center mb-6"
          style={{ backgroundColor: `${color}15`, border: `1px solid ${color}30` }}
        >
          <Icon className="w-7 h-7" style={{ color }} />
        </div>
        
        {/* Title */}
        <h3 className="text-xl font-bold text-white mb-3">
          {title}
        </h3>
        
        {/* Description */}
        <p className="text-[#A1A1AA] text-sm leading-relaxed mb-6">
          {description}
        </p>
        
        {/* Features */}
        <div className="space-y-2">
          {features.map((feature, idx) => (
            <div key={idx} className="flex items-center gap-2 text-sm">
              <div 
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span className="text-[#A1A1AA]">{feature}</span>
            </div>
          ))}
        </div>
        
        {/* Bottom accent */}
        <div 
          className="absolute bottom-0 left-6 right-6 h-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ backgroundColor: color }}
        />
      </div>
    </div>
  );
};

export const TargetAudienceSection = () => {
  const audiences = [
    {
      icon: BarChart3,
      title: 'Data-Driven Bettors',
      description: 'Für Nutzer, die Entscheidungen nicht aus Bauchgefühl treffen wollen, sondern auf Basis von Daten und Analysen.',
      features: [
        'Datenbasierte Signalbewertung',
        'Transparente Analyse-Gründe',
        'Historische Performance-Daten'
      ],
      color: '#39FF14'
    },
    {
      icon: TrendingUp,
      title: 'Live-Market Analysts',
      description: 'Für Nutzer, die Marktfenster, Timing und Dynamik verstehen und im richtigen Moment handeln wollen.',
      features: [
        'Echtzeit-Marktbewertung',
        'Signal Lifetime Tracking',
        'Execution Score Monitoring'
      ],
      color: '#00C2FF'
    },
    {
      icon: Target,
      title: 'Performance-Oriented',
      description: 'Für Nutzer, die nicht mehr Signale wollen, sondern bessere Entscheidungen und nachvollziehbare Ergebnisse.',
      features: [
        'Qualität über Quantität',
        'Risk-adjusted Signale',
        'Priorisierte Alerts'
      ],
      color: '#FFD700'
    }
  ];

  return (
    <section className="py-20 md:py-32 relative overflow-hidden" data-testid="target-audience-section">
      {/* Background */}
      <div className="absolute inset-0 grid-bg opacity-30" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full mb-6">
            <Users className="w-4 h-4 text-white" />
            <span className="font-mono text-sm text-white uppercase tracking-wider">Zielgruppen</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
            Für wen ist <span className="text-[#39FF14]">Betradarmus</span>?
          </h2>
          
          <p className="text-lg text-[#A1A1AA] max-w-3xl mx-auto">
            Betradarmus ist für alle, die einen systematischen, datenbasierten Ansatz 
            bei Live-Sportwetten-Entscheidungen bevorzugen.
          </p>
        </div>
        
        {/* Audience Cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {audiences.map((audience, idx) => (
            <AudienceCard
              key={idx}
              {...audience}
              delay={idx * 100}
            />
          ))}
        </div>
        
        {/* Bottom note */}
        <div className="text-center mt-12 p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl max-w-2xl mx-auto">
          <p className="text-[#A1A1AA]">
            <span className="text-[#39FF14] font-semibold">Wichtig:</span> Betradarmus ist keine Wettplattform, 
            sondern eine <span className="text-white">datenbasierte Analyse- und Entscheidungsplattform</span>.
          </p>
        </div>
      </div>
    </section>
  );
};

export default TargetAudienceSection;
