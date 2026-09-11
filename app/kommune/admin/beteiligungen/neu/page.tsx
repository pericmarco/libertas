'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, Check, CheckCircle2 } from 'lucide-react'
import { MODULE_LABEL, REACTION_LABEL, type ModuleType, type ReactionMode } from '@/lib/kommune/demo'

const STEPS = ['Basis', 'Module', 'Berechtigungen', 'Moderation', 'Ergebnisse', 'Veröffentlichen']

const MODULE_ORDER: ModuleType[] = ['information', 'ideen', 'karte', 'umfrage', 'varianten', 'fragen', 'buergerbudget', 'dokument', 'termine', 'ergebnisse']

const input = 'w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
const labelCls = 'block text-sm font-medium text-gray-700 mb-1.5'

function Choice<T extends string>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: { v: T; label: string; desc?: string }[] }) {
  return (
    <div className="flex flex-col gap-2">
      {options.map(o => (
        <button key={o.v} type="button" onClick={() => onChange(o.v)}
          className={`rounded-xl border p-3.5 text-left transition-all ${value === o.v ? 'border-blue-400 bg-blue-50/60 ring-1 ring-blue-200' : 'border-gray-200 hover:border-blue-300'}`}>
          <div className="flex items-center gap-2">
            <span className={`flex h-4 w-4 items-center justify-center rounded-full border ${value === o.v ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300'}`}>
              {value === o.v && <Check size={11} />}
            </span>
            <span className="text-sm font-semibold text-gray-800">{o.label}</span>
          </div>
          {o.desc && <p className="mt-0.5 pl-6 text-xs text-gray-500">{o.desc}</p>}
        </button>
      ))}
    </div>
  )
}

export default function BeteiligungErstellen() {
  const [step, setStep] = useState(0)
  const [done, setDone] = useState(false)

  const [title, setTitle] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [description, setDescription] = useState('')
  const [department, setDepartment] = useState('')
  const [contact, setContact] = useState('')
  const [district, setDistrict] = useState('')
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [modules, setModules] = useState<Set<ModuleType>>(new Set(['information']))
  const [who, setWho] = useState<'angemeldet' | 'alle' | 'verifiziert'>('angemeldet')
  const [comments, setComments] = useState(true)
  const [reactionMode, setReactionMode] = useState<ReactionMode>('sca')
  const [attachments, setAttachments] = useState(true)
  const [mapLoc, setMapLoc] = useState(true)
  const [moderation, setModeration] = useState<'pre' | 'post' | 'none'>('post')
  const [resultVis, setResultVis] = useState<'live' | 'nach' | 'verwaltung'>('nach')
  const [publishState, setPublishState] = useState<'entwurf' | 'geplant' | 'veroeffentlicht'>('veroeffentlicht')

  const toggleModule = (m: ModuleType) => setModules(prev => {
    const n = new Set(prev); if (n.has(m)) n.delete(m); else n.add(m); return n
  })

  if (done) {
    return (
      <main className="mx-auto max-w-lg px-4 sm:px-6 py-16 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100"><CheckCircle2 size={30} className="text-green-600" /></div>
        <h1 className="text-2xl font-bold text-gray-900">Beteiligung erstellt</h1>
        <p className="mt-2 text-gray-500">„{title || 'Neue Beteiligung'}“ wurde als <strong>{publishState}</strong> angelegt — mit {modules.size} Modul(en) und dem Reaktionsmodell „{REACTION_LABEL[reactionMode]}“.</p>
        <p className="mt-1 text-xs text-gray-400">Demo · wird nicht dauerhaft gespeichert.</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/admin/beteiligungen" className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors">Zur Verwaltung</Link>
          <button onClick={() => { setDone(false); setStep(0) }} className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">Noch eine erstellen</button>
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-2xl px-4 sm:px-6 py-8">
      <Link href="/admin/beteiligungen" className="mb-5 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors">
        <ChevronLeft size={15} /> Abbrechen
      </Link>
      <h1 className="text-2xl font-bold text-gray-900">Beteiligung erstellen</h1>
      <p className="mt-0.5 text-sm text-gray-500">Schritt {step + 1} von {STEPS.length} · {STEPS[step]}</p>
      <div className="mt-4 mb-6 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
        <div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
      </div>

      {/* Schritt 1: Basis */}
      {step === 0 && (
        <div className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-6">
          <div><label className={labelCls}>Titel *</label><input className={input} value={title} onChange={e => setTitle(e.target.value)} placeholder="z. B. Neugestaltung Marktplatz" /></div>
          <div><label className={labelCls}>Untertitel</label><input className={input} value={subtitle} onChange={e => setSubtitle(e.target.value)} placeholder="Kurze Beschreibung in einem Satz" /></div>
          <div><label className={labelCls}>Beschreibung</label><textarea rows={3} className={`${input} resize-none`} value={description} onChange={e => setDescription(e.target.value)} placeholder="Worum geht es? Ziel, Hintergrund…" /></div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div><label className={labelCls}>Zuständiges Amt</label><input className={input} value={department} onChange={e => setDepartment(e.target.value)} placeholder="z. B. Stadtplanungsamt" /></div>
            <div><label className={labelCls}>Ansprechpartner:in</label><input className={input} value={contact} onChange={e => setContact(e.target.value)} placeholder="Name" /></div>
            <div><label className={labelCls}>Ort / Stadtteil</label><input className={input} value={district} onChange={e => setDistrict(e.target.value)} placeholder="z. B. Innenstadt" /></div>
            <div className="grid grid-cols-2 gap-2">
              <div><label className={labelCls}>Start</label><input type="date" className={input} value={start} onChange={e => setStart(e.target.value)} /></div>
              <div><label className={labelCls}>Ende</label><input type="date" className={input} value={end} onChange={e => setEnd(e.target.value)} /></div>
            </div>
          </div>
        </div>
      )}

      {/* Schritt 2: Module */}
      {step === 1 && (
        <div className="rounded-2xl border border-gray-100 bg-white p-6">
          <p className="mb-4 text-sm text-gray-500">Welche Beteiligungsmodule sollen Bürger:innen sehen? Sie können mehrere kombinieren.</p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {MODULE_ORDER.map(m => {
              const on = modules.has(m)
              return (
                <button key={m} type="button" onClick={() => toggleModule(m)}
                  className={`flex items-center gap-3 rounded-xl border p-3.5 text-left transition-all ${on ? 'border-blue-400 bg-blue-50/60 ring-1 ring-blue-200' : 'border-gray-200 hover:border-blue-300'}`}>
                  <span className={`flex h-5 w-5 items-center justify-center rounded-md border ${on ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300'}`}>{on && <Check size={13} />}</span>
                  <span className="text-sm font-medium text-gray-800">{MODULE_LABEL[m]}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Schritt 3: Berechtigungen */}
      {step === 2 && (
        <div className="flex flex-col gap-5 rounded-2xl border border-gray-100 bg-white p-6">
          <div>
            <label className={labelCls}>Wer darf Beiträge einreichen?</label>
            <Choice value={who} onChange={setWho} options={[
              { v: 'angemeldet', label: 'Angemeldete Bürger:innen' },
              { v: 'alle', label: 'Alle (auch ohne Anmeldung)' },
              { v: 'verifiziert', label: 'Nur verifizierte Einwohner:innen', desc: 'z. B. per BundID / Adressnachweis' },
            ]} />
          </div>
          <div>
            <label className={labelCls}>Reaktionsmodell</label>
            <Choice value={reactionMode} onChange={setReactionMode} options={[
              { v: 'sca', label: REACTION_LABEL.sca, desc: 'Das differenzierte Lybertas-Modell' },
              { v: 'support', label: REACTION_LABEL.support },
              { v: 'comments', label: REACTION_LABEL.comments },
              { v: 'none', label: REACTION_LABEL.none },
            ]} />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              { on: comments, set: setComments, label: 'Kommentare erlauben' },
              { on: attachments, set: setAttachments, label: 'Anhänge erlauben' },
              { on: mapLoc, set: setMapLoc, label: 'Standorte auf Karte' },
            ].map(t => (
              <button key={t.label} type="button" onClick={() => t.set(v => !v)}
                className={`flex items-center justify-between gap-2 rounded-xl border p-3.5 text-left text-sm font-medium transition-all ${t.on ? 'border-blue-400 bg-blue-50/60 text-blue-700' : 'border-gray-200 text-gray-600'}`}>
                {t.label}
                <span className={`h-5 w-9 shrink-0 rounded-full ${t.on ? 'bg-blue-600' : 'bg-gray-200'} relative transition-colors`}>
                  <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${t.on ? 'left-[18px]' : 'left-0.5'}`} />
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Schritt 4: Moderation */}
      {step === 3 && (
        <div className="rounded-2xl border border-gray-100 bg-white p-6">
          <label className={labelCls}>Wie sollen Beiträge moderiert werden?</label>
          <Choice value={moderation} onChange={setModeration} options={[
            { v: 'pre', label: 'Vor-Moderation', desc: 'Beiträge erscheinen erst nach Freigabe durch die Verwaltung.' },
            { v: 'post', label: 'Nach-Moderation', desc: 'Beiträge erscheinen sofort, können nachträglich geprüft werden.' },
            { v: 'none', label: 'Keine Moderation', desc: 'Beiträge erscheinen ungeprüft.' },
          ]} />
        </div>
      )}

      {/* Schritt 5: Ergebnis-Sichtbarkeit */}
      {step === 4 && (
        <div className="rounded-2xl border border-gray-100 bg-white p-6">
          <label className={labelCls}>Wann sollen Ergebnisse sichtbar sein?</label>
          <Choice value={resultVis} onChange={setResultVis} options={[
            { v: 'live', label: 'Live', desc: 'Zwischenstände sind jederzeit öffentlich.' },
            { v: 'nach', label: 'Nach Abschluss', desc: 'Ergebnisse erscheinen nach Ende der Beteiligung.' },
            { v: 'verwaltung', label: 'Nur Verwaltung', desc: 'Ergebnisse sind zunächst intern.' },
          ]} />
        </div>
      )}

      {/* Schritt 6: Veröffentlichen */}
      {step === 5 && (
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-gray-100 bg-white p-6">
            <h2 className="text-base font-semibold text-gray-900">Zusammenfassung</h2>
            <dl className="mt-3 divide-y divide-gray-50 text-sm">
              {[
                ['Titel', title || '—'],
                ['Module', [...modules].map(m => MODULE_LABEL[m]).join(', ')],
                ['Einreichen', who === 'angemeldet' ? 'Angemeldete' : who === 'alle' ? 'Alle' : 'Verifizierte'],
                ['Reaktionen', REACTION_LABEL[reactionMode]],
                ['Moderation', moderation === 'pre' ? 'Vor-Moderation' : moderation === 'post' ? 'Nach-Moderation' : 'Keine'],
                ['Ergebnisse', resultVis === 'live' ? 'Live' : resultVis === 'nach' ? 'Nach Abschluss' : 'Nur Verwaltung'],
              ].map(([k, v]) => (
                <div key={k} className="flex items-start justify-between gap-4 py-2"><dt className="text-gray-400">{k}</dt><dd className="text-right font-medium text-gray-900">{v}</dd></div>
              ))}
            </dl>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-6">
            <label className={labelCls}>Veröffentlichen als</label>
            <Choice value={publishState} onChange={setPublishState} options={[
              { v: 'entwurf', label: 'Entwurf', desc: 'Nur intern sichtbar.' },
              { v: 'geplant', label: 'Geplant', desc: 'Startet automatisch am Startdatum.' },
              { v: 'veroeffentlicht', label: 'Veröffentlicht', desc: 'Sofort für Bürger:innen sichtbar.' },
            ]} />
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="mt-6 flex items-center justify-between">
        {step > 0 ? (
          <button onClick={() => setStep(s => s - 1)} className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
            <ChevronLeft size={15} /> Zurück
          </button>
        ) : <span />}
        {step < STEPS.length - 1 ? (
          <button onClick={() => setStep(s => s + 1)} disabled={step === 0 && title.trim().length < 3}
            className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
            Weiter
          </button>
        ) : (
          <button onClick={() => setDone(true)} className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors">
            Beteiligung veröffentlichen
          </button>
        )}
      </div>
    </main>
  )
}
