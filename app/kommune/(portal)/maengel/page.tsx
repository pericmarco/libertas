'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Camera, CheckCircle2, MapPin, Circle } from 'lucide-react'
import { MAENGEL, MANGEL_STATUS } from '@/lib/kommune/admin'
import type { LngLat } from '@/components/MapView'
import MapPanel from '@/components/MapPanel'

// Fiktives Zentrum „Musterstadt"
const CENTER: LngLat = { lng: 6.83, lat: 51.10 }

const KATEGORIEN = [
  { key: 'strasse', emoji: '🛣️', label: 'Straße' },
  { key: 'beleuchtung', emoji: '💡', label: 'Beleuchtung' },
  { key: 'muell', emoji: '🗑️', label: 'Müll' },
  { key: 'gruen', emoji: '🌳', label: 'Grünanlage' },
  { key: 'spielplatz', emoji: '🎠', label: 'Spielplatz' },
  { key: 'verkehr', emoji: '🚦', label: 'Verkehr' },
  { key: 'schild', emoji: '🚸', label: 'Beschilderung' },
  { key: 'sonstiges', emoji: '➕', label: 'Sonstiges' },
]

const STEPS = ['Ort', 'Kategorie', 'Beschreibung', 'Foto', 'Prüfen']
const TRACK = ['Eingegangen', 'Zuständige Stelle', 'In Bearbeitung', 'Erledigt']

export default function Maengelmelder() {
  const [step, setStep] = useState(0)
  const [pin, setPin] = useState<LngLat | null>(null)
  const [address, setAddress] = useState('')
  const [kategorie, setKategorie] = useState<string | null>(null)
  const [beschreibung, setBeschreibung] = useState('')
  const [photo, setPhoto] = useState<string | null>(null)
  const [ref, setRef] = useState<string | null>(null)

  function submit() {
    setRef('M-' + Math.floor(1000 + Math.random() * 9000))
  }

  const canNext = [
    !!pin || address.trim().length > 2,     // Ort
    !!kategorie,                            // Kategorie
    beschreibung.trim().length >= 5,        // Beschreibung
    true,                                   // Foto optional
    true,
  ][step]

  if (ref) {
    return (
      <main className="mx-auto max-w-lg px-4 sm:px-6 py-12 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100"><CheckCircle2 size={30} className="text-green-600" /></div>
        <h1 className="text-2xl font-bold text-gray-900">Meldung eingegangen</h1>
        <p className="mt-1 text-gray-500">Ihre Meldung <strong>{ref}</strong> wurde erfasst. So geht es weiter:</p>
        <ol className="mx-auto mt-6 flex max-w-xs flex-col gap-3 text-left">
          {TRACK.map((t, i) => (
            <li key={t} className="flex items-center gap-3">
              {i === 0 ? <CheckCircle2 size={18} className="shrink-0 text-green-600" /> : <Circle size={18} className="shrink-0 text-gray-200" />}
              <span className={`text-sm ${i === 0 ? 'font-semibold text-gray-900' : 'text-gray-400'}`}>{t}</span>
            </li>
          ))}
        </ol>
        <p className="mt-6 text-xs text-gray-400">Demo · Meldung wird nicht dauerhaft gespeichert.</p>
        <a href="/maengel" className="mt-6 inline-block rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors">Weitere Meldung</a>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-2xl px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-900">Mangel melden</h1>
      <p className="mt-0.5 text-sm text-gray-500">Schritt {step + 1} von {STEPS.length} · {STEPS[step]}</p>
      <div className="mt-4 mb-6 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
        <div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
      </div>

      {step === 0 && (
        <div className="flex flex-col gap-4">
          <MapPanel picker maxPins={1} geolocate title="Standort wählen" center={CENTER} zoom={13} value={pin ? [pin] : []} onChange={pins => setPin(pins[0] ?? null)} className="h-64 w-full" />
          <div className="flex items-center gap-2 text-sm text-gray-500"><MapPin size={15} className="text-blue-500" /> {pin ? 'Standort auf der Karte gesetzt' : 'Tippen Sie den Ort auf der Karte an oder nutzen Sie „Mein Standort".'}</div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Adresse / Beschreibung des Orts</label>
            <input value={address} onChange={e => setAddress(e.target.value)} placeholder="z. B. Hauptstraße 42, vor der Bäckerei" className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {KATEGORIEN.map(k => (
            <button key={k.key} onClick={() => setKategorie(k.key)}
              className={`flex flex-col items-center gap-2 rounded-2xl border p-4 transition-all ${kategorie === k.key ? 'border-blue-400 bg-blue-50/60 ring-1 ring-blue-200' : 'border-gray-200 hover:border-blue-300'}`}>
              <span className="text-2xl">{k.emoji}</span>
              <span className="text-sm font-medium text-gray-800">{k.label}</span>
            </button>
          ))}
        </div>
      )}

      {step === 2 && (
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Was ist das Problem?</label>
          <textarea value={beschreibung} onChange={e => setBeschreibung(e.target.value)} rows={5} placeholder="Beschreiben Sie den Mangel möglichst genau…" className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
        </div>
      )}

      {step === 3 && (
        <div className="flex flex-col gap-3">
          <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-gray-300 px-6 py-10 text-center hover:border-blue-300">
            <Camera size={24} className="text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Foto aufnehmen oder auswählen</span>
            <span className="text-xs text-gray-400">optional · JPG/PNG</span>
            <input type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) setPhoto(URL.createObjectURL(f)) }} />
          </label>
          {photo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo} alt="Vorschau" className="max-h-64 w-full rounded-2xl border border-gray-100 object-cover" />
          )}
        </div>
      )}

      {step === 4 && (
        <div className="rounded-2xl border border-gray-100 bg-white p-6">
          <h2 className="text-base font-semibold text-gray-900">Prüfen & senden</h2>
          <dl className="mt-3 divide-y divide-gray-50 text-sm">
            <div className="flex justify-between gap-4 py-2"><dt className="text-gray-400">Ort</dt><dd className="text-right font-medium text-gray-900">{address || (pin ? 'Auf Karte gesetzt' : '—')}</dd></div>
            <div className="flex justify-between gap-4 py-2"><dt className="text-gray-400">Kategorie</dt><dd className="text-right font-medium text-gray-900">{KATEGORIEN.find(k => k.key === kategorie)?.label ?? '—'}</dd></div>
            <div className="flex justify-between gap-4 py-2"><dt className="text-gray-400">Beschreibung</dt><dd className="max-w-[70%] text-right font-medium text-gray-900">{beschreibung || '—'}</dd></div>
            <div className="flex justify-between gap-4 py-2"><dt className="text-gray-400">Foto</dt><dd className="text-right font-medium text-gray-900">{photo ? 'angehängt' : '—'}</dd></div>
          </dl>
        </div>
      )}

      <div className="mt-6 flex items-center justify-between">
        {step > 0 ? (
          <button onClick={() => setStep(s => s - 1)} className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"><ChevronLeft size={15} /> Zurück</button>
        ) : <span />}
        {step < STEPS.length - 1 ? (
          <button onClick={() => canNext && setStep(s => s + 1)} disabled={!canNext} className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">Weiter <ChevronRight size={15} /></button>
        ) : (
          <button onClick={submit} className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors">Meldung absenden</button>
        )}
      </div>

      {/* Öffentliche Meldungen in der Nähe */}
      {step === 0 && (
        <section className="mt-10">
          <h2 className="mb-3 text-sm font-semibold text-gray-900">Bereits gemeldet in der Nähe</h2>
          <div className="flex flex-col gap-2">
            {MAENGEL.slice(0, 4).map(m => (
              <div key={m.id} className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 bg-white px-4 py-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-gray-900">{m.title}</div>
                  <div className="text-xs text-gray-400">{m.location} · {m.category}</div>
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${MANGEL_STATUS[m.status].badge}`}>{MANGEL_STATUS[m.status].label}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  )
}
