import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Check, Loader2, XCircle, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [paymentData, setPaymentData] = useState(null);
  const [pollCount, setPollCount] = useState(0);

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (!sessionId) {
      setStatus('error');
      return;
    }

    const pollPaymentStatus = async () => {
      try {
        const response = await axios.get(`${API}/payments/status/${sessionId}`);
        
        if (response.data.payment_status === 'paid') {
          setStatus('success');
          setPaymentData(response.data);
          // Refresh user data to get updated subscription
          await refreshUser();
        } else if (response.data.status === 'expired') {
          setStatus('error');
        } else if (pollCount < 5) {
          // Continue polling
          setTimeout(() => setPollCount(prev => prev + 1), 2000);
        } else {
          setStatus('error');
        }
      } catch (error) {
        console.error('Payment status error:', error);
        if (pollCount < 5) {
          setTimeout(() => setPollCount(prev => prev + 1), 2000);
        } else {
          setStatus('error');
        }
      }
    };

    pollPaymentStatus();
  }, [sessionId, pollCount, refreshUser]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-24 pb-16 flex items-center justify-center" data-testid="payment-success-page">
      <div className="max-w-md w-full mx-4">
        <div className="p-8 bg-[#121212] border border-white/10 rounded-sm text-center">
          {status === 'loading' && (
            <>
              <div className="w-16 h-16 flex items-center justify-center bg-[#39FF14]/10 rounded-full mx-auto mb-6">
                <Loader2 size={32} className="text-[#39FF14] animate-spin" />
              </div>
              <h2 className="font-heading text-2xl uppercase tracking-tight text-white mb-3">
                Zahlung wird überprüft...
              </h2>
              <p className="text-[#A1A1AA]">
                Bitte warten Sie, während wir Ihre Zahlung bestätigen.
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-16 h-16 flex items-center justify-center bg-[#39FF14]/10 rounded-full mx-auto mb-6 animate-fade-in-up">
                <Check size={32} className="text-[#39FF14]" />
              </div>
              <h2 className="font-heading text-2xl uppercase tracking-tight text-white mb-3 animate-fade-in-up animation-delay-100">
                Zahlung erfolgreich!
              </h2>
              <p className="text-[#A1A1AA] mb-6 animate-fade-in-up animation-delay-200">
                Vielen Dank für Ihr Upgrade. Ihr Abo ist jetzt aktiv.
              </p>
              
              {paymentData && (
                <div className="p-4 bg-[#0a0a0a] border border-white/5 rounded-sm mb-6 animate-fade-in-up animation-delay-300">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[#A1A1AA]">Betrag</span>
                    <span className="font-mono text-[#39FF14]">
                      €{(paymentData.amount_total / 100).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              <button
                onClick={() => navigate('/')}
                className="w-full h-12 bg-[#39FF14] text-black font-bold uppercase tracking-wide text-sm rounded-sm hover:bg-[#2ebb11] hover:shadow-[0_0_20px_rgba(57,255,20,0.4)] transition-all animate-fade-in-up animation-delay-400"
                data-testid="payment-success-continue"
              >
                Zur Live-Analyse
              </button>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-16 h-16 flex items-center justify-center bg-[#FF3B30]/10 rounded-full mx-auto mb-6">
                <XCircle size={32} className="text-[#FF3B30]" />
              </div>
              <h2 className="font-heading text-2xl uppercase tracking-tight text-white mb-3">
                Zahlung fehlgeschlagen
              </h2>
              <p className="text-[#A1A1AA] mb-6">
                Es gab ein Problem mit Ihrer Zahlung. Bitte versuchen Sie es erneut.
              </p>
              <button
                onClick={() => navigate('/#pricing')}
                className="w-full h-12 bg-white/5 border border-white/10 text-white font-bold uppercase tracking-wide text-sm rounded-sm hover:bg-white/10 transition-all flex items-center justify-center gap-2"
              >
                <ArrowLeft size={18} />
                Zurück zu den Preisen
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
