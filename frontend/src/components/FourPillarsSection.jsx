import React from 'react';
import { Zap, Clock, TrendingUp, Eye, AlertTriangle, BarChart3 } from 'lucide-react';

const FeatureCard = ({ icon: Icon, title, description, color, delay = 0 }) => {
  return (
    <div 
      className="group relative"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Hover glow */}
      <div 
        className="absolute -inset-1 rounded-2xl blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-500"
        style={{ backgroundColor: `${color}20` }}
      />
      
      <div className="relative h-full backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 transition-all duration-300 hover:border-white/20 hover:bg-white/[0.07] group-hover:translate-y-[-4px]">
        {/* Icon */}
        <div 
          className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110"
          style={{ backgroundColor: `${color}15`, border: `1px solid ${color}30` }}
        >
          <Icon className="w-7 h-7" style={{ color }} />
        </div>
        
        {/* Title */}
        <h3 className="text-xl font-bold text-white mb-3 group-hover:text-[#39FF14] transition-colors duration-300">
          {title}
        </h3>
        
        {/* Description */}
        <p className="text-[#A1A1AA] text-sm leading-relaxed">
          {description}
        </p>
        
        {/* Bottom accent line */}
        <div 
          className="absolute bottom-0 left-6 right-6 h-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300"
          style={{ backgroundColor: color }}
        />
      </div>
    </div>
  );
};

export const FourPillarsSection = () => {
  const features = [
    {
      icon: Zap,
      title: 'Execution Score',
      description: 'Bewertet, ob ein Signal im aktuellen Moment noch sinnvoll ausführbar ist. Nicht jedes erkannte Signal ist auch ein gutes Signal.',
      color: '#39FF14'
    },
    {
      icon: Clock,
      title: 'Signal Lifetime',
      description: 'Schätzt, wie lange ein Marktfenster voraussichtlich noch offen bleibt. Zeit ist der kritische Faktor bei Live-Signalen.',
      color: '#FFD700'
    },
    {
      icon: BarChart3,
      title: 'Confidence & Risk',
      description: 'Zeigt gleichzeitig die Belastbarkeit des Signals und die aktuelle Marktinstabilität. Zwei Seiten derselben Medaille.',
      color: '#00C2FF'
    },
    {
      icon: Eye,
      title: 'Explainable Signals',
      description: 'Jedes Signal wird mit verständlichen Gründen erklärt, statt nur blind ausgespielt zu werden. Transparenz schafft Vertrauen.',
      color: '#FF0040'
    }
  ];

  return (
    <section className="py-20 md:py-32 relative overflow-hidden" data-testid="four-pillars-section">
      {/* Background elements */}
      <div className="absolute inset-0 grid-bg opacity-30" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#39FF14]/5 rounded-full blur-3xl" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#39FF14]/10 border border-[#39FF14]/20 rounded-full mb-6">
            <TrendingUp className="w-4 h-4 text-[#39FF14]" />
            <span className="font-mono text-sm text-[#39FF14] uppercase tracking-wider">Core Features</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
            Vier Ebenen echter<br />
            <span className="text-[#39FF14]">Entscheidungsintelligenz</span>
          </h2>
          
          <p className="text-lg text-[#A1A1AA] max-w-3xl mx-auto">
            Betradarmus ist kein weiterer Signal-Bot. Es ist ein System, das dir hilft, 
            die richtigen Entscheidungen im richtigen Moment zu treffen.
          </p>
        </div>
        
        {/* Feature Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => (
            <FeatureCard
              key={idx}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              color={feature.color}
              delay={idx * 100}
            />
          ))}
        </div>
        
        {/* Bottom tagline */}
        <div className="text-center mt-16">
          <p className="text-xl text-white font-medium">
            Nicht mehr Signale. <span className="text-[#39FF14]">Sondern bessere Entscheidungen.</span>
          </p>
        </div>
      </div>
    </section>
  );
};

export default FourPillarsSection;
