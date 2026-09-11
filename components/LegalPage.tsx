import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import BackLink from '@/components/BackLink'
import { createClient } from '@/lib/supabase/server'

const BACK_STYLE =
  'inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-6'

// Gemeinsame Hülle für Info- und Rechtsseiten (Hilfe, Community-Richtlinien,
// Nutzungsbedingungen, Barrierefreiheit, Impressum, Datenschutz). Folgt der
// Designsprache: max-w-6xl, Karte auf grauem Grund, Rechtstexte ab lg
// zweispaltig.
//
// Angemeldete Personen behalten hier die Hauptnavigation. Ohne sie führte der
// einzige Ausgang auf die Marketing-Startseite mit „Anmelden/Registrieren" —
// das las sich wie eine Abmeldung, obwohl die Sitzung bestand.
export default async function LegalPage({
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
  let loggedIn = false
  try {
    const supabase = await createClient()
    loggedIn = !!(await supabase.auth.getUser()).data.user
  } catch {
    // Rechts- und Info-Seiten müssen erreichbar bleiben, auch wenn die
    // Auth-Abfrage scheitert — dann eben in der abgemeldeten Ansicht.
  }

  return (
    <>
      {loggedIn && <Navbar />}

      <main className={'min-h-screen bg-gray-50 px-6' + (loggedIn ? ' pt-16' : '')}>
        {/* Unten Luft für die mobile Navigationsleiste, damit der Schluss des
            Textes nicht dahinter verschwindet. */}
        <div className={'max-w-6xl mx-auto py-10' + (loggedIn ? ' pb-28 md:pb-10' : '')}>
          {loggedIn ? (
            <BackLink fallback="/feed" className={BACK_STYLE} />
          ) : (
            <Link href="/" className={BACK_STYLE}>
              <ChevronLeft size={15} /> Zurück zur Startseite
            </Link>
          )}

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
    </>
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
