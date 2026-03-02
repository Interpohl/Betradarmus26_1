import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, Linkedin, Twitter } from 'lucide-react';

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
                <Link to="/impressum" className="footer-link text-sm" data-testid="footer-impressum">
                  Impressum
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
              Folgen Sie uns
            </h4>
            <div className="flex items-center gap-4">
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 flex items-center justify-center bg-white/5 border border-white/10 rounded-sm hover:bg-white/10 hover:border-white/20 transition-all"
                data-testid="footer-linkedin"
              >
                <Linkedin size={18} className="text-[#A1A1AA]" />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 flex items-center justify-center bg-white/5 border border-white/10 rounded-sm hover:bg-white/10 hover:border-white/20 transition-all"
                data-testid="footer-twitter"
              >
                <Twitter size={18} className="text-[#A1A1AA]" />
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
