import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
  CreditCard, 
  Calendar, 
  AlertCircle, 
  CheckCircle, 
  XCircle,
  ExternalLink,
  Copy,
  RefreshCw,
  MessageCircle,
  Link2,
  Loader2,
  Crown,
  Zap,
  Star
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const planIcons = {
  free: Star,
  pro: Zap,
  elite: Crown
};

const planColors = {
  free: 'text-[#A1A1AA]',
  pro: 'text-[#39FF14]',
  elite: 'text-[#00C2FF]'
};

const statusColors = {
  active: 'bg-[#39FF14]/20 text-[#39FF14]',
  past_due: 'bg-[#FFD700]/20 text-[#FFD700]',
  canceled: 'bg-[#FF0040]/20 text-[#FF0040]',
  inactive: 'bg-[#A1A1AA]/20 text-[#A1A1AA]'
};

const statusLabels = {
  active: 'Aktiv',
  past_due: 'Zahlung ausstehend',
  canceled: 'Gekündigt',
  inactive: 'Inaktiv'
};

export const BillingPage = () => {
  const { user, isAuthenticated, token } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [billingInfo, setBillingInfo] = useState(null);
  const [linkCode, setLinkCode] = useState('');
  const [generatingCode, setGeneratingCode] = useState(false);
  const [canceling, setCanceling] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
      return;
    }
    fetchBillingInfo();
  }, [isAuthenticated, navigate]);

  const fetchBillingInfo = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/billing/info`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBillingInfo(response.data);
    } catch (error) {
      console.error('Error fetching billing info:', error);
      toast.error('Fehler beim Laden der Abrechnungsdaten');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateLinkCode = async () => {
    try {
      setGeneratingCode(true);
      const response = await axios.post(`${API}/account/link-telegram/generate`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLinkCode(response.data.code);
      toast.success('Code generiert! Sende ihn an @betradarmus_bot');
    } catch (error) {
      toast.error('Fehler beim Generieren des Codes');
    } finally {
      setGeneratingCode(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(linkCode);
    toast.success('Code kopiert!');
  };

  const handleCancelSubscription = async () => {
    if (!window.confirm('Möchtest du dein Abo wirklich kündigen? Du behältst Zugriff bis zum Ende der aktuellen Laufzeit.')) {
      return;
    }
    
    try {
      setCanceling(true);
      await axios.post(`${API}/billing/cancel`, { immediate: false }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Abo wird zum Ende der Laufzeit gekündigt');
      fetchBillingInfo();
    } catch (error) {
      toast.error('Fehler beim Kündigen des Abos');
    } finally {
      setCanceling(false);
    }
  };

  const handleOpenPortal = async () => {
    try {
      const response = await axios.get(`${API}/billing/portal`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      window.open(response.data.url, '_blank');
    } catch (error) {
      toast.error('Portal nicht verfügbar. Bitte kontaktiere den Support.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#39FF14] animate-spin" />
      </div>
    );
  }

  const subscription = billingInfo?.subscription;
  const payments = billingInfo?.payments || [];
  const linkedTelegram = billingInfo?.linked_telegram;
  
  const PlanIcon = planIcons[subscription?.plan || 'free'];

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-12 px-4" data-testid="billing-page">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Abrechnung & Abo</h1>
          <p className="text-[#A1A1AA]">Verwalte dein Abonnement und deine Zahlungen</p>
        </div>

        {/* Current Plan Card */}
        <div className="bg-[#121212] border border-white/10 rounded-2xl p-6 mb-6" data-testid="current-plan-card">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                subscription?.plan === 'elite' ? 'bg-[#00C2FF]/20' : 
                subscription?.plan === 'pro' ? 'bg-[#39FF14]/20' : 'bg-white/10'
              }`}>
                <PlanIcon className={`w-7 h-7 ${planColors[subscription?.plan || 'free']}`} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  {(subscription?.plan || 'free').toUpperCase()} Plan
                </h2>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                  statusColors[subscription?.status || 'active']
                }`}>
                  {subscription?.status === 'active' && <CheckCircle className="w-3 h-3" />}
                  {subscription?.status === 'past_due' && <AlertCircle className="w-3 h-3" />}
                  {subscription?.status === 'canceled' && <XCircle className="w-3 h-3" />}
                  {statusLabels[subscription?.status || 'active']}
                </span>
              </div>
            </div>
            
            {subscription?.plan !== 'free' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/#pricing')}
                className="border-white/10 text-white hover:bg-white/5"
              >
                Plan ändern
              </Button>
            )}
          </div>

          {/* Subscription Details */}
          {subscription?.plan !== 'free' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white/5 rounded-xl p-4">
                <div className="flex items-center gap-2 text-[#A1A1AA] text-sm mb-1">
                  <CreditCard className="w-4 h-4" />
                  Abrechnungsintervall
                </div>
                <p className="text-white font-medium">
                  {subscription?.billing_interval === 'yearly' ? 'Jährlich' : 'Monatlich'}
                </p>
              </div>
              
              <div className="bg-white/5 rounded-xl p-4">
                <div className="flex items-center gap-2 text-[#A1A1AA] text-sm mb-1">
                  <Calendar className="w-4 h-4" />
                  Nächste Abrechnung
                </div>
                <p className="text-white font-medium">
                  {subscription?.current_period_end 
                    ? new Date(subscription.current_period_end).toLocaleDateString('de-DE')
                    : '-'
                  }
                </p>
              </div>

              <div className="bg-white/5 rounded-xl p-4">
                <div className="flex items-center gap-2 text-[#A1A1AA] text-sm mb-1">
                  <RefreshCw className="w-4 h-4" />
                  Automatische Verlängerung
                </div>
                <p className="text-white font-medium">
                  {subscription?.cancel_at_period_end ? 'Deaktiviert' : 'Aktiv'}
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            {subscription?.plan === 'free' ? (
              <Button
                onClick={() => navigate('/#pricing')}
                className="bg-[#39FF14] text-black hover:bg-[#39FF14]/90"
              >
                <Zap className="w-4 h-4 mr-2" />
                Upgrade auf PRO
              </Button>
            ) : (
              <>
                {subscription?.provider === 'stripe' && (
                  <Button
                    variant="outline"
                    onClick={handleOpenPortal}
                    className="border-white/10 text-white hover:bg-white/5"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Zahlungsdaten verwalten
                  </Button>
                )}
                
                {!subscription?.cancel_at_period_end && (
                  <Button
                    variant="outline"
                    onClick={handleCancelSubscription}
                    disabled={canceling}
                    className="border-[#FF0040]/30 text-[#FF0040] hover:bg-[#FF0040]/10"
                  >
                    {canceling && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Abo kündigen
                  </Button>
                )}
              </>
            )}
          </div>

          {subscription?.cancel_at_period_end && (
            <div className="mt-4 p-4 bg-[#FFD700]/10 border border-[#FFD700]/20 rounded-xl">
              <p className="text-[#FFD700] text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Dein Abo endet am {subscription?.current_period_end 
                  ? new Date(subscription.current_period_end).toLocaleDateString('de-DE')
                  : 'Ende der Laufzeit'
                }
              </p>
            </div>
          )}
        </div>

        {/* Telegram Link Card */}
        <div className="bg-[#121212] border border-white/10 rounded-2xl p-6 mb-6" data-testid="telegram-link-card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-[#0088cc]/20 rounded-lg flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-[#0088cc]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Telegram Verknüpfung</h3>
              <p className="text-[#A1A1AA] text-sm">
                Verbinde deinen Account mit Telegram für automatische Synchronisierung
              </p>
            </div>
          </div>

          {linkedTelegram ? (
            <div className="flex items-center gap-3 p-4 bg-[#39FF14]/10 border border-[#39FF14]/20 rounded-xl">
              <CheckCircle className="w-5 h-5 text-[#39FF14]" />
              <div>
                <p className="text-white font-medium">Telegram verknüpft</p>
                <p className="text-[#A1A1AA] text-sm">ID: {linkedTelegram}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-[#A1A1AA] text-sm">
                Verknüpfe dein Telegram-Konto, um deinen Subscription-Status automatisch zu synchronisieren.
              </p>
              
              {linkCode ? (
                <div className="flex items-center gap-3">
                  <div className="flex-1 p-3 bg-white/5 border border-white/10 rounded-lg font-mono text-lg text-[#39FF14] text-center">
                    {linkCode}
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleCopyCode}
                    className="border-white/10 text-white"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              ) : null}
              
              <div className="flex items-center gap-3">
                <Button
                  onClick={handleGenerateLinkCode}
                  disabled={generatingCode}
                  variant="outline"
                  className="border-[#0088cc]/30 text-[#0088cc] hover:bg-[#0088cc]/10"
                >
                  {generatingCode ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Link2 className="w-4 h-4 mr-2" />
                  )}
                  {linkCode ? 'Neuen Code generieren' : 'Verknüpfungscode generieren'}
                </Button>
                
                <a
                  href="https://t.me/betradarmus_bot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#0088cc] text-sm hover:underline flex items-center gap-1"
                >
                  @betradarmus_bot öffnen
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              
              {linkCode && (
                <p className="text-[#A1A1AA] text-xs">
                  Sende diesen Code an @betradarmus_bot auf Telegram. Der Code ist 24 Stunden gültig.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Payment History */}
        <div className="bg-[#121212] border border-white/10 rounded-2xl p-6" data-testid="payment-history">
          <h3 className="text-lg font-bold text-white mb-4">Zahlungsverlauf</h3>
          
          {payments.length > 0 ? (
            <div className="space-y-3">
              {payments.map((payment, index) => (
                <div 
                  key={payment.id || index}
                  className="flex items-center justify-between p-4 bg-white/5 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      payment.status === 'completed' ? 'bg-[#39FF14]/20' : 'bg-[#FF0040]/20'
                    }`}>
                      {payment.status === 'completed' ? (
                        <CheckCircle className="w-4 h-4 text-[#39FF14]" />
                      ) : (
                        <XCircle className="w-4 h-4 text-[#FF0040]" />
                      )}
                    </div>
                    <div>
                      <p className="text-white font-medium">
                        {payment.payment_type === 'subscription' ? 'Abo-Zahlung' : 'Einmalzahlung'}
                      </p>
                      <p className="text-[#A1A1AA] text-sm">
                        {new Date(payment.created_at).toLocaleDateString('de-DE')} • {payment.provider}
                      </p>
                    </div>
                  </div>
                  <p className="text-white font-mono font-medium">
                    €{payment.amount?.toFixed(2) || '0.00'}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-[#A1A1AA]">
              <CreditCard className="w-10 h-10 mx-auto mb-3 opacity-50" />
              <p>Noch keine Zahlungen vorhanden</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BillingPage;
