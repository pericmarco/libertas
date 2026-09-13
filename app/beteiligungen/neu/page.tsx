'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import { createClient } from '@/lib/supabase/client'
import { useCity } from '@/lib/city/context'
import {
  AVAILABLE_MODULES, MODULE_LABEL, REACTION_LABEL, STATUS_META,
  type ModuleType, type ReactionMode, type ProcessStatus, type ResultsMode,
} from '@/lib/participation/process'
import { ChevronLeft, CheckCircle2, Lock, Landmark, Check } from 'lucide-react'

const inputCls = 'w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
const labelCls = 'mb-1.5 block text-sm font-medium text-gray-700'

const STATUSES: ProcessStatus[] = ['beteiligung_laeuft', 'geplant', 'in_auswertung']
const REACTIONS: ReactionMode[] = ['sca', 'support', 'comments', 'none']

export default function BeteiligungNeu() {
  const city = useCity()
  const [ready, setReady] = useState(false)
  const [canCreate, setCanCreate] = useState(false)

  const [title, setTitle] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<ProcessStatus>('beteiligung_laeuft')
  const [modules, setModules] = useState<Set<ModuleType>>(new Set<ModuleType>(['information', 'karte']))
  const [reaction, setReaction] = useState<ReactionMode>('sca')
  const [results, setResults] = useState<ResultsMode>('nach')
  const [department, setDepartment] = useState('')
  const [contact, setContact] = useState('')
  const [area, setArea] = useState('')
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [doneId, setDoneId] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }) => {
      const uid = data.user?.id ?? null
      if (uid) {
        const { data: profile } = await supabase.from('profiles').select('role, politician_verified').eq('id', uid).single()
        const role = profile?.role ?? 'citizen'
        setCanCreate(role === 'admin' || role === 'city' || (role === 'politician' && profile?.politician_verified === true))
      }
      setReady(true)
    })
  }, [])

  function toggleModule(m: ModuleType) {
    if (m === 'information') return // Überblick ist immer aktiv
    setModules(prev => { const n = new Set(prev); if (n.has(m)) n.delete(m); else n.add(m); return n })
  }

  const valid = title.trim().length >= 3

  async function submit() {
    if (!valid) return
    setSaving(true); setError('')
    const supabase = createClient()
    const { data, error: e } = await supabase.from('participation_processes').insert({
      title: title.trim(),
      subtitle: subtitle.trim() || null,
      description: description.trim() || null,
      status,
      modules: Array.from(modules),
      reaction_mode: reaction,
      results_mode: results,
      department: department.trim() || null,
      contact: contact.trim() || null,
      area: area.trim() || null,
      starts_at: start || null,
      ends_at: end || null,
    }).select('id').single()
    setSaving(false)
    if (e || !data) { setError('Konnte nicht gespeichert werden: ' + (e?.message ?? 'unbekannt')); return }
    setDoneId(data.id)
  }

  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen bg-gray-50">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 py-8">
          {!ready ? (
            <div className="h-64 animate-pulse rounded-2xl bg-gray-100" />
          ) : !canCreate ? (
            <div className="rounded-2xl border border-gray-100 bg-white px-6 py-12 text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-400"><Lock size={24} /></div>
              <h1 className="text-xl font-bold text-gray-900">Nur für offizielle Accounts</h1>
              <p className="mx-auto mt-1 max-w-sm text-sm text-gray-500">
                Beteiligungsverfahren können nur von der Stadt, Verwaltung oder verifizierten Politik-Accounts angelegt werden.
              </p>
              <Link href="/beteiligungen" className="mt-5 inline-block rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700">Zu den Verfahren</Link>
            </div>
          ) : doneId ? (
            <div className="px-2 py-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100"><CheckCircle2 size={30} className="text-green-600" /></div>
              <h1 className="text-2xl font-bold text-gray-900">Verfahren veröffentlicht</h1>
              <p className="mt-1 text-gray-500">„{title}“ ist jetzt in {city.name} für alle sichtbar.</p>
              <div className="mt-6 flex justify-center gap-3">
                <Link href={`/beteiligungen/${doneId}`} className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700">Verfahren ansehen</Link>
                <Link href="/beteiligungen" className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50">Zur Übersicht</Link>
              </div>
            </div>
          ) : (
            <>
              <Link href="/beteiligungen" className="inline-flex items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-gray-900">
                <ChevronLeft size={15} /> Zurück
              </Link>
              <h1 className="mt-3 flex items-center gap-2 text-2xl font-bold text-gray-900">
                <Landmark size={22} className="text-blue-600" /> Beteiligungsverfahren anlegen
              </h1>
              <p className="mt-0.5 text-sm text-gray-500">Ein offizielles Verfahren in {city.name} — erscheint im Feed und unter „Beteiligungen“.</p>

              <div className="mt-6 flex flex-col gap-5">
                <div className="rounded-2xl border border-gray-100 bg-white p-5">
                  <div><label className={labelCls}>Titel *</label><input className={inputCls} value={title} onChange={e => setTitle(e.target.value)} placeholder="z. B. Neugestaltung des Rheinufers" /></div>
                  <div className="mt-4"><label className={labelCls}>Untertitel</label><input className={inputCls} value={subtitle} onChange={e => setSubtitle(e.target.value)} placeholder="Eine Leitfrage in einem Satz" /></div>
                  <div className="mt-4"><label className={labelCls}>Beschreibung</label><textarea rows={4} className={`${inputCls} resize-none`} value={description} onChange={e => setDescription(e.target.value)} placeholder="Worum geht es? Ziel, Hintergrund…" /></div>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-white p-5">
                  <label className={labelCls}>Module</label>
                  <p className="mb-3 text-xs text-gray-400">Weitere Module (Umfrage, Bürgerbudget, Dokumente …) kommen in Kürze dazu.</p>
                  <div className="grid grid-cols-2 gap-2">
                    {AVAILABLE_MODULES.map(m => {
                      const on = modules.has(m)
                      const locked = m === 'information'
                      return (
                        <button key={m} type="button" onClick={() => toggleModule(m)} disabled={locked}
                          className={`flex items-center gap-2.5 rounded-xl border p-3 text-left transition-all ${on ? 'border-blue-400 bg-blue-50/60 ring-1 ring-blue-200' : 'border-gray-200 hover:border-blue-300'} ${locked ? 'cursor-default' : ''}`}>
                          <span className={`flex h-5 w-5 items-center justify-center rounded-md border ${on ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300'}`}>{on && <Check size={13} />}</span>
                          <span className="text-sm font-medium text-gray-800">{MODULE_LABEL[m]}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-white p-5">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div><label className={labelCls}>Status</label>
                      <select className={inputCls} value={status} onChange={e => setStatus(e.target.value as ProcessStatus)}>
                        {STATUSES.map(s => <option key={s} value={s}>{STATUS_META[s].label}</option>)}
                      </select>
                    </div>
                    <div><label className={labelCls}>Reaktionsmodell</label>
                      <select className={inputCls} value={reaction} onChange={e => setReaction(e.target.value as ReactionMode)}>
                        {REACTIONS.map(r => <option key={r} value={r}>{REACTION_LABEL[r]}</option>)}
                      </select>
                    </div>
                    <div><label className={labelCls}>Ergebnisse sichtbar</label>
                      <select className={inputCls} value={results} onChange={e => setResults(e.target.value as ResultsMode)}>
                        <option value="live">Live (Zwischenstand)</option>
                        <option value="nach">Nach Abschluss</option>
                        <option value="verwaltung">Nur Verwaltung</option>
                      </select>
                    </div>
                    <div><label className={labelCls}>Ort / Stadtteil</label><input className={inputCls} value={area} onChange={e => setArea(e.target.value)} placeholder="z. B. Innenstadt" /></div>
                  </div>
                  <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div><label className={labelCls}>Zuständiges Amt</label><input className={inputCls} value={department} onChange={e => setDepartment(e.target.value)} placeholder="z. B. Stadtplanungsamt" /></div>
                    <div><label className={labelCls}>Ansprechpartner:in</label><input className={inputCls} value={contact} onChange={e => setContact(e.target.value)} placeholder="Name" /></div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div><label className={labelCls}>Start</label><input type="date" className={inputCls} value={start} onChange={e => setStart(e.target.value)} /></div>
                    <div><label className={labelCls}>Ende</label><input type="date" className={inputCls} value={end} onChange={e => setEnd(e.target.value)} /></div>
                  </div>
                </div>

                {error && <div className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</div>}

                <div className="flex items-center justify-end gap-3">
                  <Link href="/beteiligungen" className="rounded-xl px-5 py-3 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900">Abbrechen</Link>
                  <button onClick={submit} disabled={!valid || saving} className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40">
                    {saving ? 'Wird veröffentlicht…' : 'Veröffentlichen'}
                  </button>
                </div>
                {!valid && <p className="-mt-2 text-right text-xs text-gray-400">Ein Titel (mind. 3 Zeichen) ist erforderlich.</p>}
              </div>
            </>
          )}
        </div>
      </main>
    </>
  )
}
