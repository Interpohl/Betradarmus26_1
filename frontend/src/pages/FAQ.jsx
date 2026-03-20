import React, { useState } from 'react';
import { ChevronDown, HelpCircle, Zap, CreditCard, Shield, MessageCircle, BarChart3, Users } from 'lucide-react';

const faqData = [
  {
    category: "Allgemein",
    icon: HelpCircle,
    questions: [
      {
        q: "Was ist BETRADARMUS?",
        a: "BETRADARMUS ist eine KI-gestützte Analyseplattform für Live-Fußballmärkte. Wir analysieren in Echtzeit Marktbewegungen, Wahrscheinlichkeiten und identifizieren potenzielle Ineffizienzen. Wichtig: Wir sind KEIN Wettanbieter und vermitteln keine Wetten."
      },
      {
        q: "Wie funktioniert die KI-Analyse?",
        a: "Unsere KI verarbeitet Live-Daten aus über 50 Ligen weltweit in Echtzeit. Sie analysiert Spielverläufe, historische Muster, Quotenbewegungen und weitere Faktoren, um Marktineffizienzen zu erkennen. Das Ergebnis sind Signale mit Confidence-Index und Risk-Score."
      },
      {
        q: "Für wen ist BETRADARMUS geeignet?",
        a: "Für datenaffine Fußballfans, die analytische Einblicke suchen. Für Marktanalysten, die systematisch Wahrscheinlichkeiten auswerten. Und für Performance-Nutzer, die maximale Geschwindigkeit und präzise Risikobewertungen benötigen."
      },
      {
        q: "Ist BETRADARMUS legal?",
        a: "Ja, absolut. BETRADARMUS ist eine reine Analyseplattform. Wir bieten keine Wetten an und vermitteln auch keine. Alle Informationen dienen ausschließlich zu Analyse- und Informationszwecken."
      }
    ]
  },
  {
    category: "Signale & Analyse",
    icon: Zap,
    questions: [
      {
        q: "Was ist ein Signal?",
        a: "Ein Signal ist eine KI-generierte Analyse, die eine potenzielle Marktineffizienz identifiziert. Jedes Signal enthält: Match-Info, Markt (z.B. Over 2.5 Goals), Confidence-Index (Zuverlässigkeit), Risk-Score (Risikobewertung) und eine Erklärung der KI-Entscheidung."
      },
      {
        q: "Was bedeutet der Confidence-Index?",
        a: "Der Confidence-Index (0-100%) zeigt, wie sicher die KI bei ihrer Analyse ist. Er basiert auf historischen Daten und der Qualität der verfügbaren Informationen. Höhere Werte bedeuten höhere Zuverlässigkeit der Analyse."
      },
      {
        q: "Was ist der Risk-Score?",
        a: "Der Risk-Score (0-100) bewertet die Volatilität und Unsicherheit einer Situation. Ein niedriger Score bedeutet stabilere Bedingungen, ein hoher Score deutet auf höhere Varianz hin."
      },
      {
        q: "Wie oft werden Signale gesendet?",
        a: "Die Häufigkeit variiert je nach Live-Spielen und erkannten Opportunities. An Spieltagen mit vielen Partien können es mehrere Signale pro Stunde sein. FREE-Nutzer erhalten eine begrenzte Anzahl, PRO-Nutzer alle verfügbaren Signale."
      },
      {
        q: "Wie hoch ist eure Trefferquote?",
        a: "Unsere aktuelle Trefferquote liegt bei über 70% (verifiziert durch automatische Auswertung via The Odds API). Alle Statistiken sind transparent auf unserer Homepage einsehbar - keine versteckten Zahlen."
      }
    ]
  },
  {
    category: "Telegram Bot",
    icon: MessageCircle,
    questions: [
      {
        q: "Wie starte ich den Telegram Bot?",
        a: "Öffne Telegram und suche nach @Betradarmus_bot oder klicke direkt auf t.me/Betradarmus_bot. Sende /start und folge den Anweisungen zur Registrierung."
      },
      {
        q: "Welche Befehle gibt es?",
        a: "/start - Bot starten und registrieren\n/settings - Einstellungen anpassen\n/subscribe - Ligen abonnieren\n/unsubscribe - Ligen abbestellen\n/status - Aktuellen Status anzeigen\n/help - Hilfe anzeigen"
      },
      {
        q: "Kann ich bestimmte Ligen filtern?",
        a: "Ja! Mit /subscribe kannst du auswählen, welche Ligen du verfolgen möchtest (z.B. nur Bundesliga und Premier League). Du erhältst dann nur Signale für diese Ligen."
      },
      {
        q: "Gibt es eine Community-Gruppe?",
        a: "Ja! Unsere kostenlose Telegram Community-Gruppe ist für alle offen. Tritt jetzt bei: https://t.me/+Pb8X_nXzKu41N2Yy - Dort kannst du dich mit anderen Nutzern austauschen und erhältst zusätzliche Insights."
      }
    ]
  },
  {
    category: "Preise & Pläne",
    icon: CreditCard,
    questions: [
      {
        q: "Was kostet BETRADARMUS?",
        a: "FREE: 0€ - Kostenloser Einstieg mit Basis-Funktionen und Community-Zugang.\nPRO: 49€/Monat - Voller Zugriff auf alle Signale, Risk Scores und erweiterte Analysen.\nELITE: 199€/Monat - Premium-Features inkl. API-Zugang und Priority Support (Coming Soon)."
      },
      {
        q: "Welche Zahlungsmethoden werden akzeptiert?",
        a: "Wir akzeptieren Kreditkarte (Visa, Mastercard, American Express), PayPal und Klarna. Alle Zahlungen werden sicher über Stripe abgewickelt."
      },
      {
        q: "Kann ich jederzeit kündigen?",
        a: "Ja, du kannst dein Abo jederzeit zum Ende des Abrechnungszeitraums kündigen. Es gibt keine versteckten Gebühren oder Mindestlaufzeiten."
      }
    ]
  },
  {
    category: "Statistiken",
    icon: BarChart3,
    questions: [
      {
        q: "Wie werden die Statistiken berechnet?",
        a: "Alle Tipps werden automatisch via The Odds API ausgewertet. Die Endergebnisse der Spiele werden täglich abgerufen und mit unseren Vorhersagen abgeglichen. Die Statistiken sind 100% transparent und nachvollziehbar."
      },
      {
        q: "Was bedeutet ROI?",
        a: "ROI (Return on Investment) zeigt die prozentuale Rendite basierend auf den Tipps. Ein ROI von +42% bedeutet beispielsweise, dass bei gleichmäßigen Einsätzen ein Gewinn von 42% über alle Tipps erzielt wurde."
      },
      {
        q: "Was ist ein Streak?",
        a: "Ein Streak zeigt aufeinanderfolgende Gewinne (oder Verluste). Ein '5er HOT STREAK' bedeutet 5 gewonnene Tipps in Folge. Streaks sind ein Indikator für die aktuelle Form unserer KI-Analyse."
      }
    ]
  },
  {
    category: "Sicherheit & Datenschutz",
    icon: Shield,
    questions: [
      {
        q: "Wie sicher sind meine Daten?",
        a: "Wir nehmen Datenschutz sehr ernst. Alle Daten werden verschlüsselt übertragen (SSL/TLS) und auf sicheren Servern in Deutschland gespeichert. Wir geben keine Daten an Dritte weiter."
      },
      {
        q: "Welche Daten werden gespeichert?",
        a: "Wir speichern nur die notwendigen Daten: E-Mail-Adresse, gewählter Plan und Telegram-ID (falls verbunden). Detaillierte Informationen findest du in unserer Datenschutzerklärung."
      },
      {
        q: "Kann ich mein Konto löschen?",
        a: "Ja, du kannst jederzeit die vollständige Löschung deines Kontos und aller zugehörigen Daten anfordern. Kontaktiere uns dafür über das Kontaktformular oder per E-Mail."
      }
    ]
  },
  {
    category: "Support",
    icon: Users,
    questions: [
      {
        q: "Wie erreiche ich den Support?",
        a: "Du erreichst uns über das Kontaktformular auf unserer Website, per E-Mail an info@betradarmus.de oder direkt im Telegram Bot. PRO-Nutzer erhalten priorisierten Support."
      },
      {
        q: "Wie schnell antwortet der Support?",
        a: "Wir antworten in der Regel innerhalb von 24 Stunden. PRO- und ELITE-Nutzer erhalten Priority Support mit schnelleren Antwortzeiten."
      },
      {
        q: "Gibt es Tutorials oder Anleitungen?",
        a: "Ja! Nach der Registrierung erhältst du eine Willkommens-E-Mail mit den wichtigsten Infos. Außerdem findest du Tipps und Tutorials in unserer Telegram Community-Gruppe."
      }
    ]
  }
];

const FAQItem = ({ question, answer, isOpen, onClick }) => {
  return (
    <div className="border-b border-white/10 last:border-b-0">
      <button
        onClick={onClick}
        className="w-full py-5 flex items-center justify-between text-left hover:bg-white/5 transition-colors px-4 -mx-4 rounded-lg"
      >
        <span className="text-white font-medium pr-4">{question}</span>
        <ChevronDown 
          className={`w-5 h-5 text-[#39FF14] flex-shrink-0 transition-transform duration-300 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          isOpen ? 'max-h-96 pb-5' : 'max-h-0'
        }`}
      >
        <p className="text-[#A1A1AA] text-sm leading-relaxed whitespace-pre-line">
          {answer}
        </p>
      </div>
    </div>
  );
};

const FAQCategory = ({ category, icon: Icon, questions }) => {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <div className="bg-[#121212] border border-white/10 rounded-xl p-6 md:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 flex items-center justify-center bg-[#39FF14]/10 rounded-lg">
          <Icon className="w-5 h-5 text-[#39FF14]" />
        </div>
        <h2 className="text-xl font-bold text-white">{category}</h2>
      </div>
      <div>
        {questions.map((item, index) => (
          <FAQItem
            key={index}
            question={item.q}
            answer={item.a}
            isOpen={openIndex === index}
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
          />
        ))}
      </div>
    </div>
  );
};

export const FAQ = () => {
  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-24 pb-16" data-testid="faq-page">
      <div className="max-w-4xl mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#39FF14]/10 border border-[#39FF14]/20 rounded-full mb-6">
            <HelpCircle className="w-4 h-4 text-[#39FF14]" />
            <span className="text-[#39FF14] text-sm font-medium">Hilfe & Support</span>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            Häufig gestellte Fragen
          </h1>
          <p className="text-[#A1A1AA] max-w-2xl mx-auto">
            Finde Antworten auf die wichtigsten Fragen zu BETRADARMUS. 
            Deine Frage ist nicht dabei? Kontaktiere uns!
          </p>
        </div>

        {/* FAQ Categories */}
        <div className="space-y-6">
          {faqData.map((category, index) => (
            <FAQCategory
              key={index}
              category={category.category}
              icon={category.icon}
              questions={category.questions}
            />
          ))}
        </div>

        {/* Telegram Community CTA */}
        <div className="mt-12 p-6 bg-[#0088CC]/10 border border-[#0088CC]/30 rounded-xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#0088CC]/20 rounded-full flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-[#0088CC]" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Telegram Community</h3>
                <p className="text-[#A1A1AA] text-sm">Trete unserer kostenlosen Community bei!</p>
              </div>
            </div>
            <a
              href="https://t.me/+Pb8X_nXzKu41N2Yy"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#0088CC] text-white font-bold rounded-lg hover:bg-[#0099DD] transition-colors"
              data-testid="faq-telegram-community-btn"
            >
              <MessageCircle className="w-4 h-4" />
              Jetzt beitreten
            </a>
          </div>
        </div>

        {/* Contact CTA */}
        <div className="mt-6 text-center p-8 bg-gradient-to-r from-[#39FF14]/10 to-[#00C2FF]/10 border border-white/10 rounded-xl">
          <h3 className="text-xl font-bold text-white mb-2">
            Noch Fragen?
          </h3>
          <p className="text-[#A1A1AA] mb-6">
            Unser Support-Team hilft dir gerne weiter.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/kontakt"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#39FF14] text-black font-bold rounded-lg hover:bg-[#2ebb11] transition-colors"
            >
              Kontakt aufnehmen
            </a>
            <a
              href="https://t.me/Betradarmus_bot"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/10 text-white font-bold rounded-lg hover:bg-white/20 transition-colors border border-white/20"
            >
              <MessageCircle className="w-4 h-4" />
              Telegram Bot
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
