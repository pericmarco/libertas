'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ShieldCheck, CheckCircle2, Circle, Plus, Trash2, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import RepScoreBadge from '@/components/RepScoreBadge'
import { computeRepScoreForProfiles } from '@/lib/repScore'

type Vote = {
  id: string
  title: string
  description: string | null
  ends_at: string | null
  total_votes: number
  is_partner_vote: boolean
  partner_name: string | null
}

type VoteOption = {
  id: string
  vote_id: string
  label: string
  description: string | null
  count: number
}

export default function Abstimmungen() {
  const [tab, setTab] = useState<'buerger' | 'partner'>('partner')
  const [votes, setVotes] = useState<Vote[]>([])
  const [options, setOptions] = useState<VoteOption[]>([])
  const [userVotes, setUserVotes] = useState<Record<string, string>>({})
  const [selected, setSelected] = useState<Record<string, string>>({})
  const [reps, setReps] = useState<Record<string, { score: number; participants: number }>>({})
  const [submitting, setSubmitting] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [myRole, setMyRole] = useState<string>('citizen')
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Formular: neue Stadtumfrage (nur Stadt/Admin)
  const [showCreate, setShowCreate] = useState(false)
  const [cTitle, setCTitle] = useState('')
  const [cDesc, setCDesc] = useState('')
  const [cSender, setCSender] = useState('Lybertas')
  const [cEndsAt, setCEndsAt] = useState('')
  const [cOptions, setCOptions] = useState<{ label: string; description: string }[]>([
    { label: '', description: '' },
    { label: '', description: '' },
  ])
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState('')

  useEffect(() => {
    const supabase = createClient()
    async function load() {
      const { data: userData } = await supabase.auth.getUser()
      const uid = userData.user?.id ?? null
      setUserId(uid)

      if (uid) {
        const { data: me } = await supabase.from('profiles').select('role').eq('id', uid).single()
        setMyRole(me?.role ?? 'citizen')
        if (me?.role === 'city') setCSender('Stadt Köln')
      }

      const [{ data: votesData }, { data: optionsData }] = await Promise.all([
        supabase.from('votes').select('*').order('created_at', { ascending: false }),
        supabase.from('vote_options').select('*'),
      ])
      setVotes(votesData ?? [])
      setOptions(optionsData ?? [])

      if (uid) {
        const { data: own } = await supabase.from('vote_responses').select('vote_id, option_id').eq('user_id', uid)
        const map: Record<string, string> = {}
        for (const r of own ?? []) map[r.vote_id] = r.option_id
        setUserVotes(map)
      }

      // Repräsentativitäts-Score je Umfrage (anonyme Teilnehmer-Demografie via RPC)
      const repEntries = await Promise.all((votesData ?? []).map(async v => {
        const { data: demo } = await supabase.rpc('vote_participant_demographics', { v_id: v.id })
        const rep = await computeRepScoreForProfiles(supabase, demo ?? [])
        return [v.id, rep] as const
      }))
      setReps(Object.fromEntries(repEntries))

      setLoading(false)
    }
    load()
  }, [])

  function getOptions(voteId: string) {
    const opts = options.filter(o => o.vote_id === voteId)
    const total = opts.reduce((sum, o) => sum + o.count, 0)
    return opts.map(o => ({ ...o, percent: total > 0 ? Math.round((o.count / total) * 100) : 0 }))
  }

  const canCreate = myRole === 'admin' || myRole === 'city'

  async function createSurvey() {
    const validOptions = cOptions.filter(o => o.label.trim())
    if (cTitle.trim().length < 5 || validOptions.length < 2) {
      setCreateError('Bitte Titel (mind. 5 Zeichen) und mindestens zwei Antwortoptionen angeben.')
      return
    }
    setCreating(true)
    setCreateError('')
    const supabase = createClient()

    const { data: v, error: e1 } = await supabase.from('votes').insert({
      title: cTitle.trim(),
      description: cDesc.trim() || null,
      is_partner_vote: true,
      partner_name: cSender.trim() || 'Lybertas',
      ends_at: cEndsAt ? new Date(cEndsAt + 'T23:59:59').toISOString() : null,
    }).select('*').single()

    if (e1 || !v) { setCreateError(e1?.message ?? 'Fehler beim Anlegen.'); setCreating(false); return }

    const { data: newOpts, error: e2 } = await supabase.from('vote_options').insert(
      validOptions.map(o => ({ vote_id: v.id, label: o.label.trim(), description: o.description.trim() || null }))
    ).select('*')

    setCreating(false)
    if (e2) { setCreateError('Umfrage angelegt, aber Optionen fehlgeschlagen: ' + e2.message); return }

    setVotes(prev => [v, ...prev])
    setOptions(prev => [...prev, ...(newOpts ?? [])])
    setShowCreate(false)
    setCTitle(''); setCDesc(''); setCEndsAt('')
    setCOptions([{ label: '', description: '' }, { label: '', description: '' }])
  }

  async function deleteSurvey(voteId: string) {
    if (!window.confirm('Umfrage endgültig löschen? Alle abgegebenen Stimmen werden mit entfernt.')) return
    const supabase = createClient()
    const { error } = await supabase.from('votes').delete().eq('id', voteId)
    if (!error) setVotes(prev => prev.filter(v => v.id !== voteId))
  }

  async function castVote(voteId: string, optionId: string) {
    if (!userId) { router.push('/login'); return }
    setSubmitting(voteId)
    const supabase = createClient()
    const { error } = await supabase.from('vote_responses').insert({ vote_id: voteId, option_id: optionId, user_id: userId })
    if (!error) {
      setUserVotes(prev => ({ ...prev, [voteId]: optionId }))
      const [{ data: opts }, { data: v }, { data: demo }] = await Promise.all([
        supabase.from('vote_options').select('*').eq('vote_id', voteId),
        supabase.from('votes').select('total_votes').eq('id', voteId).single(),
        supabase.rpc('vote_participant_demographics', { v_id: voteId }),
      ])
      if (opts) setOptions(prev => [...prev.filter(o => o.vote_id !== voteId), ...opts])
      if (v) setVotes(prev => prev.map(x => x.id === voteId ? { ...x, total_votes: v.total_votes } : x))
      const rep = await computeRepScoreForProfiles(supabase, demo ?? [])
      setReps(prev => ({ ...prev, [voteId]: rep }))
    }
    setSubmitting(null)
  }

  const filtered = votes.filter(v => tab === 'partner' ? v.is_partner_vote : !v.is_partner_vote)

  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="mb-4">
            <h1 className="text-3xl font-bold text-gray-900">Priorisierung</h1>
            <p className="text-gray-500 mt-1">Meinungsbilder und Lösungsoptionen zu lokalen Themen</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 p-1 bg-gray-100 rounded-xl w-fit mb-8">
            <button
              onClick={() => setTab('partner')}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'partner' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <ShieldCheck size={14} />
              Stadtumfragen
            </button>
            <button
              onClick={() => setTab('buerger')}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'buerger' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Bürgerabstimmungen
            </button>
          </div>

          {tab === 'partner' && (
            <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mb-6 text-sm text-blue-700">
              <ShieldCheck size={16} className="shrink-0 mt-0.5" />
              <span>Stadtumfragen werden von Städten, Kommunen, Parteien oder Verbänden in Auftrag gegeben, um ein Meinungsbild zu aktuellen Themen einzuholen. Der Absender ist immer sichtbar.</span>
            </div>
          )}

          {/* Neue Stadtumfrage — nur für Stadt- und Admin-Rolle */}
          {tab === 'partner' && canCreate && (
            <div className="mb-6">
              {!showCreate ? (
                <button
                  onClick={() => setShowCreate(true)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors"
                >
                  <Plus size={15} /> Neue Stadtumfrage
                </button>
              ) : (
                <div className="bg-white rounded-2xl border border-blue-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-sm font-semibold text-gray-900">Neue Stadtumfrage anlegen</div>
                    <button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-gray-700"><X size={16} /></button>
                  </div>
                  <div className="flex flex-col gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Titel / Frage *</label>
                      <input value={cTitle} onChange={e => setCTitle(e.target.value)} placeholder="z. B. Welche Priorität soll … haben?"
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Kurzbeschreibung</label>
                      <textarea value={cDesc} onChange={e => setCDesc(e.target.value)} rows={2}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Absender (öffentlich sichtbar)</label>
                        <input value={cSender} onChange={e => setCSender(e.target.value)}
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Läuft bis (optional)</label>
                        <input type="date" value={cEndsAt} onChange={e => setCEndsAt(e.target.value)}
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-2">Antwortoptionen * (mind. 2)</label>
                      <div className="flex flex-col gap-2">
                        {cOptions.map((opt, i) => (
                          <div key={i} className="flex gap-2">
                            <div className="flex-1 flex flex-col gap-1.5">
                              <input value={opt.label} placeholder={`Option ${i + 1}`}
                                onChange={e => setCOptions(prev => prev.map((o, j) => j === i ? { ...o, label: e.target.value } : o))}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                              <input value={opt.description} placeholder="Erklärung (optional)"
                                onChange={e => setCOptions(prev => prev.map((o, j) => j === i ? { ...o, description: e.target.value } : o))}
                                className="w-full px-3 py-2 border border-gray-100 rounded-lg text-xs text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                            {cOptions.length > 2 && (
                              <button onClick={() => setCOptions(prev => prev.filter((_, j) => j !== i))}
                                className="text-gray-300 hover:text-red-500 shrink-0 self-start mt-2" aria-label="Option entfernen">
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                      {cOptions.length < 6 && (
                        <button onClick={() => setCOptions(prev => [...prev, { label: '', description: '' }])}
                          className="mt-2 text-xs text-blue-600 hover:underline">
                          + Weitere Option
                        </button>
                      )}
                    </div>
                    {createError && (
                      <div className="text-sm text-red-600 bg-red-50 px-4 py-2.5 rounded-xl">{createError}</div>
                    )}
                    <div>
                      <button onClick={createSurvey} disabled={creating}
                        className="px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-40">
                        {creating ? 'Wird angelegt…' : 'Umfrage veröffentlichen'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {loading ? (
            <div className="flex flex-col gap-6">
              {[1, 2].map(i => <div key={i} className="h-48 bg-gray-100 rounded-2xl animate-pulse" />)}
            </div>
          ) : filtered.length > 0 ? (
            <div className="flex flex-col gap-6">
              {filtered.map((vote) => {
                const opts = getOptions(vote.id)
                const votedOption = userVotes[vote.id]
                const hasVoted = !!votedOption
                const showResults = hasVoted || !userId
                const endsAt = vote.ends_at ? new Date(vote.ends_at).toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' }) : null
                const rep = reps[vote.id] ?? { score: 0, participants: 0 }
                const chosen = selected[vote.id]

                return (
                  <Card key={vote.id}>
                    <CardHeader>
                      {/* Auf Mobile stapeln Titel und Badge, ab sm nebeneinander — sonst quetscht das Badge den Titel */}
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                        <div>
                          {vote.is_partner_vote && vote.partner_name && (
                            <div className="flex items-center gap-1.5 text-xs text-blue-600 font-medium mb-1">
                              <ShieldCheck size={12} />
                              Stadtumfrage · {vote.partner_name}
                            </div>
                          )}
                          <CardTitle className="text-lg font-semibold leading-snug">{vote.title}</CardTitle>
                        </div>
                        {endsAt && (
                          <Badge className="self-start shrink-0 bg-blue-50 text-blue-700 hover:bg-blue-50">Läuft bis {endsAt}</Badge>
                        )}
                      </div>
                      {vote.description && <p className="text-sm text-gray-700 mt-1 leading-relaxed">{vote.description}</p>}
                    </CardHeader>
                    <CardContent>
                      <div className="mb-5"><RepScoreBadge score={rep.score} participants={rep.participants} /></div>

                      {opts.length === 0 ? (
                        <div className="text-sm text-gray-400 mb-6">Keine Optionen hinterlegt.</div>
                      ) : showResults ? (
                        <div className="flex flex-col gap-3 mb-6">
                          {opts.map((opt) => {
                            const isChoice = votedOption === opt.id
                            return (
                              <div key={opt.id}>
                                <div className="flex justify-between text-sm mb-1">
                                  <span className={`font-medium ${isChoice ? 'text-blue-700' : 'text-gray-700'}`}>
                                    {opt.label}{isChoice && ' ✓'}
                                  </span>
                                  <span className="text-gray-500">{opt.percent}%</span>
                                </div>
                                <Progress value={opt.percent} className="h-2" />
                              </div>
                            )
                          })}
                        </div>
                      ) : (
                        <div className="flex flex-col gap-2 mb-6">
                          {opts.map((opt) => {
                            const isSelected = chosen === opt.id
                            return (
                              <button
                                key={opt.id}
                                onClick={() => setSelected(prev => ({ ...prev, [vote.id]: opt.id }))}
                                className={`text-left p-4 rounded-xl border transition-all ${
                                  isSelected ? 'border-blue-400 bg-blue-50/60 ring-1 ring-blue-200' : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                                }`}
                              >
                                <div className="flex items-start gap-3">
                                  {isSelected
                                    ? <CheckCircle2 size={18} className="text-blue-600 shrink-0 mt-0.5" />
                                    : <Circle size={18} className="text-gray-300 shrink-0 mt-0.5" />
                                  }
                                  <div>
                                    <div className="text-sm font-semibold text-gray-800">{opt.label}</div>
                                    {opt.description && <div className="text-sm text-gray-600 leading-relaxed mt-0.5">{opt.description}</div>}
                                  </div>
                                </div>
                              </button>
                            )
                          })}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                          {vote.total_votes.toLocaleString('de-DE')} {vote.total_votes === 1 ? 'Teilnehmer' : 'Teilnehmende'}
                          {myRole === 'admin' && (
                            <button onClick={() => deleteSurvey(vote.id)}
                              className="flex items-center gap-1 text-xs text-gray-300 hover:text-red-600 transition-colors" aria-label="Umfrage löschen">
                              <Trash2 size={13} /> Löschen
                            </button>
                          )}
                        </div>
                        {hasVoted ? (
                          <span className="flex items-center gap-1.5 text-sm font-medium text-green-600">
                            <CheckCircle2 size={16} /> Du hast abgestimmt
                          </span>
                        ) : !userId ? (
                          <button
                            onClick={() => router.push('/login')}
                            className="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Anmelden zum Abstimmen
                          </button>
                        ) : (
                          <button
                            onClick={() => chosen && castVote(vote.id, chosen)}
                            disabled={!chosen || submitting === vote.id}
                            className="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            {submitting === vote.id ? 'Wird gesendet…' : 'Jetzt abstimmen'}
                          </button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="text-4xl mb-4">{tab === 'partner' ? '📊' : '🗳️'}</div>
              <div className="font-semibold text-gray-700 mb-2">
                {tab === 'partner' ? 'Keine Stadtumfragen aktiv' : 'Noch keine Bürgerabstimmungen'}
              </div>
              <div className="text-sm text-gray-500 max-w-sm mx-auto">
                {tab === 'partner'
                  ? 'Stadtumfragen werden von Städten und Organisationen eingestellt.'
                  : 'Forderungen mit genug Relevanz können später zur Bürgerabstimmung werden.'}
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
