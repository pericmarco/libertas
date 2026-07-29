import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export default function Datenschutz() {
  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="max-w-6xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-6">
          <ChevronLeft size={15} /> Zurück zur Startseite
        </Link>

        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Datenschutzerklärung</h1>
          <p className="text-xs text-gray-400 mb-6">Stand: Juli 2026 · Version 1</p>

          <div className="text-sm text-gray-700 leading-relaxed lg:columns-2 lg:gap-x-12 [&>section]:mb-6 [&>section]:break-inside-avoid">

            <section>
              <h2 className="font-semibold text-gray-900 mb-1">1. Verantwortlicher</h2>
              <p>
                Verantwortlich im Sinne der Datenschutz-Grundverordnung (DSGVO) ist die Lybertas GbR,
                vertreten durch Tobias Mittmann und Marco Müller. Kontakt in Datenschutzfragen:{' '}
                <a href="mailto:info@lybertas.de" className="text-blue-600 hover:underline">info@lybertas.de</a>.
                Ladungsfähige Anschriften: siehe <Link href="/impressum" className="text-blue-600 hover:underline">Impressum</Link>.
              </p>
              <p className="mt-2 text-xs text-gray-400">
                Wir sind gesetzlich nicht verpflichtet, eine:n Datenschutzbeauftragte:n zu benennen.
              </p>
            </section>

            <section>
              <h2 className="font-semibold text-gray-900 mb-1">2. Welche Daten wir verarbeiten</h2>
              <p className="mb-2">Bei der Nutzung von Lybertas verarbeiten wir folgende Daten:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li><strong>Bei der Registrierung:</strong> Name, E-Mail-Adresse, Passwort (verschlüsselt gespeichert) und optional ein selbst gewählter Nutzername (Pseudonym). Dein Name wird ausschließlich intern gespeichert und niemals öffentlich angezeigt; öffentlich erscheint höchstens dein Nutzername.</li>
                <li><strong>Einwilligungs-Nachweis:</strong> Zeitpunkt und Version deiner bei der Registrierung erteilten Einwilligung in diese Datenschutzerklärung.</li>
                <li><strong>Im Profil:</strong> Altersgruppe, Geschlecht, Stadtteil — freiwillig im Rahmen der Nutzung angegeben, um Beteiligung repräsentativ auswerten zu können.</li>
                <li><strong>Bei Beteiligung:</strong> eingereichte Forderungen, Positionen (Unterstützung/Gegenargument/Alternative), Kommentare, Umfrage-Antworten.</li>
                <li><strong>Technisch:</strong> ein Session-Cookie zur Anmeldung, IP-Adresse und Standard-Zugriffsdaten durch unseren Hosting-Anbieter.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-semibold text-gray-900 mb-1">3. Wofür wir diese Daten nutzen</h2>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>Bereitstellung deines Kontos und der Beteiligungsfunktionen (Forderungen, Abstimmungen, Kommentare).</li>
                <li>Berechnung des Repräsentativitäts-Scores: Wir vergleichen die anonymisierte Zusammensetzung der Teilnehmenden einer Forderung oder Umfrage (Altersgruppe, Geschlecht, Stadtteil) mit der Bevölkerungsstruktur von Köln Innenstadt. Bei Umfragen erfolgt dieser Vergleich technisch so, dass niemand — auch wir nicht direkt über die Anwendung — einsehen kann, wer wie abgestimmt hat.</li>
                <li>Deine Beiträge, Positionen und Forderungen werden anderen Nutzer:innen <strong>anonym</strong> angezeigt — ohne Namen und ohne Nutzernamen.</li>
                <li>Eingereichte Forderungen und Beiträge sind öffentlich einsehbar — auch ohne Anmeldung —, jedoch stets anonym. Mängelmeldungen sind grundsätzlich nicht öffentlich, sondern nur für dich und unser Team einsehbar.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-semibold text-gray-900 mb-1">4. Rechtsgrundlage</h2>
              <p>
                Die Verarbeitung erfolgt zur Erfüllung des Nutzungsvertrags mit dir (Art. 6 Abs. 1 lit. b DSGVO),
                sowie auf Grundlage unseres berechtigten Interesses an einem sicheren und funktionsfähigen Betrieb
                der Plattform (Art. 6 Abs. 1 lit. f DSGVO). Altersgruppe, Geschlecht und Stadtteil sind nach
                Registrierung freiwillige Angaben (Art. 6 Abs. 1 lit. a DSGVO). Erteilte Einwilligungen kannst du
                jederzeit mit Wirkung für die Zukunft widerrufen (Art. 7 Abs. 3 DSGVO); die Rechtmäßigkeit der bis
                zum Widerruf erfolgten Verarbeitung bleibt davon unberührt. Keine der erhobenen Daten fällt unter
                besondere Kategorien personenbezogener Daten nach Art. 9 DSGVO.
              </p>
            </section>

            <section>
              <h2 className="font-semibold text-gray-900 mb-1">5. Mindestalter</h2>
              <p>
                Die Nutzung von Lybertas setzt ein Mindestalter von 16 Jahren voraus. Mit der Registrierung
                bestätigst du, mindestens 16 Jahre alt zu sein. Personen unter 16 Jahren dürfen die Plattform
                nicht nutzen.
              </p>
            </section>

            <section>
              <h2 className="font-semibold text-gray-900 mb-1">6. Politik-Verzeichnis</h2>
              <p>
                Wir führen ein öffentlich einsehbares Verzeichnis kommunaler Mandats- und Amtsträger:innen. Dort
                verarbeiten wir Name, Partei, Funktion/Gremium, Themenschwerpunkte, eine Kurzvorstellung, ein
                optionales Foto sowie — soweit im Eintrag ausdrücklich freigegeben — Kontaktdaten (E-Mail,
                Telefon, Website) und öffentliche Stellungnahmen zu Anliegen. Diese Daten betreffen die Ausübung
                eines öffentlichen Amtes; Rechtsgrundlage ist unser berechtigtes Interesse an Transparenz
                kommunalpolitischer Vertretung (Art. 6 Abs. 1 lit. f DSGVO). Betroffene Mandatsträger:innen können
                ihren Eintrag nach Anmeldung selbst verwalten, der Verarbeitung widersprechen (Art. 21 DSGVO) und
                Berichtigung oder Löschung verlangen (Kontakt siehe <Link href="/impressum" className="text-blue-600 hover:underline">Impressum</Link>).
                Kontaktdaten werden nur öffentlich angezeigt, wenn dies im Eintrag aktiviert ist.
              </p>
            </section>

            <section>
              <h2 className="font-semibold text-gray-900 mb-1">7. Wer deine Daten verarbeitet (Auftragsverarbeiter)</h2>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li><strong>Supabase</strong> (Supabase Inc.) — Datenbank, Authentifizierung. Serverstandort: Frankfurt am Main, Deutschland (EU).</li>
                <li><strong>Vercel</strong> (Vercel Inc., USA) — Hosting der Webanwendung und cookielose Reichweitenmessung (Vercel Web Analytics, siehe Abschnitt 8). Datentransfer in die USA erfolgt auf Grundlage des EU-US Data Privacy Framework.</li>
                <li><strong>Resend</strong> — Versand von Bestätigungs- und Systemmails (nur E-Mail-Adresse).</li>
              </ul>
              <p className="mt-2 text-xs text-gray-400">Mit Supabase und Vercel bestehen bzw. werden Auftragsverarbeitungsverträge (AVV) abgeschlossen.</p>
            </section>

            <section>
              <h2 className="font-semibold text-gray-900 mb-1">8. Cookies und Reichweitenmessung</h2>
              <p>
                Wir setzen ausschließlich ein technisch notwendiges Cookie zur Aufrechterhaltung deiner
                Anmeldesitzung (Supabase Auth Session). Es werden keine Tracking-, Analyse- oder
                Werbe-Cookies eingesetzt. Für dieses Cookie ist keine Einwilligung erforderlich
                (§ 25 Abs. 2 Nr. 2 TDDDG).
              </p>
              <p className="mt-2">
                Zur Verbesserung der Plattform nutzen wir <strong>Vercel Web Analytics</strong>, eine
                cookielose Reichweitenmessung: Erfasst werden aggregierte Seitenaufrufe; Besucher werden
                dabei nicht über eine dauerhafte Kennung wiedererkannt, sondern über einen Hash, der
                sich täglich ändert. Es findet kein seitenübergreifendes Tracking statt und es werden
                keine Nutzungsprofile gebildet. Rechtsgrundlage ist unser berechtigtes Interesse an
                einer funktionsfähigen, bedarfsgerechten Plattform (Art. 6 Abs. 1 lit. f DSGVO).
              </p>
            </section>

            <section>
              <h2 className="font-semibold text-gray-900 mb-1">9. Standortdaten (Kartenfunktion)</h2>
              <p>
                Beim Einreichen eines Anliegens kannst du einen Ort auf einer Karte markieren. Der
                „Mein Standort"-Knopf nutzt die Standortabfrage deines Browsers und funktioniert nur,
                wenn du sie dort ausdrücklich freigibst (Einwilligung, Art. 6 Abs. 1 lit. a DSGVO,
                § 25 Abs. 1 TDDDG). Dein Gerätestandort wird dabei ausschließlich lokal auf deinem
                Gerät verwendet, um die Karte zu zentrieren — er wird von uns <strong>weder übertragen
                noch gespeichert</strong>. Gespeichert werden nur die Koordinaten des Punktes, den du
                selbst bewusst auf der Karte setzt und mit deinem Anliegen absendest; sie sind Teil
                deiner Meldung und werden mit ihr gelöscht. Die Kartendarstellung selbst lädt
                Kartenkacheln von basemap.de, einem Dienst des Bundesamts für Kartographie und
                Geodäsie (Deutschland); dabei fallen die üblichen technischen Zugriffsdaten an.
              </p>
            </section>

            <section>
              <h2 className="font-semibold text-gray-900 mb-1">10. Speicherdauer</h2>
              <p>
                Wir speichern deine Daten, solange dein Konto besteht. Nach Löschung deines Kontos werden deine
                Daten gelöscht, soweit keine gesetzlichen Aufbewahrungspflichten entgegenstehen.
              </p>
            </section>

            <section>
              <h2 className="font-semibold text-gray-900 mb-1">11. Deine Rechte</h2>
              <p className="mb-2">Du hast das Recht auf:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>Auskunft über deine gespeicherten Daten (Art. 15 DSGVO)</li>
                <li>Berichtigung unrichtiger Daten (Art. 16 DSGVO)</li>
                <li>Löschung deiner Daten (Art. 17 DSGVO)</li>
                <li>Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
                <li>Datenübertragbarkeit (Art. 20 DSGVO)</li>
                <li>Widerspruch gegen die Verarbeitung (Art. 21 DSGVO)</li>
                <li>Widerruf erteilter Einwilligungen mit Wirkung für die Zukunft (Art. 7 Abs. 3 DSGVO)</li>
                <li>Beschwerde bei einer Datenschutz-Aufsichtsbehörde (Art. 77 DSGVO)</li>
              </ul>
              <p className="mt-2">
                Zur Ausübung dieser Rechte kontaktiere uns unter{' '}
                <a href="mailto:info@lybertas.de" className="text-blue-600 hover:underline">info@lybertas.de</a> oder
                über die im <Link href="/impressum" className="text-blue-600 hover:underline">Impressum</Link> genannten
                Kontaktdaten. Eine Selbstbedienungs-Löschfunktion im Konto ist noch nicht verfügbar — bis dahin
                bearbeiten wir Löschanfragen manuell.
              </p>
              <p className="mt-2">
                Die für uns zuständige Aufsichtsbehörde ist die Landesbeauftragte für Datenschutz und
                Informationsfreiheit Nordrhein-Westfalen (LDI NRW), Kavalleriestraße 2–4, 40213 Düsseldorf.
              </p>
            </section>

          </div>
        </div>
      </div>
    </main>
  )
}
