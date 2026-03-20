import React from 'react';
import { Brain, Heart, CheckCircle, XCircle, Zap, Clock, TrendingUp, AlertTriangle } from 'lucide-react';

export const ComparisonSection = () => {
  const comparisons = [
    {
      category: 'Entscheidungsbasis',
      gut: 'Datenbasierte KI-Analyse',
      bauchgefuhl: 'Emotionen & Hoffnung'
    },
    {
      category: 'Reaktionszeit',
      gut: 'Millisekunden',
      bauchgefuhl: 'Minuten bis Stunden'
    },
    {
      category: 'Konsistenz',
      gut: 'Immer objektiv',
      bauchgefuhl: 'Schwankt mit Stimmung'
    },
    {
      category: 'Risikobewertung',
      gut: 'Quantifizierter Risk Score',
      bauchgefuhl: 'Gefühlte Sicherheit'
    },
    {
      category: 'Lernfähigkeit',
      gut: 'Kontinuierliche Optimierung',
      bauchgefuhl: 'Wiederholte Fehler'
    },
    {
      category: 'Marktabdeckung',
      gut: '50+ Ligen gleichzeitig',
      bauchgefuhl: '1-2 Lieblingsligen'
    }
  ];

  return (
    <section className="py-16 md:py-24 bg-[#0a0a0a] relative overflow-hidden" data-testid="comparison-section">
      {/* Background Effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#39FF14]/5 via-transparent to-[#FF3B30]/5 opacity-30" />
      
      <div className="max-w-6xl mx-auto px-4 md:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#FFD700]/10 border border-[#FFD700]/20 rounded-full mb-6">
            <Zap className="w-4 h-4 text-[#FFD700]" />
            <span className="text-[#FFD700] text-sm font-medium">Gewinnen statt zocken</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            BETRADARMUS vs. Bauchgefühl
          </h2>
          <p className="text-[#A1A1AA] max-w-2xl mx-auto">
            Warum datenbasierte Entscheidungen emotionalen Reaktionen überlegen sind.
          </p>
        </div>

        {/* Comparison Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          {/* BETRADARMUS Card */}
          <div className="bg-gradient-to-br from-[#39FF14]/10 to-[#39FF14]/5 border border-[#39FF14]/30 rounded-xl p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-[#39FF14]/20 rounded-lg flex items-center justify-center">
                <Brain className="w-6 h-6 text-[#39FF14]" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">BETRADARMUS</h3>
                <p className="text-[#39FF14] text-sm">KI-gestützte Analyse</p>
              </div>
            </div>
            <ul className="space-y-3">
              {comparisons.map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-[#39FF14] flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[#A1A1AA] text-sm">{item.category}:</span>
                    <p className="text-white font-medium">{item.gut}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Bauchgefühl Card */}
          <div className="bg-gradient-to-br from-[#FF3B30]/10 to-[#FF3B30]/5 border border-[#FF3B30]/30 rounded-xl p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-[#FF3B30]/20 rounded-lg flex items-center justify-center">
                <Heart className="w-6 h-6 text-[#FF3B30]" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Bauchgefühl</h3>
                <p className="text-[#FF3B30] text-sm">Emotionale Entscheidung</p>
              </div>
            </div>
            <ul className="space-y-3">
              {comparisons.map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-[#FF3B30] flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[#A1A1AA] text-sm">{item.category}:</span>
                    <p className="text-white/70 font-medium">{item.bauchgefuhl}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Stats */}
        <div className="bg-[#121212] border border-white/10 rounded-xl p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="flex items-center justify-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-[#39FF14]" />
                <span className="text-3xl font-bold text-[#39FF14]">71%</span>
              </div>
              <p className="text-[#A1A1AA] text-sm">BETRADARMUS Trefferquote</p>
            </div>
            <div className="md:border-x border-white/10">
              <div className="flex items-center justify-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-[#FF3B30]" />
                <span className="text-3xl font-bold text-[#FF3B30]">~45%</span>
              </div>
              <p className="text-[#A1A1AA] text-sm">Durchschnitt Bauchgefühl*</p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-[#00C2FF]" />
                <span className="text-3xl font-bold text-[#00C2FF]">&lt;50ms</span>
              </div>
              <p className="text-[#A1A1AA] text-sm">Reaktionszeit KI</p>
            </div>
          </div>
          <p className="text-center text-xs text-[#A1A1AA]/60 mt-4">
            *Basierend auf Studien zu emotionalen Entscheidungen im Sport-Kontext
          </p>
        </div>
      </div>
    </section>
  );
};

export default ComparisonSection;
