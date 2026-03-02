import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Activity, User, LogOut, Crown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AuthModal } from './AuthModal';

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const location = useLocation();
  const { user, isAuthenticated, isPremium, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const openAuth = (mode) => {
    setAuthMode(mode);
    setShowAuthModal(true);
    setIsMobileMenuOpen(false);
  };

  const scrollToSection = (sectionId) => {
    if (location.pathname !== '/') {
      window.location.href = `/#${sectionId}`;
      return;
    }
    
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-[#0a0a0a]/95 backdrop-blur-md border-b border-white/5' : 'bg-transparent'
      }`}
      data-testid="navbar"
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3" data-testid="navbar-logo">
            <div className="w-8 h-8 flex items-center justify-center bg-[#39FF14] rounded-sm">
              <Activity size={18} className="text-black" />
            </div>
            <span className="font-heading text-xl md:text-2xl font-bold uppercase tracking-tight text-white">
              Betradarmus
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <button 
              onClick={() => scrollToSection('problem')}
              className="text-sm text-[#A1A1AA] hover:text-white transition-colors uppercase tracking-wide"
            >
              Problem
            </button>
            <button 
              onClick={() => scrollToSection('solution')}
              className="text-sm text-[#A1A1AA] hover:text-white transition-colors uppercase tracking-wide"
            >
              Lösung
            </button>
            <button 
              onClick={() => scrollToSection('technology')}
              className="text-sm text-[#A1A1AA] hover:text-white transition-colors uppercase tracking-wide"
            >
              Technologie
            </button>
            <button 
              onClick={() => scrollToSection('pricing')}
              className="text-sm text-[#A1A1AA] hover:text-white transition-colors uppercase tracking-wide"
            >
              Preise
            </button>
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <>
                {isPremium && (
                  <span className="flex items-center gap-1 px-2 py-1 bg-[#39FF14]/10 border border-[#39FF14]/20 rounded-sm">
                    <Crown size={14} className="text-[#39FF14]" />
                    <span className="text-xs text-[#39FF14] font-mono uppercase">{user?.subscription}</span>
                  </span>
                )}
                <div className="flex items-center gap-2 text-sm text-[#A1A1AA]">
                  <User size={16} />
                  <span>{user?.name}</span>
                </div>
                <button 
                  onClick={logout}
                  className="p-2 text-[#A1A1AA] hover:text-white transition-colors"
                  data-testid="logout-btn"
                >
                  <LogOut size={18} />
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => openAuth('login')}
                  className="text-sm text-[#A1A1AA] hover:text-white transition-colors uppercase tracking-wide"
                  data-testid="navbar-login"
                >
                  Anmelden
                </button>
                <button 
                  onClick={() => openAuth('register')}
                  className="h-10 px-5 bg-[#39FF14] text-black font-bold uppercase tracking-wide text-xs rounded-sm hover:bg-[#2ebb11] hover:shadow-[0_0_20px_rgba(57,255,20,0.4)] transition-all"
                  data-testid="navbar-cta"
                >
                  Registrieren
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            data-testid="mobile-menu-btn"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-[#0a0a0a] border-b border-white/5 py-4 px-4 animate-fade-in-up">
            <div className="flex flex-col gap-4">
              <button 
                onClick={() => scrollToSection('problem')}
                className="text-left py-2 text-[#A1A1AA] hover:text-white transition-colors uppercase tracking-wide text-sm"
              >
                Problem
              </button>
              <button 
                onClick={() => scrollToSection('solution')}
                className="text-left py-2 text-[#A1A1AA] hover:text-white transition-colors uppercase tracking-wide text-sm"
              >
                Lösung
              </button>
              <button 
                onClick={() => scrollToSection('technology')}
                className="text-left py-2 text-[#A1A1AA] hover:text-white transition-colors uppercase tracking-wide text-sm"
              >
                Technologie
              </button>
              <button 
                onClick={() => scrollToSection('pricing')}
                className="text-left py-2 text-[#A1A1AA] hover:text-white transition-colors uppercase tracking-wide text-sm"
              >
                Preise
              </button>
              {isAuthenticated ? (
                <>
                  <div className="flex items-center gap-2 py-2 text-[#A1A1AA]">
                    <User size={16} />
                    <span>{user?.name}</span>
                    {isPremium && (
                      <span className="ml-2 px-2 py-0.5 bg-[#39FF14]/10 text-[#39FF14] text-xs font-mono rounded-sm">
                        {user?.subscription}
                      </span>
                    )}
                  </div>
                  <button 
                    onClick={logout}
                    className="mt-2 h-10 bg-white/5 border border-white/10 text-white font-bold uppercase tracking-wide text-xs rounded-sm flex items-center justify-center gap-2"
                  >
                    <LogOut size={16} />
                    Abmelden
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => openAuth('login')}
                    className="mt-2 h-10 bg-white/5 border border-white/10 text-white font-bold uppercase tracking-wide text-xs rounded-sm"
                  >
                    Anmelden
                  </button>
                  <button 
                    onClick={() => openAuth('register')}
                    className="h-10 bg-[#39FF14] text-black font-bold uppercase tracking-wide text-xs rounded-sm"
                  >
                    Registrieren
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Auth Modal */}
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)} 
          initialMode={authMode}
        />
      </div>
    </nav>
  );
};

export default Navbar;
