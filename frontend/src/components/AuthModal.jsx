import React, { useState } from 'react';
import { X, Mail, Lock, User, Loader2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AuthModal = ({ isOpen, onClose, initialMode = 'login' }) => {
  const [mode, setMode] = useState(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login, register } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    let result;
    if (mode === 'login') {
      result = await login(email, password);
    } else {
      if (password.length < 8) {
        setError('Passwort muss mindestens 8 Zeichen lang sein.');
        setLoading(false);
        return;
      }
      result = await register(name, email, password);
    }

    setLoading(false);

    if (result.success) {
      onClose();
      setName('');
      setEmail('');
      setPassword('');
    } else {
      setError(result.message);
    }
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" data-testid="auth-modal">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md bg-[#121212] border border-white/10 rounded-sm p-8 animate-fade-in-up">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[#A1A1AA] hover:text-white transition-colors"
          data-testid="auth-modal-close"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <h2 className="font-heading text-2xl uppercase tracking-tight text-white mb-2">
          {mode === 'login' ? 'Anmelden' : 'Registrieren'}
        </h2>
        <p className="text-sm text-[#A1A1AA] mb-6">
          {mode === 'login' 
            ? 'Melden Sie sich an, um auf alle Features zuzugreifen.' 
            : 'Erstellen Sie ein kostenloses Konto.'}
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-sm text-[#A1A1AA] mb-2 uppercase tracking-wide">
                Name
              </label>
              <div className="relative">
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A1A1AA]" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-12 pl-12 pr-4 bg-[#0a0a0a] border border-white/10 text-white placeholder-[#A1A1AA]/50 rounded-sm focus:border-[#39FF14] focus:ring-1 focus:ring-[#39FF14] focus:outline-none transition-all"
                  placeholder="Ihr Name"
                  required
                  data-testid="auth-name-input"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm text-[#A1A1AA] mb-2 uppercase tracking-wide">
              E-Mail
            </label>
            <div className="relative">
              <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A1A1AA]" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-12 pl-12 pr-4 bg-[#0a0a0a] border border-white/10 text-white placeholder-[#A1A1AA]/50 rounded-sm focus:border-[#39FF14] focus:ring-1 focus:ring-[#39FF14] focus:outline-none transition-all"
                placeholder="ihre@email.de"
                required
                data-testid="auth-email-input"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-[#A1A1AA] mb-2 uppercase tracking-wide">
              Passwort
            </label>
            <div className="relative">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A1A1AA]" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-12 pl-12 pr-12 bg-[#0a0a0a] border border-white/10 text-white placeholder-[#A1A1AA]/50 rounded-sm focus:border-[#39FF14] focus:ring-1 focus:ring-[#39FF14] focus:outline-none transition-all"
                placeholder={mode === 'register' ? 'Min. 8 Zeichen' : '••••••••'}
                required
                data-testid="auth-password-input"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A1A1AA] hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-sm text-[#FF3B30]" data-testid="auth-error">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-[#39FF14] text-black font-bold uppercase tracking-wide text-sm rounded-sm hover:bg-[#2ebb11] hover:shadow-[0_0_20px_rgba(57,255,20,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            data-testid="auth-submit-btn"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              mode === 'login' ? 'Anmelden' : 'Konto erstellen'
            )}
          </button>
        </form>

        {/* Switch Mode */}
        <p className="mt-6 text-center text-sm text-[#A1A1AA]">
          {mode === 'login' ? (
            <>
              Noch kein Konto?{' '}
              <button
                onClick={switchMode}
                className="text-[#39FF14] hover:underline"
                data-testid="auth-switch-mode"
              >
                Jetzt registrieren
              </button>
            </>
          ) : (
            <>
              Bereits registriert?{' '}
              <button
                onClick={switchMode}
                className="text-[#39FF14] hover:underline"
                data-testid="auth-switch-mode"
              >
                Anmelden
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
};

export default AuthModal;
