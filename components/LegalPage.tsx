import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

// Gemeinsame Hülle für Info- und Rechtsseiten (Nutzungsbedingungen,
// Community-Richtlinien, Barrierefreiheit, Hilfe). Folgt der Designsprache:
// max-w-6xl, Karte auf grauem Grund, Rechtstexte ab lg zweispaltig.
export default function LegalPage({
  title,
  meta,
  columns = true,
  children,
}: {
  title: string
  meta?: string
  /** Zweispaltig ab lg — für lange Rechtstexte sinnvoll, für die FAQ nicht. */
  columns?: boolean
  children: React.ReactNode
}) {
  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="max-w-6xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-6"
        >
          <ChevronLeft size={15} /> Zurück zur Startseite
        </Link>

        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">{title}</h1>
          {meta && <p className="text-xs text-gray-400 mb-6">{meta}</p>}
          {!meta && <div className="mb-6" />}

          <div
            className={
              'text-sm text-gray-700 leading-relaxed [&>section]:mb-6 [&>section]:break-inside-avoid' +
              (columns ? ' lg:columns-2 lg:gap-x-12' : '')
            }
          >
            {children}
          </div>
        </div>
      </div>
    </main>
  )
}

/** Abschnitt mit Überschrift — einheitlich über alle Info-Seiten. */
export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-semibold text-gray-900 mb-1">{title}</h2>
      {children}
    </section>
  )
}
