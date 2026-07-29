'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ShieldCheck } from 'lucide-react'

// Auf diesen Seiten darf der Banner nicht überlagern — sonst kann man die
// Erklärung nicht lesen, bevor man zustimmt.
const EXEMPT = ['/datenschutz', '/impressum']

// Einwilligungs-Banner: muss aktiv bestätigt werden. Blendet sich erst nach
// „Verstanden & akzeptieren" aus und merkt sich die Einwilligung lokal.
// Versionsnummer erhöhen, wenn sich die Datenverarbeitung wesentlich ändert —
// dann wird die Einwilligung erneut eingeholt.
const CONSENT_KEY = 'lybertas_consent'
const CONSENT_VERSION = 1

export default function ConsentBanner() {
  const pathname = usePathname()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CONSENT_KEY)
      const parsed = raw ? JSON.parse(raw) : null
      if (!parsed || parsed.v !== CONSENT_VERSION) setVisible(true)
    } catch {
      setVisible(true)
    }
  }, [])

  function accept() {
    try {
      localStorage.setItem(CONSENT_KEY, JSON.stringify({ v: CONSENT_VERSION, ts: Date.now() }))
    } catch {
      /* localStorage nicht verfügbar — Banner trotzdem schließen */
    }
    setVisible(false)
  }

  if (!visible || EXEMPT.includes(pathname)) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Datenschutz-Einwilligung"
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4"
    >
      <div className="w-full max-w-lg bg-white rounded-2xl border border-gray-100 shadow-xl p-6">
        <div className="flex items-center gap-2 mb-3">
          <ShieldCheck size={20} className="text-blue-600" />
          <h2 className="text-lg font-bold text-gray-900">Datenschutz &amp; Einwilligung</h2>
        </div>

        <p className="text-sm text-gray-600 leading-relaxed">
          Lybertas speichert einige Daten, um die Plattform bereitzustellen — z. B. dein Konto,
          deine Beiträge und ein technisch notwendiges Anmelde-Cookie. Es werden keine
          Tracking- oder Werbe-Cookies gesetzt. Bevor es losgeht, bitten wir dich um deine
          Einwilligung in die Datenverarbeitung, wie sie in unserer Datenschutzerklärung
          beschrieben ist.
        </p>

        <p className="text-sm text-gray-600 leading-relaxed mt-3">
          Mit „Verstanden &amp; akzeptieren" bestätigst du, dass du die{' '}
          <Link href="/datenschutz" className="text-blue-600 font-medium hover:underline">
            Datenschutzerklärung
          </Link>{' '}
          gelesen hast und mit der beschriebenen Verarbeitung einverstanden bist.
        </p>

        <div className="flex flex-col sm:flex-row-reverse gap-3 mt-6">
          <button
            onClick={accept}
            className="flex-1 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
          >
            Verstanden &amp; akzeptieren
          </button>
          <Link
            href="/datenschutz"
            className="flex-1 py-3 text-center border border-gray-200 text-gray-600 font-medium rounded-xl hover:bg-gray-50 transition-colors"
          >
            Datenschutzerklärung lesen
          </Link>
        </div>
      </div>
    </div>
  )
}
