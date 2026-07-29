'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle2 } from 'lucide-react'

export default function PasswortNeu() {
  const router = useRouter()
  const [ready, setReady] = useState(false)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  // Die Seite ist nur mit gültiger Sitzung sinnvoll (aus dem Reset-Link oder
  // als angemeldeter Nutzer). Ohne Sitzung zurück zur Passwort-vergessen-Seite.
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.replace('/passwort-vergessen')
      else setReady(true)
    })
  }, [router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password.length < 8) { setError('Das Passwort muss mindestens 8 Zeichen haben.'); return }
    if (password !== confirm) { setError('Die Passwörter stimmen nicht überein.'); return }
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (error) { setError(error.message); return }
    setDone(true)
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <Image src="/logo.svg" alt="Lybertas Logo" width={32} height={32} className="w-8 h-8" priority unoptimized />
            <span className="font-semibold text-gray-900">Lybertas</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Neues Passwort setzen</h1>
          <p className="text-gray-500 mt-1">Wähle ein neues, sicheres Passwort</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          {done ? (
            <div className="text-center py-4">
              <CheckCircle2 size={36} className="mx-auto text-green-500 mb-3" />
              <p className="text-sm text-gray-700 leading-relaxed">Dein Passwort wurde geändert.</p>
              <Link href="/dashboard" className="inline-block mt-6 px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors">
                Zum Dashboard
              </Link>
            </div>
          ) : !ready ? (
            <div className="h-32 animate-pulse bg-gray-50 rounded-xl" />
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Neues Passwort</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Passwort wiederholen</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  required
                  minLength={8}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {error && <div className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl">{error}</div>}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Speichern…' : 'Passwort speichern'}
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  )
}
