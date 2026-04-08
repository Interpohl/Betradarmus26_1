/**
 * Push Notification Settings Component
 * Allows users to enable/disable push notifications
 */
import React, { useState, useEffect } from 'react';
import { Bell, BellOff, CheckCircle, AlertCircle, Loader2, Send } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import pushService from '../utils/pushNotifications';

const API = process.env.REACT_APP_BACKEND_URL;

export const PushNotificationSettings = () => {
  const { token, user } = useAuth();
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSendingTest, setIsSendingTest] = useState(false);

  // Check push support and status on mount
  useEffect(() => {
    const checkStatus = async () => {
      setIsLoading(true);
      
      // Check browser support
      const supported = pushService.isPushSupported();
      setIsSupported(supported);
      
      if (!supported) {
        setIsLoading(false);
        return;
      }
      
      // Check permission
      const perm = pushService.getPermissionStatus();
      setPermission(perm);
      
      // Check subscription status
      const subscribed = await pushService.isSubscribed();
      setIsSubscribed(subscribed);
      
      setIsLoading(false);
    };
    
    checkStatus();
  }, []);

  // Enable push notifications
  const handleEnable = async () => {
    setIsLoading(true);
    
    try {
      // Request permission
      const granted = await pushService.requestPermission();
      setPermission(granted ? 'granted' : 'denied');
      
      if (!granted) {
        toast.error('Push-Benachrichtigungen wurden blockiert');
        setIsLoading(false);
        return;
      }
      
      // Subscribe
      await pushService.subscribeToPush(token);
      setIsSubscribed(true);
      toast.success('Push-Benachrichtigungen aktiviert!');
      
    } catch (error) {
      console.error('Push subscription error:', error);
      toast.error('Fehler beim Aktivieren der Push-Benachrichtigungen');
    }
    
    setIsLoading(false);
  };

  // Disable push notifications
  const handleDisable = async () => {
    setIsLoading(true);
    
    try {
      await pushService.unsubscribeFromPush(token);
      setIsSubscribed(false);
      toast.success('Push-Benachrichtigungen deaktiviert');
    } catch (error) {
      console.error('Push unsubscribe error:', error);
      toast.error('Fehler beim Deaktivieren');
    }
    
    setIsLoading(false);
  };

  // Send test notification
  const handleSendTest = async () => {
    setIsSendingTest(true);
    
    try {
      const response = await fetch(`${API}/api/push/send-test`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('Test-Benachrichtigung gesendet!');
      } else {
        toast.error(data.detail || 'Test fehlgeschlagen');
      }
    } catch (error) {
      console.error('Test notification error:', error);
      toast.error('Fehler beim Senden der Test-Benachrichtigung');
    }
    
    setIsSendingTest(false);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-[#121212] border border-white/10 rounded-xl p-6">
        <div className="flex items-center gap-3">
          <Loader2 className="w-5 h-5 text-[#39FF14] animate-spin" />
          <span className="text-[#A1A1AA]">Lade Push-Einstellungen...</span>
        </div>
      </div>
    );
  }

  // Not supported
  if (!isSupported) {
    return (
      <div className="bg-[#121212] border border-white/10 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#A1A1AA]/10 flex items-center justify-center flex-shrink-0">
            <BellOff className="w-6 h-6 text-[#A1A1AA]" />
          </div>
          <div>
            <h3 className="text-white font-semibold mb-1">Push-Benachrichtigungen</h3>
            <p className="text-[#A1A1AA] text-sm">
              Dein Browser unterstützt keine Push-Benachrichtigungen. 
              Verwende Chrome, Firefox, Edge oder Safari für diese Funktion.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Permission denied
  if (permission === 'denied') {
    return (
      <div className="bg-[#121212] border border-white/10 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-6 h-6 text-red-400" />
          </div>
          <div>
            <h3 className="text-white font-semibold mb-1">Push-Benachrichtigungen blockiert</h3>
            <p className="text-[#A1A1AA] text-sm mb-3">
              Du hast Push-Benachrichtigungen in deinem Browser blockiert. 
              Um sie zu aktivieren, ändere die Berechtigung in deinen Browser-Einstellungen.
            </p>
            <ol className="text-[#A1A1AA] text-sm list-decimal list-inside space-y-1">
              <li>Klicke auf das Schloss-Symbol in der Adressleiste</li>
              <li>Finde "Benachrichtigungen" in den Website-Einstellungen</li>
              <li>Ändere die Berechtigung auf "Erlauben"</li>
              <li>Lade die Seite neu</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#121212] border border-white/10 rounded-xl p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
            isSubscribed ? 'bg-[#39FF14]/10' : 'bg-white/5'
          }`}>
            {isSubscribed ? (
              <Bell className="w-6 h-6 text-[#39FF14]" />
            ) : (
              <BellOff className="w-6 h-6 text-[#A1A1AA]" />
            )}
          </div>
          <div>
            <h3 className="text-white font-semibold mb-1">Push-Benachrichtigungen</h3>
            <p className="text-[#A1A1AA] text-sm mb-3">
              {isSubscribed 
                ? 'Du erhältst Benachrichtigungen für neue Signale direkt im Browser.'
                : 'Aktiviere Push-Benachrichtigungen, um keine Signale zu verpassen.'
              }
            </p>
            
            {/* Status Badge */}
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
              isSubscribed 
                ? 'bg-[#39FF14]/10 text-[#39FF14]' 
                : 'bg-white/5 text-[#A1A1AA]'
            }`}>
              {isSubscribed ? (
                <>
                  <CheckCircle className="w-3 h-3" />
                  Aktiviert
                </>
              ) : (
                <>
                  <BellOff className="w-3 h-3" />
                  Deaktiviert
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* Action Button */}
        <div className="flex flex-col gap-2">
          {isSubscribed ? (
            <>
              <button
                onClick={handleSendTest}
                disabled={isSendingTest}
                className="px-4 py-2 bg-[#39FF14]/10 text-[#39FF14] rounded-lg text-sm font-medium hover:bg-[#39FF14]/20 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isSendingTest ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                Test
              </button>
              <button
                onClick={handleDisable}
                disabled={isLoading}
                className="px-4 py-2 bg-white/5 text-[#A1A1AA] rounded-lg text-sm font-medium hover:bg-white/10 transition-colors disabled:opacity-50"
              >
                Deaktivieren
              </button>
            </>
          ) : (
            <button
              onClick={handleEnable}
              disabled={isLoading}
              className="px-4 py-2 bg-[#39FF14] text-black rounded-lg text-sm font-medium hover:bg-[#39FF14]/90 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Bell className="w-4 h-4" />
              )}
              Aktivieren
            </button>
          )}
        </div>
      </div>
      
      {/* Premium hint for free users */}
      {user?.subscription === 'free' && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <p className="text-[#A1A1AA] text-xs">
            💡 <span className="text-[#FFD60A]">PRO</span> und <span className="text-[#FFD60A]">ELITE</span> Nutzer 
            erhalten Push-Benachrichtigungen für alle Signale. FREE Nutzer erhalten nur wichtige Updates.
          </p>
        </div>
      )}
    </div>
  );
};

export default PushNotificationSettings;
