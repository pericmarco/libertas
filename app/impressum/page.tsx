import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export default function Impressum() {
  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="max-w-6xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-6">
          <ChevronLeft size={15} /> Zurück zur Startseite
        </Link>

        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Impressum</h1>

          <div className="text-sm text-gray-700 leading-relaxed lg:columns-2 lg:gap-x-12 [&>section]:mb-6 [&>section]:break-inside-avoid">
            <section>
              <h2 className="font-semibold text-gray-900 mb-1">Angaben gemäß § 5 DDG</h2>
              <p>
                Lybertas GbR<br />
                vertreten durch die Gesellschafter Tobias Mittmann und Marco Müller
              </p>
              <p className="mt-3">
                Tobias Mittmann<br />
                Bergstraße 144<br />
                53129 Bonn
              </p>
              <p className="mt-3">
                Marco Müller<br />
                Mathilde-Wrede-Str. 5<br />
                51469 Bergisch Gladbach
              </p>
            </section>

            <section>
              <h2 className="font-semibold text-gray-900 mb-1">Kontakt</h2>
              <p>
                E-Mail: <a href="mailto:info@lybertas.de" className="text-blue-600 hover:underline">info@lybertas.de</a>
              </p>
            </section>

            <section>
              <h2 className="font-semibold text-gray-900 mb-1">Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</h2>
              <p>Tobias Mittmann und Marco Müller (Anschriften wie oben)</p>
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
              <h2 className="font-semibold text-gray-900 mb-1">Verbraucherstreitbeilegung</h2>
              <p>
                Wir sind nicht verpflichtet und nicht bereit, an einem Streitbeilegungsverfahren vor einer
                Verbraucherschlichtungsstelle teilzunehmen (§ 36 VSBG). Die frühere EU-Plattform zur
                Online-Streitbeilegung (OS) wurde im Jahr 2025 eingestellt.
              </p>
            </section>
          </div>
        </div>
      </div>
    </main>
  )
}
