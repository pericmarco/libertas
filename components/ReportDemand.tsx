'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Flag, X } from 'lucide-react'

const REASONS: { value: string; label: string }[] = [
  { value: 'spam', label: 'Spam oder Werbung' },
  { value: 'beleidigung', label: 'Beleidigung oder Hassrede' },
  { value: 'falsch', label: 'Falschinformation' },
  { value: 'duplikat', label: 'Doppelte Forderung' },
  { value: 'unangemessen', label: 'Unangemessener Inhalt' },
  { value: 'sonstiges', label: 'Sonstiges' },
]

export default function ReportDemand({ demandId }: { demandId: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [reported, setReported] = useState(false)
  const [error, setError] = useState('')

  // Hat der Nutzer diese Forderung bereits gemeldet? (defensiv — Tabelle
  // kann fehlen, solange die Migration noch nicht eingespielt ist)
  useEffect(() => {
    let active = true
    ;(async () => {
      const supabase = createClient()
      const { data: u } = await supabase.auth.getUser()
      if (!u.user) return
      const { data } = await supabase.from('demand_reports')
        .select('id').eq('demand_id', demandId).eq('reporter_id', u.user.id).maybeSingle()
      if (active && data) setReported(true)
    })().catch(() => {})
    return () => { active = false }
  }, [demandId])

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [open])

  async function openModal() {
    const supabase = createClient()
    const { data: u } = await supabase.auth.getUser()
    if (!u.user) { router.push('/login'); return }
    setError(''); setReason(''); setNote(''); setOpen(true)
  }

  async function submit() {
    if (!reason) return
    setSaving(true); setError('')
    const supabase = createClient()
    const { data: u } = await supabase.auth.getUser()
    if (!u.user) { router.push('/login'); return }
    const { error: e } = await supabase.from('demand_reports').insert({
      demand_id: demandId, reporter_id: u.user.id, reason, note: note.trim() || null,
    })
    setSaving(false)
    if (e) {
      // Doppelte Meldung (unique) → als bereits gemeldet behandeln
      if (e.code === '23505') { setReported(true); setOpen(false); return }
      setError('Melden ist gerade nicht möglich. Bitte später erneut versuchen.')
      return
    }
    setReported(true); setOpen(false)
  }

  if (reported) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-gray-400">
        <Flag size={13} /> Danke, deine Meldung ist eingegangen.
      </div>
    )
  }

  return (
    <>
      <button
        onClick={openModal}
        className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-600 transition-colors"
      >
        <Flag size={13} /> Forderung melden
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/40 px-4 py-6"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-md bg-white rounded-2xl border border-gray-100 p-6"
            onClick={e => e.stopPropagation()}
          >
            <div className="mb-1 flex items-start justify-between gap-3">
              <h3 className="text-base font-semibold text-gray-900">Forderung melden</h3>
              <button onClick={() => setOpen(false)} aria-label="Schließen" className="text-gray-400 hover:text-gray-700">
                <X size={18} />
              </button>
            </div>
            <p className="mb-4 text-sm text-gray-500">
              Warum möchtest du diese Forderung melden? Das Lybertas-Team prüft die Meldung.
            </p>

            <div className="mb-4 flex flex-col gap-2">
              {REASONS.map(r => (
                <button
                  key={r.value}
                  onClick={() => setReason(r.value)}
                  className={`w-full rounded-xl border px-4 py-2.5 text-left text-sm transition-colors ${
                    reason === r.value ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-700 hover:border-blue-300'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>

            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              rows={3}
              maxLength={500}
              placeholder="Optionale Anmerkung (was genau ist das Problem?)"
              className="mb-3 w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {error && <div className="mb-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>}

            <div className="flex items-center justify-end gap-2">
              <button onClick={() => setOpen(false)} className="px-4 py-2.5 text-sm font-medium text-gray-500 hover:text-gray-900">
                Abbrechen
              </button>
              <button
                onClick={submit}
                disabled={!reason || saving}
                className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
              >
                {saving ? 'Wird gemeldet…' : 'Melden'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
