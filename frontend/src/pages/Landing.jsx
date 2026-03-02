import React, { useState } from 'react';
import { 
  Activity, Zap, Shield, BarChart3, Brain, Filter, Clock, 
  Server, Cpu, Globe, TrendingUp, ChevronRight, Users, Target, LineChart
} from 'lucide-react';
import { LiveDashboard } from '../components/LiveDashboard';
import { LiveDashboardReal } from '../components/LiveDashboardReal';
import { LiveTicker } from '../components/LiveTicker';
import { EarlyAccessForm } from '../components/EarlyAccessForm';
import { PricingCard } from '../components/PricingCard';
import { AuthModal } from '../components/AuthModal';
import { useAuth } from '../context/AuthContext';

const features = [
  {
    icon: Activity,
    title: 'Live Opportunity Feed',
    description: 'Echtzeit-Analyse von Marktbewegungen und Ineffizienzen während des Spiels.'
  },
  {
    icon: Shield,
    title: 'Risk Score',
    description: 'Bewertet Volatilität und Stabilität jeder identifizierten Opportunity.'
  },
  {
    icon: BarChart3,
    title: 'Confidence Index',
    description: 'Historisch basierte Einschätzung der Analysequalität.'
  },
  {
    icon: Brain,
    title: 'Explainable AI',
    description: 'Transparente Begründung jeder Analyse-Entscheidung.'
  },
  {
    icon: Filter,
    title: 'Liga & Markt Filter',
    description: 'Bundesliga, Premier League, Champions League und mehr.'
  },
  {
    icon: Clock,
    title: 'Millisekunden-Latenz',
    description: 'Extrem schnelle Datenverarbeitung für zeitkritische Analysen.'
  }
];

const techFeatures = [
  {
    icon: Server,
    title: 'Realtime-Datenverarbeitung',
    description: 'Event-Streaming-Architektur für Live-Analysen'
  },
  {
    icon: Cpu,
    title: 'KI-Enrichment-Engine',
    description: 'Intelligente Datenanreicherung und Mustererkennung'
  },
  {
    icon: Globe,
    title: 'Skalierbare Infrastruktur',
    description: 'Cloud-native Architektur für globale Verfügbarkeit'
  },
  {
    icon: Zap,
    title: 'Ultra-Low Latency',
    description: 'Optimiert für Millisekunden-Reaktionszeiten'
  }
];

const personas = [
  {
    icon: LineChart,
    title: 'Data-Driven Fans',
    description: 'Für Fußballfans, die datenbasierte Einblicke suchen und Spielverläufe analytisch verstehen möchten.',
    features: ['Live-Statistiken', 'Trend-Analysen', 'Performance-Metriken']
  },
  {
    icon: Target,
    title: 'Marktanalysten',
    description: 'Für professionelle Analysten, die Marktbewegungen und Wahrscheinlichkeiten systematisch auswerten.',
    features: ['Marktineffizienz-Erkennung', 'Historische Daten', 'API-Zugang']
  },
  {
    icon: TrendingUp,
    title: 'Performance-Nutzer',
    description: 'Für ambitionierte Nutzer, die maximale Geschwindigkeit und präzise Risikobewertungen benötigen.',
    features: ['Priority Updates', 'Erweiterte Insights', 'Risk Scores']
  }
];

export const Landing = () => {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingPlan, setPendingPlan] = useState(null);
  const { isAuthenticated } = useAuth();

  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
    const earlyAccessSection = document.getElementById('early-access');
    if (earlyAccessSection) {
      earlyAccessSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleAuthRequired = (plan) => {
    setPendingPlan(plan);
    setShowAuthModal(true);
  };

  const handleAuthClose = () => {
    setShowAuthModal(false);
    // If user just authenticated and had a pending plan, scroll to pricing
    if (pendingPlan && isAuthenticated) {
      setTimeout(() => {
        document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
      }, 500);
    }
    setPendingPlan(null);
  };

  const scrollToPricing = () => {
    document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]" data-testid="landing-page">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20 pb-8 overflow-hidden" data-testid="hero-section">
        {/* Background Effects */}
        <div className="absolute inset-0 hero-glow" />
        <div className="absolute inset-0 grid-bg opacity-50" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column - Text */}
            <div className="lg:col-span-5 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#39FF14]/10 border border-[#39FF14]/20 rounded-sm animate-fade-in-up">
                <div className="live-dot" />
                <span className="font-mono text-xs text-[#39FF14] uppercase tracking-wider">Live Analysis Active</span>
              </div>
              
              <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold uppercase tracking-tighter text-white leading-[0.95] animate-fade-in-up animation-delay-100">
                Erkenne Live-Marktbewegungen, bevor sie verschwinden.
              </h1>
              
              <p className="text-base md:text-lg text-[#A1A1AA] leading-relaxed animate-fade-in-up animation-delay-200">
                Betradarmus analysiert Live-Fußballmärkte in Echtzeit mit KI-gestützter Risiko- und Wahrscheinlichkeitsbewertung.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 pt-4 animate-fade-in-up animation-delay-300">
                <button 
                  onClick={() => document.getElementById('solution')?.scrollIntoView({ behavior: 'smooth' })}
                  className="h-12 px-6 bg-[#39FF14] text-black font-bold uppercase tracking-wide text-sm rounded-sm hover:bg-[#2ebb11] hover:shadow-[0_0_20px_rgba(57,255,20,0.4)] transition-all flex items-center justify-center gap-2"
                  data-testid="hero-demo-btn"
                >
                  Live-Demo ansehen
                  <ChevronRight size={18} />
                </button>
                <button 
                  onClick={() => document.getElementById('early-access')?.scrollIntoView({ behavior: 'smooth' })}
                  className="h-12 px-6 bg-white/5 border border-white/10 text-white font-bold uppercase tracking-wide text-sm rounded-sm hover:bg-white/10 hover:border-white/20 transition-all"
                  data-testid="hero-access-btn"
                >
                  Frühen Zugang sichern
                </button>
              </div>
            </div>

            {/* Right Column - Dashboard */}
            <div className="lg:col-span-7 animate-fade-in-up animation-delay-400">
              {isAuthenticated ? (
                <LiveDashboardReal onUpgradeClick={scrollToPricing} />
              ) : (
                <LiveDashboard />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Live Ticker */}
      <LiveTicker />

      {/* Problem Section */}
      <section id="problem" className="py-24 md:py-32 relative" data-testid="problem-section">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-semibold uppercase tracking-tight text-white mb-6">
              Live-Märkte sind schnell. Bauchgefühl ist langsam.
            </h2>
            <p className="text-[#A1A1AA] text-base md:text-lg">
              In der Welt der Live-Fußballanalyse zählt jede Sekunde. Manuelle Analyse kann mit der Geschwindigkeit moderner Märkte nicht mithalten.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { title: 'Chancen verschwinden in Sekunden', desc: 'Marktineffizienzen existieren nur für kurze Momente.' },
              { title: 'Emotionen verzerren Entscheidungen', desc: 'Subjektive Einschätzungen führen zu systematischen Fehlern.' },
              { title: 'Marktineffizienzen sind schwer erkennbar', desc: 'Ohne Datenanalyse bleiben viele Opportunities verborgen.' },
              { title: 'Informationsflut führt zu Fehlern', desc: 'Zu viele Datenpunkte ohne klare Priorisierung.' }
            ].map((item, index) => (
              <div 
                key={index}
                className="p-6 md:p-8 bg-[#121212] border border-white/5 rounded-sm card-hover"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 flex items-center justify-center bg-[#FF3B30]/10 rounded-sm flex-shrink-0">
                    <span className="font-mono text-lg font-bold text-[#FF3B30]">{index + 1}</span>
                  </div>
                  <div>
                    <h3 className="font-heading text-lg md:text-xl uppercase tracking-tight text-white mb-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-[#A1A1AA]">{item.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section id="solution" className="py-24 md:py-32 bg-[#121212]/50 relative" data-testid="solution-section">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#39FF14]/10 border border-[#39FF14]/20 rounded-sm mb-6">
              <Brain size={16} className="text-[#39FF14]" />
              <span className="font-mono text-xs text-[#39FF14] uppercase tracking-wider">KI-Powered</span>
            </div>
            <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-semibold uppercase tracking-tight text-white mb-6">
              KI-gestützte Live-Analyse für Fußball
            </h2>
            <p className="text-[#A1A1AA] text-base md:text-lg">
              Betradarmus kombiniert modernste KI-Technologie mit Echtzeit-Datenverarbeitung für präzise Marktanalysen.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="feature-card rounded-sm"
              >
                <div className="w-12 h-12 flex items-center justify-center bg-[#39FF14]/10 rounded-sm mb-4">
                  <feature.icon size={24} className="text-[#39FF14]" />
                </div>
                <h3 className="font-heading text-xl uppercase tracking-tight text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-sm text-[#A1A1AA] leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section id="technology" className="py-24 md:py-32 relative overflow-hidden" data-testid="technology-section">
        <div className="absolute inset-0 grid-bg opacity-30" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-semibold uppercase tracking-tight text-white mb-6">
              Architektur für Geschwindigkeit
            </h2>
            <p className="text-[#A1A1AA] text-base md:text-lg">
              Unsere Infrastruktur wurde von Grund auf für maximale Performance und Zuverlässigkeit entwickelt.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {techFeatures.map((feature, index) => (
              <div 
                key={index}
                className="p-8 bg-[#121212] border border-white/5 rounded-sm card-hover group"
              >
                <div className="flex items-start gap-6">
                  <div className="w-14 h-14 flex items-center justify-center bg-[#00C2FF]/10 rounded-sm flex-shrink-0 group-hover:bg-[#00C2FF]/20 transition-colors">
                    <feature.icon size={28} className="text-[#00C2FF]" />
                  </div>
                  <div>
                    <h3 className="font-heading text-xl uppercase tracking-tight text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-[#A1A1AA]">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: '<50ms', label: 'Latenz' },
              { value: '99.9%', label: 'Uptime' },
              { value: '50+', label: 'Ligen' },
              { value: '24/7', label: 'Live-Analyse' }
            ].map((stat, index) => (
              <div key={index} className="text-center p-6 bg-[#121212] border border-white/5 rounded-sm">
                <div className="font-mono text-3xl md:text-4xl font-bold text-[#39FF14] mb-2">
                  {stat.value}
                </div>
                <div className="data-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Audience Section */}
      <section id="audience" className="py-24 md:py-32 bg-[#121212]/50" data-testid="audience-section">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-semibold uppercase tracking-tight text-white mb-6">
              Für wen ist Betradarmus?
            </h2>
            <p className="text-[#A1A1AA] text-base md:text-lg">
              Unsere Plattform wurde für unterschiedliche Nutzerprofile entwickelt.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {personas.map((persona, index) => (
              <div 
                key={index}
                className="persona-card p-8 rounded-sm"
              >
                <div className="w-14 h-14 flex items-center justify-center bg-[#39FF14]/10 rounded-sm mb-6">
                  <persona.icon size={28} className="text-[#39FF14]" />
                </div>
                <h3 className="font-heading text-2xl uppercase tracking-tight text-white mb-3">
                  {persona.title}
                </h3>
                <p className="text-sm text-[#A1A1AA] mb-6 leading-relaxed">
                  {persona.description}
                </p>
                <ul className="space-y-2">
                  {persona.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-center gap-2 text-sm text-[#EDEDED]">
                      <div className="w-1.5 h-1.5 bg-[#39FF14] rounded-full" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 md:py-32 relative" data-testid="pricing-section">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-semibold uppercase tracking-tight text-white mb-6">
              Wählen Sie Ihren Plan
            </h2>
            <p className="text-[#A1A1AA] text-base md:text-lg">
              Starten Sie kostenlos und upgraden Sie, wenn Sie bereit sind.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
            <PricingCard plan="free" onSelect={handlePlanSelect} onAuthRequired={handleAuthRequired} />
            <PricingCard plan="pro" onSelect={handlePlanSelect} onAuthRequired={handleAuthRequired} />
            <PricingCard plan="elite" onSelect={handlePlanSelect} onAuthRequired={handleAuthRequired} />
          </div>
        </div>
      </section>

      {/* Early Access Section */}
      <section id="early-access" className="py-24 md:py-32 bg-[#121212]/50 relative overflow-hidden" data-testid="early-access-section">
        <div className="absolute inset-0 hero-glow opacity-50" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#39FF14]/10 border border-[#39FF14]/20 rounded-sm mb-6">
              <Zap size={16} className="text-[#39FF14]" />
              <span className="font-mono text-xs text-[#39FF14] uppercase tracking-wider">Limitierte Plätze</span>
            </div>
            
            <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-semibold uppercase tracking-tight text-white mb-6">
              Jetzt Early Access sichern
            </h2>
            
            <p className="text-[#A1A1AA] text-base md:text-lg mb-8">
              Registrieren Sie sich jetzt und erhalten Sie exklusiven Zugang zu Betradarmus, bevor wir offiziell starten.
            </p>

            <div className="flex justify-center">
              <EarlyAccessForm planInterest={selectedPlan || 'free'} />
            </div>
          </div>
        </div>
      </section>

      {/* Disclaimer Section */}
      <section className="py-16 border-t border-white/5" data-testid="disclaimer-section">
        <div className="max-w-4xl mx-auto px-4 md:px-8 text-center">
          <div className="p-6 bg-[#121212] border border-white/5 rounded-sm">
            <h3 className="font-heading text-lg uppercase tracking-tight text-white mb-3">
              Rechtlicher Hinweis
            </h3>
            <p className="text-sm text-[#A1A1AA] leading-relaxed">
              Betradarmus ist eine datenbasierte Analyseplattform. Es werden keine Wetten angeboten oder vermittelt. 
              Alle Informationen dienen ausschließlich zu Analyse- und Informationszwecken. 
              Die bereitgestellten Daten stellen keine Finanz- oder Anlageberatung dar.
            </p>
          </div>
        </div>
      </section>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={handleAuthClose} 
        initialMode="register"
      />
    </div>
  );
};

export default Landing;
