import React, { useState } from 'react';
import { ArrowRight, Check, Loader2 } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const EarlyAccessForm = ({ planInterest = 'free' }) => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      setStatus('error');
      setMessage('Bitte geben Sie eine gültige E-Mail-Adresse ein.');
      return;
    }

    setStatus('loading');

    try {
      const response = await axios.post(`${API}/early-access`, {
        email,
        plan_interest: planInterest
      });

      if (response.data.success) {
        setStatus('success');
        setMessage(response.data.message);
        setEmail('');
      } else {
        setStatus('error');
        setMessage(response.data.message);
      }
    } catch (error) {
      setStatus('error');
      setMessage('Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.');
    }
  };

  return (
    <div className="w-full max-w-md" data-testid="early-access-form">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Ihre E-Mail-Adresse"
            className="w-full h-12 px-4 bg-[#0a0a0a] border border-white/10 text-white placeholder-[#A1A1AA] rounded-sm focus:border-[#39FF14] focus:ring-1 focus:ring-[#39FF14] focus:outline-none transition-all font-body"
            disabled={status === 'loading' || status === 'success'}
            data-testid="early-access-email-input"
          />
        </div>
        <button
          type="submit"
          disabled={status === 'loading' || status === 'success'}
          className="h-12 px-6 bg-[#39FF14] text-black font-bold uppercase tracking-wide text-sm rounded-sm hover:bg-[#2ebb11] hover:shadow-[0_0_20px_rgba(57,255,20,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          data-testid="early-access-submit-btn"
        >
          {status === 'loading' ? (
            <Loader2 size={18} className="animate-spin" />
          ) : status === 'success' ? (
            <>
              <Check size={18} />
              Registriert
            </>
          ) : (
            <>
              Zugang Sichern
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </form>
      
      {message && (
        <p 
          className={`mt-3 text-sm ${status === 'success' ? 'text-[#39FF14]' : 'text-[#FF3B30]'}`}
          data-testid="early-access-message"
        >
          {message}
        </p>
      )}
    </div>
  );
};

export default EarlyAccessForm;
