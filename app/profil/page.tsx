'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/layout/Navbar'
import { createClient } from '@/lib/supabase/client'
import { AGE_GROUPS, GENDERS, REGION_NAME } from '@/lib/constants'
import { ShieldCheck, CheckCircle2 } from 'lucide-react'

type District = { id: string; name: string }

export default function Profil() {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<string>('citizen')
  const [fullName, setFullName] = useState('')
  const [ageGroup, setAgeGroup] = useState('')
  const [gender, setGender] = useState('')
  const [districtId, setDistrictId] = useState('')
  const [districts, setDistricts] = useState<District[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const supabase = createClient()
    async function load() {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) return
      setEmail(userData.user.email ?? '')

      const [{ data: profile }, { data: region }] = await Promise.all([
        supabase.from('profiles').select('full_name, role, age_group, gender, district_id').eq('id', userData.user.id).single(),
        supabase.from('regions').select('id').eq('name', REGION_NAME).single(),
      ])

      if (profile) {
        setFullName(profile.full_name ?? '')
        setRole(profile.role ?? 'citizen')
        if (profile.age_group && AGE_GROUPS.includes(profile.age_group)) setAgeGroup(profile.age_group)
        if (profile.gender) setGender(profile.gender)
        if (profile.district_id) setDistrictId(profile.district_id)
      }

      if (region) {
        const { data: districtData } = await supabase.from('districts').select('id, name').eq('region_id', region.id)
        if (districtData) setDistricts(districtData)
      }
      setLoading(false)
    }
    load()
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSaved(false)

    const supabase = createClient()
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) return

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ full_name: fullName || null, age_group: ageGroup, gender, district_id: districtId })
      .eq('id', userData.user.id)

    if (updateError) {
      setError(updateError.message)
      setSaving(false)
      return
    }

    setSaved(true)
    setSaving(false)
  }

  const complete = ageGroup && gender && districtId

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="pt-16 min-h-screen bg-gray-50">
          <div className="max-w-2xl mx-auto px-6 py-10 space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-32 bg-white rounded-2xl animate-pulse" />)}
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-6 py-10">

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Dein Profil</h1>
            <p className="text-gray-500 mt-1">Verwalte deine persönlichen Angaben</p>
          </div>

          <form onSubmit={handleSave} className="flex flex-col gap-6">

            {/* Konto */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">Konto</div>
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">E-Mail</label>
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="Dein Name"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                {role !== 'citizen' && (
                  <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 border border-blue-100 rounded-xl px-4 py-2.5">
                    <ShieldCheck size={15} />
                    {role === 'admin' ? 'Administrator-Konto' : 'Stadt-Konto'}
                  </div>
                )}
              </div>
            </div>

            {/* Demografische Angaben */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">Demografische Angaben</div>

              <div className="flex flex-col gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Altersgruppe</label>
                  <div className="grid grid-cols-3 gap-2">
                    {AGE_GROUPS.map(ag => (
                      <button
                        key={ag}
                        type="button"
                        onClick={() => { setAgeGroup(ag); setSaved(false) }}
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
                        onClick={() => { setGender(g); setSaved(false) }}
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
                    onChange={e => { setDistrictId(e.target.value); setSaved(false) }}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    <option value="">Stadtteil wählen…</option>
                    {districts.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-6 bg-gray-50 border border-gray-100 rounded-xl p-4 text-sm text-gray-500 leading-relaxed">
                Diese Angaben werden anonymisiert verwendet und dienen nur dazu, Umfragen und Forderungen
                transparenter auszuwerten. So kann sichtbar werden, ob bestimmte Altersgruppen, Stadtteile
                oder Geschlechter in einer Beteiligung über- oder unterrepräsentiert sind.
              </div>
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={!complete || saving}
                className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {saving ? 'Speichern…' : 'Änderungen speichern'}
              </button>
              {saved && (
                <span className="flex items-center gap-1.5 text-sm font-medium text-green-600">
                  <CheckCircle2 size={16} /> Gespeichert
                </span>
              )}
            </div>
          </form>

        </div>
      </main>
    </>
  )
}
