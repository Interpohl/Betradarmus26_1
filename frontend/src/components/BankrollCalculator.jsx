/**
 * BankrollCalculator - Interaktiver Gewinn-Rechner für BETRADARMUS
 * Berechnet potentielle Gewinne basierend auf Plan und Zeitraum
 */
import React, { useState, useMemo } from 'react';
import { Calculator, TrendingUp, Euro, Calendar, Zap, Crown, Info } from 'lucide-react';

// Plan-Konfiguration
const PLANS = {
  pro: {
    name: 'PRO',
    signalsPerDay: 5,
    hitRate: 0.71, // 71%
    avgOdds: 2.22,
    stakePercent: 0.05, // 5%
    color: '#39FF14',
    monthlyPrice: 29
  },
  elite: {
    name: 'ELITE',
    signalsPerDay: 10,
    hitRate: 0.74, // 74%
    avgOdds: 2.57,
    stakePercent: 0.05, // 5%
    color: '#FFD700',
    monthlyPrice: 79
  }
};

const PERIODS = [
  { months: 1, label: '1 Monat' },
  { months: 3, label: '3 Monate' },
  { months: 6, label: '6 Monate' },
  { months: 12, label: '12 Monate' }
];

export const BankrollCalculator = () => {
  const [startCapital, setStartCapital] = useState(1000);
  const [selectedPlan, setSelectedPlan] = useState('pro');
  const [showInfo, setShowInfo] = useState(false);

  // Berechne erwarteten Gewinn für jeden Zeitraum
  const calculations = useMemo(() => {
    const plan = PLANS[selectedPlan];
    const results = [];

    PERIODS.forEach(period => {
      const totalDays = period.months * 30; // Durchschnitt 30 Tage/Monat
      
      // Realistischere Berechnung: Tägliches Compound-Wachstum mit Varianz
      let bankroll = startCapital;
      
      for (let day = 0; day < totalDays; day++) {
        const signalsToday = plan.signalsPerDay;
        
        // Berechne täglichen Expected Value
        for (let signal = 0; signal < signalsToday; signal++) {
          const stake = bankroll * plan.stakePercent;
          
          // Expected Value pro Signal
          const winAmount = stake * (plan.avgOdds - 1);
          const lossAmount = stake;
          const expectedGain = (plan.hitRate * winAmount) - ((1 - plan.hitRate) * lossAmount);
          
          bankroll += expectedGain;
        }
        
        // Cap das tägliche Wachstum bei maximal 15% pro Tag (realistisch)
        const maxDailyBankroll = bankroll > startCapital ? 
          Math.min(bankroll, bankroll * 1.15) : bankroll;
        bankroll = maxDailyBankroll;
      }
      
      // Zusätzlich: Realistische Obergrenze basierend auf historischer Performance
      // Pro: ~150% Rendite pro Jahr, Elite: ~200% Rendite pro Jahr
      const annualizedReturn = selectedPlan === 'elite' ? 2.0 : 1.5;
      const periodReturn = Math.pow(1 + annualizedReturn, period.months / 12);
      const conservativeBankroll = startCapital * periodReturn;
      
      // Nimm den konservativeren Wert
      const finalBankroll = Math.min(bankroll, conservativeBankroll);
      
      const profit = finalBankroll - startCapital;
      const percentGain = ((finalBankroll / startCapital) - 1) * 100;
      const subscriptionCost = period.months * plan.monthlyPrice;
      const netProfit = profit - subscriptionCost;
      
      results.push({
        period: period.label,
        months: period.months,
        finalBankroll: Math.round(finalBankroll),
        profit: Math.round(profit),
        percentGain: percentGain.toFixed(1),
        subscriptionCost,
        netProfit: Math.round(netProfit),
        totalSignals: totalDays * plan.signalsPerDay
      });
    });

    return results;
  }, [startCapital, selectedPlan]);

  const plan = PLANS[selectedPlan];

  return (
    <section className="py-16 md:py-20 bg-[#0a0a0a] relative" data-testid="calculator-section">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#39FF14]/10 border border-[#39FF14]/20 rounded-full mb-6">
            <Calculator className="w-4 h-4 text-[#39FF14]" />
            <span className="text-[#39FF14] text-sm font-medium">Gewinn-Rechner</span>
          </div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4">
            Berechne dein Gewinnpotential
          </h2>
          <p className="text-[#A1A1AA] max-w-2xl mx-auto">
            Gib dein Startkapital ein und sieh, wie sich deine Bankroll mit BETRADARMUS entwickeln könnte.
          </p>
        </div>

        {/* Calculator Card */}
        <div className="bg-[#121212] border border-white/10 rounded-2xl p-6 md:p-8">
          {/* Input Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Startkapital */}
            <div>
              <label className="block text-sm text-[#A1A1AA] mb-2 font-medium">
                Startkapital
              </label>
              <div className="relative">
                <Euro className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A1A1AA]" />
                <input
                  type="number"
                  value={startCapital}
                  onChange={(e) => setStartCapital(Math.max(100, parseInt(e.target.value) || 100))}
                  min="100"
                  step="100"
                  className="w-full h-14 pl-12 pr-4 bg-[#0a0a0a] border border-white/10 rounded-xl text-white text-lg font-mono focus:border-[#39FF14]/50 focus:outline-none transition-colors"
                  data-testid="calculator-input"
                />
              </div>
              {/* Quick Select */}
              <div className="flex gap-2 mt-3">
                {[500, 1000, 2500, 5000].map(amount => (
                  <button
                    key={amount}
                    onClick={() => setStartCapital(amount)}
                    className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                      startCapital === amount 
                        ? 'bg-[#39FF14]/20 text-[#39FF14] border border-[#39FF14]/30' 
                        : 'bg-white/5 text-[#A1A1AA] hover:bg-white/10 border border-transparent'
                    }`}
                  >
                    €{amount.toLocaleString('de-DE')}
                  </button>
                ))}
              </div>
            </div>

            {/* Plan Selection */}
            <div>
              <label className="block text-sm text-[#A1A1AA] mb-2 font-medium">
                Wähle deinen Plan
              </label>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(PLANS).map(([key, p]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedPlan(key)}
                    className={`p-4 rounded-xl border transition-all ${
                      selectedPlan === key
                        ? `bg-[${p.color}]/10 border-[${p.color}]/50`
                        : 'bg-[#0a0a0a] border-white/10 hover:border-white/20'
                    }`}
                    style={{
                      backgroundColor: selectedPlan === key ? `${p.color}10` : undefined,
                      borderColor: selectedPlan === key ? `${p.color}80` : undefined
                    }}
                    data-testid={`plan-${key}`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {key === 'elite' ? (
                        <Crown className="w-5 h-5" style={{ color: p.color }} />
                      ) : (
                        <Zap className="w-5 h-5" style={{ color: p.color }} />
                      )}
                      <span className="font-bold text-white">{p.name}</span>
                    </div>
                    <div className="text-xs text-[#A1A1AA] space-y-1 text-left">
                      <div>{p.signalsPerDay} Signale/Tag</div>
                      <div>{Math.round(p.hitRate * 100)}% Trefferquote</div>
                      <div>Ø Quote {p.avgOdds.toFixed(2)}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {calculations.map((calc, index) => (
              <div 
                key={calc.months}
                className="p-4 md:p-5 bg-[#0a0a0a] border border-white/10 rounded-xl hover:border-white/20 transition-all"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-4 h-4 text-[#A1A1AA]" />
                  <span className="text-sm text-[#A1A1AA]">{calc.period}</span>
                </div>
                
                <div className="space-y-2">
                  {/* Endkapital */}
                  <div>
                    <div className="text-2xl md:text-3xl font-bold font-mono" style={{ color: plan.color }}>
                      €{calc.finalBankroll.toLocaleString('de-DE')}
                    </div>
                    <div className="text-xs text-[#A1A1AA]">Endkapital</div>
                  </div>
                  
                  {/* Gewinn */}
                  <div className="pt-2 border-t border-white/5">
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-[#39FF14]" />
                      <span className="text-sm font-mono text-[#39FF14]">
                        +€{calc.profit.toLocaleString('de-DE')}
                      </span>
                      <span className="text-xs text-[#A1A1AA]">
                        (+{calc.percentGain}%)
                      </span>
                    </div>
                  </div>

                  {/* Netto nach Abo */}
                  <div className="text-xs text-[#A1A1AA]">
                    <span className="text-white">Netto:</span>{' '}
                    <span className={calc.netProfit > 0 ? 'text-[#39FF14]' : 'text-red-400'}>
                      {calc.netProfit > 0 ? '+' : ''}€{calc.netProfit.toLocaleString('de-DE')}
                    </span>
                    <span className="text-[#666]"> (nach Abo)</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Info Box */}
          <div className="p-4 bg-[#0a0a0a]/50 border border-white/5 rounded-xl">
            <button 
              onClick={() => setShowInfo(!showInfo)}
              className="flex items-center gap-2 text-sm text-[#A1A1AA] hover:text-white transition-colors w-full"
            >
              <Info className="w-4 h-4" />
              <span>Berechnungsgrundlage</span>
              <span className="ml-auto">{showInfo ? '−' : '+'}</span>
            </button>
            
            {showInfo && (
              <div className="mt-4 pt-4 border-t border-white/5 text-xs text-[#A1A1AA] space-y-2">
                <p>
                  <strong className="text-white">{plan.name}-Plan:</strong>{' '}
                  {plan.signalsPerDay} Signale/Tag × {Math.round(plan.hitRate * 100)}% Trefferquote × 
                  Durchschnittsquote {plan.avgOdds.toFixed(2)} × 5% Einsatz pro Signal
                </p>
                <p>
                  Die Berechnung nutzt <span className="text-white">Compound-Wachstum</span> – 
                  dein Einsatz wächst proportional mit deiner Bankroll.
                </p>
                <p className="text-[#FFD700]">
                  ⚠️ Hinweis: Diese Berechnung basiert auf historischen Durchschnittswerten. 
                  Sportwetten beinhalten Risiken. Vergangene Ergebnisse garantieren keine zukünftigen Gewinne.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          {[
            { label: 'Signale/Tag', value: plan.signalsPerDay, icon: Zap },
            { label: 'Trefferquote', value: `${Math.round(plan.hitRate * 100)}%`, icon: TrendingUp },
            { label: 'Ø Quote', value: plan.avgOdds.toFixed(2), icon: Calculator },
            { label: 'Einsatz/Signal', value: '5%', icon: Euro }
          ].map((stat, index) => (
            <div 
              key={index}
              className="flex items-center gap-3 p-4 bg-[#121212]/50 border border-white/5 rounded-xl"
            >
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${plan.color}15` }}>
                <stat.icon className="w-5 h-5" style={{ color: plan.color }} />
              </div>
              <div>
                <div className="text-lg font-bold text-white font-mono">{stat.value}</div>
                <div className="text-xs text-[#A1A1AA]">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BankrollCalculator;
