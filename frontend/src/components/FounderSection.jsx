import React from 'react';
import { Shield, TrendingUp, Award, Brain } from 'lucide-react';

export const FounderSection = () => {
  return (
    <section className="py-16 md:py-24 bg-[#0a0a0a] relative overflow-hidden" data-testid="founder-section">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#39FF14]/5 via-transparent to-[#00C2FF]/5" />
      
      <div className="max-w-5xl mx-auto px-4 md:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Image */}
          <div className="flex justify-center lg:justify-start">
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute -inset-4 bg-[#39FF14]/20 blur-3xl rounded-full" />
              
              {/* Image container */}
              <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden border-4 border-[#39FF14]/30 shadow-2xl">
                <img 
                  src="https://customer-assets.emergentagent.com/job_6fa2eb84-b932-4fcd-9a28-2db9d2605718/artifacts/axvgsbt7_Betradarmus%20%282%29.png"
                  alt="BETRADARMUS Seher - Gründer"
                  className="w-full h-full object-cover object-center scale-110"
                />
              </div>
            </div>
          </div>
          
          {/* Text */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#39FF14]/10 border border-[#39FF14]/20 rounded-full mb-6">
              <Brain className="w-4 h-4 text-[#39FF14]" />
              <span className="text-[#39FF14] text-sm font-medium">Der Kopf hinter BETRADARMUS</span>
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Der Seher
            </h2>
            
            <p className="text-[#A1A1AA] mb-6 leading-relaxed">
              Mit über <strong className="text-white">30 Jahren Erfahrung</strong> in der Sportanalyse und 
              einem Background in Data Science habe ich BETRADARMUS gegründet, um datenbasierte 
              Entscheidungen für jeden zugänglich zu machen.
            </p>
            
            <p className="text-[#A1A1AA] mb-8 leading-relaxed">
              Mein Ziel: <strong className="text-[#39FF14]">Transparenz statt Bauchgefühl.</strong> Jedes 
              Signal wird von unserer KI analysiert und verifiziert - keine versteckten Zahlen, 
              keine falschen Versprechungen.
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-[#121212] border border-white/10 rounded-lg">
                <div className="flex items-center justify-center mb-1">
                  <TrendingUp className="w-4 h-4 text-[#39FF14] mr-1" />
                  <span className="text-xl font-bold text-[#39FF14]">30+</span>
                </div>
                <p className="text-xs text-[#A1A1AA]">Jahre Erfahrung</p>
              </div>
              <div className="text-center p-3 bg-[#121212] border border-white/10 rounded-lg">
                <div className="flex items-center justify-center mb-1">
                  <Award className="w-4 h-4 text-[#FFD700] mr-1" />
                  <span className="text-xl font-bold text-[#FFD700]">71%</span>
                </div>
                <p className="text-xs text-[#A1A1AA]">Trefferquote</p>
              </div>
              <div className="text-center p-3 bg-[#121212] border border-white/10 rounded-lg">
                <div className="flex items-center justify-center mb-1">
                  <Shield className="w-4 h-4 text-[#00C2FF] mr-1" />
                  <span className="text-xl font-bold text-[#00C2FF]">100%</span>
                </div>
                <p className="text-xs text-[#A1A1AA]">Transparent</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FounderSection;
