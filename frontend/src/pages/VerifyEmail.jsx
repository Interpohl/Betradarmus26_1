import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle, XCircle, Loader2, ArrowRight, Send } from 'lucide-react';
import { Button } from '../components/ui/button';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [status, setStatus] = useState('loading'); // loading, success, already_verified, error
  const [message, setMessage] = useState('');
  const [plan, setPlan] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Kein Verifizierungstoken gefunden.');
        return;
      }

      try {
        const response = await axios.get(`${BACKEND_URL}/api/verify-email/${token}`);
        
        if (response.data.success) {
          if (response.data.already_verified) {
            setStatus('already_verified');
          } else {
            setStatus('success');
          }
          setMessage(response.data.message);
          setPlan(response.data.plan || 'free');
          setEmail(response.data.email || '');
        }
      } catch (error) {
        setStatus('error');
        setMessage(
          error.response?.data?.detail || 
          'Ein Fehler ist aufgetreten. Bitte versuche es später erneut.'
        );
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-[#121212] border border-gray-800 rounded-xl p-8 text-center">
          {/* Logo */}
          <div className="mb-8">
            <Link to="/" className="inline-flex items-center gap-2">
              <span className="text-2xl font-bold text-white tracking-wider">BETRADARMUS</span>
            </Link>
          </div>

          {/* Loading State */}
          {status === 'loading' && (
            <div className="py-8">
              <Loader2 className="w-16 h-16 text-cyan-500 animate-spin mx-auto mb-4" />
              <p className="text-gray-400">E-Mail wird verifiziert...</p>
            </div>
          )}

          {/* Success State */}
          {status === 'success' && (
            <div className="py-4">
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-3">E-Mail bestätigt!</h1>
              <p className="text-gray-400 mb-6">{message}</p>
              
              {email && (
                <p className="text-sm text-gray-500 mb-4">
                  Registriert: <span className="text-white">{email}</span>
                </p>
              )}
              
              {plan && (
                <div className="bg-[#0a0a0a] rounded-lg p-4 mb-6">
                  <p className="text-gray-400 text-sm mb-1">Dein Plan</p>
                  <p className="text-[#39FF14] font-bold text-xl uppercase">{plan}</p>
                </div>
              )}

              {plan === 'free' && (
                <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-4 mb-6">
                  <p className="text-cyan-400 font-medium mb-2">Tritt unserer FREE Community bei!</p>
                  <a 
                    href="https://t.me/+Pb8X_nXzKu41N2Yy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-white hover:text-cyan-400 transition-colors"
                  >
                    <Send className="w-4 h-4" />
                    Telegram Gruppe beitreten
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              )}

              <div className="space-y-3">
                <a 
                  href="https://t.me/Betradarmus_bot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Button className="w-full bg-gradient-to-r from-cyan-500 to-blue-600">
                    <Send className="w-4 h-4 mr-2" />
                    Telegram Bot starten
                  </Button>
                </a>
                <Link to="/">
                  <Button variant="outline" className="w-full border-gray-700 text-gray-300 hover:bg-gray-800">
                    Zur Startseite
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* Already Verified State */}
          {status === 'already_verified' && (
            <div className="py-4">
              <div className="w-20 h-20 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-cyan-500" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-3">Bereits verifiziert</h1>
              <p className="text-gray-400 mb-6">{message}</p>
              
              <div className="space-y-3">
                <a 
                  href="https://t.me/Betradarmus_bot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Button className="w-full bg-gradient-to-r from-cyan-500 to-blue-600">
                    <Send className="w-4 h-4 mr-2" />
                    Telegram Bot starten
                  </Button>
                </a>
                <Link to="/">
                  <Button variant="outline" className="w-full border-gray-700 text-gray-300 hover:bg-gray-800">
                    Zur Startseite
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* Error State */}
          {status === 'error' && (
            <div className="py-4">
              <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <XCircle className="w-10 h-10 text-red-500" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-3">Verifizierung fehlgeschlagen</h1>
              <p className="text-gray-400 mb-6">{message}</p>
              
              <div className="space-y-3">
                <Link to="/#early-access">
                  <Button className="w-full bg-gradient-to-r from-cyan-500 to-blue-600">
                    Erneut registrieren
                  </Button>
                </Link>
                <Link to="/">
                  <Button variant="outline" className="w-full border-gray-700 text-gray-300 hover:bg-gray-800">
                    Zur Startseite
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-gray-600 text-sm mt-6">
          Bei Fragen: <a href="mailto:info@betradarmus.de" className="text-cyan-500 hover:underline">info@betradarmus.de</a>
        </p>
      </div>
    </div>
  );
};

export default VerifyEmail;
