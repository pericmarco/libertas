'use client'

import { useMemo, useState } from 'react'
import { VORHABEN, VORHABEN_STATUS, type VorhabenStatus, type VorhabenKategorie } from '@/lib/kommune/vorhaben'
import VorhabenCard from '@/components/kommune/VorhabenCard'
import SortBar, { type SortOption } from '@/components/kommune/SortBar'

type Sort = 'neueste' | 'relevanteste' | 'endet_bald'
const SORTS: SortOption<Sort>[] = [
  { key: 'neueste', label: 'Neueste' },
  { key: 'relevanteste', label: 'Relevanteste' },
  { key: 'endet_bald', label: 'Fertigstellung zuerst' },
]

const STATUS_FILTER: { key: VorhabenStatus | 'alle'; label: string }[] = [
  { key: 'alle', label: 'Alle' },
  { key: 'planung', label: VORHABEN_STATUS.planung.label },
  { key: 'beteiligung', label: VORHABEN_STATUS.beteiligung.label },
  { key: 'umsetzung', label: VORHABEN_STATUS.umsetzung.label },
  { key: 'abgeschlossen', label: VORHABEN_STATUS.abgeschlossen.label },
]

const KATEGORIEN: VorhabenKategorie[] = ['Verkehr', 'Stadtgrün', 'Hochbau', 'Bildung', 'Digitales', 'Sport']

export default function VorhabenListe() {
  const [status, setStatus] = useState<VorhabenStatus | 'alle'>('alle')
  const [kat, setKat] = useState<VorhabenKategorie | 'alle'>('alle')
  const [sort, setSort] = useState<Sort>('neueste')

  const list = useMemo(() => {
    const filtered = VORHABEN.filter(v =>
      (status === 'alle' || v.status === status) && (kat === 'alle' || v.kategorie === kat),
    )
    const arr = [...filtered]
    if (sort === 'neueste') arr.sort((a, b) => (a.start < b.start ? 1 : -1))
    else if (sort === 'relevanteste') arr.sort((a, b) => b.interest - a.interest)
    else {
      // Fertigstellung zuerst: laufende Vorhaben mit der nächsten Fertigstellung
      // oben, abgeschlossene/ohne Termin ans Ende.
      const rank = (v: typeof arr[number]) =>
        v.end && v.status !== 'abgeschlossen' ? v.end : '9999'
      arr.sort((a, b) => (rank(a) < rank(b) ? -1 : rank(a) > rank(b) ? 1 : 0))
    }
    return arr
  }, [status, kat, sort])

  // Nur tatsächlich vorkommende Kategorien anbieten.
  const usedKats = KATEGORIEN.filter(k => VORHABEN.some(v => v.kategorie === k))

  return (
    <main className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-gray-900">Vorhaben der Stadt</h1>
        <p className="mt-0.5 text-sm text-gray-500">Offizielle Projekte der Verwaltung – mit Zeitplan, Stand und Beteiligungsmöglichkeiten.</p>
      </div>

      {/* Statusfilter */}
      <div className="mb-3 flex flex-wrap gap-2">
        {STATUS_FILTER.map(f => {
          const on = status === f.key
          return (
            <button key={f.key} onClick={() => setStatus(f.key)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${on ? 'border-transparent bg-blue-600 text-white' : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'}`}>
              {f.key !== 'alle' && <span className="h-2 w-2 rounded-full" style={{ backgroundColor: VORHABEN_STATUS[f.key].dot }} />}
              {f.label}
            </button>
          )
        })}
      </div>

      {/* Kategoriefilter */}
      <div className="mb-3 flex flex-wrap gap-2">
        <button onClick={() => setKat('alle')}
          className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${kat === 'alle' ? 'border-gray-800 bg-gray-800 text-white' : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'}`}>
          Alle Bereiche
        </button>
        {usedKats.map(k => (
          <button key={k} onClick={() => setKat(kat === k ? 'alle' : k)}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${kat === k ? 'border-gray-800 bg-gray-800 text-white' : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'}`}>
            {k}
          </button>
        ))}
      </div>

      {/* Sortierung */}
      <div className="mb-5">
        <SortBar options={SORTS} value={sort} onChange={setSort} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map(v => <VorhabenCard key={v.slug} v={v} />)}
      </div>
      {list.length === 0 && (
        <p className="rounded-2xl border border-dashed border-gray-200 py-12 text-center text-sm text-gray-400">Keine Vorhaben mit dieser Auswahl.</p>
      )}
    </main>
  )
}
