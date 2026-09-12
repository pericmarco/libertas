'use client'

import { ArrowDownWideNarrow } from 'lucide-react'

// Wiederverwendbare Sortier-/Filterleiste für alle Aufzählungen (Beteiligungen,
// Vorhaben, Mängel). Einheitliche Optik im gesamten Portal.
export type SortOption<T extends string> = { key: T; label: string }

export default function SortBar<T extends string>({
  options, value, onChange, label = 'Sortieren',
}: {
  options: SortOption<T>[]
  value: T
  onChange: (key: T) => void
  label?: string
}) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <span className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-gray-400">
        <ArrowDownWideNarrow size={14} /> {label}:
      </span>
      {options.map(o => {
        const on = o.key === value
        return (
          <button
            key={o.key}
            type="button"
            onClick={() => onChange(o.key)}
            className={`shrink-0 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${on ? 'border-transparent bg-blue-600 text-white' : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'}`}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}
