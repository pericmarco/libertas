'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/layout/Navbar'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { MessageCircle, ChevronLeft, QrCode } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type Politician = {
  id: string
  name: string
  party: string
  role: string
  topics: string[]
  response_rate: number
  avatar_url: string | null
}

const partyColors: Record<string, { bg: string; text: string; border: string; card: string }> = {
  SPD:   { bg: 'bg-red-600',    text: 'text-white',      border: 'border-red-200',    card: 'bg-red-50' },
  CDU:   { bg: 'bg-gray-800',   text: 'text-white',      border: 'border-gray-200',   card: 'bg-gray-50' },
  Grüne: { bg: 'bg-green-600',  text: 'text-white',      border: 'border-green-200',  card: 'bg-green-50' },
  FDP:   { bg: 'bg-yellow-400', text: 'text-gray-900',   border: 'border-yellow-200', card: 'bg-yellow-50' },
  AfD:   { bg: 'bg-blue-700',   text: 'text-white',      border: 'border-blue-200',   card: 'bg-blue-50' },
  Linke: { bg: 'bg-purple-600', text: 'text-white',      border: 'border-purple-200', card: 'bg-purple-50' },
}

const defaultColor = { bg: 'bg-gray-600', text: 'text-white', border: 'border-gray-200', card: 'bg-gray-50' }

export default function Politiker() {
  const [politicians, setPoliticians] = useState<Politician[]>([])
  const [selectedParty, setSelectedParty] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.from('politicians').select('*').order('name').then(({ data }) => {
      if (data) setPoliticians(data)
    })
  }, [])

  const parties = [...new Set(politicians.map(p => p.party))].sort()
  const partyPoliticians = selectedParty ? politicians.filter(p => p.party === selectedParty) : []

  if (selectedParty) {
    const colors = partyColors[selectedParty] ?? defaultColor
    return (
      <>
        <Navbar />
        <main className="pt-16 min-h-screen bg-gray-50">
          <div className="max-w-6xl mx-auto px-6 py-10">
            <button
              onClick={() => setSelectedParty(null)}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-6"
            >
              <ChevronLeft size={16} />
              Alle Parteien
            </button>

            <div className="flex items-center gap-3 mb-8">
              <div className={`px-4 py-1.5 rounded-full text-sm font-bold ${colors.bg} ${colors.text}`}>
                {selectedParty}
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Politiker in deinem Wahlkreis</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {partyPoliticians.map((p) => (
                <Card key={p.id} className={`hover:shadow-sm transition-shadow border ${colors.border}`}>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`w-12 h-12 rounded-full ${colors.bg} flex items-center justify-center font-bold text-lg ${colors.text}`}>
                        {p.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{p.name}</div>
                        <div className="text-sm text-gray-500">{p.role}</div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {(p.topics ?? []).map((t: string) => (
                        <span key={t} className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{t}</span>
                      ))}
                    </div>

                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-500 flex items-center gap-1"><MessageCircle size={12} /> Reaktionsquote</span>
                        <span className="font-semibold text-gray-700">{p.response_rate}%</span>
                      </div>
                      <Progress value={p.response_rate} className="h-1.5" />
                    </div>

                    <button
                      title="QR-Code für Plakat"
                      className="w-full flex items-center justify-center gap-2 py-2 text-sm text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50 hover:text-gray-700 transition-colors"
                    >
                      <QrCode size={15} />
                      QR-Code für Plakat
                    </button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Politische Vertreter</h1>
            <p className="text-gray-500 mt-1">Wähle eine Partei um ihre Vertreter zu sehen</p>
          </div>

          {parties.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {parties.map(party => {
                const colors = partyColors[party] ?? defaultColor
                const count = politicians.filter(p => p.party === party).length
                return (
                  <button
                    key={party}
                    onClick={() => setSelectedParty(party)}
                    className={`p-6 rounded-2xl border ${colors.border} ${colors.card} text-left hover:shadow-sm transition-all group`}
                  >
                    <div className={`inline-block px-3 py-1 rounded-full text-sm font-bold mb-3 ${colors.bg} ${colors.text}`}>
                      {party}
                    </div>
                    <div className="text-gray-900 font-semibold">
                      {count} {count === 1 ? 'Vertreter' : 'Vertreter'}
                    </div>
                    <div className="text-sm text-gray-400 mt-1 group-hover:text-gray-600 transition-colors">
                      Profil ansehen →
                    </div>
                  </button>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-20 text-gray-400">Keine Politiker vorhanden</div>
          )}
        </div>
      </main>
    </>
  )
}
