import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Datenschutz = () => {
  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-24 pb-16" data-testid="datenschutz-page">
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
          Datenschutzerklärung
        </h1>

        {/* Content */}
        <div className="legal-content space-y-8">
          <section>
            <h2>1. Datenschutz auf einen Blick</h2>
            <h3>Allgemeine Hinweise</h3>
            <p>
              Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren 
              personenbezogenen Daten passiert, wenn Sie diese Website besuchen. Personenbezogene 
              Daten sind alle Daten, mit denen Sie persönlich identifiziert werden können.
            </p>
          </section>

          <section>
            <h2>2. Datenerfassung auf dieser Website</h2>
            <h3>Wer ist verantwortlich für die Datenerfassung auf dieser Website?</h3>
            <p>
              Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber. Dessen 
              Kontaktdaten können Sie dem Impressum dieser Website entnehmen.
            </p>

            <h3>Wie erfassen wir Ihre Daten?</h3>
            <p>
              Ihre Daten werden zum einen dadurch erhoben, dass Sie uns diese mitteilen. Hierbei 
              kann es sich z. B. um Daten handeln, die Sie in ein Kontaktformular eingeben oder 
              bei der Anmeldung für den Early Access.
            </p>
            <p>
              Andere Daten werden automatisch oder nach Ihrer Einwilligung beim Besuch der Website 
              durch unsere IT-Systeme erfasst. Das sind vor allem technische Daten (z. B. 
              Internetbrowser, Betriebssystem oder Uhrzeit des Seitenaufrufs).
            </p>

            <h3>Wofür nutzen wir Ihre Daten?</h3>
            <p>
              Ein Teil der Daten wird erhoben, um eine fehlerfreie Bereitstellung der Website zu 
              gewährleisten. Andere Daten können zur Analyse Ihres Nutzerverhaltens verwendet werden.
            </p>
          </section>

          <section>
            <h2>3. Allgemeine Hinweise und Pflichtinformationen</h2>
            <h3>Datenschutz</h3>
            <p>
              Die Betreiber dieser Seiten nehmen den Schutz Ihrer persönlichen Daten sehr ernst. 
              Wir behandeln Ihre personenbezogenen Daten vertraulich und entsprechend der 
              gesetzlichen Datenschutzvorschriften sowie dieser Datenschutzerklärung.
            </p>

            <h3>Hinweis zur verantwortlichen Stelle</h3>
            <p>
              Die verantwortliche Stelle für die Datenverarbeitung auf dieser Website ist:
            </p>
            <p>
              Betradarmus GmbH<br />
              Musterstraße 123<br />
              10115 Berlin<br />
              E-Mail: datenschutz@betradarmus.de
            </p>
          </section>

          <section>
            <h2>4. Datenerfassung auf dieser Website</h2>
            <h3>Cookies</h3>
            <p>
              Unsere Internetseiten verwenden so genannte „Cookies". Cookies sind kleine 
              Textdateien und richten auf Ihrem Endgerät keinen Schaden an. Sie werden entweder 
              vorübergehend für die Dauer einer Sitzung (Session-Cookies) oder dauerhaft 
              (permanente Cookies) auf Ihrem Endgerät gespeichert.
            </p>

            <h3>Server-Log-Dateien</h3>
            <p>
              Der Provider der Seiten erhebt und speichert automatisch Informationen in so 
              genannten Server-Log-Dateien, die Ihr Browser automatisch an uns übermittelt. 
              Dies sind:
            </p>
            <ul>
              <li>Browsertyp und Browserversion</li>
              <li>verwendetes Betriebssystem</li>
              <li>Referrer URL</li>
              <li>Hostname des zugreifenden Rechners</li>
              <li>Uhrzeit der Serveranfrage</li>
              <li>IP-Adresse</li>
            </ul>

            <h3>Kontaktformular / Early Access Anmeldung</h3>
            <p>
              Wenn Sie uns per Kontaktformular Anfragen zukommen lassen oder sich für den Early 
              Access anmelden, werden Ihre Angaben aus dem Formular inklusive der von Ihnen dort 
              angegebenen Kontaktdaten zwecks Bearbeitung der Anfrage und für den Fall von 
              Anschlussfragen bei uns gespeichert.
            </p>
          </section>

          <section>
            <h2>5. Ihre Rechte</h2>
            <p>
              Sie haben jederzeit das Recht:
            </p>
            <ul>
              <li>Auskunft über Ihre bei uns gespeicherten Daten zu erhalten</li>
              <li>Berichtigung unrichtiger personenbezogener Daten zu verlangen</li>
              <li>Löschung Ihrer bei uns gespeicherten Daten zu verlangen</li>
              <li>Einschränkung der Datenverarbeitung zu verlangen</li>
              <li>Widerspruch gegen die Verarbeitung einzulegen</li>
              <li>Datenübertragbarkeit zu verlangen</li>
            </ul>
            <p>
              Wenn Sie glauben, dass die Verarbeitung Ihrer Daten gegen das Datenschutzrecht 
              verstößt, haben Sie das Recht, sich bei einer Aufsichtsbehörde zu beschweren.
            </p>
          </section>

          <section>
            <h2>6. Analyse-Tools und Werbung</h2>
            <p>
              Diese Website verwendet keine externen Analyse-Tools oder Werbetracker. Wir erheben 
              lediglich die für den Betrieb der Plattform notwendigen Daten.
            </p>
          </section>

          {/* Disclaimer */}
          <section className="mt-12 p-6 bg-[#121212] border border-white/5 rounded-sm">
            <p className="text-sm text-[#A1A1AA]">
              <strong className="text-white">Stand:</strong> Dezember 2025
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Datenschutz;
