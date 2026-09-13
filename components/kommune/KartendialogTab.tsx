'use client'

import { useMemo, useState } from 'react'
import { MapPin, ThumbsUp, Check, X } from 'lucide-react'
import MapPanel from '@/components/MapPanel'
import type { LngLat, MapPin as MapPinT } from '@/components/MapView'
import { MAP_CONTRIB, MAP_CENTER, MAP_PROMPT, MAP_CATEGORY, type MapContribution, type MapCategory } from '@/lib/kommune/mapdialog'

const DEFAULT_CENTER: LngLat = { lng: 6.83, lat: 51.10 }
const CATS: MapCategory[] = ['vorschlag', 'problem', 'lob']

export default function KartendialogTab({ slug }: { slug: string }) {
  const [items, setItems] = useState<MapContribution[]>(MAP_CONTRIB[slug] ?? [])
  const [draft, setDraft] = useState<LngLat | null>(null)
  const [cat, setCat] = useState<MapCategory>('vorschlag')
  const [text, setText] = useState('')
  const [supported, setSupported] = useState<Set<string>>(new Set())
  const [active, setActive] = useState<string | null>(null)

  const center = MAP_CENTER[slug] ?? DEFAULT_CENTER
  const prompt = MAP_PROMPT[slug] ?? 'Setzen Sie einen Punkt auf die Karte und sagen Sie uns, worum es geht.'

  const pins: MapPinT[] = useMemo(() => items.map(c => ({
    id: c.id,
    lng: c.lng,
    lat: c.lat,
    title: MAP_CATEGORY[c.category].label,
    meta: c.text,
    color: MAP_CATEGORY[c.category].color,
  })), [items])

  function addContribution() {
    if (!draft || text.trim().length < 3) return
    const c: MapContribution = {
      id: 'neu-' + Date.now(),
      lng: draft.lng, lat: draft.lat,
      category: cat, text: text.trim(),
      author: 'Sie (Demo)', supports: 0,
    }
    setItems(prev => [c, ...prev])
    setDraft(null); setText('')
  }

  function toggleSupport(id: string) {
    setSupported(prev => {
      const n = new Set(prev)
      if (n.has(id)) n.delete(id); else n.add(id)
      return n
    })
  }

  const total = items.length
  const sorted = useMemo(() => [...items].sort((a, b) =>
    (b.supports + (supported.has(b.id) ? 1 : 0)) - (a.supports + (supported.has(a.id) ? 1 : 0)),
  ), [items, supported])

  return (
    <div className="flex flex-col gap-4">
      {/* Aufruf */}
      <p className="text-sm leading-relaxed text-gray-600">{prompt}</p>

      {/* Legende */}
      <div className="flex flex-wrap gap-x-4 gap-y-1.5">
        {CATS.map(c => (
          <span key={c} className="inline-flex items-center gap-1.5 text-xs text-gray-500">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: MAP_CATEGORY[c].color }} />
            {MAP_CATEGORY[c].label}
          </span>
        ))}
      </div>

      {/* Karte mit Picker */}
      <MapPanel
        picker
        maxPins={1}
        geolocate
        title="Kartendialog"
        center={center}
        zoom={15}
        pins={pins}
        value={draft ? [draft] : []}
        onChange={p => setDraft(p[0] ?? null)}
        onPinClick={setActive}
        className="h-[52vh] min-h-[320px] w-full"
      />

      {/* Beitrags-Formular (erscheint, sobald ein Punkt gesetzt ist) */}
      {draft ? (
        <div className="rounded-2xl border border-blue-100 bg-blue-50/40 p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-900">
              <MapPin size={15} className="text-blue-600" /> Punkt gesetzt – worum geht es?
            </h3>
            <button onClick={() => { setDraft(null); setText('') }} className="inline-flex items-center gap-1 text-xs text-gray-500 transition-colors hover:text-gray-800">
              <X size={13} /> Verwerfen
            </button>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {CATS.map(c => {
              const on = cat === c
              const m = MAP_CATEGORY[c]
              return (
                <button key={c} onClick={() => setCat(c)}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${on ? 'text-white' : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'}`}
                  style={on ? { backgroundColor: m.color, borderColor: 'transparent' } : undefined}>
                  <span>{m.emoji}</span> {m.label}
                </button>
              )
            })}
          </div>

          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            rows={3}
            placeholder="Beschreiben Sie kurz Ihren Hinweis…"
            className="mt-3 w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="mt-2 flex items-center gap-3">
            <button onClick={addContribution} disabled={text.trim().length < 3}
              className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40">
              Beitrag hinzufügen
            </button>
            <span className="text-xs text-gray-400">Demo · wird nicht gespeichert</span>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-500">
          <MapPin size={15} className="shrink-0 text-blue-500" /> Tippen Sie auf die Karte, um einen Beitrag zu verorten – oder nutzen Sie „Mein Standort“.
        </div>
      )}

      {/* Liste der Beiträge */}
      <div className="mt-1 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">Beiträge auf der Karte</h3>
        <span className="text-xs text-gray-400">{total} {total === 1 ? 'Beitrag' : 'Beiträge'}</span>
      </div>
      <div className="flex flex-col gap-3">
        {sorted.map(c => {
          const m = MAP_CATEGORY[c.category]
          const isSup = supported.has(c.id)
          const count = c.supports + (isSup ? 1 : 0)
          return (
            <div key={c.id}
              onMouseEnter={() => setActive(c.id)} onMouseLeave={() => setActive(null)}
              className={`flex items-start gap-3 rounded-2xl border bg-white p-4 transition-colors ${active === c.id ? 'border-blue-300 ring-1 ring-blue-100' : 'border-gray-100'}`}>
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm" style={{ backgroundColor: m.color + '1a', color: m.color }}>
                {m.emoji}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ backgroundColor: m.color + '1a', color: m.color }}>{m.label}</span>
                  <span className="text-xs text-gray-400">{c.author}</span>
                </div>
                <p className="mt-1 text-sm leading-relaxed text-gray-700">{c.text}</p>
              </div>
              <button
                onClick={() => toggleSupport(c.id)}
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${isSup ? 'border-green-200 bg-green-50 text-green-700' : 'border-gray-200 bg-white text-gray-600 hover:border-green-300 hover:text-green-700'}`}>
                {isSup ? <Check size={14} /> : <ThumbsUp size={14} />}
                <span className="tabular-nums">{count}</span>
              </button>
            </div>
          )
        })}
        {total === 0 && (
          <p className="rounded-2xl border border-dashed border-gray-200 py-10 text-center text-sm text-gray-400">
            Noch keine Beiträge – setzen Sie den ersten Punkt auf der Karte.
          </p>
        )}
      </div>
    </div>
  )
}
