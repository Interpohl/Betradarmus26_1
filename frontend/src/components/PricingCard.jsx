import React, { useState } from 'react';
import { Check, Zap, Crown, Star, Loader2, Clock, TrendingUp, Shield, Eye } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const plans = {
  free: {
    name: 'Free',
    priceMonthly: '0',
    priceYearly: '0',
    period: '',
    description: 'Für den Einstieg',
    microcopy: 'Erste Einblicke in Live-Marktdynamik',
    icon: Star,
    features: [
      'Zugriff auf ausgewählte Live-Signale',
      'Basis-Marktübersicht',
      'Eingeschränkte Telegram Alerts',
      'Verzögerte Signalanzeige'
    ],
    cta: 'Kostenlos starten',
    highlight: false,
    badge: null
  },
  pro: {
    name: 'Pro',
    priceMonthly: '29',
    priceYearly: '249',
    period: '/Monat',
    description: 'Für datenbasierte Entscheidungen',
    microcopy: 'Erkenne den richtigen Moment, nicht nur das Signal',
    icon: Zap,
    features: [
      'Voller Zugriff auf Live-Signale',
      'Execution Score',
      'Confidence Bewertung',
      'Risk Score',
      'Signal-Timeline',
      'Echtzeit Telegram Alerts',
      'Priorisierte Signale'
    ],
    cta: 'Zugriff freischalten',
    highlight: true,
    badge: 'Meistgewählt'
  },
  elite: {
    name: 'Elite',
    priceMonthly: '79',
    priceYearly: '699',
    period: '/Monat',
    description: 'Für maximale Echtzeit-Transparenz',
    microcopy: 'Volle Kontrolle über Timing und Marktverhalten',
    icon: Crown,
    features: [
      'Alles aus Pro',
      'Signal Lifetime Prediction',
      'Erweiterte Explain Layer',
      'Personalisierte Signalfilter',
      'Schnellere Signal-Ausspielung',
      'Signal-Historie',
      'Frühere Signalerkennung'
    ],
    cta: 'Elite freischalten',
    highlight: false,
    elite: true,
    badge: 'Maximale Kontrolle',
    disabled: false
  }
};

export const PricingCard = ({ plan, billingInterval = 'monthly', onSelect, onAuthRequired }) => {
  const planData = plans[plan];
  const Icon = planData.icon;
  const { isAuthenticated, user, token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isCurrentPlan = user?.subscription === plan;
  const isYearly = billingInterval === 'yearly';
  
  // Get price based on billing interval
  const price = isYearly ? planData.priceYearly : planData.priceMonthly;
  const period = isYearly ? '/Jahr' : '/Monat';
  
  // Calculate savings for yearly
  const monthlyCost = parseFloat(planData.priceMonthly);
  const yearlyCost = parseFloat(planData.priceYearly);
  const yearlyMonthlyCost = yearlyCost / 12;
  const savingsPercent = monthlyCost > 0 ? Math.round((1 - yearlyMonthlyCost / monthlyCost) * 100) : 0;

  const handleClick = async () => {
    // For free plan, just select it
    if (plan === 'free') {
      if (onSelect) onSelect(plan);
      return;
    }

    // Check if user is authenticated
    if (!isAuthenticated) {
      if (onAuthRequired) {
        onAuthRequired(plan);
      }
      return;
    }

    // If user already has this plan, do nothing
    if (isCurrentPlan) {
      return;
    }

    // Create Stripe checkout session
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API}/payments/checkout`, {
        plan: plan,
        billing_interval: billingInterval,
        origin_url: window.location.origin
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success && response.data.checkout_url) {
        // Redirect to Stripe Checkout
        window.location.href = response.data.checkout_url;
      } else {
        setError(response.data.message || 'Fehler beim Erstellen der Checkout-Session');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setError('Ein Fehler ist aufgetreten. Bitte versuche es erneut.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className={`relative flex flex-col h-full p-6 md:p-8 rounded-2xl transition-all duration-300 ${
        planData.elite 
          ? 'bg-gradient-to-b from-[#00C2FF]/10 to-[#121212] border-2 border-[#00C2FF]/30 hover:border-[#00C2FF]/50' 
          : planData.highlight 
            ? 'bg-gradient-to-b from-[#39FF14]/10 to-[#1a1a1a] border-2 border-[#39FF14]/50 hover:border-[#39FF14]/70 scale-105 shadow-[0_0_40px_rgba(57,255,20,0.15)]' 
            : 'bg-[#0f0f0f] border border-white/10 hover:border-white/20'
      }`}
      data-testid={`pricing-card-${plan}`}
    >
      {/* Badge */}
      {planData.badge && (
        <div className={`absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-full ${
          planData.elite 
            ? 'bg-[#00C2FF] text-black' 
            : 'bg-[#39FF14] text-black'
        }`}>
          {planData.badge}
        </div>
      )}

      {/* Current Plan Badge */}
      {isCurrentPlan && (
        <div className="absolute -top-4 right-4 px-3 py-1.5 bg-white/20 text-white text-xs font-bold uppercase tracking-wider rounded-full border border-white/30">
          Aktuell
        </div>
      )}

      {/* Header */}
      <div className="mb-6 pt-2">
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-12 h-12 flex items-center justify-center rounded-xl ${
            planData.elite ? 'bg-[#00C2FF]/20' : planData.highlight ? 'bg-[#39FF14]/20' : 'bg-white/5'
          }`}>
            <Icon 
              size={24} 
              className={planData.elite ? 'text-[#00C2FF]' : planData.highlight ? 'text-[#39FF14]' : 'text-white'} 
            />
          </div>
          <h3 className="font-heading text-2xl font-bold text-white">
            {planData.name}
          </h3>
        </div>
        
        <div className="flex items-baseline gap-1 mb-1">
          <span className="font-mono text-4xl md:text-5xl font-bold text-white">€{price}</span>
          {plan !== 'free' && <span className="text-[#A1A1AA] text-sm">{period}</span>}
        </div>
        
        {/* Savings indicator for yearly */}
        {plan !== 'free' && isYearly && savingsPercent > 0 && (
          <p className="text-xs text-[#39FF14] mb-2">
            Spare {savingsPercent}% gegenüber monatlicher Zahlung
          </p>
        )}
        
        {/* Show alternative pricing */}
        {plan !== 'free' && !isYearly && (
          <p className="text-xs text-[#A1A1AA] mb-2">
            oder €{planData.priceYearly}/Jahr <span className="text-[#39FF14]">(spare {savingsPercent}%)</span>
          </p>
        )}
        
        <p className="text-[#A1A1AA] text-sm">{planData.description}</p>
      </div>

      {/* Features */}
      <ul className="flex-1 space-y-3 mb-6">
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

      {/* Error Message */}
      {error && (
        <p className="text-xs text-[#FF3B30] mb-4">{error}</p>
      )}

      {/* CTA */}
      <button
        onClick={handleClick}
        disabled={loading || isCurrentPlan || planData.disabled}
        className={`w-full h-14 font-bold uppercase tracking-wide text-sm rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
          isCurrentPlan
            ? 'bg-white/10 text-white border border-white/20'
            : planData.disabled
              ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
              : planData.highlight 
                ? 'bg-[#39FF14] text-black hover:bg-[#2ebb11] hover:shadow-[0_0_30px_rgba(57,255,20,0.5)]'
                : planData.elite
                  ? 'bg-[#00C2FF] text-black hover:bg-[#00a8dd] hover:shadow-[0_0_30px_rgba(0,194,255,0.5)]'
                  : 'bg-white/5 text-white border border-white/10 hover:bg-white/10 hover:border-white/20'
        }`}
        data-testid={`pricing-cta-${plan}`}
      >
        {loading ? (
          <Loader2 size={18} className="animate-spin" />
        ) : isCurrentPlan ? (
          'Aktueller Plan'
        ) : planData.disabled ? (
          planData.cta
        ) : !isAuthenticated && plan !== 'free' ? (
          'Anmelden & Upgraden'
        ) : (
          planData.cta
        )}
      </button>

      {/* Microcopy */}
      {planData.microcopy && (
        <p className="text-xs text-[#666] text-center mt-4">{planData.microcopy}</p>
      )}
    </div>
  );
};

export default PricingCard;
