import React from 'react';
import { HelpCircle } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './ui/accordion';

export const FAQSection = () => {
  const faqs = [
    {
      question: 'Ist Betradarmus ein Tippdienst?',
      answer: 'Nein. Betradarmus liefert keine klassischen Tipps. Die Plattform analysiert Live-Marktdaten und bewertet, ob ein Signal aktuell sinnvoll ausführbar ist.'
    },
    {
      question: 'Bekomme ich fertige Wetten?',
      answer: 'Nein. Du erhältst strukturierte Entscheidungsdaten wie Execution Score, Risiko und Zeitfenster.'
    },
    {
      question: 'Warum ist Timing so wichtig?',
      answer: 'Viele Signale sehen gut aus, sind aber bereits vom Markt verarbeitet. Timing entscheidet darüber, ob eine Chance noch existiert.'
    },
    {
      question: 'Wie schnell sind die Signale?',
      answer: 'Die Analyse erfolgt in Echtzeit. Signale werden direkt über die Plattform und den Telegram Bot bereitgestellt.'
    },
    {
      question: 'Was ist der Execution Score?',
      answer: 'Der Execution Score bewertet, ob ein Signal aktuell noch sinnvoll ausführbar ist – basierend auf Marktverhalten, Stabilität und Timing.'
    }
  ];

  return (
    <section className="py-20 md:py-32 relative overflow-hidden bg-[#0a0a0a]" data-testid="faq-section">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#121212]/50 via-transparent to-[#121212]/50" />
      
      <div className="relative z-10 max-w-3xl mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#FFD700]/10 border border-[#FFD700]/20 rounded-full mb-6">
            <HelpCircle className="w-4 h-4 text-[#FFD700]" />
            <span className="font-mono text-sm text-[#FFD700] uppercase tracking-wider">FAQ</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            Häufige Fragen
          </h2>
        </div>
        
        {/* FAQ Accordion */}
        <div className="bg-[#121212] border border-white/10 rounded-2xl overflow-hidden">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="border-b border-white/10 last:border-b-0"
              >
                <AccordionTrigger className="px-6 py-5 text-left text-white font-medium hover:no-underline hover:bg-white/5 transition-colors group">
                  <span className="flex items-center gap-3 pr-4">
                    <span className="w-8 h-8 bg-[#39FF14]/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-[#39FF14]/20 transition-colors">
                      <span className="text-[#39FF14] font-mono text-sm font-bold">{index + 1}</span>
                    </span>
                    <span className="text-base md:text-lg">{faq.question}</span>
                  </span>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-5">
                  <div className="pl-11">
                    <p className="text-[#A1A1AA] text-base leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
