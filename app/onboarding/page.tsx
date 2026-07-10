'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { AGE_GROUPS, GENDERS, REGION_NAME } from '@/lib/constants'

type District = { id: string; name: string }

export default function Onboarding() {
  const [ageGroup, setAgeGroup] = useState('')
  const [gender, setGender] = useState('')
  const [districtId, setDistrictId] = useState('')
  const [districts, setDistricts] = useState<District[]>([])
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        router.push('/login')
        return
      }
      const { data: profile } = await supabase
        .from('profiles')
        .select('age_group, gender, district_id')
        .eq('id', data.user.id)
        .single()

      if (profile?.age_group && AGE_GROUPS.includes(profile.age_group) && profile?.gender && profile?.district_id) {
        router.push('/dashboard')
        return
      }

      if (profile?.district_id) setDistrictId(profile.district_id)

      const { data: region } = await supabase.from('regions').select('id').eq('name', REGION_NAME).single()
      if (region) {
        const { data: districtData } = await supabase.from('districts').select('id, name').eq('region_id', region.id)
        if (districtData) setDistricts(districtData)
      }
      setChecking(false)
    })
  }, [router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { data } = await supabase.auth.getUser()
    if (!data.user) return

    const { error: upsertError } = await supabase
      .from('profiles')
      .upsert({ id: data.user.id, age_group: ageGroup, gender, district_id: districtId })

    if (upsertError) {
      setError(upsertError.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
  }

  if (checking) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50" />
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Image src="/logo.svg" alt="Lybertas Logo" width={40} height={40} className="w-10 h-10 mx-auto mb-4" unoptimized />
          <h1 className="text-2xl font-bold text-gray-900">Fast geschafft</h1>
          <p className="text-gray-500 mt-2 text-sm leading-relaxed">
            Damit wir zeigen können wie <span className="font-semibold text-gray-700">repräsentativ</span> die Abstimmungsergebnisse sind, brauchen wir noch zwei Angaben von dir.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 text-sm text-blue-700">
            <strong>Warum fragen wir das?</strong><br />
            Wir vergleichen die Teilnehmerstruktur mit den öffentlichen Bevölkerungsdaten deines Stadtteils — so entsteht der Repräsentations-Score. Deine Angaben sind anonym.
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Altersgruppe</label>
              <div className="grid grid-cols-3 gap-2">
                {AGE_GROUPS.map(ag => (
                  <button
                    key={ag}
                    type="button"
                    onClick={() => setAgeGroup(ag)}
                    className={`py-2.5 rounded-xl text-sm font-medium border transition-colors ${
                      ageGroup === ag
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600'
                    }`}
                  >
                    {ag}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Geschlecht</label>
              <div className="grid grid-cols-2 gap-2">
                {GENDERS.map(g => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGender(g)}
                    className={`py-2.5 rounded-xl text-sm font-medium border transition-colors ${
                      gender === g
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Stadtteil</label>
              <select
                value={districtId}
                onChange={e => setDistrictId(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="">Stadtteil wählen…</option>
                {districts.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={!ageGroup || !gender || !districtId || loading}
              className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Speichern…' : 'Weiter zum Dashboard'}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
