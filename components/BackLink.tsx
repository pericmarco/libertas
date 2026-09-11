'use client'

import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'

/**
 * Zurück-Knopf für Unterseiten (Hilfe, Richtlinien, Rechtstexte).
 *
 * Bewusst kein fester Link auf „/": Wer angemeldet aus dem Feed heraus eine
 * Info-Seite öffnet, soll auch dorthin zurückkommen — nicht auf die
 * Marketing-Startseite, die wie eine Abmeldung wirkt.
 */
export default function BackLink({
  fallback,
  label = 'Zurück',
  className,
}: {
  /** Ziel, wenn die Seite ohne Verlauf geöffnet wurde (geteilter Link, neuer Tab). */
  fallback: string
  label?: string
  className?: string
}) {
  const router = useRouter()

  return (
    <button
      type="button"
      onClick={() => {
        if (window.history.length > 1) router.back()
        else router.push(fallback)
      }}
      className={className}
    >
      <ChevronLeft size={15} /> {label}
    </button>
  )
}
