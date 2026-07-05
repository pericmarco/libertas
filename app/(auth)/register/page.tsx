'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { REGION_NAME, USERNAME_REGEX, containsBlocked } from '@/lib/constants'

type District = { id: string; name: string; city: string }

export default function Register() {
  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [districtId, setDistrictId] = useState('')
  const [districts, setDistricts] = useState<District[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    async function load() {
      const { data: region } = await supabase.from('regions').select('id').eq('name', REGION_NAME).single()
      if (!region) return
      const { data } = await supabase.from('districts').select('id, name, city').eq('region_id', region.id)
      if (data) setDistricts(data)
    }
    load()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const name = username.trim()
    if (!USERNAME_REGEX.test(name)) {
      setError('Nutzername: 3–24 Zeichen, nur Buchstaben, Zahlen, Punkt und Unterstrich.')
      setLoading(false)
      return
    }
    if (containsBlocked(name)) {
      setError('Dieser Nutzername ist nicht zulässig. Bitte wähle einen anderen.')
      setLoading(false)
      return
    }

    const supabase = createClient()

    const { data: taken } = await supabase
      .from('profiles').select('id').ilike('username', name).limit(1)
    if (taken && taken.length > 0) {
      setError('Dieser Nutzername ist bereits vergeben.')
      setLoading(false)
      return
    }

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, username: name, district_id: districtId || null },
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6 bg-gray-50">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">✓</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Registrierung erfolgreich!</h1>
          <p className="text-gray-500 mb-6">
            Wir haben dir eine Bestätigungs-E-Mail geschickt. Bitte klicke auf den Link darin um dein Konto zu aktivieren.
          </p>
          <Link href="/login" className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors">
            Zur Anmeldung
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">L</span>
            </div>
            <span className="font-semibold text-gray-900">Lybertas</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Konto erstellen</h1>
          <p className="text-gray-500 mt-1">Werde Teil deiner lokalen Demokratie</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Vollständiger Name</label>
              <input
                type="text"
                placeholder="Max Mustermann"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nutzername</label>
              <input
                type="text"
                placeholder="z. B. koelner_jeck"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                minLength={3}
                maxLength={24}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-400 mt-1.5">Unter diesem Namen erscheinen deine Beiträge. Dein echter Name bleibt privat.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">E-Mail</label>
              <input
                type="email"
                placeholder="du@beispiel.de"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Stadtteil</label>
              <select
                value={districtId}
                onChange={e => setDistrictId(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="">Stadtteil wählen…</option>
                {districts.map(d => (
                  <option key={d.id} value={d.id}>{d.city} {d.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Passwort</label>
              <input
                type="password"
                placeholder="Mindestens 6 Zeichen"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Registrieren…' : 'Registrieren'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Bereits ein Konto?{' '}
            <Link href="/login" className="text-blue-600 font-medium hover:underline">Anmelden</Link>
          </p>
        </div>
      </div>
    </main>
  )
}
