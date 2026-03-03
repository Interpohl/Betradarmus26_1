import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Impressum = () => {
  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-24 pb-16" data-testid="impressum-page">
      <div className="max-w-3xl mx-auto px-4 md:px-8">
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
        <h1 className="font-heading text-4xl md:text-5xl font-bold uppercase tracking-tighter text-white mb-8">
          Impressum
        </h1>

        {/* Content */}
        <div className="legal-content space-y-8">
          <section>
            <h2>Angaben gemäß § 5 TMG</h2>
            <p>
              <strong>Interpohl Solutions GmbH i.Gr.</strong><br />
              Kontor H72<br />
              Hansastr. 72<br />
              44137 Dortmund<br />
              Deutschland
            </p>
          </section>

          <section>
            <h2>Vertreten durch</h2>
            <p>
              Geschäftsführer: Tobias Pohl
            </p>
          </section>

          <section>
            <h2>Kontakt</h2>
            <p>
              Telefon: 0170-7967959<br />
              E-Mail: info@betradarmus.de
            </p>
          </section>

          <section>
            <h2>Registereintrag</h2>
            <p>
              Gesellschaft in Gründung (i.Gr.)<br />
              Registergericht: Amtsgericht Dortmund<br />
              <em>Registernummer wird nach Eintragung ergänzt.</em>
            </p>
          </section>

          <section>
            <h2>Umsatzsteuer-ID</h2>
            <p>
              Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz:<br />
              <em>Wird nach Erteilung ergänzt.</em>
            </p>
          </section>

          <section>
            <h2>Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</h2>
            <p>
              Tobias Pohl<br />
              Kontor H72<br />
              Hansastr. 72<br />
              44137 Dortmund
            </p>
          </section>

          <section>
            <h2>EU-Streitschlichtung</h2>
            <p>
              Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: 
              <a 
                href="https://ec.europa.eu/consumers/odr/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[#39FF14] hover:underline ml-1"
              >
                https://ec.europa.eu/consumers/odr/
              </a>
            </p>
            <p>
              Unsere E-Mail-Adresse finden Sie oben im Impressum.
            </p>
          </section>

          <section>
            <h2>Verbraucherstreitbeilegung / Universalschlichtungsstelle</h2>
            <p>
              Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer 
              Verbraucherschlichtungsstelle teilzunehmen.
            </p>
          </section>

          <section>
            <h2>Haftung für Inhalte</h2>
            <p>
              Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten 
              nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als 
              Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde 
              Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige 
              Tätigkeit hinweisen.
            </p>
            <p>
              Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den 
              allgemeinen Gesetzen bleiben hiervon unberührt. Eine diesbezügliche Haftung ist jedoch 
              erst ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich. Bei 
              Bekanntwerden von entsprechenden Rechtsverletzungen werden wir diese Inhalte umgehend 
              entfernen.
            </p>
          </section>

          <section>
            <h2>Haftung für Links</h2>
            <p>
              Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen 
              Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. 
              Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der 
              Seiten verantwortlich. Die verlinkten Seiten wurden zum Zeitpunkt der Verlinkung auf 
              mögliche Rechtsverstöße überprüft. Rechtswidrige Inhalte waren zum Zeitpunkt der 
              Verlinkung nicht erkennbar.
            </p>
            <p>
              Eine permanente inhaltliche Kontrolle der verlinkten Seiten ist jedoch ohne konkrete 
              Anhaltspunkte einer Rechtsverletzung nicht zumutbar. Bei Bekanntwerden von 
              Rechtsverletzungen werden wir derartige Links umgehend entfernen.
            </p>
          </section>

          <section>
            <h2>Urheberrecht</h2>
            <p>
              Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen 
              dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art 
              der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen 
              Zustimmung des jeweiligen Autors bzw. Erstellers. Downloads und Kopien dieser Seite sind 
              nur für den privaten, nicht kommerziellen Gebrauch gestattet.
            </p>
            <p>
              Soweit die Inhalte auf dieser Seite nicht vom Betreiber erstellt wurden, werden die 
              Urheberrechte Dritter beachtet. Insbesondere werden Inhalte Dritter als solche 
              gekennzeichnet. Sollten Sie trotzdem auf eine Urheberrechtsverletzung aufmerksam werden, 
              bitten wir um einen entsprechenden Hinweis. Bei Bekanntwerden von Rechtsverletzungen 
              werden wir derartige Inhalte umgehend entfernen.
            </p>
          </section>

          {/* Disclaimer */}
          <section className="mt-12 p-6 bg-[#121212] border border-white/5 rounded-sm">
            <p className="text-sm text-[#A1A1AA]">
              <strong className="text-white">Hinweis:</strong> Betradarmus ist eine datenbasierte 
              Analyseplattform. Es werden keine Wetten angeboten oder vermittelt. Alle Informationen 
              dienen ausschließlich zu Analyse- und Informationszwecken.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Impressum;
