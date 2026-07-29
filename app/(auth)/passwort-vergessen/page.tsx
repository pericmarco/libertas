'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle2, ChevronLeft } from 'lucide-react'

export default function PasswortVergessen() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/auth/callback?next=/passwort-neu`,
    })
    setLoading(false)
    // Aus Datenschutzgründen immer Erfolg zeigen (keine Auskunft, ob die
    // E-Mail existiert). Bei echten Fehlern (z. B. Rate-Limit) Hinweis geben.
    if (error && error.status !== 429) {
      setError('Es gab ein Problem. Bitte versuche es später erneut.')
      return
    }
    setSent(true)
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <Image src="/logo.svg" alt="Lybertas Logo" width={32} height={32} className="w-8 h-8" priority unoptimized />
            <span className="font-semibold text-gray-900">Lybertas</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Passwort zurücksetzen</h1>
          <p className="text-gray-500 mt-1">Wir schicken dir einen Link per E-Mail</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          {sent ? (
            <div className="text-center py-4">
              <CheckCircle2 size={36} className="mx-auto text-green-500 mb-3" />
              <p className="text-sm text-gray-700 leading-relaxed">
                Falls ein Konto mit <strong>{email}</strong> existiert, haben wir dir einen Link zum
                Zurücksetzen deines Passworts geschickt. Schau auch im Spam-Ordner nach.
              </p>
              <Link href="/login" className="inline-block mt-6 text-sm text-blue-600 font-medium hover:underline">
                Zurück zur Anmeldung
              </Link>
            </div>
          ) : (
            <>
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

                {error && (
                  <div className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl">{error}</div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Wird gesendet…' : 'Link anfordern'}
                </button>
              </form>

              <Link href="/login" className="flex items-center justify-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors mt-6">
                <ChevronLeft size={15} /> Zurück zur Anmeldung
              </Link>
            </>
          )}
        </div>
      </div>
    </main>
  )
}
