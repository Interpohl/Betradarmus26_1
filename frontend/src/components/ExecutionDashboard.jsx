import React, { useState, useEffect } from 'react';
import { Zap, Clock, TrendingUp, AlertTriangle, CheckCircle, Eye } from 'lucide-react';

// Animated counter hook
const useAnimatedValue = (targetValue, duration = 1000) => {
  const [value, setValue] = useState(0);
  
  useEffect(() => {
    const startTime = Date.now();
    const startValue = 0;
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(startValue + (targetValue - startValue) * easeOut));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [targetValue, duration]);
  
  return value;
};

// Progress bar component
const ProgressBar = ({ value, maxValue = 100, color }) => {
  const percentage = (value / maxValue) * 100;
  
  return (
    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
      <div 
        className="h-full rounded-full transition-all duration-1000 ease-out"
        style={{ 
          width: `${percentage}%`,
          backgroundColor: color,
          boxShadow: `0 0 10px ${color}50`
        }}
      />
    </div>
  );
};

// Status badge component
const StatusBadge = ({ status }) => {
  const statusConfig = {
    'entry_open': {
      label: 'ENTRY WINDOW OPEN',
      color: '#39FF14',
      bgColor: 'bg-[#39FF14]/10',
      borderColor: 'border-[#39FF14]/30',
      icon: CheckCircle
    },
    'monitor': {
      label: 'MONITOR CLOSELY',
      color: '#FFD700',
      bgColor: 'bg-[#FFD700]/10',
      borderColor: 'border-[#FFD700]/30',
      icon: Eye
    },
    'too_late': {
      label: 'TOO LATE',
      color: '#FF0040',
      bgColor: 'bg-[#FF0040]/10',
      borderColor: 'border-[#FF0040]/30',
      icon: AlertTriangle
    }
  };
  
  const config = statusConfig[status] || statusConfig['entry_open'];
  const Icon = config.icon;
  
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 ${config.bgColor} border ${config.borderColor} rounded-full`}>
      <Icon className="w-4 h-4" style={{ color: config.color }} />
      <span className="font-mono text-xs font-bold tracking-wider" style={{ color: config.color }}>
        {config.label}
      </span>
    </div>
  );
};

export const ExecutionDashboard = ({ 
  match = "Bayern München vs Dortmund",
  league = "Bundesliga",
  market = "Over 2.5 Goals",
  executionScore = 78,
  confidence = 81,
  riskScore = 29,
  lifetime = "~50s",
  status = "entry_open",
  reasons = [
    "market lag detected",
    "stable across 3 updates",
    "4.2% divergence from consensus"
  ]
}) => {
  const animatedExecution = useAnimatedValue(executionScore, 1500);
  const animatedConfidence = useAnimatedValue(confidence, 1500);
  const animatedRisk = useAnimatedValue(riskScore, 1500);
  
  const [showReasons, setShowReasons] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setShowReasons(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative group">
      {/* Glow effect */}
      <div className="absolute -inset-1 bg-gradient-to-r from-[#39FF14]/20 via-[#00C2FF]/20 to-[#39FF14]/20 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-500" />
      
      {/* Main card */}
      <div className="relative backdrop-blur-xl bg-black/80 border border-white/10 rounded-2xl p-6 overflow-hidden">
        {/* Live indicator */}
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <div className="w-2 h-2 bg-[#39FF14] rounded-full animate-pulse" />
          <span className="font-mono text-xs text-[#39FF14] uppercase tracking-wider">Live</span>
        </div>
        
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <StatusBadge status={status} />
          </div>
          <h3 className="text-xl md:text-2xl font-bold text-white mb-1">{match}</h3>
          <div className="flex items-center gap-3 text-sm text-[#A1A1AA]">
            <span>{league}</span>
            <span className="w-1 h-1 bg-[#A1A1AA] rounded-full" />
            <span className="text-[#39FF14] font-medium">{market}</span>
          </div>
        </div>
        
        {/* Scores Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {/* Execution Score */}
          <div className="bg-white/5 rounded-xl p-4 border border-white/5">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-[#39FF14]" />
              <span className="text-xs text-[#A1A1AA] uppercase tracking-wider">Execution</span>
            </div>
            <div className="font-mono text-3xl font-bold text-[#39FF14] mb-2">
              {animatedExecution}
            </div>
            <ProgressBar value={animatedExecution} color="#39FF14" />
          </div>
          
          {/* Confidence */}
          <div className="bg-white/5 rounded-xl p-4 border border-white/5">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-[#00C2FF]" />
              <span className="text-xs text-[#A1A1AA] uppercase tracking-wider">Confidence</span>
            </div>
            <div className="font-mono text-3xl font-bold text-[#00C2FF] mb-2">
              {animatedConfidence}%
            </div>
            <ProgressBar value={animatedConfidence} color="#00C2FF" />
          </div>
          
          {/* Risk Score */}
          <div className="bg-white/5 rounded-xl p-4 border border-white/5">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-[#FF0040]" />
              <span className="text-xs text-[#A1A1AA] uppercase tracking-wider">Risk</span>
            </div>
            <div className="font-mono text-3xl font-bold text-[#FF0040] mb-2">
              {animatedRisk}
            </div>
            <ProgressBar value={100 - animatedRisk} color="#FF0040" />
          </div>
          
          {/* Lifetime */}
          <div className="bg-white/5 rounded-xl p-4 border border-white/5">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-[#FFD700]" />
              <span className="text-xs text-[#A1A1AA] uppercase tracking-wider">Window</span>
            </div>
            <div className="font-mono text-3xl font-bold text-[#FFD700] mb-2">
              {lifetime}
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#FFD700] rounded-full animate-pulse"
                style={{ width: '65%', boxShadow: '0 0 10px #FFD70050' }}
              />
            </div>
          </div>
        </div>
        
        {/* Explain Layer */}
        <div className={`transition-all duration-500 ${showReasons ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="bg-white/5 rounded-xl p-4 border border-[#00C2FF]/20">
            <div className="flex items-center gap-2 mb-3">
              <Eye className="w-4 h-4 text-[#00C2FF]" />
              <span className="text-xs text-[#00C2FF] uppercase tracking-wider font-bold">Why this signal?</span>
            </div>
            <div className="space-y-2">
              {reasons.map((reason, idx) => (
                <div 
                  key={idx}
                  className="flex items-center gap-2 text-sm text-[#A1A1AA]"
                  style={{ 
                    animationDelay: `${idx * 200}ms`,
                    animation: showReasons ? 'fadeInLeft 0.5s ease-out forwards' : 'none'
                  }}
                >
                  <span className="w-1.5 h-1.5 bg-[#00C2FF] rounded-full" />
                  <span>{reason}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-[#39FF14]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-[#00C2FF]/5 rounded-full blur-3xl" />
      </div>
    </div>
  );
};

export default ExecutionDashboard;
