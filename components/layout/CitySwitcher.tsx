'use client'

import { useEffect, useRef, useState } from 'react'
import { MapPin, ChevronDown, Check, Search, Home } from 'lucide-react'
import { useCity } from '@/lib/city/context'

// Stadtwechsel oben in der Network-Navigation. Aktuell hat man genau seine
// aktive Stadt; weitere Städte (Heimat + Interessen/Pendeln) folgen — das
// Suchfeld ist als „bald" angelegt, damit die Struktur schon steht.
export default function CitySwitcher() {
  const city = useCity()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('mousedown', onClick); document.removeEventListener('keydown', onKey) }
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:border-gray-300"
      >
        <MapPin size={14} className="text-blue-600" />
        <span className="max-w-[8rem] truncate">{city.name}</span>
        <ChevronDown size={14} className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div role="menu" className="absolute left-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_12px_40px_-12px_rgba(15,23,42,0.25)]">
          <div className="px-4 pb-1 pt-3 text-xs font-semibold uppercase tracking-wide text-gray-400">Deine Stadt</div>
          <div className="px-2">
            <div className="flex items-center gap-2.5 rounded-xl bg-blue-50/60 px-3 py-2.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600"><Home size={16} /></span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-gray-900">{city.name}</span>
                <span className="block text-[11px] text-gray-400">Aktive Stadt{city.is_demo ? ' · Beispiel' : ''}</span>
              </span>
              <Check size={16} className="shrink-0 text-blue-600" />
            </div>
          </div>

          {/* Weitere Städte – bald */}
          <div className="mt-2 border-t border-gray-100 px-4 pb-3 pt-3">
            <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-400">
              <Search size={15} />
              <span>Stadt suchen …</span>
              <span className="ml-auto rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-600">bald</span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-gray-400">
              Bald kannst du deine Heimatstadt und weitere Städte (z. B. zum Pendeln oder Besuchen) hinzufügen und mit einem Tippen wechseln.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
