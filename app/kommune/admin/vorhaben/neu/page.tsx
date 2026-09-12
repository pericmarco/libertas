'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, CheckCircle2, Building2, CalendarClock, Wallet } from 'lucide-react'
import { VORHABEN_STATUS, KAT_META, euro, fmtMonth, type VorhabenStatus, type VorhabenKategorie } from '@/lib/kommune/vorhaben'
import { PROCESSES } from '@/lib/kommune/demo'

const KINDS: VorhabenKategorie[] = ['Verkehr', 'Stadtgrün', 'Hochbau', 'Bildung', 'Digitales', 'Sport']
const STATUS: VorhabenStatus[] = ['planung', 'beteiligung', 'umsetzung', 'abgeschlossen']

const inputCls = 'w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
const labelCls = 'mb-1.5 block text-sm font-medium text-gray-700'

export default function VorhabenNeu() {
  const [title, setTitle] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [kategorie, setKategorie] = useState<VorhabenKategorie>('Verkehr')
  const [status, setStatus] = useState<VorhabenStatus>('planung')
  const [department, setDepartment] = useState('')
  const [district, setDistrict] = useState('')
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [budget, setBudget] = useState('')
  const [description, setDescription] = useState('')
  const [processSlug, setProcessSlug] = useState('')
  const [done, setDone] = useState(false)

  const valid = title.trim().length >= 3 && !!start

  if (done) {
    return (
      <main className="mx-auto max-w-lg px-4 sm:px-6 py-12 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100"><CheckCircle2 size={30} className="text-green-600" /></div>
        <h1 className="text-2xl font-bold text-gray-900">Vorhaben angelegt</h1>
        <p className="mt-1 text-gray-500">„{title}“ wurde erstellt und würde jetzt im Vorhaben-Bereich erscheinen.</p>

        <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-5 text-left">
          <div className="flex items-center gap-3">
            <span className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg ${KAT_META[kategorie].accent}`}>{KAT_META[kategorie].emoji}</span>
            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${VORHABEN_STATUS[status].badge}`}>{VORHABEN_STATUS[status].label}</span>
          </div>
          <div className="mt-2 font-semibold text-gray-900">{title}</div>
          {subtitle && <div className="text-sm text-gray-500">{subtitle}</div>}
          <div className="mt-2 flex flex-col gap-1.5 text-sm text-gray-600">
            {department && <span className="inline-flex items-center gap-2"><Building2 size={14} className="text-blue-600" /> {department}</span>}
            <span className="inline-flex items-center gap-2"><CalendarClock size={14} className="text-blue-600" /> {start ? fmtMonth(start) : '—'}{end ? ` – ${fmtMonth(end)}` : ''}</span>
            {budget && <span className="inline-flex items-center gap-2"><Wallet size={14} className="text-blue-600" /> {euro(Number(budget))}</span>}
          </div>
        </div>

        <p className="mt-6 text-xs text-gray-400">Demo · Das Vorhaben wird nicht dauerhaft gespeichert.</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/admin/vorhaben" className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:border-gray-300">Zur Übersicht</Link>
          <button onClick={() => { setDone(false); setTitle(''); setSubtitle(''); setDescription(''); setStart(''); setEnd('') }} className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700">Weiteres anlegen</button>
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-2xl px-4 sm:px-6 py-8">
      <Link href="/admin/vorhaben" className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900">
        <ChevronLeft size={16} /> Vorhaben
      </Link>
      <h1 className="mt-3 text-2xl font-bold text-gray-900">Vorhaben erstellen</h1>
      <p className="mt-0.5 text-sm text-gray-500">Neues städtisches Projekt anlegen.</p>

      <div className="mt-6 flex flex-col gap-5">
        {/* Basis */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5">
          <div>
            <label className={labelCls}>Titel *</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="z. B. Umbau des Marktplatzes" className={inputCls} />
          </div>
          <div className="mt-4">
            <label className={labelCls}>Kurzbeschreibung</label>
            <input value={subtitle} onChange={e => setSubtitle(e.target.value)} placeholder="Ein Satz, worum es geht" className={inputCls} />
          </div>
          <div className="mt-4">
            <label className={labelCls}>Bereich</label>
            <div className="flex flex-wrap gap-2">
              {KINDS.map(k => (
                <button key={k} type="button" onClick={() => setKategorie(k)}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${kategorie === k ? 'border-transparent bg-blue-600 text-white' : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'}`}>
                  <span>{KAT_META[k].emoji}</span> {k}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-4">
            <label className={labelCls}>Status</label>
            <div className="flex flex-wrap gap-2">
              {STATUS.map(s => (
                <button key={s} type="button" onClick={() => setStatus(s)}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${status === s ? 'border-transparent bg-blue-600 text-white' : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'}`}>
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: VORHABEN_STATUS[s].dot }} /> {VORHABEN_STATUS[s].label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Organisation */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Zuständiges Amt</label>
              <input value={department} onChange={e => setDepartment(e.target.value)} placeholder="z. B. Stadtplanungsamt" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Ort / Stadtteil</label>
              <input value={district} onChange={e => setDistrict(e.target.value)} placeholder="z. B. Innenstadt" className={inputCls} />
            </div>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className={labelCls}>Start *</label>
              <input type="month" value={start} onChange={e => setStart(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Fertigstellung</label>
              <input type="month" value={end} onChange={e => setEnd(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Budget (€)</label>
              <input type="number" min={0} value={budget} onChange={e => setBudget(e.target.value)} placeholder="z. B. 850000" className={inputCls} />
            </div>
          </div>
        </div>

        {/* Beschreibung & Verknüpfung */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5">
          <div>
            <label className={labelCls}>Beschreibung</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} placeholder="Ziele, Umfang und Nutzen des Vorhabens…" className={`${inputCls} resize-none`} />
          </div>
          <div className="mt-4">
            <label className={labelCls}>Mit Beteiligung verknüpfen (optional)</label>
            <select value={processSlug} onChange={e => setProcessSlug(e.target.value)} className={inputCls}>
              <option value="">– keine –</option>
              {PROCESSES.map(p => <option key={p.slug} value={p.slug}>{p.title}</option>)}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <Link href="/admin/vorhaben" className="rounded-xl px-5 py-3 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900">Abbrechen</Link>
          <button
            onClick={() => valid && setDone(true)}
            disabled={!valid}
            className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Vorhaben veröffentlichen
          </button>
        </div>
        {!valid && <p className="-mt-2 text-right text-xs text-gray-400">Titel und Startmonat sind erforderlich.</p>}
      </div>
    </main>
  )
}
