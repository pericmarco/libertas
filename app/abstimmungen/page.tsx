'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/layout/Navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ShieldCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type Vote = {
  id: string
  title: string
  description: string | null
  ends_at: string | null
  total_votes: number
  representation_score: number
  is_partner_vote: boolean
  partner_name: string | null
}

type VoteOption = {
  id: string
  vote_id: string
  label: string
  count: number
}

function RepScore({ score }: { score: number }) {
  const color = score >= 75 ? 'text-green-600' : score >= 50 ? 'text-yellow-600' : 'text-red-500'
  const label = score >= 75 ? 'Gut repräsentativ' : score >= 50 ? 'Mäßig repräsentativ' : 'Wenig repräsentativ'
  return (
    <div className="bg-gray-50 rounded-xl px-4 py-3 mb-4">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-medium text-gray-500">Repräsentations-Score</span>
        <span className={`text-sm font-bold ${color}`}>{score}/100 · {label}</span>
      </div>
      <Progress value={score} className="h-1.5" />
    </div>
  )
}

export default function Abstimmungen() {
  const [tab, setTab] = useState<'buerger' | 'partner'>('buerger')
  const [votes, setVotes] = useState<Vote[]>([])
  const [options, setOptions] = useState<VoteOption[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    Promise.all([
      supabase.from('votes').select('*').order('created_at', { ascending: false }),
      supabase.from('vote_options').select('*'),
    ]).then(([votesRes, optionsRes]) => {
      setVotes(votesRes.data ?? [])
      setOptions(optionsRes.data ?? [])
      setLoading(false)
    })
  }, [])

  const filtered = votes.filter(v => tab === 'partner' ? v.is_partner_vote : !v.is_partner_vote)

  function getOptions(voteId: string) {
    const opts = options.filter(o => o.vote_id === voteId)
    const total = opts.reduce((sum, o) => sum + o.count, 0)
    return opts.map(o => ({ ...o, percent: total > 0 ? Math.round((o.count / total) * 100) : 0 }))
  }

  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Abstimmungen</h1>
            <p className="text-gray-500 mt-1">Laufende Bürgerabstimmungen in deinem Wahlkreis</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 p-1 bg-gray-100 rounded-xl w-fit mb-8">
            <button
              onClick={() => setTab('buerger')}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'buerger' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Bürgerabstimmungen
            </button>
            <button
              onClick={() => setTab('partner')}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'partner' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <ShieldCheck size={14} />
              Partner-Umfragen
            </button>
          </div>

          {tab === 'partner' && (
            <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mb-6 text-sm text-blue-700">
              <ShieldCheck size={16} className="shrink-0 mt-0.5" />
              <span>Partner-Umfragen werden von verifizierten Organisationen in Auftrag gegeben und sind unabhängig geprüft.</span>
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
                const endsAt = vote.ends_at ? new Date(vote.ends_at).toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' }) : null

                return (
                  <Card key={vote.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          {vote.is_partner_vote && vote.partner_name && (
                            <div className="flex items-center gap-1.5 text-xs text-blue-600 font-medium mb-1">
                              <ShieldCheck size={12} />
                              {vote.partner_name}
                            </div>
                          )}
                          <CardTitle className="text-lg font-semibold leading-snug">{vote.title}</CardTitle>
                        </div>
                        {endsAt && (
                          <Badge className="shrink-0 bg-blue-50 text-blue-700 hover:bg-blue-50">Läuft bis {endsAt}</Badge>
                        )}
                      </div>
                      {vote.description && <p className="text-sm text-gray-500">{vote.description}</p>}
                    </CardHeader>
                    <CardContent>
                      <RepScore score={vote.representation_score} />

                      {opts.length > 0 ? (
                        <div className="flex flex-col gap-3 mb-6">
                          {opts.map((opt) => (
                            <div key={opt.id}>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="font-medium text-gray-700">{opt.label}</span>
                                <span className="text-gray-500">{opt.percent}%</span>
                              </div>
                              <Progress value={opt.percent} className="h-2" />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-sm text-gray-400 mb-6">Noch keine Stimmen abgegeben</div>
                      )}

                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="text-sm text-gray-500">
                          {vote.total_votes.toLocaleString('de-DE')} Teilnehmer
                        </div>
                        <button className="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
                          Jetzt abstimmen
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="text-4xl mb-4">{tab === 'partner' ? '🤝' : '🗳️'}</div>
              <div className="font-semibold text-gray-700 mb-2">
                {tab === 'partner' ? 'Keine Partner-Umfragen aktiv' : 'Noch keine Abstimmungen'}
              </div>
              <div className="text-sm text-gray-400 max-w-sm mx-auto">
                {tab === 'partner'
                  ? 'Partner-Umfragen werden von verifizierten Organisationen eingestellt.'
                  : 'Forderungen mit genug Unterstützungen werden automatisch zur Abstimmung.'}
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
