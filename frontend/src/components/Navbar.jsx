import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Activity } from 'lucide-react';

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

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
            <button 
              onClick={() => scrollToSection('early-access')}
              className="h-10 px-5 bg-[#39FF14] text-black font-bold uppercase tracking-wide text-xs rounded-sm hover:bg-[#2ebb11] hover:shadow-[0_0_20px_rgba(57,255,20,0.4)] transition-all"
              data-testid="navbar-cta"
            >
              Early Access
            </button>
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
              <button 
                onClick={() => scrollToSection('early-access')}
                className="mt-2 h-10 bg-[#39FF14] text-black font-bold uppercase tracking-wide text-xs rounded-sm"
              >
                Early Access
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
