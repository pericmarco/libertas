'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { useCityBrand } from '@/lib/city/context'
import { AGE_GROUPS } from '@/lib/constants'

export default function Login() {
  const brand = useCityBrand()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      if (error.code === 'email_not_confirmed') {
        setError('Bitte bestätige zuerst deine E-Mail-Adresse. Wir haben dir einen Link geschickt.')
      } else {
        setError('E-Mail oder Passwort falsch. Bitte nochmal versuchen.')
      }
      setLoading(false)
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('age_group, gender, district_id')
      .eq('id', data.user.id)
      .single()

    const hasCompleteProfile =
      profile?.age_group && AGE_GROUPS.includes(profile.age_group) && profile?.gender && profile?.district_id

    if (!hasCompleteProfile) {
      router.push('/onboarding')
    } else {
      router.push('/dashboard')
    }
    router.refresh()
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <Image src="/logo.svg" alt={`${brand} Logo`} width={32} height={32} className="w-8 h-8" priority unoptimized />
            <span className="font-semibold text-gray-900">{brand}</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Willkommen zurück</h1>
          <p className="text-gray-500 mt-1">Melde dich mit deinem Konto an</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-gray-700">Passwort</label>
                <Link href="/passwort-vergessen" className="text-xs text-blue-600 hover:underline">
                  Passwort vergessen?
                </Link>
              </div>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
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
              {loading ? 'Anmelden…' : 'Anmelden'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Noch kein Konto?{' '}
            <Link href="/register" className="text-blue-600 font-medium hover:underline">Registrieren</Link>
          </p>
        </div>
      </div>
    </main>
  )
}
