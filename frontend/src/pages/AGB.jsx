import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AGB = () => {
  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-24 pb-16" data-testid="agb-page">
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
          Allgemeine Geschäftsbedingungen
        </h1>

        {/* Content */}
        <div className="legal-content space-y-8">
          <section>
            <h2>§ 1 Geltungsbereich</h2>
            <p>
              (1) Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für alle Verträge zwischen 
              der Interpohl Solutions GmbH i.Gr., Kontor H72, Hansastr. 72, 44137 Dortmund 
              (nachfolgend „Anbieter") und dem Kunden (nachfolgend „Nutzer") über die Nutzung 
              der Plattform „Betradarmus" (nachfolgend „Plattform").
            </p>
            <p>
              (2) Abweichende Bedingungen des Nutzers werden nicht anerkannt, es sei denn, der 
              Anbieter stimmt ihrer Geltung ausdrücklich schriftlich zu.
            </p>
            <p>
              (3) Diese AGB gelten sowohl gegenüber Verbrauchern als auch gegenüber Unternehmern, 
              es sei denn, in der jeweiligen Klausel wird eine Differenzierung vorgenommen.
            </p>
          </section>

          <section>
            <h2>§ 2 Leistungsbeschreibung</h2>
            <p>
              (1) Die Plattform Betradarmus ist eine KI-gestützte Analyseplattform für 
              Live-Fußballmärkte. Sie bietet datenbasierte Marktanalysen, Risikobewertungen 
              und Wahrscheinlichkeitsberechnungen in Echtzeit.
            </p>
            <p>
              (2) <strong>Betradarmus ist ausdrücklich KEIN Wettanbieter.</strong> Es werden 
              keine Wetten angeboten, angenommen oder vermittelt. Die Plattform stellt 
              ausschließlich Analysewerkzeuge und Informationen bereit.
            </p>
            <p>
              (3) Die bereitgestellten Analysen und Informationen stellen keine Anlageberatung, 
              Finanzberatung oder Empfehlung zum Abschluss von Wetten dar. Der Nutzer trifft 
              alle Entscheidungen eigenverantwortlich.
            </p>
            <p>
              (4) Der Anbieter behält sich vor, den Funktionsumfang der Plattform jederzeit 
              zu erweitern, zu ändern oder einzuschränken, soweit dies für den Nutzer zumutbar ist.
            </p>
          </section>

          <section>
            <h2>§ 3 Vertragsschluss und Registrierung</h2>
            <p>
              (1) Die Registrierung auf der Plattform stellt ein Angebot des Nutzers auf 
              Abschluss eines Nutzungsvertrages dar. Der Vertrag kommt mit der Freischaltung 
              des Benutzerkontos durch den Anbieter zustande.
            </p>
            <p>
              (2) Der Nutzer muss bei der Registrierung wahrheitsgemäße und vollständige 
              Angaben machen. Änderungen der Daten sind dem Anbieter unverzüglich mitzuteilen.
            </p>
            <p>
              (3) Die Nutzung der Plattform ist nur volljährigen Personen gestattet. Mit der 
              Registrierung bestätigt der Nutzer, dass er das 18. Lebensjahr vollendet hat.
            </p>
            <p>
              (4) Ein Anspruch auf Registrierung besteht nicht. Der Anbieter behält sich vor, 
              Registrierungen ohne Angabe von Gründen abzulehnen.
            </p>
          </section>

          <section>
            <h2>§ 4 Nutzungsrechte und Pflichten</h2>
            <p>
              (1) Der Nutzer erhält ein einfaches, nicht übertragbares Recht zur Nutzung der 
              Plattform im Rahmen des gewählten Abonnements.
            </p>
            <p>
              (2) Der Nutzer verpflichtet sich:
            </p>
            <ul>
              <li>die Plattform nur für eigene Zwecke zu nutzen;</li>
              <li>seine Zugangsdaten geheim zu halten und vor unbefugtem Zugriff zu schützen;</li>
              <li>keine automatisierten Abrufe (Scraping, Bots) durchzuführen;</li>
              <li>keine Inhalte der Plattform zu vervielfältigen, zu verbreiten oder 
                  öffentlich zugänglich zu machen;</li>
              <li>die Plattform nicht für illegale Zwecke zu nutzen.</li>
            </ul>
            <p>
              (3) Bei Verdacht auf Missbrauch oder Verstoß gegen diese AGB ist der Anbieter 
              berechtigt, den Zugang zur Plattform vorübergehend oder dauerhaft zu sperren.
            </p>
          </section>

          <section>
            <h2>§ 5 Preise und Zahlungsbedingungen</h2>
            <p>
              (1) Die Nutzung der Plattform wird in verschiedenen Abonnement-Modellen angeboten:
            </p>
            <ul>
              <li><strong>FREE:</strong> Kostenlos mit eingeschränktem Funktionsumfang</li>
              <li><strong>PRO:</strong> 19,00 € pro Monat</li>
              <li><strong>ELITE:</strong> 39,00 € pro Monat</li>
            </ul>
            <p>
              (2) Alle Preise verstehen sich inklusive der gesetzlichen Mehrwertsteuer.
            </p>
            <p>
              (3) Die Zahlung erfolgt monatlich im Voraus per Kreditkarte oder anderen 
              angebotenen Zahlungsmethoden über den Zahlungsdienstleister Stripe.
            </p>
            <p>
              (4) Bei Zahlungsverzug ist der Anbieter berechtigt, den Zugang zur Plattform 
              bis zum Ausgleich der offenen Forderungen zu sperren.
            </p>
          </section>

          <section>
            <h2>§ 6 Vertragslaufzeit und Kündigung</h2>
            <p>
              (1) Kostenpflichtige Abonnements haben eine Mindestlaufzeit von einem Monat und 
              verlängern sich automatisch um jeweils einen weiteren Monat, sofern sie nicht 
              gekündigt werden.
            </p>
            <p>
              (2) Die Kündigung ist jederzeit zum Ende des laufenden Abrechnungszeitraums 
              möglich. Sie kann über das Benutzerkonto oder per E-Mail an info@betradarmus.de 
              erfolgen.
            </p>
            <p>
              (3) Das Recht zur außerordentlichen Kündigung aus wichtigem Grund bleibt unberührt.
            </p>
            <p>
              (4) Nach Beendigung des Vertrages wird das Benutzerkonto deaktiviert. Der Nutzer 
              hat keinen Anspruch auf Herausgabe gespeicherter Daten.
            </p>
          </section>

          <section>
            <h2>§ 7 Widerrufsrecht für Verbraucher</h2>
            <p>
              (1) Verbraucher haben ein 14-tägiges Widerrufsrecht.
            </p>
            <p>
              <strong>Widerrufsbelehrung:</strong>
            </p>
            <p>
              Sie haben das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen 
              Vertrag zu widerrufen. Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag 
              des Vertragsabschlusses.
            </p>
            <p>
              Um Ihr Widerrufsrecht auszuüben, müssen Sie uns (Interpohl Solutions GmbH i.Gr., 
              Kontor H72, Hansastr. 72, 44137 Dortmund, E-Mail: info@betradarmus.de, 
              Telefon: 0170-7967959) mittels einer eindeutigen Erklärung (z. B. ein mit der 
              Post versandter Brief oder E-Mail) über Ihren Entschluss, diesen Vertrag zu 
              widerrufen, informieren.
            </p>
            <p>
              Zur Wahrung der Widerrufsfrist reicht es aus, dass Sie die Mitteilung über die 
              Ausübung des Widerrufsrechts vor Ablauf der Widerrufsfrist absenden.
            </p>
            <p>
              <strong>Folgen des Widerrufs:</strong> Wenn Sie diesen Vertrag widerrufen, haben 
              wir Ihnen alle Zahlungen, die wir von Ihnen erhalten haben, unverzüglich und 
              spätestens binnen vierzehn Tagen ab dem Tag zurückzuzahlen, an dem die Mitteilung 
              über Ihren Widerruf dieses Vertrags bei uns eingegangen ist.
            </p>
          </section>

          <section>
            <h2>§ 8 Haftung und Gewährleistung</h2>
            <p>
              (1) Der Anbieter haftet unbeschränkt für Schäden aus der Verletzung des Lebens, 
              des Körpers oder der Gesundheit sowie für vorsätzlich oder grob fahrlässig 
              verursachte Schäden.
            </p>
            <p>
              (2) Für leicht fahrlässig verursachte Schäden haftet der Anbieter nur bei 
              Verletzung wesentlicher Vertragspflichten (Kardinalpflichten). Die Haftung ist 
              in diesem Fall auf den vertragstypischen, vorhersehbaren Schaden begrenzt.
            </p>
            <p>
              (3) <strong>Der Anbieter übernimmt keine Haftung für die Richtigkeit, 
              Vollständigkeit oder Aktualität der bereitgestellten Analysen und Informationen.</strong> 
              Die Nutzung der Plattform erfolgt auf eigenes Risiko des Nutzers.
            </p>
            <p>
              (4) Der Anbieter haftet nicht für Schäden, die dem Nutzer durch die Nutzung 
              der bereitgestellten Informationen für Wett- oder Anlageentscheidungen entstehen.
            </p>
            <p>
              (5) Der Anbieter gewährleistet keine ununterbrochene Verfügbarkeit der Plattform. 
              Wartungsarbeiten und technische Störungen können zu vorübergehenden 
              Einschränkungen führen.
            </p>
          </section>

          <section>
            <h2>§ 9 Datenschutz</h2>
            <p>
              Die Verarbeitung personenbezogener Daten erfolgt gemäß unserer Datenschutzerklärung, 
              die unter 
              <Link to="/datenschutz" className="text-[#39FF14] hover:underline mx-1">
                https://betradarmus.de/datenschutz
              </Link> 
              abrufbar ist.
            </p>
          </section>

          <section>
            <h2>§ 10 Änderungen der AGB</h2>
            <p>
              (1) Der Anbieter behält sich vor, diese AGB jederzeit zu ändern, soweit dies 
              für den Nutzer zumutbar ist.
            </p>
            <p>
              (2) Änderungen werden dem Nutzer per E-Mail mitgeteilt. Die Änderungen gelten 
              als genehmigt, wenn der Nutzer nicht innerhalb von vier Wochen nach Zugang der 
              Mitteilung widerspricht. Auf diese Folge wird der Nutzer in der Mitteilung 
              hingewiesen.
            </p>
          </section>

          <section>
            <h2>§ 11 Schlussbestimmungen</h2>
            <p>
              (1) Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des 
              UN-Kaufrechts.
            </p>
            <p>
              (2) Ist der Nutzer Kaufmann, juristische Person des öffentlichen Rechts oder 
              öffentlich-rechtliches Sondervermögen, ist Gerichtsstand für alle Streitigkeiten 
              aus diesem Vertrag Dortmund.
            </p>
            <p>
              (3) Sollten einzelne Bestimmungen dieser AGB unwirksam sein oder werden, bleibt 
              die Wirksamkeit der übrigen Bestimmungen unberührt.
            </p>
          </section>

          {/* Disclaimer */}
          <section className="mt-12 p-6 bg-[#121212] border border-white/5 rounded-sm">
            <p className="text-sm text-[#A1A1AA]">
              <strong className="text-white">Stand:</strong> März 2025
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AGB;
