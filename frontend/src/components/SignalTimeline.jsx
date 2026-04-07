import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, Zap, TrendingUp, AlertTriangle, XCircle } from 'lucide-react';

const TimelinePhase = ({ phase, label, icon: Icon, color, isActive, isPast, delay = 0 }) => {
  return (
    <div 
      className="flex flex-col items-center relative"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Dot/Icon */}
      <div 
        className={`relative z-10 w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center transition-all duration-500 ${
          isActive 
            ? 'scale-110' 
            : isPast 
              ? 'opacity-70' 
              : 'opacity-40'
        }`}
        style={{ 
          backgroundColor: isActive ? `${color}20` : isPast ? `${color}10` : 'rgba(255,255,255,0.05)',
          border: `2px solid ${isActive ? color : isPast ? `${color}50` : 'rgba(255,255,255,0.1)'}`,
          boxShadow: isActive ? `0 0 30px ${color}40` : 'none'
        }}
      >
        <Icon 
          className={`w-5 h-5 md:w-6 md:h-6 transition-colors duration-300`}
          style={{ color: isActive || isPast ? color : '#666' }}
        />
        
        {/* Pulse animation for active phase */}
        {isActive && (
          <div 
            className="absolute inset-0 rounded-full animate-ping opacity-30"
            style={{ backgroundColor: color }}
          />
        )}
      </div>
      
      {/* Label */}
      <div className="mt-4 text-center">
        <span 
          className={`font-mono text-xs md:text-sm uppercase tracking-wider font-bold transition-colors duration-300`}
          style={{ color: isActive ? color : isPast ? `${color}90` : '#666' }}
        >
          {label}
        </span>
        {isActive && (
          <div className="mt-1">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-white/10 rounded-full text-xs text-white">
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: color }} />
              Aktuell
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

const TimelineConnector = ({ isPast, color }) => {
  return (
    <div className="flex-1 h-1 mx-2 md:mx-4 relative top-6 md:top-8">
      <div className="absolute inset-0 bg-white/10 rounded-full" />
      <div 
        className={`absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ${isPast ? 'w-full' : 'w-0'}`}
        style={{ backgroundColor: color }}
      />
    </div>
  );
};

export const SignalTimeline = () => {
  const [activePhase, setActivePhase] = useState(2); // Peak Window is active
  
  const phases = [
    { 
      phase: 'detected', 
      label: 'Detected', 
      icon: Zap, 
      color: '#A1A1AA',
      description: 'Signal wurde erkannt'
    },
    { 
      phase: 'confirmed', 
      label: 'Confirmed', 
      icon: CheckCircle, 
      color: '#00C2FF',
      description: 'Signal wurde bestätigt'
    },
    { 
      phase: 'peak', 
      label: 'Peak Window', 
      icon: TrendingUp, 
      color: '#39FF14',
      description: 'Optimales Zeitfenster'
    },
    { 
      phase: 'closing', 
      label: 'Closing', 
      icon: AlertTriangle, 
      color: '#FFD700',
      description: 'Fenster schließt sich'
    },
    { 
      phase: 'expired', 
      label: 'Expired', 
      icon: XCircle, 
      color: '#FF0040',
      description: 'Nicht mehr spielbar'
    }
  ];
  
  // Auto-cycle through phases for demo
  useEffect(() => {
    const interval = setInterval(() => {
      setActivePhase(prev => (prev + 1) % phases.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-20 md:py-32 relative overflow-hidden" data-testid="signal-timeline-section">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#00C2FF]/5 to-transparent" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#00C2FF]/10 border border-[#00C2FF]/20 rounded-full mb-6">
            <Clock className="w-4 h-4 text-[#00C2FF]" />
            <span className="font-mono text-sm text-[#00C2FF] uppercase tracking-wider">Signal Lifecycle</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
            Signale entwickeln sich.<br />
            <span className="text-[#00C2FF]">Betradarmus zeigt dir wie.</span>
          </h2>
          
          <p className="text-lg text-[#A1A1AA] max-w-3xl mx-auto">
            Ein Signal durchläuft verschiedene Phasen. Betradarmus zeigt dir nicht nur das Signal selbst,
            sondern auch in welcher Phase es sich gerade befindet.
          </p>
        </div>
        
        {/* Timeline */}
        <div className="relative max-w-4xl mx-auto">
          {/* Desktop Timeline */}
          <div className="hidden md:flex items-start justify-between">
            {phases.map((phase, idx) => (
              <React.Fragment key={phase.phase}>
                <TimelinePhase
                  {...phase}
                  isActive={idx === activePhase}
                  isPast={idx < activePhase}
                  delay={idx * 100}
                />
                {idx < phases.length - 1 && (
                  <TimelineConnector 
                    isPast={idx < activePhase} 
                    color={phases[idx].color}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
          
          {/* Mobile Timeline (Vertical) */}
          <div className="md:hidden space-y-6">
            {phases.map((phase, idx) => (
              <div 
                key={phase.phase}
                className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-300 ${
                  idx === activePhase 
                    ? 'bg-white/10 border border-white/20' 
                    : 'opacity-60'
                }`}
              >
                <div 
                  className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0`}
                  style={{ 
                    backgroundColor: `${phase.color}20`,
                    border: `2px solid ${phase.color}`
                  }}
                >
                  <phase.icon className="w-5 h-5" style={{ color: phase.color }} />
                </div>
                <div>
                  <span 
                    className="font-mono text-sm uppercase tracking-wider font-bold block"
                    style={{ color: phase.color }}
                  >
                    {phase.label}
                  </span>
                  <span className="text-xs text-[#A1A1AA]">{phase.description}</span>
                </div>
                {idx === activePhase && (
                  <div className="ml-auto">
                    <span className="w-2 h-2 rounded-full animate-pulse inline-block" style={{ backgroundColor: phase.color }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* Current Phase Description */}
        <div className="text-center mt-12 p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl max-w-2xl mx-auto">
          <p className="text-[#A1A1AA]">
            <span className="text-white font-semibold">Aktuell: </span>
            <span style={{ color: phases[activePhase].color }} className="font-bold">
              {phases[activePhase].label}
            </span>
            {' - '}
            {phases[activePhase].description}
          </p>
        </div>
        
        {/* Bottom note */}
        <div className="text-center mt-8">
          <p className="text-sm text-[#A1A1AA]">
            Das optimale <span className="text-[#39FF14]">Peak Window</span> ist der beste Zeitpunkt für Entscheidungen.
          </p>
        </div>
      </div>
    </section>
  );
};

export default SignalTimeline;
