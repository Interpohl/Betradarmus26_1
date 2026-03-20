import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, Facebook, Instagram } from 'lucide-react';

// Custom TikTok Icon (not in lucide)
const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

// Custom Twitch Icon
const TwitchIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
    <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"/>
  </svg>
);

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0a0a0a] border-t border-white/5" data-testid="footer">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 flex items-center justify-center bg-[#39FF14] rounded-sm">
                <Activity size={18} className="text-black" />
              </div>
              <span className="font-heading text-xl font-bold uppercase tracking-tight text-white">
                Betradarmus
              </span>
            </Link>
            <p className="text-sm text-[#A1A1AA] leading-relaxed">
              Live-Fußball intelligent analysiert. KI-gestützte Marktanalyse in Echtzeit.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-heading text-sm font-semibold uppercase tracking-wider text-white mb-4">
              Navigation
            </h4>
            <ul className="space-y-3">
              <li>
                <Link to="/#problem" className="footer-link text-sm">
                  Das Problem
                </Link>
              </li>
              <li>
                <Link to="/#solution" className="footer-link text-sm">
                  Die Lösung
                </Link>
              </li>
              <li>
                <Link to="/#technology" className="footer-link text-sm">
                  Technologie
                </Link>
              </li>
              <li>
                <Link to="/#pricing" className="footer-link text-sm">
                  Preise
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-heading text-sm font-semibold uppercase tracking-wider text-white mb-4">
              Rechtliches
            </h4>
            <ul className="space-y-3">
              <li>
                <Link to="/faq" className="footer-link text-sm" data-testid="footer-faq">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/impressum" className="footer-link text-sm" data-testid="footer-impressum">
                  Impressum
                </Link>
              </li>
              <li>
                <Link to="/agb" className="footer-link text-sm" data-testid="footer-agb">
                  AGB
                </Link>
              </li>
              <li>
                <Link to="/datenschutz" className="footer-link text-sm" data-testid="footer-datenschutz">
                  Datenschutz
                </Link>
              </li>
              <li>
                <Link to="/kontakt" className="footer-link text-sm" data-testid="footer-kontakt">
                  Kontakt
                </Link>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-heading text-sm font-semibold uppercase tracking-wider text-white mb-4">
              Folge uns
            </h4>
            <div className="flex items-center gap-3">
              <a 
                href="https://facebook.com/betradarmus" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 flex items-center justify-center bg-white/5 border border-white/10 rounded-sm hover:bg-[#1877F2]/20 hover:border-[#1877F2]/50 transition-all group"
                data-testid="footer-facebook"
              >
                <Facebook size={18} className="text-[#A1A1AA] group-hover:text-[#1877F2]" />
              </a>
              <a 
                href="https://instagram.com/betradarmus" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 flex items-center justify-center bg-white/5 border border-white/10 rounded-sm hover:bg-[#E4405F]/20 hover:border-[#E4405F]/50 transition-all group"
                data-testid="footer-instagram"
              >
                <Instagram size={18} className="text-[#A1A1AA] group-hover:text-[#E4405F]" />
              </a>
              <a 
                href="https://tiktok.com/@betradarmus" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 flex items-center justify-center bg-white/5 border border-white/10 rounded-sm hover:bg-white/20 hover:border-white/50 transition-all group"
                data-testid="footer-tiktok"
              >
                <span className="text-[#A1A1AA] group-hover:text-white"><TikTokIcon /></span>
              </a>
              <a 
                href="https://twitch.tv/betradarmus" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 flex items-center justify-center bg-white/5 border border-white/10 rounded-sm hover:bg-[#9146FF]/20 hover:border-[#9146FF]/50 transition-all group"
                data-testid="footer-twitch"
              >
                <span className="text-[#A1A1AA] group-hover:text-[#9146FF]"><TwitchIcon /></span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#A1A1AA]">
            © {currentYear} Betradarmus. Alle Rechte vorbehalten.
          </p>
          <p className="text-xs text-[#A1A1AA] text-center md:text-right max-w-lg">
            Betradarmus ist eine datenbasierte Analyseplattform. Es werden keine Wetten angeboten oder vermittelt.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
