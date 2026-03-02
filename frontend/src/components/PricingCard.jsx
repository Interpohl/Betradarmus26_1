import React from 'react';
import { Check, Zap, Crown, Star } from 'lucide-react';

const plans = {
  free: {
    name: 'Free',
    price: '0',
    period: 'Kostenlos',
    description: 'Grundlegender Zugang zur Live-Analyse',
    icon: Star,
    features: [
      'Begrenzter Live-Zugriff',
      'Basis-Analyse',
      '3 Ligen verfügbar',
      'Community Support'
    ],
    cta: 'Kostenlos Starten',
    highlight: false
  },
  pro: {
    name: 'Pro',
    price: '19',
    period: '/Monat',
    description: 'Für ambitionierte Analysten',
    icon: Zap,
    features: [
      'Voller Live-Zugriff',
      'Risk Score Analyse',
      'Confidence Index',
      'Erweiterte Liga-Filter',
      'Alle Top-5 Ligen',
      'E-Mail Support'
    ],
    cta: 'Pro Wählen',
    highlight: true
  },
  elite: {
    name: 'Elite',
    price: '39',
    period: '/Monat',
    description: 'Maximale Performance',
    icon: Crown,
    features: [
      'Priorisierte Live-Updates',
      'Historische Analyse',
      'Erweiterte Insights',
      'Alle Ligen weltweit',
      'API-Zugang',
      'Priority Support',
      'Explainable AI Details'
    ],
    cta: 'Elite Wählen',
    highlight: false,
    elite: true
  }
};

export const PricingCard = ({ plan, onSelect }) => {
  const planData = plans[plan];
  const Icon = planData.icon;

  return (
    <div 
      className={`relative flex flex-col h-full p-6 md:p-8 ${
        planData.elite 
          ? 'pricing-card-elite bg-[#121212]' 
          : planData.highlight 
            ? 'pricing-card bg-[#1a1a1a] border-[#39FF14]/30' 
            : 'pricing-card'
      }`}
      data-testid={`pricing-card-${plan}`}
    >
      {/* Popular Badge */}
      {planData.highlight && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#39FF14] text-black text-xs font-bold uppercase tracking-wider rounded-sm">
          Beliebt
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-10 h-10 flex items-center justify-center rounded-sm ${
            planData.elite ? 'bg-[#00C2FF]/10' : planData.highlight ? 'bg-[#39FF14]/10' : 'bg-white/5'
          }`}>
            <Icon 
              size={20} 
              className={planData.elite ? 'text-[#00C2FF]' : planData.highlight ? 'text-[#39FF14]' : 'text-white'} 
            />
          </div>
          <h3 className="font-heading text-2xl uppercase tracking-tight text-white">
            {planData.name}
          </h3>
        </div>
        
        <div className="flex items-baseline gap-1 mb-2">
          <span className="font-mono text-4xl md:text-5xl font-bold text-white">€{planData.price}</span>
          <span className="text-[#A1A1AA] text-sm">{planData.period}</span>
        </div>
        
        <p className="text-[#A1A1AA] text-sm">{planData.description}</p>
      </div>

      {/* Features */}
      <ul className="flex-1 space-y-3 mb-8">
        {planData.features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3">
            <Check 
              size={16} 
              className={`mt-0.5 flex-shrink-0 ${
                planData.elite ? 'text-[#00C2FF]' : 'text-[#39FF14]'
              }`} 
            />
            <span className="text-sm text-[#EDEDED]">{feature}</span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <button
        onClick={() => onSelect && onSelect(plan)}
        className={`w-full h-12 font-bold uppercase tracking-wide text-sm rounded-sm transition-all ${
          planData.highlight 
            ? 'bg-[#39FF14] text-black hover:bg-[#2ebb11] hover:shadow-[0_0_20px_rgba(57,255,20,0.4)]'
            : planData.elite
              ? 'bg-[#00C2FF] text-black hover:bg-[#00a8dd] hover:shadow-[0_0_20px_rgba(0,194,255,0.4)]'
              : 'bg-white/5 text-white border border-white/10 hover:bg-white/10 hover:border-white/20'
        }`}
        data-testid={`pricing-cta-${plan}`}
      >
        {planData.cta}
      </button>
    </div>
  );
};

export default PricingCard;
