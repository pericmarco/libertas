import Link from 'next/link'
import { ChevronLeft, AlertTriangle } from 'lucide-react'

export default function Impressum() {
  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="max-w-6xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-6">
          <ChevronLeft size={15} /> Zurück zur Startseite
        </Link>

        <div className="flex items-start gap-3 bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 mb-6 text-sm text-yellow-800 leading-relaxed">
          <AlertTriangle size={16} className="shrink-0 mt-0.5" />
          <span>
            <strong>Entwurf, noch nicht vollständig.</strong> Anschrift und E-Mail-Adresse fehlen noch — beides ist
            nach §5 TMG Pflichtangabe. Diese Seite darf erst live gehen, wenn diese Angaben ergänzt sind.
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Impressum</h1>

          <div className="text-sm text-gray-700 leading-relaxed lg:columns-2 lg:gap-x-12 [&>section]:mb-6 [&>section]:break-inside-avoid">
            <section>
              <h2 className="font-semibold text-gray-900 mb-1">Angaben gemäß § 5 TMG</h2>
              <p>
                Tobias Mittmann<br />
                Marco Müller<br />
                <span className="text-red-500">[Anschrift noch zu ergänzen — Straße, Hausnummer, PLZ, Ort]</span>
              </p>
            </section>

            <section>
              <h2 className="font-semibold text-gray-900 mb-1">Kontakt</h2>
              <p>
                E-Mail: <span className="text-red-500">[noch zu ergänzen]</span>
              </p>
            </section>

            <section>
              <h2 className="font-semibold text-gray-900 mb-1">Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</h2>
              <p>Tobias Mittmann, Marco Müller (Anschrift wie oben)</p>
            </section>

            <section>
              <h2 className="font-semibold text-gray-900 mb-1">Haftungsausschluss</h2>
              <p>
                Die Inhalte dieser Seite wurden mit Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und
                Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen. Lybertas befindet sich in der
                Pilotphase; einzelne Funktionen und Inhalte können sich ändern.
              </p>
            </section>

            <section>
              <h2 className="font-semibold text-gray-900 mb-1">Streitschlichtung</h2>
              <p>
                Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{' '}
                <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  https://ec.europa.eu/consumers/odr/
                </a>. Wir sind nicht verpflichtet und nicht bereit, an einem Streitbeilegungsverfahren vor einer
                Verbraucherschlichtungsstelle teilzunehmen.
              </p>
            </section>
          </div>
        </div>
      </div>
    </main>
  )
}
