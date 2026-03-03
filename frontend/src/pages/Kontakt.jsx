import React, { useState } from 'react';
import { ArrowLeft, Send, Loader2, Check, Mail, MapPin, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const Kontakt = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      setStatus('error');
      setErrorMessage('Bitte füllen Sie alle Felder aus.');
      return;
    }

    if (!formData.email.includes('@')) {
      setStatus('error');
      setErrorMessage('Bitte geben Sie eine gültige E-Mail-Adresse ein.');
      return;
    }

    setStatus('loading');

    try {
      const response = await axios.post(`${API}/contact`, formData);

      if (response.data.success) {
        setStatus('success');
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        setStatus('error');
        setErrorMessage(response.data.message || 'Ein Fehler ist aufgetreten.');
      }
    } catch (error) {
      setStatus('error');
      setErrorMessage('Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-24 pb-16" data-testid="kontakt-page">
      <div className="max-w-5xl mx-auto px-4 md:px-8">
        {/* Back Link */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-sm text-[#A1A1AA] hover:text-[#39FF14] transition-colors mb-8"
          data-testid="back-to-home"
        >
          <ArrowLeft size={16} />
          Zurück zur Startseite
        </Link>

        {/* Header */}
        <h1 className="font-heading text-4xl md:text-5xl font-bold uppercase tracking-tighter text-white mb-4">
          Kontakt
        </h1>
        <p className="text-[#A1A1AA] text-lg mb-12 max-w-2xl">
          Haben Sie Fragen zu Betradarmus? Wir freuen uns auf Ihre Nachricht.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Contact Info */}
          <div className="space-y-6">
            <div className="p-6 bg-[#121212] border border-white/5 rounded-sm">
              <div className="w-12 h-12 flex items-center justify-center bg-[#39FF14]/10 rounded-sm mb-4">
                <Mail size={24} className="text-[#39FF14]" />
              </div>
              <h3 className="font-heading text-lg uppercase tracking-tight text-white mb-2">
                E-Mail
              </h3>
              <p className="text-[#A1A1AA]">info@betradarmus.de</p>
            </div>

            <div className="p-6 bg-[#121212] border border-white/5 rounded-sm">
              <div className="w-12 h-12 flex items-center justify-center bg-[#39FF14]/10 rounded-sm mb-4">
                <MapPin size={24} className="text-[#39FF14]" />
              </div>
              <h3 className="font-heading text-lg uppercase tracking-tight text-white mb-2">
                Adresse
              </h3>
              <p className="text-[#A1A1AA]">
                Interpohl Solutions GmbH i.Gr.<br />
                Kontor H72<br />
                Hansastr. 72<br />
                44137 Dortmund<br />
                Deutschland
              </p>
            </div>

            <div className="p-6 bg-[#121212] border border-white/5 rounded-sm">
              <div className="w-12 h-12 flex items-center justify-center bg-[#39FF14]/10 rounded-sm mb-4">
                <Phone size={24} className="text-[#39FF14]" />
              </div>
              <h3 className="font-heading text-lg uppercase tracking-tight text-white mb-2">
                Telefon
              </h3>
              <p className="text-[#A1A1AA]">0170-7967959</p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="p-8 bg-[#121212] border border-white/5 rounded-sm">
              {status === 'success' ? (
                <div className="text-center py-12" data-testid="contact-success">
                  <div className="w-16 h-16 flex items-center justify-center bg-[#39FF14]/10 rounded-full mx-auto mb-6">
                    <Check size={32} className="text-[#39FF14]" />
                  </div>
                  <h3 className="font-heading text-2xl uppercase tracking-tight text-white mb-3">
                    Nachricht gesendet
                  </h3>
                  <p className="text-[#A1A1AA] mb-6">
                    Vielen Dank für Ihre Nachricht. Wir werden uns in Kürze bei Ihnen melden.
                  </p>
                  <button
                    onClick={() => setStatus('idle')}
                    className="h-10 px-6 bg-white/5 border border-white/10 text-white font-bold uppercase tracking-wide text-xs rounded-sm hover:bg-white/10 transition-all"
                  >
                    Weitere Nachricht senden
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6" data-testid="contact-form">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm text-[#A1A1AA] mb-2 uppercase tracking-wide">
                        Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full h-12 px-4 bg-[#0a0a0a] border border-white/10 text-white placeholder-[#A1A1AA]/50 rounded-sm focus:border-[#39FF14] focus:ring-1 focus:ring-[#39FF14] focus:outline-none transition-all"
                        placeholder="Ihr Name"
                        data-testid="contact-name-input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-[#A1A1AA] mb-2 uppercase tracking-wide">
                        E-Mail *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full h-12 px-4 bg-[#0a0a0a] border border-white/10 text-white placeholder-[#A1A1AA]/50 rounded-sm focus:border-[#39FF14] focus:ring-1 focus:ring-[#39FF14] focus:outline-none transition-all"
                        placeholder="ihre@email.de"
                        data-testid="contact-email-input"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-[#A1A1AA] mb-2 uppercase tracking-wide">
                      Betreff *
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full h-12 px-4 bg-[#0a0a0a] border border-white/10 text-white placeholder-[#A1A1AA]/50 rounded-sm focus:border-[#39FF14] focus:ring-1 focus:ring-[#39FF14] focus:outline-none transition-all"
                      placeholder="Worum geht es?"
                      data-testid="contact-subject-input"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-[#A1A1AA] mb-2 uppercase tracking-wide">
                      Nachricht *
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows={6}
                      className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/10 text-white placeholder-[#A1A1AA]/50 rounded-sm focus:border-[#39FF14] focus:ring-1 focus:ring-[#39FF14] focus:outline-none transition-all resize-none"
                      placeholder="Ihre Nachricht..."
                      data-testid="contact-message-input"
                    />
                  </div>

                  {status === 'error' && (
                    <p className="text-sm text-[#FF3B30]" data-testid="contact-error">
                      {errorMessage}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="w-full md:w-auto h-12 px-8 bg-[#39FF14] text-black font-bold uppercase tracking-wide text-sm rounded-sm hover:bg-[#2ebb11] hover:shadow-[0_0_20px_rgba(57,255,20,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    data-testid="contact-submit-btn"
                  >
                    {status === 'loading' ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <>
                        Nachricht senden
                        <Send size={18} />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-12 p-6 bg-[#121212] border border-white/5 rounded-sm">
          <p className="text-sm text-[#A1A1AA] text-center">
            <strong className="text-white">Hinweis:</strong> Betradarmus ist eine datenbasierte 
            Analyseplattform. Es werden keine Wetten angeboten oder vermittelt.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Kontakt;
