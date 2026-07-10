'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Flag, ExternalLink } from 'lucide-react'

type Report = {
  id: string
  demand_id: string
  reporter_id: string
  reason: string
  note: string | null
  status: string
  created_at: string
}

const REASON_LABELS: Record<string, string> = {
  spam: 'Spam oder Werbung',
  beleidigung: 'Beleidigung oder Hassrede',
  falsch: 'Falschinformation',
  duplikat: 'Doppelte Forderung',
  unangemessen: 'Unangemessener Inhalt',
  sonstiges: 'Sonstiges',
}

const STATUS_LABELS: Record<string, string> = {
  offen: 'Offen', erledigt: 'Erledigt', verworfen: 'Verworfen',
}

const FILTERS = ['offen', 'erledigt', 'verworfen', 'alle'] as const
type Filter = typeof FILTERS[number]

export default function AdminReports() {
  const [reports, setReports] = useState<Report[]>([])
  const [titles, setTitles] = useState<Record<string, string>>({})
  const [usernames, setUsernames] = useState<Record<string, string>>({})
  const [filter, setFilter] = useState<Filter>('offen')
  const [loading, setLoading] = useState(true)
  const [tableMissing, setTableMissing] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let active = true
    async function load() {
      setLoading(true)
      const supabase = createClient()
      let q = supabase.from('demand_reports').select('*').order('created_at', { ascending: false })
      if (filter !== 'alle') q = q.eq('status', filter)
      const { data, error } = await q
      if (!active) return
      if (error) { setTableMissing(true); setReports([]); setLoading(false); return }
      setTableMissing(false)
      const rows = (data ?? []) as Report[]
      setReports(rows)

      const demandIds = [...new Set(rows.map(r => r.demand_id))]
      const reporterIds = [...new Set(rows.map(r => r.reporter_id))]
      if (demandIds.length) {
        const { data: ds } = await supabase.from('demands').select('id, title').in('id', demandIds)
        if (active) setTitles(Object.fromEntries((ds ?? []).map(d => [d.id, d.title as string])))
      }
      if (reporterIds.length) {
        const { data: ps } = await supabase.from('profiles').select('id, username').in('id', reporterIds)
        if (active) setUsernames(Object.fromEntries((ps ?? []).filter(p => p.username).map(p => [p.id, p.username as string])))
      }
      if (active) setLoading(false)
    }
    load()
    return () => { active = false }
  }, [filter, reloadKey])

  async function setStatus(id: string, status: string) {
    const supabase = createClient()
    await supabase.from('demand_reports').update({ status }).eq('id', id)
    setReloadKey(k => k + 1)
  }

  function fmtDate(s: string) {
    return new Date(s).toLocaleDateString('de-DE', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  return (
    <div>
      <div className="mb-5 flex flex-wrap gap-2">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
              filter === f ? 'bg-blue-600 text-white' : 'border border-gray-200 bg-white text-gray-600 hover:border-blue-300'
            }`}
          >
            {f === 'alle' ? 'Alle' : STATUS_LABELS[f]}
          </button>
        ))}
      </div>

      {tableMissing ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Die Melde-Funktion ist aktiv, aber die Datenbank-Tabelle <code className="font-mono">demand_reports</code> wurde
          noch nicht angelegt. Sobald die Migration <strong>022</strong> eingespielt ist, erscheinen die Meldungen hier.
        </div>
      ) : loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map(i => <div key={i} className="h-24 animate-pulse rounded-2xl border border-gray-100 bg-white" />)}
        </div>
      ) : reports.length === 0 ? (
        <div className="py-16 text-center text-gray-400">
          <Flag size={28} className="mx-auto mb-3" />
          <div className="font-medium">Keine Meldungen</div>
          <div className="mt-1 text-sm">Hier erscheinen von Nutzern gemeldete Forderungen.</div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {reports.map(r => (
            <div key={r.id} className="rounded-2xl border border-gray-100 bg-white p-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600">
                  {REASON_LABELS[r.reason] ?? r.reason}
                </span>
                <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                  r.status === 'offen' ? 'bg-amber-100 text-amber-700'
                  : r.status === 'erledigt' ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-500'
                }`}>
                  {STATUS_LABELS[r.status] ?? r.status}
                </span>
                <span className="text-xs text-gray-400">{fmtDate(r.created_at)}</span>
              </div>

              <Link
                href={`/forderungen/${r.demand_id}`}
                className="mt-2 inline-flex items-center gap-1.5 font-semibold text-gray-900 hover:text-blue-600 transition-colors"
              >
                {titles[r.demand_id] ?? 'Forderung'}
                <ExternalLink size={13} className="text-gray-300" />
              </Link>

              {r.note && <p className="mt-1.5 text-sm text-gray-600 leading-relaxed">{`„${r.note}“`}</p>}

              <div className="mt-2 text-xs text-gray-400">
                gemeldet von {usernames[r.reporter_id] ? `@${usernames[r.reporter_id]}` : 'anonym'}
              </div>

              {r.status === 'offen' && (
                <div className="mt-3 flex items-center gap-2 border-t border-gray-100 pt-3">
                  <button
                    onClick={() => setStatus(r.id, 'erledigt')}
                    className="rounded-lg bg-green-600 px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-green-700"
                  >
                    Erledigt
                  </button>
                  <button
                    onClick={() => setStatus(r.id, 'verworfen')}
                    className="rounded-lg border border-gray-200 px-3.5 py-2 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50"
                  >
                    Verwerfen
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
