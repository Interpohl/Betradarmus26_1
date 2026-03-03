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
              Ausführliche Informationen zum Thema Datenschutz entnehmen Sie unserer unter 
              diesem Text aufgeführten Datenschutzerklärung.
            </p>
          </section>

          <section>
            <h2>2. Verantwortliche Stelle</h2>
            <p>
              Die verantwortliche Stelle für die Datenverarbeitung auf dieser Website ist:
            </p>
            <p>
              <strong>Interpohl Solutions GmbH i.Gr.</strong><br />
              Kontor H72<br />
              Hansastr. 72<br />
              44137 Dortmund<br /><br />
              Telefon: 0170-7967959<br />
              E-Mail: info@betradarmus.de
            </p>
            <p>
              Verantwortliche Stelle ist die natürliche oder juristische Person, die allein oder 
              gemeinsam mit anderen über die Zwecke und Mittel der Verarbeitung von personenbezogenen 
              Daten (z. B. Namen, E-Mail-Adressen o. Ä.) entscheidet.
            </p>
          </section>

          <section>
            <h2>3. Datenerfassung auf dieser Website</h2>
            
            <h3>Wer ist verantwortlich für die Datenerfassung auf dieser Website?</h3>
            <p>
              Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber. Dessen 
              Kontaktdaten können Sie dem Abschnitt „Verantwortliche Stelle" in dieser 
              Datenschutzerklärung entnehmen.
            </p>

            <h3>Wie erfassen wir Ihre Daten?</h3>
            <p>
              Ihre Daten werden zum einen dadurch erhoben, dass Sie uns diese mitteilen. Hierbei 
              kann es sich z. B. um Daten handeln, die Sie in ein Kontaktformular eingeben oder 
              bei der Anmeldung für den Early Access bzw. bei der Registrierung eines Benutzerkontos.
            </p>
            <p>
              Andere Daten werden automatisch oder nach Ihrer Einwilligung beim Besuch der Website 
              durch unsere IT-Systeme erfasst. Das sind vor allem technische Daten (z. B. 
              Internetbrowser, Betriebssystem oder Uhrzeit des Seitenaufrufs). Die Erfassung dieser 
              Daten erfolgt automatisch, sobald Sie diese Website betreten.
            </p>

            <h3>Wofür nutzen wir Ihre Daten?</h3>
            <p>
              Ein Teil der Daten wird erhoben, um eine fehlerfreie Bereitstellung der Website zu 
              gewährleisten. Andere Daten können zur Analyse Ihres Nutzerverhaltens verwendet werden.
              Bei kostenpflichtigen Abonnements werden Ihre Daten zur Vertragsabwicklung und 
              Zahlungsabwicklung verwendet.
            </p>

            <h3>Welche Rechte haben Sie bezüglich Ihrer Daten?</h3>
            <p>
              Sie haben jederzeit das Recht, unentgeltlich Auskunft über Herkunft, Empfänger und 
              Zweck Ihrer gespeicherten personenbezogenen Daten zu erhalten. Sie haben außerdem ein 
              Recht, die Berichtigung oder Löschung dieser Daten zu verlangen. Wenn Sie eine 
              Einwilligung zur Datenverarbeitung erteilt haben, können Sie diese Einwilligung 
              jederzeit für die Zukunft widerrufen. Außerdem haben Sie das Recht, unter bestimmten 
              Umständen die Einschränkung der Verarbeitung Ihrer personenbezogenen Daten zu verlangen.
              Des Weiteren steht Ihnen ein Beschwerderecht bei der zuständigen Aufsichtsbehörde zu.
            </p>
            <p>
              Hierzu sowie zu weiteren Fragen zum Thema Datenschutz können Sie sich jederzeit an uns wenden.
            </p>
          </section>

          <section>
            <h2>4. Hosting</h2>
            <p>
              Wir hosten die Inhalte unserer Website bei Strato. Anbieter ist die Strato AG, 
              Otto-Ostrowski-Straße 7, 10249 Berlin (nachfolgend „Strato").
            </p>
            <p>
              Details entnehmen Sie der Datenschutzerklärung von Strato: 
              <a 
                href="https://www.strato.de/datenschutz/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[#39FF14] hover:underline ml-1"
              >
                https://www.strato.de/datenschutz/
              </a>
            </p>
            <p>
              Die Verwendung von Strato erfolgt auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO. 
              Wir haben ein berechtigtes Interesse an einer möglichst zuverlässigen Darstellung 
              unserer Website.
            </p>
          </section>

          <section>
            <h2>5. Allgemeine Hinweise und Pflichtinformationen</h2>
            
            <h3>Datenschutz</h3>
            <p>
              Die Betreiber dieser Seiten nehmen den Schutz Ihrer persönlichen Daten sehr ernst. 
              Wir behandeln Ihre personenbezogenen Daten vertraulich und entsprechend den 
              gesetzlichen Datenschutzvorschriften sowie dieser Datenschutzerklärung.
            </p>
            <p>
              Wenn Sie diese Website benutzen, werden verschiedene personenbezogene Daten erhoben. 
              Personenbezogene Daten sind Daten, mit denen Sie persönlich identifiziert werden 
              können. Die vorliegende Datenschutzerklärung erläutert, welche Daten wir erheben und 
              wofür wir sie nutzen. Sie erläutert auch, wie und zu welchem Zweck das geschieht.
            </p>
            <p>
              Wir weisen darauf hin, dass die Datenübertragung im Internet (z. B. bei der 
              Kommunikation per E-Mail) Sicherheitslücken aufweisen kann. Ein lückenloser Schutz 
              der Daten vor dem Zugriff durch Dritte ist nicht möglich.
            </p>

            <h3>Widerruf Ihrer Einwilligung zur Datenverarbeitung</h3>
            <p>
              Viele Datenverarbeitungsvorgänge sind nur mit Ihrer ausdrücklichen Einwilligung 
              möglich. Sie können eine bereits erteilte Einwilligung jederzeit widerrufen. Die 
              Rechtmäßigkeit der bis zum Widerruf erfolgten Datenverarbeitung bleibt vom Widerruf 
              unberührt.
            </p>

            <h3>Widerspruchsrecht gegen die Datenerhebung in besonderen Fällen sowie gegen 
            Direktwerbung (Art. 21 DSGVO)</h3>
            <p>
              WENN DIE DATENVERARBEITUNG AUF GRUNDLAGE VON ART. 6 ABS. 1 LIT. E ODER F DSGVO 
              ERFOLGT, HABEN SIE JEDERZEIT DAS RECHT, AUS GRÜNDEN, DIE SICH AUS IHRER BESONDEREN 
              SITUATION ERGEBEN, GEGEN DIE VERARBEITUNG IHRER PERSONENBEZOGENEN DATEN WIDERSPRUCH 
              EINZULEGEN. DIE JEWEILIGE RECHTSGRUNDLAGE, AUF DENEN EINE VERARBEITUNG BERUHT, 
              ENTNEHMEN SIE DIESER DATENSCHUTZERKLÄRUNG. WENN SIE WIDERSPRUCH EINLEGEN, WERDEN 
              WIR IHRE BETROFFENEN PERSONENBEZOGENEN DATEN NICHT MEHR VERARBEITEN, ES SEI DENN, 
              WIR KÖNNEN ZWINGENDE SCHUTZWÜRDIGE GRÜNDE FÜR DIE VERARBEITUNG NACHWEISEN, DIE IHRE 
              INTERESSEN, RECHTE UND FREIHEITEN ÜBERWIEGEN ODER DIE VERARBEITUNG DIENT DER 
              GELTENDMACHUNG, AUSÜBUNG ODER VERTEIDIGUNG VON RECHTSANSPRÜCHEN (WIDERSPRUCH NACH 
              ART. 21 ABS. 1 DSGVO).
            </p>

            <h3>Beschwerderecht bei der zuständigen Aufsichtsbehörde</h3>
            <p>
              Im Falle von Verstößen gegen die DSGVO steht den Betroffenen ein Beschwerderecht 
              bei einer Aufsichtsbehörde zu, insbesondere in dem Mitgliedstaat ihres gewöhnlichen 
              Aufenthalts, ihres Arbeitsplatzes oder des Orts des mutmaßlichen Verstoßes. Das 
              Beschwerderecht besteht unbeschadet anderweitiger verwaltungsrechtlicher oder 
              gerichtlicher Rechtsbehelfe.
            </p>

            <h3>Recht auf Datenübertragbarkeit</h3>
            <p>
              Sie haben das Recht, Daten, die wir auf Grundlage Ihrer Einwilligung oder in 
              Erfüllung eines Vertrags automatisiert verarbeiten, an sich oder an einen Dritten 
              in einem gängigen, maschinenlesbaren Format aushändigen zu lassen. Sofern Sie die 
              direkte Übertragung der Daten an einen anderen Verantwortlichen verlangen, erfolgt 
              dies nur, soweit es technisch machbar ist.
            </p>

            <h3>Auskunft, Löschung und Berichtigung</h3>
            <p>
              Sie haben im Rahmen der geltenden gesetzlichen Bestimmungen jederzeit das Recht auf 
              unentgeltliche Auskunft über Ihre gespeicherten personenbezogenen Daten, deren 
              Herkunft und Empfänger und den Zweck der Datenverarbeitung und ggf. ein Recht auf 
              Berichtigung oder Löschung dieser Daten. Hierzu sowie zu weiteren Fragen zum Thema 
              personenbezogene Daten können Sie sich jederzeit an uns wenden.
            </p>

            <h3>Recht auf Einschränkung der Verarbeitung</h3>
            <p>
              Sie haben das Recht, die Einschränkung der Verarbeitung Ihrer personenbezogenen 
              Daten zu verlangen. Hierzu können Sie sich jederzeit an uns wenden.
            </p>

            <h3>SSL- bzw. TLS-Verschlüsselung</h3>
            <p>
              Diese Seite nutzt aus Sicherheitsgründen und zum Schutz der Übertragung vertraulicher 
              Inhalte, wie zum Beispiel Bestellungen oder Anfragen, die Sie an uns als 
              Seitenbetreiber senden, eine SSL- bzw. TLS-Verschlüsselung. Eine verschlüsselte 
              Verbindung erkennen Sie daran, dass die Adresszeile des Browsers von „http://" auf 
              „https://" wechselt und an dem Schloss-Symbol in Ihrer Browserzeile.
            </p>
            <p>
              Wenn die SSL- bzw. TLS-Verschlüsselung aktiviert ist, können die Daten, die Sie an 
              uns übermitteln, nicht von Dritten mitgelesen werden.
            </p>
          </section>

          <section>
            <h2>6. Datenerfassung auf dieser Website</h2>

            <h3>Cookies</h3>
            <p>
              Unsere Internetseiten verwenden so genannte „Cookies". Cookies sind kleine 
              Datenpakete und richten auf Ihrem Endgerät keinen Schaden an. Sie werden entweder 
              vorübergehend für die Dauer einer Sitzung (Session-Cookies) oder dauerhaft 
              (permanente Cookies) auf Ihrem Endgerät gespeichert. Session-Cookies werden nach 
              Ende Ihres Besuchs automatisch gelöscht. Permanente Cookies bleiben auf Ihrem 
              Endgerät gespeichert, bis Sie diese selbst löschen oder eine automatische Löschung 
              durch Ihren Webbrowser erfolgt.
            </p>
            <p>
              Cookies können von uns (First-Party-Cookies) oder von Drittunternehmen stammen 
              (sog. Third-Party-Cookies). Third-Party-Cookies ermöglichen die Einbindung 
              bestimmter Dienstleistungen von Drittunternehmen innerhalb von Webseiten.
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
            <p>
              Eine Zusammenführung dieser Daten mit anderen Datenquellen wird nicht vorgenommen.
            </p>
            <p>
              Die Erfassung dieser Daten erfolgt auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO. 
              Der Websitebetreiber hat ein berechtigtes Interesse an der technisch fehlerfreien 
              Darstellung und der Optimierung seiner Website – hierzu müssen die Server-Log-Files 
              erfasst werden.
            </p>

            <h3>Kontaktformular</h3>
            <p>
              Wenn Sie uns per Kontaktformular Anfragen zukommen lassen, werden Ihre Angaben aus 
              dem Anfrageformular inklusive der von Ihnen dort angegebenen Kontaktdaten zwecks 
              Bearbeitung der Anfrage und für den Fall von Anschlussfragen bei uns gespeichert. 
              Diese Daten geben wir nicht ohne Ihre Einwilligung weiter.
            </p>
            <p>
              Die Verarbeitung dieser Daten erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO, 
              sofern Ihre Anfrage mit der Erfüllung eines Vertrags zusammenhängt oder zur 
              Durchführung vorvertraglicher Maßnahmen erforderlich ist. In allen übrigen Fällen 
              beruht die Verarbeitung auf unserem berechtigten Interesse an der effektiven 
              Bearbeitung der an uns gerichteten Anfragen (Art. 6 Abs. 1 lit. f DSGVO) oder auf 
              Ihrer Einwilligung (Art. 6 Abs. 1 lit. a DSGVO) sofern diese abgefragt wurde.
            </p>

            <h3>Registrierung auf dieser Website</h3>
            <p>
              Sie können sich auf dieser Website registrieren, um zusätzliche Funktionen auf der 
              Seite zu nutzen. Die dazu eingegebenen Daten verwenden wir nur zum Zwecke der 
              Nutzung des jeweiligen Angebotes oder Dienstes, für den Sie sich registriert haben. 
              Die bei der Registrierung abgefragten Pflichtangaben müssen vollständig angegeben 
              werden. Anderenfalls werden wir die Registrierung ablehnen.
            </p>
            <p>
              Für wichtige Änderungen etwa beim Angebotsumfang oder bei technisch notwendigen 
              Änderungen nutzen wir die bei der Registrierung angegebene E-Mail-Adresse, um Sie 
              auf diesem Wege zu informieren.
            </p>
            <p>
              Die Verarbeitung der bei der Registrierung eingegebenen Daten erfolgt zum Zwecke 
              der Durchführung des durch die Registrierung begründeten Nutzungsverhältnisses und 
              ggf. zur Anbahnung weiterer Verträge (Art. 6 Abs. 1 lit. b DSGVO).
            </p>
          </section>

          <section>
            <h2>7. Zahlungsanbieter</h2>

            <h3>Stripe</h3>
            <p>
              Für die Abwicklung von Zahlungen nutzen wir den Zahlungsdienstleister Stripe. 
              Anbieter ist die Stripe Payments Europe, Ltd., 1 Grand Canal Street Lower, 
              Grand Canal Dock, Dublin, Irland.
            </p>
            <p>
              Bei Bezahlung via Stripe werden die von Ihnen eingegebenen Zahlungsdaten an 
              Stripe übermittelt. Die Übermittlung Ihrer Daten an Stripe erfolgt auf 
              Grundlage von Art. 6 Abs. 1 lit. b DSGVO (Vertragsabwicklung) und im Interesse 
              eines möglichst reibungslosen und sicheren Zahlungsvorgangs.
            </p>
            <p>
              Details entnehmen Sie der Datenschutzerklärung von Stripe:
              <a 
                href="https://stripe.com/de/privacy" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[#39FF14] hover:underline ml-1"
              >
                https://stripe.com/de/privacy
              </a>
            </p>
          </section>

          <section>
            <h2>8. Speicherdauer</h2>
            <p>
              Soweit innerhalb dieser Datenschutzerklärung keine speziellere Speicherdauer genannt 
              wurde, verbleiben Ihre personenbezogenen Daten bei uns, bis der Zweck für die 
              Datenverarbeitung entfällt. Wenn Sie ein berechtigtes Löschersuchen geltend machen 
              oder eine Einwilligung zur Datenverarbeitung widerrufen, werden Ihre Daten gelöscht, 
              sofern wir keine anderen rechtlich zulässigen Gründe für die Speicherung Ihrer 
              personenbezogenen Daten haben (z. B. steuer- oder handelsrechtliche 
              Aufbewahrungsfristen); im letztgenannten Fall erfolgt die Löschung nach Fortfall 
              dieser Gründe.
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

export default Datenschutz;
