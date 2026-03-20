import React, { useState } from 'react';
import { 
  Activity, Zap, Shield, BarChart3, Brain, Filter, Clock, 
  Server, Cpu, Globe, TrendingUp, ChevronRight, Users, Target, LineChart,
  MessageCircle, CheckCircle, Star, ArrowRight, Sparkles, Lock, AlertTriangle
} from 'lucide-react';
import { LiveDashboard } from '../components/LiveDashboard';
import { LiveDashboardReal } from '../components/LiveDashboardReal';
import { LiveTicker } from '../components/LiveTicker';
import { LiveDemo } from '../components/LiveDemo';
import { LiveCounter } from '../components/LiveCounter';
import { ComparisonSection } from '../components/ComparisonSection';
import { TelegramPreview } from '../components/TelegramPreview';
import { Statistics } from '../components/Statistics';
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
    if (plan === 'free') {
      // Open registration modal for free plan
      setPendingPlan('free');
      setShowAuthModal(true);
    } else {
      const earlyAccessSection = document.getElementById('early-access');
      if (earlyAccessSection) {
        earlyAccessSection.scrollIntoView({ behavior: 'smooth' });
      }
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
              {/* USP Badge - Eye-catching */}
              <div className="flex flex-wrap gap-2 animate-fade-in-up">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#39FF14]/10 border border-[#39FF14]/20 rounded-sm">
                  <div className="live-dot" />
                  <span className="font-mono text-xs text-[#39FF14] uppercase tracking-wider">Live</span>
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#00C2FF]/10 border border-[#00C2FF]/20 rounded-sm">
                  <span className="font-mono text-xs text-[#00C2FF] uppercase tracking-wider">71% Trefferquote</span>
                </div>
              </div>
              
              <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold uppercase tracking-tighter text-white leading-[0.95] animate-fade-in-up animation-delay-100">
                KI-Signale mit <span className="text-[#39FF14]">71% Trefferquote</span> - direkt aufs Handy.
              </h1>
              
              <p className="text-base md:text-lg text-[#A1A1AA] leading-relaxed animate-fade-in-up animation-delay-200">
                Unsere KI analysiert Live-Fußballmärkte und sendet dir profitable Signale per Telegram. Transparent, schnell, nachweisbar.
              </p>

              {/* USP Stats Row */}
              <div className="grid grid-cols-3 gap-4 py-4 animate-fade-in-up animation-delay-250">
                <div className="text-center">
                  <div className="font-mono text-2xl md:text-3xl font-bold text-[#39FF14]">71%</div>
                  <div className="text-xs text-[#A1A1AA] uppercase tracking-wide">Win Rate</div>
                </div>
                <div className="text-center border-x border-white/10">
                  <div className="font-mono text-2xl md:text-3xl font-bold text-[#00C2FF]">+42%</div>
                  <div className="text-xs text-[#A1A1AA] uppercase tracking-wide">ROI</div>
                </div>
                <div className="text-center">
                  <div className="font-mono text-2xl md:text-3xl font-bold text-white">150+</div>
                  <div className="text-xs text-[#A1A1AA] uppercase tracking-wide">Tipps</div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up animation-delay-300">
                <button 
                  onClick={() => {
                    setPendingPlan('free');
                    setShowAuthModal(true);
                  }}
                  className="h-14 px-8 bg-[#39FF14] text-black font-bold uppercase tracking-wide text-sm rounded-sm hover:bg-[#2ebb11] hover:shadow-[0_0_30px_rgba(57,255,20,0.5)] transition-all flex items-center justify-center gap-2"
                  data-testid="hero-cta-btn"
                >
                  Kostenlos starten
                  <ChevronRight size={18} />
                </button>
                <button 
                  onClick={() => document.getElementById('statistics')?.scrollIntoView({ behavior: 'smooth' })}
                  className="h-14 px-6 bg-white/5 border border-white/10 text-white font-bold uppercase tracking-wide text-sm rounded-sm hover:bg-white/10 hover:border-white/20 transition-all"
                  data-testid="hero-stats-btn"
                >
                  Statistiken ansehen
                </button>
              </div>

              {/* Trust Indicator */}
              <p className="text-xs text-[#A1A1AA] animate-fade-in-up animation-delay-400">
                Alle Statistiken verifiziert via The Odds API. Keine versteckten Zahlen.
              </p>
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

      {/* Live Counter Bar */}
      <LiveCounter />

      {/* Live Ticker */}
      <LiveTicker />

      {/* How It Works Section - NEW */}
      <section className="py-16 md:py-20 bg-[#0a0a0a] relative overflow-hidden" data-testid="how-it-works-section">
        <div className="absolute inset-0 bg-gradient-to-b from-[#39FF14]/5 via-transparent to-transparent opacity-50" />
        <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#00C2FF]/10 border border-[#00C2FF]/20 rounded-full mb-6">
              <Zap className="w-4 h-4 text-[#00C2FF]" />
              <span className="text-[#00C2FF] text-sm font-medium">In 3 Schritten starten</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
              So funktioniert's
            </h2>
            <p className="text-[#A1A1AA] max-w-2xl mx-auto">
              In wenigen Minuten erhältst du KI-gestützte Signale direkt auf dein Handy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {/* Step 1 */}
            <div className="relative p-6 md:p-8 bg-[#121212] border border-white/10 rounded-xl group hover:border-[#39FF14]/30 transition-all">
              <div className="absolute -top-4 left-6 w-8 h-8 bg-[#39FF14] rounded-full flex items-center justify-center font-bold text-black">
                1
              </div>
              <div className="mt-4">
                <div className="w-12 h-12 bg-[#39FF14]/10 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-[#39FF14]" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Kostenlos registrieren</h3>
                <p className="text-[#A1A1AA] text-sm">
                  Erstelle in 30 Sekunden dein kostenloses Konto. Keine Kreditkarte erforderlich.
                </p>
              </div>
              <div className="hidden md:block absolute -right-4 top-1/2 -translate-y-1/2 z-10">
                <ArrowRight className="w-8 h-8 text-[#39FF14]/30" />
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative p-6 md:p-8 bg-[#121212] border border-white/10 rounded-xl group hover:border-[#00C2FF]/30 transition-all">
              <div className="absolute -top-4 left-6 w-8 h-8 bg-[#00C2FF] rounded-full flex items-center justify-center font-bold text-black">
                2
              </div>
              <div className="mt-4">
                <div className="w-12 h-12 bg-[#00C2FF]/10 rounded-lg flex items-center justify-center mb-4">
                  <MessageCircle className="w-6 h-6 text-[#00C2FF]" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Telegram verbinden</h3>
                <p className="text-[#A1A1AA] text-sm mb-3">
                  Verbinde deinen Telegram Account mit unserem Bot @Betradarmus_bot.
                </p>
                <a 
                  href="https://t.me/+Pb8X_nXzKu41N2Yy" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-[#00C2FF] hover:text-[#00D4FF] transition-colors"
                  data-testid="how-it-works-telegram-link"
                >
                  <MessageCircle className="w-4 h-4" />
                  Community Gruppe beitreten
                </a>
              </div>
              <div className="hidden md:block absolute -right-4 top-1/2 -translate-y-1/2 z-10">
                <ArrowRight className="w-8 h-8 text-[#00C2FF]/30" />
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative p-6 md:p-8 bg-[#121212] border border-white/10 rounded-xl group hover:border-[#FFD700]/30 transition-all">
              <div className="absolute -top-4 left-6 w-8 h-8 bg-[#FFD700] rounded-full flex items-center justify-center font-bold text-black">
                3
              </div>
              <div className="mt-4">
                <div className="w-12 h-12 bg-[#FFD700]/10 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-[#FFD700]" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Signale erhalten</h3>
                <p className="text-[#A1A1AA] text-sm">
                  Erhalte KI-Signale mit Confidence-Index und Risk-Score direkt aufs Handy.
                </p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center mt-10">
            <button 
              onClick={() => {
                setPendingPlan('free');
                setShowAuthModal(true);
              }}
              className="inline-flex items-center gap-2 h-14 px-8 bg-[#39FF14] text-black font-bold uppercase tracking-wide text-sm rounded-lg hover:bg-[#2ebb11] hover:shadow-[0_0_30px_rgba(57,255,20,0.5)] transition-all"
            >
              Jetzt kostenlos starten
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* Live Demo Section */}
      <LiveDemo />

      {/* Statistics Section */}
      <Statistics />

      {/* Testimonials Section - NEW */}
      <section className="py-16 md:py-20 bg-[#0a0a0a] relative" data-testid="testimonials-section">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#FFD700]/10 border border-[#FFD700]/20 rounded-full mb-6">
              <Star className="w-4 h-4 text-[#FFD700]" />
              <span className="text-[#FFD700] text-sm font-medium">Nutzerstimmen</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
              Was unsere Nutzer sagen
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: "Markus K.",
                role: "PRO Nutzer seit 3 Monaten",
                text: "Die Signale kommen schnell und die Trefferquote ist wirklich beeindruckend. Endlich eine transparente Plattform!",
                rating: 5
              },
              {
                name: "Stefan W.",
                role: "PRO Nutzer seit 6 Monaten", 
                text: "Der Telegram Bot ist super praktisch. Ich bekomme die Signale direkt aufs Handy und kann sofort reagieren.",
                rating: 5
              },
              {
                name: "Thomas R.",
                role: "FREE Nutzer",
                text: "Selbst mit dem kostenlosen Plan bekommt man einen guten Eindruck. Die Statistiken sind komplett transparent.",
                rating: 4
              }
            ].map((testimonial, index) => (
              <div 
                key={index}
                className="p-6 bg-[#121212] border border-white/10 rounded-xl hover:border-white/20 transition-all"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-4 h-4 ${i < testimonial.rating ? 'text-[#FFD700] fill-[#FFD700]' : 'text-gray-600'}`} 
                    />
                  ))}
                </div>
                <p className="text-[#A1A1AA] text-sm mb-4 italic">"{testimonial.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#39FF14]/20 to-[#00C2FF]/20 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">{testimonial.name.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">{testimonial.name}</p>
                    <p className="text-[#A1A1AA] text-xs">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Section - BETRADARMUS vs Bauchgefühl */}
      <ComparisonSection />

      {/* Telegram Preview Section */}
      <TelegramPreview />

      {/* AI Model Transparency Section - NEW */}
      <section className="py-16 md:py-20 bg-[#121212]/50 relative overflow-hidden" data-testid="ai-model-section">
        <div className="absolute inset-0 bg-gradient-to-r from-[#39FF14]/5 via-transparent to-[#00C2FF]/5" />
        <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#39FF14]/10 border border-[#39FF14]/20 rounded-full mb-6">
                <Brain className="w-4 h-4 text-[#39FF14]" />
                <span className="text-[#39FF14] text-sm font-medium">Unsere Technologie</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Wie unsere KI funktioniert
              </h2>
              <p className="text-[#A1A1AA] mb-6">
                Unsere KI-Modelle werden täglich mit neuen Spieldaten trainiert und kontinuierlich optimiert. 
                Vollständige Transparenz über unsere Methodik.
              </p>
              
              <div className="space-y-4">
                {[
                  { title: "Machine Learning Modelle", desc: "XGBoost & RandomForest trainiert auf historischen Daten" },
                  { title: "Echtzeit-Datenfeeds", desc: "Live-Odds von The Odds API + Spielstände von Livescore" },
                  { title: "Tägliches Retraining", desc: "Modelle werden täglich mit neuen Ergebnissen aktualisiert" },
                  { title: "Backtesting", desc: "Alle Strategien werden auf historischen Daten validiert" }
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[#39FF14] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-white font-medium">{item.title}</p>
                      <p className="text-[#A1A1AA] text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Visual representation */}
            <div className="relative">
              <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-6 md:p-8">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#39FF14]" />
                  Model Pipeline
                </h3>
                <div className="space-y-3">
                  {[
                    { step: "1", label: "Daten sammeln", detail: "50+ Ligen weltweit" },
                    { step: "2", label: "Features berechnen", detail: "200+ Variablen pro Spiel" },
                    { step: "3", label: "ML Prediction", detail: "Wahrscheinlichkeiten + EV" },
                    { step: "4", label: "Risk Assessment", detail: "Volatilität bewerten" },
                    { step: "5", label: "Signal generieren", detail: "Confidence ≥ 65%" }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-4 p-3 bg-white/5 rounded-lg">
                      <div className="w-8 h-8 bg-[#39FF14]/20 rounded-full flex items-center justify-center">
                        <span className="text-[#39FF14] font-mono text-sm font-bold">{item.step}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-white text-sm font-medium">{item.label}</p>
                        <p className="text-[#A1A1AA] text-xs">{item.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Free Trial Comparison Section - NEW */}
      <section className="py-16 md:py-20 bg-[#0a0a0a] relative" data-testid="free-trial-section">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#00C2FF]/10 border border-[#00C2FF]/20 rounded-full mb-6">
              <Zap className="w-4 h-4 text-[#00C2FF]" />
              <span className="text-[#00C2FF] text-sm font-medium">Kostenlos starten</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
              Teste BETRADARMUS gratis
            </h2>
            <p className="text-[#A1A1AA] max-w-2xl mx-auto">
              Starte kostenlos und upgrade wenn du überzeugt bist. Keine Kreditkarte, keine versteckten Kosten.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Free Plan */}
            <div className="p-6 md:p-8 bg-[#121212] border border-white/10 rounded-xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">FREE</h3>
                <span className="px-3 py-1 bg-white/10 text-white text-sm rounded-full">Kostenlos</span>
              </div>
              <ul className="space-y-3 mb-6">
                {[
                  { text: "3 Signale pro Woche", included: true },
                  { text: "Basis-Ligen (Bundesliga, PL)", included: true },
                  { text: "Telegram Community Gruppe", included: true },
                  { text: "Confidence Index", included: true },
                  { text: "Risk Score", included: false },
                  { text: "Alle 50+ Ligen", included: false },
                  { text: "Unbegrenzte Signale", included: false },
                  { text: "Priority Support", included: false }
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-3">
                    {item.included ? (
                      <CheckCircle className="w-5 h-5 text-[#39FF14]" />
                    ) : (
                      <Lock className="w-5 h-5 text-gray-600" />
                    )}
                    <span className={item.included ? "text-white" : "text-gray-500"}>{item.text}</span>
                  </li>
                ))}
              </ul>
              <button 
                onClick={() => {
                  setPendingPlan('free');
                  setShowAuthModal(true);
                }}
                className="w-full h-12 bg-white/10 border border-white/20 text-white font-bold rounded-lg hover:bg-white/20 transition-all"
              >
                Kostenlos starten
              </button>
            </div>

            {/* Pro Plan */}
            <div className="p-6 md:p-8 bg-gradient-to-br from-[#39FF14]/10 to-[#00C2FF]/10 border border-[#39FF14]/30 rounded-xl relative overflow-hidden">
              <div className="absolute top-4 right-4 px-3 py-1 bg-[#39FF14] text-black text-xs font-bold rounded-full">
                BELIEBT
              </div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">PRO</h3>
                <div className="text-right">
                  <span className="text-3xl font-bold text-[#39FF14]">€49</span>
                  <span className="text-[#A1A1AA] text-sm">/Monat</span>
                </div>
              </div>
              <ul className="space-y-3 mb-6">
                {[
                  { text: "Unbegrenzte Signale", included: true },
                  { text: "Alle 50+ Ligen weltweit", included: true },
                  { text: "Risk Score & EV Analyse", included: true },
                  { text: "Confidence Index", included: true },
                  { text: "Liga & Markt Filter", included: true },
                  { text: "Priority Telegram Signale", included: true },
                  { text: "E-Mail Support", included: true }
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-[#39FF14]" />
                    <span className="text-white">{item.text}</span>
                  </li>
                ))}
              </ul>
              <button 
                onClick={() => {
                  setPendingPlan('pro');
                  setShowAuthModal(true);
                }}
                className="w-full h-12 bg-[#39FF14] text-black font-bold rounded-lg hover:bg-[#2ebb11] hover:shadow-[0_0_30px_rgba(57,255,20,0.4)] transition-all"
              >
                PRO werden
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted Partners Section - NEW */}
      <section className="py-12 bg-[#121212]/30 border-y border-white/5" data-testid="partners-section">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <p className="text-center text-[#A1A1AA] text-sm mb-8 uppercase tracking-wider">Daten & Technologie von</p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 opacity-60 hover:opacity-100 transition-opacity">
            {/* The Odds API */}
            <div className="flex items-center gap-2 text-white">
              <Globe className="w-6 h-6 text-[#39FF14]" />
              <span className="font-bold">The Odds API</span>
            </div>
            {/* Livescore */}
            <div className="flex items-center gap-2 text-white">
              <Activity className="w-6 h-6 text-[#00C2FF]" />
              <span className="font-bold">Livescore</span>
            </div>
            {/* Stripe */}
            <div className="flex items-center gap-2 text-white">
              <Shield className="w-6 h-6 text-[#6366F1]" />
              <span className="font-bold">Stripe</span>
            </div>
            {/* Telegram */}
            <div className="flex items-center gap-2 text-white">
              <MessageCircle className="w-6 h-6 text-[#0088CC]" />
              <span className="font-bold">Telegram</span>
            </div>
          </div>
        </div>
      </section>

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
              Wähle deinen Plan
            </h2>
            <p className="text-[#A1A1AA] text-base md:text-lg">
              Starte kostenlos und upgrade, wenn du bereit bist.
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
              Registriere dich jetzt und erhalte exklusiven Zugang zu Betradarmus, bevor wir offiziell starten.
            </p>

            <div className="flex justify-center">
              <EarlyAccessForm planInterest={selectedPlan || 'free'} />
            </div>
          </div>
        </div>
      </section>

      {/* Legal Disclaimer Section - ENHANCED */}
      <section className="py-16 bg-[#0a0a0a] border-t border-white/10" data-testid="disclaimer-section">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <div className="bg-[#121212] border border-[#FF6B00]/20 rounded-xl p-6 md:p-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-[#FF6B00]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-[#FF6B00]" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-4">
                  Wichtiger rechtlicher Hinweis
                </h3>
                <div className="space-y-3 text-sm text-[#A1A1AA] leading-relaxed">
                  <p>
                    <strong className="text-white">BETRADARMUS ist eine reine Analyseplattform.</strong> Wir bieten keine Wetten an und vermitteln auch keine Wetten. 
                    Alle bereitgestellten Informationen dienen ausschließlich zu Analyse-, Bildungs- und Informationszwecken.
                  </p>
                  <p>
                    Die von unseren KI-Modellen generierten Wahrscheinlichkeiten und Signale basieren auf historischen Daten und statistischen Methoden. 
                    <strong className="text-white"> Vergangene Performance ist kein Indikator für zukünftige Ergebnisse.</strong>
                  </p>
                  <p>
                    Diese Plattform stellt keine Finanz-, Anlage- oder Rechtsberatung dar. Nutzer tragen die volle Verantwortung für ihre Entscheidungen. 
                    Bitte beachte die geltenden Gesetze in deinem Land und spiele verantwortungsvoll.
                  </p>
                  <p className="pt-2 border-t border-white/10">
                    Bei Fragen wende dich an{' '}
                    <a href="mailto:info@betradarmus.de" className="text-[#39FF14] hover:underline">info@betradarmus.de</a> | 
                    <a href="/datenschutz" className="text-[#39FF14] hover:underline ml-1">Datenschutz</a> | 
                    <a href="/agb" className="text-[#39FF14] hover:underline ml-1">AGB</a>
                  </p>
                </div>
              </div>
            </div>
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
