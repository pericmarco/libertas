'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { REGION_NAME } from '@/lib/constants'
import { validatePassword } from '@/lib/password'
import PasswordRequirements from '@/components/PasswordRequirements'
import { useCity } from '@/lib/city/context'

type District = { id: string; name: string; city: string }

export default function Register() {
  const city = useCity()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [districtId, setDistrictId] = useState('')
  const [districts, setDistricts] = useState<District[]>([])
  const [accepted, setAccepted] = useState(false)
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
    setError('')

    // Ohne akzeptierte Datenschutzerklärung keine Registrierung.
    if (!accepted) {
      setError('Bitte akzeptiere die Datenschutzerklärung, um fortzufahren.')
      return
    }

    const pwError = validatePassword(password)
    if (pwError) { setError(pwError); return }

    setLoading(true)

    const supabase = createClient()

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // Klarname wird erhoben, aber ausschließlich intern gespeichert (für
        // den Ernstfall). Der Nutzername (öffentliches Pseudonym) wird erst im
        // Onboarding abgefragt. terms_accepted/consent_version → Einwilligungs-
        // Nachweis (Trigger setzt daraus consent_at + consent_version im Profil).
        data: {
          full_name: fullName.trim() || null,
          district_id: districtId || null,
          // Stadt der aufgerufenen Subdomain — der Trigger legt das Profil
          // damit in der richtigen Stadt an.
          city_slug: city.slug,
          terms_accepted: 'true',
          consent_version: '1',
        },
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
            <Image src="/logo.svg" alt="Lybertas Logo" width={32} height={32} className="w-8 h-8" priority unoptimized />
            <span className="font-semibold text-gray-900">Lybertas</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Konto erstellen</h1>
          <p className="text-gray-500 mt-1">Werde Teil deiner lokalen Demokratie</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6">
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
              <p className="text-xs text-gray-400 mt-1.5">Bleibt <strong>privat</strong> und wird niemals öffentlich angezeigt. Wir speichern ihn nur intern.</p>
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
                placeholder="Sicheres Passwort wählen"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <PasswordRequirements password={password} />
            </div>

            {/* Pflicht-Einwilligung — ohne Häkchen keine Registrierung */}
            <label className="flex items-start gap-3 cursor-pointer mt-1">
              <input
                type="checkbox"
                checked={accepted}
                onChange={e => { setAccepted(e.target.checked); setError('') }}
                required
                className="w-4 h-4 mt-0.5 accent-blue-600 shrink-0"
              />
              <span className="text-sm text-gray-600 leading-relaxed">
                Ich bin mindestens 16 Jahre alt und habe die{' '}
                <Link href="/datenschutz" target="_blank" className="text-blue-600 font-medium hover:underline">
                  Datenschutzerklärung
                </Link>{' '}
                gelesen und stimme der Verarbeitung meiner Daten zu.
              </span>
            </label>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !accepted}
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
