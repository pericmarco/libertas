'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/layout/Navbar'
import { createClient } from '@/lib/supabase/client'
import { ShieldCheck, Search, ChevronDown, Trash2, AlertTriangle, Flame } from 'lucide-react'

const RELEVANCE_THRESHOLD = 50

const MOD_STATUS: Record<string, { label: string; badge: string }> = {
  neu:             { label: 'Neu eingereicht',       badge: 'bg-blue-100 text-blue-700' },
  in_pruefung:     { label: 'In Prüfung',            badge: 'bg-yellow-100 text-yellow-700' },
  freigegeben:     { label: 'Freigegeben',           badge: 'bg-green-100 text-green-700' },
  ueberarbeitung:  { label: 'Braucht Überarbeitung', badge: 'bg-orange-100 text-orange-700' },
  weitergeleitet:  { label: 'Weitergeleitet',        badge: 'bg-purple-100 text-purple-700' },
  zurueckgestellt: { label: 'Zurückgestellt',        badge: 'bg-gray-200 text-gray-600' },
}

const PUBLIC_STATUS = ['eingereicht', 'geprüft', 'bearbeitet', 'umgesetzt', 'abgelehnt', 'zurückgezogen']

// Diese Moderationsstatus gelten als "erledigt" und verschwinden aus der Offen-Ansicht
const DONE_MOD_STATUSES = ['freigegeben', 'weitergeleitet', 'zurueckgestellt']

const ROLES: Record<string, { label: string; badge: string }> = {
  citizen:    { label: 'Bürger',   badge: 'bg-gray-100 text-gray-600' },
  city:       { label: 'Stadt',    badge: 'bg-emerald-100 text-emerald-700' },
  politician: { label: 'Politik',  badge: 'bg-purple-100 text-purple-700' },
  admin:      { label: 'Lybertas', badge: 'bg-blue-600 text-white' },
}

type Demand = {
  id: string
  title: string
  description: string | null
  solution: string | null
  location: string | null
  addressees: string[] | null
  category: string | null
  district_id: string | null
  user_id: string | null
  relevance_score: number
  status: string
  created_at: string
}

type Moderation = { demand_id: string; status: string; note: string | null }
type Profile = { id: string; username: string | null; full_name: string | null; role: string; district_id: string | null; created_at?: string }

export default function Admin() {
  const [authorized, setAuthorized] = useState<boolean | null>(null)
  const [tab, setTab] = useState<'forderungen' | 'nutzer'>('forderungen')
  const [demands, setDemands] = useState<Demand[]>([])
  const [moderation, setModeration] = useState<Record<string, Moderation>>({})
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [districts, setDistricts] = useState<Record<string, string>>({})
  const [search, setSearch] = useState('')
  const [modFilter, setModFilter] = useState<string>('alle')
  const [view, setView] = useState<'offen' | 'erledigt' | 'alle'>('offen')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [edit, setEdit] = useState<{ title: string; description: string; solution: string; status: string; modStatus: string; note: string }>({ title: '', description: '', solution: '', status: 'eingereicht', modStatus: 'neu', note: '' })
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState('')

  useEffect(() => {
    const supabase = createClient()
    async function load() {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) { setAuthorized(false); return }
      const { data: me } = await supabase.from('profiles').select('role').eq('id', userData.user.id).single()
      if (me?.role !== 'admin') { setAuthorized(false); return }
      setAuthorized(true)

      const [{ data: d }, { data: m }, { data: p }, { data: dist }] = await Promise.all([
        supabase.from('demands').select('*').order('created_at', { ascending: false }),
        supabase.from('demand_moderation').select('*'),
        supabase.from('profiles').select('id, username, full_name, role, district_id, created_at'),
        supabase.from('districts').select('id, name'),
      ])
      setDemands(d ?? [])
      setModeration(Object.fromEntries((m ?? []).map(x => [x.demand_id, x])))
      setProfiles(p ?? [])
      setDistricts(Object.fromEntries((dist ?? []).map(x => [x.id, x.name])))
    }
    load()
  }, [])

  const profileById = Object.fromEntries(profiles.map(p => [p.id, p]))

  function openEditor(d: Demand) {
    const mod = moderation[d.id]
    setExpanded(expanded === d.id ? null : d.id)
    setFeedback('')
    setEdit({
      title: d.title,
      description: d.description ?? '',
      solution: d.solution ?? '',
      status: d.status,
      modStatus: mod?.status ?? 'neu',
      note: mod?.note ?? '',
    })
  }

  async function saveDemand(demandId: string) {
    setSaving(true)
    setFeedback('')
    const supabase = createClient()

    const { error: e1 } = await supabase.from('demands').update({
      title: edit.title.trim(),
      description: edit.description.trim() || null,
      solution: edit.solution.trim() || null,
      status: edit.status,
    }).eq('id', demandId)

    const { error: e2 } = await supabase.from('demand_moderation').upsert({
      demand_id: demandId,
      status: edit.modStatus,
      note: edit.note.trim() || null,
      updated_at: new Date().toISOString(),
    })

    setSaving(false)
    if (e1 || e2) { setFeedback('Fehler: ' + (e1?.message ?? e2?.message)); return }

    setDemands(prev => prev.map(d => d.id === demandId
      ? { ...d, title: edit.title.trim(), description: edit.description.trim() || null, solution: edit.solution.trim() || null, status: edit.status }
      : d))
    setModeration(prev => ({ ...prev, [demandId]: { demand_id: demandId, status: edit.modStatus, note: edit.note.trim() || null } }))
    setFeedback('Gespeichert')
  }

  async function deleteDemand(demandId: string) {
    if (!window.confirm('Forderung endgültig löschen? Alle Positionen und Beiträge dazu werden mit entfernt. Für ein weiches Entfernen lieber Status "zurückgestellt" nutzen.')) return
    const supabase = createClient()
    const { error } = await supabase.from('demands').delete().eq('id', demandId)
    if (error) { setFeedback('Fehler: ' + error.message); return }
    setDemands(prev => prev.filter(d => d.id !== demandId))
    setExpanded(null)
  }

  async function setRole(userId: string, role: string) {
    const supabase = createClient()
    const { error } = await supabase.from('profiles').update({ role }).eq('id', userId)
    if (!error) {
      setProfiles(prev => prev.map(p => p.id === userId ? { ...p, role } : p))
    }
  }

  if (authorized === null) {
    return (
      <>
        <Navbar />
        <main className="pt-16 min-h-screen bg-gray-50">
          <div className="max-w-5xl mx-auto px-6 py-10">
            <div className="h-32 bg-white rounded-2xl animate-pulse" />
          </div>
        </main>
      </>
    )
  }

  if (!authorized) {
    return (
      <>
        <Navbar />
        <main className="pt-16 min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center text-gray-400">
            <AlertTriangle size={28} className="mx-auto mb-3" />
            <div className="font-medium text-gray-600">Kein Zugriff</div>
            <div className="text-sm mt-1">Dieser Bereich ist dem Lybertas-Team vorbehalten.</div>
          </div>
        </main>
      </>
    )
  }

  const thresholdReached = demands.filter(d => d.relevance_score >= RELEVANCE_THRESHOLD && d.status !== 'zurückgezogen')

  const isDone = (d: Demand) => DONE_MOD_STATUSES.includes(moderation[d.id]?.status ?? 'neu')
  const openCount = demands.filter(d => !isDone(d)).length
  const doneCount = demands.length - openCount

  const filtered = demands.filter(d => {
    if (view === 'offen' && isDone(d)) return false
    if (view === 'erledigt' && !isDone(d)) return false
    if (modFilter !== 'alle' && (moderation[d.id]?.status ?? 'neu') !== modFilter) return false
    if (search && !d.title.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">

          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck size={20} className="text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Admin</h1>
          </div>
          <p className="text-gray-500 mb-6">Moderation, Weiterleitung und Rollenverwaltung</p>

          {/* Tabs */}
          <div className="flex gap-1 p-1 bg-gray-100 rounded-xl w-fit mb-6">
            {(['forderungen', 'nutzer'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {t === 'forderungen' ? `Forderungen (${demands.length})` : `Nutzer (${profiles.length})`}
              </button>
            ))}
          </div>

          {tab === 'forderungen' && (
            <>
              {/* Schwellenwert-Hinweis (kein Filter — nur Information) */}
              {thresholdReached.length > 0 && (
                <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-5 text-sm text-amber-800">
                  <Flame size={16} className="shrink-0 mt-0.5" />
                  <span>
                    <strong>{thresholdReached.length} Forderung{thresholdReached.length === 1 ? '' : 'en'}</strong> über der 50-Punkte-Schwelle — bereit zur Weiterleitung prüfen:{' '}
                    {thresholdReached.map(d => d.title).join(' · ')}
                  </span>
                </div>
              )}

              {/* Offen/Erledigt: freigegebene, weitergeleitete und zurückgestellte
                  Forderungen verschwinden aus der Arbeitsansicht */}
              <div className="flex gap-1 p-1 bg-gray-100 rounded-xl w-fit mb-4">
                {([['offen', `Offen (${openCount})`], ['erledigt', `Erledigt (${doneCount})`], ['alle', 'Alle']] as const).map(([v, label]) => (
                  <button
                    key={v}
                    onClick={() => setView(v)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors ${view === v ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Suche + Moderationsfilter */}
              <div className="flex flex-col sm:flex-row gap-3 mb-5">
                <div className="relative flex-1">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" />
                  <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Nach Titel suchen…"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <select
                  value={modFilter}
                  onChange={e => setModFilter(e.target.value)}
                  className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="alle">Alle Moderationsstatus</option>
                  {Object.entries(MOD_STATUS).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
              </div>

              {/* Liste */}
              <div className="flex flex-col gap-3">
                {filtered.length === 0 && (
                  <div className="text-center py-16 text-gray-400 text-sm">Keine Forderungen für diese Auswahl.</div>
                )}
                {filtered.map(d => {
                  const mod = moderation[d.id]
                  const modInfo = MOD_STATUS[mod?.status ?? 'neu']
                  const author = d.user_id ? profileById[d.user_id] : null
                  const overThreshold = d.relevance_score >= RELEVANCE_THRESHOLD
                  const isOpen = expanded === d.id
                  return (
                    <div key={d.id} className={`bg-white rounded-2xl border p-5 ${overThreshold ? 'border-amber-300' : 'border-gray-100'}`}>
                      <button onClick={() => openEditor(d)} className="w-full text-left">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${modInfo.badge}`}>{modInfo.label}</span>
                              <span className="text-xs text-gray-400">{d.status}</span>
                              {d.category && <span className="text-xs text-gray-400">· {d.category}</span>}
                              {d.district_id && <span className="text-xs text-gray-400">· {districts[d.district_id]}</span>}
                              {overThreshold && (
                                <span className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                                  <Flame size={11} /> {d.relevance_score} Punkte — Schwelle erreicht
                                </span>
                              )}
                            </div>
                            <div className="font-semibold text-gray-900 leading-snug">{d.title}</div>
                            <div className="text-xs text-gray-400 mt-1">
                              {author?.username ? `@${author.username}` : author?.full_name ?? 'Unbekannt'} · {new Date(d.created_at).toLocaleDateString('de-DE')} · {d.relevance_score} Relevanzpunkte
                              {d.addressees && d.addressees.length > 0 && ` · an: ${d.addressees.join(', ')}`}
                            </div>
                            {mod?.note && !isOpen && (
                              <div className="text-xs text-orange-500 mt-1 truncate">Notiz: {mod.note}</div>
                            )}
                          </div>
                          <ChevronDown size={16} className={`text-gray-300 shrink-0 mt-1 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                        </div>
                      </button>

                      {isOpen && (
                        <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Titel</label>
                            <input value={edit.title} onChange={e => setEdit(p => ({ ...p, title: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">Problem</label>
                              <textarea value={edit.description} onChange={e => setEdit(p => ({ ...p, description: e.target.value }))} rows={3}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">Lösung</label>
                              <textarea value={edit.solution} onChange={e => setEdit(p => ({ ...p, solution: e.target.value }))} rows={3}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                            </div>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">Öffentlicher Status</label>
                              <select value={edit.status} onChange={e => setEdit(p => ({ ...p, status: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                                {PUBLIC_STATUS.map(s => <option key={s} value={s}>{s}</option>)}
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">Moderationsstatus (intern)</label>
                              <select value={edit.modStatus} onChange={e => setEdit(p => ({ ...p, modStatus: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                                {Object.entries(MOD_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                              </select>
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Interne Notiz (nur für euch sichtbar)</label>
                            <textarea value={edit.note} onChange={e => setEdit(p => ({ ...p, note: e.target.value }))} rows={2}
                              placeholder="z. B. Adressat unklar — Nutzer kontaktieren, Formulierung überarbeiten…"
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                          </div>
                          {feedback && (
                            <div className={`text-sm px-3 py-2 rounded-lg ${feedback.startsWith('Fehler') ? 'text-red-600 bg-red-50' : 'text-green-600 bg-green-50'}`}>{feedback}</div>
                          )}
                          <div className="flex items-center justify-between">
                            <button onClick={() => saveDemand(d.id)} disabled={saving}
                              className="px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-40">
                              {saving ? 'Speichern…' : 'Speichern'}
                            </button>
                            <button onClick={() => deleteDemand(d.id)}
                              className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-red-600 transition-colors">
                              <Trash2 size={14} /> Endgültig löschen
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </>
          )}

          {tab === 'nutzer' && (
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              {profiles.map((p, i) => {
                const roleInfo = ROLES[p.role] ?? ROLES.citizen
                return (
                  <div key={p.id} className={`flex flex-wrap items-center justify-between gap-3 px-5 py-4 ${i < profiles.length - 1 ? 'border-b border-gray-100' : ''}`}>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 text-sm">{p.username ? `@${p.username}` : '—'}</span>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${roleInfo.badge}`}>{roleInfo.label}</span>
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        {p.full_name ?? 'Kein Name'}{p.district_id ? ` · ${districts[p.district_id]}` : ''}
                      </div>
                    </div>
                    <select
                      value={p.role}
                      onChange={e => setRole(p.id, e.target.value)}
                      className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {Object.entries(ROLES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                    </select>
                  </div>
                )
              })}
            </div>
          )}

        </div>
      </main>
    </>
  )
}
