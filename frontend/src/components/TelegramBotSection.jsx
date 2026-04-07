import React, { useState, useEffect } from 'react';
import { MessageCircle, Zap, Send, CheckCircle, Bell, Smartphone, ArrowRight } from 'lucide-react';

// Simulated chat message animation
const ChatMessage = ({ message, delay = 0 }) => {
  const [visible, setVisible] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);
  
  if (!visible) return null;
  
  return (
    <div className="animate-fade-in-up">
      {message}
    </div>
  );
};

export const TelegramBotSection = () => {
  const [showTyping, setShowTyping] = useState(true);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setShowTyping(prev => !prev);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: Zap,
      title: 'Echtzeit-Alerts',
      description: 'Live-Signale werden automatisch und sofort zugestellt'
    },
    {
      icon: CheckCircle,
      title: 'Strukturierte Nachrichten',
      description: 'Alle wichtigen Daten auf einen Blick formatiert'
    },
    {
      icon: Smartphone,
      title: 'Mobile First',
      description: 'Optimiert für schnelle Entscheidungen unterwegs'
    },
    {
      icon: Bell,
      title: 'Push-Benachrichtigungen',
      description: 'Verpasse kein wichtiges Signal mehr'
    }
  ];

  return (
    <section className="py-20 md:py-32 relative overflow-hidden" data-testid="telegram-bot-section">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0088cc]/5 to-transparent" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#0088cc]/10 border border-[#0088cc]/20 rounded-full mb-6">
            <MessageCircle className="w-4 h-4 text-[#0088cc]" />
            <span className="font-mono text-sm text-[#0088cc] uppercase tracking-wider">Telegram Integration</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
            Live-Signale automatisch<br />
            <span className="text-[#0088cc]">auf Telegram</span>
          </h2>
          
          <p className="text-lg text-[#A1A1AA] max-w-3xl mx-auto">
            Die automatische Signalversendung erfolgt über den <span className="text-white font-semibold">@betradarmus_bot</span>.
            Schnell, zuverlässig, direkt auf dein Handy.
          </p>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          {/* Left: Chat Preview */}
          <div className="relative order-2 lg:order-1">
            {/* Phone frame */}
            <div className="relative max-w-sm mx-auto">
              {/* Glow effect */}
              <div className="absolute -inset-4 bg-[#0088cc]/20 rounded-3xl blur-2xl opacity-50" />
              
              {/* Phone mockup */}
              <div className="relative bg-[#0f0f0f] rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
                {/* Status bar */}
                <div className="h-8 bg-[#1a1a1a] flex items-center justify-between px-4">
                  <span className="text-xs text-[#A1A1AA]">9:41</span>
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-2 bg-[#39FF14] rounded-sm" />
                  </div>
                </div>
                
                {/* Chat header */}
                <div className="bg-[#1a1a1a] px-4 py-3 flex items-center gap-3 border-b border-white/10">
                  <div className="w-10 h-10 rounded-full bg-[#0088cc]/20 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-[#0088cc]" />
                  </div>
                  <div>
                    <div className="text-white font-semibold text-sm">@betradarmus_bot</div>
                    <div className="text-xs text-[#39FF14] flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-[#39FF14] rounded-full animate-pulse" />
                      online
                    </div>
                  </div>
                </div>
                
                {/* Chat messages */}
                <div className="p-4 space-y-4 min-h-[400px] bg-[#0a0a0a]">
                  {/* Bot message */}
                  <ChatMessage 
                    delay={500}
                    message={
                      <div className="bg-[#1a1a1a] rounded-2xl rounded-tl-sm p-4 max-w-[90%] border border-white/5">
                        <div className="flex items-center gap-2 text-[#39FF14] font-bold mb-3">
                          <Zap className="w-4 h-4" />
                          <span className="text-sm">BETRADARMUS LIVE ALERT</span>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <div className="text-white font-medium">
                            Match: <span className="text-[#A1A1AA]">Dortmund vs Leipzig</span>
                          </div>
                          <div className="text-white font-medium">
                            Market: <span className="text-[#00C2FF]">Over 2.5 Goals</span>
                          </div>
                          
                          <div className="h-px bg-white/10 my-3" />
                          
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="text-[#A1A1AA]">Execution:</span>
                              <span className="text-[#39FF14] font-mono ml-1">78</span>
                            </div>
                            <div>
                              <span className="text-[#A1A1AA]">Confidence:</span>
                              <span className="text-[#00C2FF] font-mono ml-1">0.81</span>
                            </div>
                            <div>
                              <span className="text-[#A1A1AA]">Risk:</span>
                              <span className="text-[#FF0040] font-mono ml-1">29</span>
                            </div>
                            <div>
                              <span className="text-[#A1A1AA]">Window:</span>
                              <span className="text-[#FFD700] font-mono ml-1">~50s</span>
                            </div>
                          </div>
                          
                          <div className="h-px bg-white/10 my-3" />
                          
                          <div className="text-xs">
                            <div className="text-[#A1A1AA] mb-1">Why:</div>
                            <div className="space-y-1 text-[#A1A1AA]">
                              <div className="flex items-center gap-2">
                                <span className="w-1 h-1 bg-[#00C2FF] rounded-full" />
                                4.2% divergence
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="w-1 h-1 bg-[#00C2FF] rounded-full" />
                                market lag detected
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="w-1 h-1 bg-[#00C2FF] rounded-full" />
                                stable across 3 updates
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-xs text-[#666] mt-3">14:32</div>
                      </div>
                    }
                  />
                  
                  {/* Typing indicator */}
                  {showTyping && (
                    <div className="flex items-center gap-2 text-xs text-[#A1A1AA]">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-[#0088cc] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 bg-[#0088cc] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 bg-[#0088cc] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                      <span>Nächstes Signal wird analysiert...</span>
                    </div>
                  )}
                </div>
                
                {/* Input area (decorative) */}
                <div className="bg-[#1a1a1a] px-4 py-3 flex items-center gap-3 border-t border-white/10">
                  <div className="flex-1 bg-[#0a0a0a] rounded-full px-4 py-2 text-sm text-[#666]">
                    Nachricht...
                  </div>
                  <div className="w-10 h-10 rounded-full bg-[#0088cc] flex items-center justify-center">
                    <Send className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right: Features & CTA */}
          <div className="order-1 lg:order-2 space-y-8">
            {/* Features */}
            <div className="grid sm:grid-cols-2 gap-4">
              {features.map((feature, idx) => (
                <div 
                  key={idx}
                  className="p-4 bg-white/5 border border-white/10 rounded-xl hover:border-[#0088cc]/30 transition-colors duration-300"
                >
                  <feature.icon className="w-6 h-6 text-[#0088cc] mb-3" />
                  <h4 className="text-white font-semibold mb-1">{feature.title}</h4>
                  <p className="text-sm text-[#A1A1AA]">{feature.description}</p>
                </div>
              ))}
            </div>
            
            {/* CTA */}
            <div className="space-y-4">
              <a 
                href="https://t.me/betradarmus_bot"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-center gap-3 w-full px-8 py-4 bg-[#0088cc] hover:bg-[#0088cc]/90 text-white font-bold rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-[#0088cc]/25"
              >
                <MessageCircle className="w-5 h-5" />
                <span>@betradarmus_bot starten</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
              
              <p className="text-center text-sm text-[#A1A1AA]">
                Kostenlos starten • Keine Kreditkarte erforderlich
              </p>
            </div>
            
            {/* Trust indicators */}
            <div className="flex items-center justify-center gap-6 pt-4 border-t border-white/10">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">500+</div>
                <div className="text-xs text-[#A1A1AA]">Aktive Nutzer</div>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div className="text-center">
                <div className="text-2xl font-bold text-[#39FF14]">24/7</div>
                <div className="text-xs text-[#A1A1AA]">Live Monitoring</div>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div className="text-center">
                <div className="text-2xl font-bold text-[#00C2FF]">&lt;1s</div>
                <div className="text-xs text-[#A1A1AA]">Alert Latency</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TelegramBotSection;
