'use client'

import { useState } from 'react'
import { ChevronDown, Landmark, TrendingUp, UserRound, Users } from 'lucide-react'
import {
  BEZIRK, PARTEI_FARBEN, STADTTEILE,
  ergebnisKompakt, ergebnisVoll, type ParteiErgebnis, type Stadtteil,
} from '@/lib/stadtteilDaten'

const nf = new Intl.NumberFormat('de-DE')
const pf = new Intl.NumberFormat('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 })

// Balkenliste „Ratswahl 2025 im Stadtteil" — Name und Wert stehen als Text
// (Identität nie nur über Farbe), der Balken trägt die Parteifarbe und wird
// relativ zur stärksten Partei skaliert.
function ErgebnisBalken({ rows }: { rows: ParteiErgebnis[] }) {
  const max = Math.max(...rows.map(r => r.anteil), 1)
  return (
    <ul className="space-y-2" role="list">
      {rows.map(r => (
        <li key={r.partei} className="grid grid-cols-[92px_1fr_52px] items-center gap-3">
          <span className="text-sm font-medium text-gray-900 truncate">{r.partei}</span>
          <span
            className="h-2 rounded-full bg-gray-100 overflow-hidden"
            role="img"
            aria-label={`${r.partei}: ${pf.format(r.anteil)} Prozent`}
          >
            <span
              className="block h-full rounded-full"
              style={{ width: `${(r.anteil / max) * 100}%`, backgroundColor: PARTEI_FARBEN[r.partei] ?? PARTEI_FARBEN['Weitere'] }}
            />
          </span>
          <span className="text-sm text-gray-500 tabular-nums text-right">{pf.format(r.anteil)} %</span>
        </li>
      ))}
    </ul>
  )
}

export default function StadtteilCard({ defaultName }: { defaultName?: string | null }) {
  const fallback = STADTTEILE[0].name
  const initial = STADTTEILE.some(s => s.name === defaultName) ? (defaultName as string) : fallback
  const [name, setName] = useState(initial)
  const [mehr, setMehr] = useState(false)

  const s: Stadtteil = STADTTEILE.find(t => t.name === name) ?? STADTTEILE[0]
  const staerkste = s.ergebnis[0]
  const rows = mehr ? ergebnisVoll(s) : ergebnisKompakt(s)

  return (
    <section className="mb-6">
      {/* Stadtteil-Wahl */}
      <div className="flex items-center gap-3 mb-1">
        <span className="text-sm text-gray-500">Dein Stadtteil</span>
        <div className="relative">
          <select
            value={name}
            onChange={e => { setName(e.target.value); setMehr(false) }}
            aria-label="Stadtteil auswählen"
            className="appearance-none bg-white border border-gray-200 rounded-full pl-4 pr-8 py-1.5 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {STADTTEILE.map(t => <option key={t.name} value={t.name}>{t.name}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>
      <p className="text-xs text-gray-400 mb-3">Stadtbezirk {BEZIRK.name}</p>

      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900">{s.name} auf einen Blick</h2>
        <p className="text-sm text-gray-500 mt-0.5 mb-5">
          Stadtbezirk {BEZIRK.name} · zuständig: {BEZIRK.gremium}
        </p>

        {/* Kennzahlen */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
          <div className="flex items-center gap-3 rounded-xl border border-gray-100 px-4 py-3">
            <span className="p-2 rounded-lg bg-blue-50 text-blue-600"><Users size={16} /></span>
            <span>
              <span className="block font-bold text-gray-900 tabular-nums">{nf.format(s.einwohner)}</span>
              <span className="block text-xs text-gray-500">Einwohner*innen</span>
            </span>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-gray-100 px-4 py-3">
            <span className="p-2 rounded-lg bg-green-50 text-green-600"><TrendingUp size={16} /></span>
            <span>
              <span className="block font-bold text-gray-900 tabular-nums">{pf.format(s.wahlbeteiligung)} %</span>
              <span className="block text-xs text-gray-500">Wahlbeteiligung 2025</span>
            </span>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-gray-100 px-4 py-3">
            <span
              className="w-3.5 h-3.5 rounded-full shrink-0 ml-1"
              style={{ backgroundColor: PARTEI_FARBEN[staerkste.partei] }}
              aria-hidden="true"
            />
            <span>
              <span className="block font-bold text-gray-900">{staerkste.partei} <span className="tabular-nums">{pf.format(staerkste.anteil)} %</span></span>
              <span className="block text-xs text-gray-500">stärkste Partei</span>
            </span>
          </div>
        </div>

        {/* Zuständigkeit — bewusst Bezirksebene, Stadtteile haben kein eigenes Gremium */}
        <div className="space-y-1.5 pb-4 border-b border-gray-100">
          <p className="flex items-center gap-2 text-sm text-gray-600">
            <Landmark size={15} className="text-gray-400 shrink-0" />
            Politisch zuständig: <span className="font-medium text-gray-900">{BEZIRK.gremium}</span>
          </p>
          <p className="flex items-center gap-2 text-sm text-gray-600">
            <UserRound size={15} className="text-gray-400 shrink-0" />
            Bezirksbürgermeisterin: <span className="font-medium text-gray-900">{BEZIRK.buergermeisterin}, {BEZIRK.buergermeisterinPartei}</span>
          </p>
        </div>

        {/* Ratswahl 2025 im Stadtteil */}
        <h3 className="font-semibold text-gray-900 text-sm mt-4 mb-3">Ratswahl 2025 in {s.name}</h3>
        <ErgebnisBalken rows={rows} />

        {mehr && (
          <dl className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-gray-100">
            <div>
              <dt className="text-xs text-gray-500">Wahlberechtigte</dt>
              <dd className="text-sm font-semibold text-gray-900 tabular-nums">{nf.format(s.wahlberechtigte)}</dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500">Gültige Stimmen</dt>
              <dd className="text-sm font-semibold text-gray-900 tabular-nums">{nf.format(s.gueltigeStimmen)}</dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500">Fläche</dt>
              <dd className="text-sm font-semibold text-gray-900 tabular-nums">{pf.format(s.flaecheKm2)} km²</dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500">Bevölkerungsdichte</dt>
              <dd className="text-sm font-semibold text-gray-900 tabular-nums">{nf.format(s.dichteProKm2)} Einw./km²</dd>
            </div>
          </dl>
        )}

        <button
          type="button"
          onClick={() => setMehr(m => !m)}
          aria-expanded={mehr}
          className="w-full flex items-center justify-center gap-1 mt-4 pt-3 border-t border-gray-100 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
        >
          {mehr ? 'Weniger anzeigen' : 'Mehr anzeigen'}
          <ChevronDown size={15} className={`transition-transform ${mehr ? 'rotate-180' : ''}`} />
        </button>

        <p className="text-xs text-gray-400 mt-3">{BEZIRK.quelle}</p>
      </div>
    </section>
  )
}
