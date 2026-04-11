/**
 * MoneyBackGuarantee - Vertrauensbildendes Garantie-Badge
 * Reduziert Kaufbarriere durch Risikoübernahme
 */
import React from 'react';
import { Shield, CheckCircle, Clock, CreditCard, ArrowRight } from 'lucide-react';

export const MoneyBackGuarantee = ({ onCtaClick, variant = 'full' }) => {
  // Kompakte Variante für Header/Navbar
  if (variant === 'badge') {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#39FF14]/10 border border-[#39FF14]/20 rounded-full">
        <Shield className="w-4 h-4 text-[#39FF14]" />
        <span className="text-xs text-[#39FF14] font-medium">14 Tage Geld-zurück</span>
      </div>
    );
  }

  // Inline-Variante für Pricing Cards
  if (variant === 'inline') {
    return (
      <div className="flex items-center gap-2 text-sm">
        <Shield className="w-4 h-4 text-[#39FF14]" />
        <span className="text-[#A1A1AA]">14 Tage Geld-zurück-Garantie</span>
      </div>
    );
  }

  // Volle Section-Variante
  return (
    <section className="py-12 bg-gradient-to-b from-[#0a0a0a] to-[#121212]" data-testid="money-back-guarantee">
      <div className="max-w-4xl mx-auto px-4 md:px-8">
        <div className="relative p-6 md:p-8 bg-gradient-to-r from-[#39FF14]/5 via-[#39FF14]/10 to-[#39FF14]/5 border border-[#39FF14]/20 rounded-2xl overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 left-0 w-full h-full" style={{
              backgroundImage: `repeating-linear-gradient(
                45deg,
                transparent,
                transparent 10px,
                rgba(57, 255, 20, 0.1) 10px,
                rgba(57, 255, 20, 0.1) 20px
              )`
            }} />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
            {/* Shield Icon */}
            <div className="flex-shrink-0">
              <div className="relative">
                <div className="w-20 h-20 bg-[#39FF14]/20 rounded-2xl flex items-center justify-center">
                  <Shield className="w-10 h-10 text-[#39FF14]" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-[#39FF14] rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-black" />
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-xl md:text-2xl font-bold text-white mb-2">
                14 Tage Geld-zurück-Garantie
              </h3>
              <p className="text-[#A1A1AA] mb-4">
                Teste BETRADARMUS risikofrei. Nicht zufrieden? Du erhältst dein Geld zurück – 
                ohne Fragen, ohne Bedingungen.
              </p>

              {/* Trust Points */}
              <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-4">
                {[
                  { icon: Clock, text: "14 Tage testen" },
                  { icon: CreditCard, text: "Volle Erstattung" },
                  { icon: CheckCircle, text: "Keine Fragen" }
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <item.icon className="w-4 h-4 text-[#39FF14]" />
                    <span className="text-white">{item.text}</span>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              {onCtaClick && (
                <button
                  onClick={onCtaClick}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#39FF14] text-black font-bold rounded-lg hover:bg-[#2ebb11] hover:shadow-[0_0_30px_rgba(57,255,20,0.4)] transition-all group"
                >
                  <span>Risikofrei starten</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              )}
            </div>

            {/* Badge */}
            <div className="hidden lg:block flex-shrink-0">
              <div className="w-24 h-24 rounded-full border-4 border-[#39FF14]/30 flex items-center justify-center bg-[#0a0a0a]">
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#39FF14]">100%</div>
                  <div className="text-[10px] text-[#A1A1AA] uppercase">Garantie</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Note */}
        <p className="text-center text-xs text-[#666] mt-4">
          Die Garantie gilt für alle Erst-Abonnements. Einfach E-Mail an support@betradarmus.de
        </p>
      </div>
    </section>
  );
};

export default MoneyBackGuarantee;
