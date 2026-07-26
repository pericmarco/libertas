'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import { createClient } from '@/lib/supabase/client'
import { PARTEI_FARBEN } from '@/lib/stadtteilDaten'
import { Politician, POLITICIAN_COLUMNS } from '@/lib/politiker'
import { CheckCircle2, BadgeCheck, ExternalLink, LogIn, Info } from 'lucide-react'

type Claimable = { slug: string; name: string; party: string | null; role: string | null }

export default function MeinPolitikerProfil() {
  const [checking, setChecking] = useState(true)
  const [loggedIn, setLoggedIn] = useState(false)
  const [entry, setEntry] = useState<Politician | null>(null)
  const [claimable, setClaimable] = useState<Claimable | null>(null)
  const [claiming, setClaiming] = useState(false)
  const [claimError, setClaimError] = useState('')

  // Formularfelder
  const [form, setForm] = useState({
    name: '', party: '', role: '', constituency: '', bio: '',
    email: '', phone: '', website: '', topics: '', contact_public: true,
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState('')

  function fillForm(p: Politician) {
    setForm({
      name: p.name ?? '',
      party: p.party ?? '',
      role: p.role ?? '',
      constituency: p.constituency ?? '',
      bio: p.bio ?? '',
      email: p.email ?? '',
      phone: p.phone ?? '',
      website: p.website ?? '',
      topics: (p.topics ?? []).join(', '),
      contact_public: p.contact_public ?? true,
    })
  }

  async function load() {
    const supabase = createClient()
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) { setLoggedIn(false); setChecking(false); return }
    setLoggedIn(true)

    // Eigenen (bereits übernommenen) Eintrag laden — RLS lässt genau diesen zu.
    const { data: mine } = await supabase
      .from('politicians')
      .select(POLITICIAN_COLUMNS)
      .eq('claimed_by', userData.user.id)
      .maybeSingle()

    if (mine) {
      const p = mine as Politician
      setEntry(p)
      fillForm(p)
      setChecking(false)
      return
    }

    // Sonst: passenden, noch freien Eintrag zur eigenen E-Mail suchen.
    const { data: cand } = await supabase.rpc('claimable_politician_entry')
    if (cand && cand.length > 0) setClaimable(cand[0] as Claimable)
    setChecking(false)
  }

  useEffect(() => { load() }, [])

  async function handleClaim() {
    if (!claimable) return
    setClaiming(true)
    setClaimError('')
    const supabase = createClient()
    const { data, error } = await supabase.rpc('claim_politician_entry', { p_slug: claimable.slug })
    setClaiming(false)
    if (error) { setClaimError(error.message); return }
    const res = Array.isArray(data) ? data[0] : data
    if (!res?.ok) {
      setClaimError(res?.reason === 'EMAIL_MISMATCH'
        ? 'Die E-Mail des Eintrags stimmt nicht mit Ihrem Konto überein.'
        : 'Übernahme nicht möglich. Bitte wenden Sie sich an das Lybertas-Team.')
      return
    }
    setClaimable(null)
    setChecking(true)
    await load()
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!entry) return
    setSaving(true)
    setSaved(false)
    setSaveError('')
    const supabase = createClient()
    const topics = form.topics.split(',').map(t => t.trim()).filter(Boolean)
    const { error } = await supabase
      .from('politicians')
      .update({
        name: form.name.trim(),
        party: form.party.trim() || null,
        role: form.role.trim() || null,
        constituency: form.constituency.trim() || null,
        bio: form.bio.trim() || null,
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
        website: form.website.trim() || null,
        topics,
        contact_public: form.contact_public,
      })
      .eq('id', entry.id)
    setSaving(false)
    if (error) { setSaveError(error.message); return }
    setSaved(true)
  }

  // ── Zustände ───────────────────────────────────────────────
  if (checking) {
    return (
      <>
        <Navbar />
        <main className="pt-16 min-h-screen bg-gray-50">
          <div className="max-w-2xl mx-auto px-6 py-10">
            <div className="h-40 bg-white rounded-2xl animate-pulse border border-gray-100" />
          </div>
        </main>
      </>
    )
  }

  if (!loggedIn) {
    return (
      <>
        <Navbar />
        <main className="pt-16 min-h-screen bg-gray-50 flex items-center justify-center px-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-8 max-w-md text-center">
            <LogIn size={26} className="mx-auto text-blue-600 mb-3" />
            <h1 className="text-xl font-bold text-gray-900 mb-1">Anmeldung erforderlich</h1>
            <p className="text-sm text-gray-500 mb-5">
              Melden Sie sich mit der E-Mail-Adresse an, unter der Sie beim Lybertas-Team
              hinterlegt sind. Danach können Sie Ihren Eintrag übernehmen und pflegen.
            </p>
            <Link href="/login" className="inline-block px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors">
              Zur Anmeldung
            </Link>
          </div>
        </main>
      </>
    )
  }

  // Angemeldet, aber noch kein Eintrag übernommen
  if (!entry) {
    return (
      <>
        <Navbar />
        <main className="pt-16 min-h-screen bg-gray-50">
          <div className="max-w-2xl mx-auto px-6 py-10">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Mein Politik-Eintrag</h1>

            {claimable ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <div className="flex items-center gap-2 text-green-600 mb-3">
                  <BadgeCheck size={18} />
                  <span className="font-semibold">Wir haben einen Eintrag für Sie gefunden</span>
                </div>
                <div className="rounded-xl bg-gray-50 border border-gray-100 p-4 mb-4">
                  <div className="font-semibold text-gray-900">{claimable.name}</div>
                  <div className="text-sm text-gray-500">
                    {[claimable.party, claimable.role].filter(Boolean).join(' · ') || 'Verzeichniseintrag'}
                  </div>
                </div>
                <p className="text-sm text-gray-500 mb-4">
                  Übernehmen Sie den Eintrag, um Angaben, Themenschwerpunkte und Kontaktdaten
                  selbst zu pflegen. Die Verifizierung bleibt beim Lybertas-Team.
                </p>
                {claimError && <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg mb-3">{claimError}</div>}
                <button
                  onClick={handleClaim}
                  disabled={claiming}
                  className="px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-40"
                >
                  {claiming ? 'Wird übernommen…' : 'Eintrag übernehmen'}
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <div className="flex items-center gap-2 text-gray-700 mb-2">
                  <Info size={18} className="text-blue-600" />
                  <span className="font-semibold">Noch kein Eintrag hinterlegt</span>
                </div>
                <p className="text-sm text-gray-500">
                  Zu Ihrer angemeldeten E-Mail-Adresse liegt aktuell kein Verzeichniseintrag vor.
                  Das Lybertas-Team legt Einträge aus den zugesandten Angaben an — sobald Ihr
                  Eintrag angelegt und mit dieser E-Mail verknüpft ist, erscheint er hier
                  automatisch zur Bearbeitung.
                </p>
              </div>
            )}
          </div>
        </main>
      </>
    )
  }

  // Eintrag übernommen → Bearbeitungsformular
  const partyList = Object.keys(PARTEI_FARBEN).filter(n => n !== 'Weitere')
  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-6 py-10">

          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Mein Politik-Eintrag</h1>
              <p className="text-sm text-gray-500 mt-1">Ihre Angaben im öffentlichen Verzeichnis.</p>
            </div>
            <Link href={`/politiker/${entry.slug}`} className="shrink-0 flex items-center gap-1 text-sm text-blue-600 hover:underline">
              Öffentlich ansehen <ExternalLink size={13} />
            </Link>
          </div>

          {entry.verified ? (
            <div className="flex items-center gap-2 text-sm text-blue-700 bg-blue-50 border border-blue-100 rounded-xl px-4 py-2.5 mb-6">
              <BadgeCheck size={15} /> Ihr Eintrag ist vom Lybertas-Team verifiziert.
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-100 border border-gray-200 rounded-xl px-4 py-2.5 mb-6">
              <Info size={15} /> Verifizierung durch das Lybertas-Team steht noch aus.
            </div>
          )}

          <datalist id="parteien-liste">
            {partyList.map(n => <option key={n} value={n} />)}
          </datalist>

          <form onSubmit={handleSave} className="flex flex-col gap-6">

            {/* Zur Person */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col gap-4">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Zur Person</div>
              <Field label="Name">
                <input value={form.name} onChange={e => { setForm(f => ({ ...f, name: e.target.value })); setSaved(false) }}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" required />
              </Field>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Partei (leer = parteilos)">
                  <input value={form.party} list="parteien-liste" onChange={e => { setForm(f => ({ ...f, party: e.target.value })); setSaved(false) }}
                    placeholder="z. B. GRÜNE" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </Field>
                <Field label="Funktion">
                  <input value={form.role} onChange={e => { setForm(f => ({ ...f, role: e.target.value })); setSaved(false) }}
                    placeholder="z. B. Ratsmitglied" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </Field>
              </div>
              <Field label="Gremium / Wahlkreis">
                <input value={form.constituency} onChange={e => { setForm(f => ({ ...f, constituency: e.target.value })); setSaved(false) }}
                  placeholder="z. B. Bezirksvertretung Innenstadt" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </Field>
              <Field label="Themenschwerpunkte (mit Komma trennen)">
                <input value={form.topics} onChange={e => { setForm(f => ({ ...f, topics: e.target.value })); setSaved(false) }}
                  placeholder="Wohnen, Verkehr, Umwelt" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </Field>
              <Field label="Kurzvorstellung">
                <textarea value={form.bio} onChange={e => { setForm(f => ({ ...f, bio: e.target.value })); setSaved(false) }}
                  rows={5} placeholder="Ein paar Sätze zu Ihren Zielen und Schwerpunkten…"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none" />
              </Field>
            </div>

            {/* Kontakt */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col gap-4">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Kontakt</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="E-Mail">
                  <input type="email" value={form.email} onChange={e => { setForm(f => ({ ...f, email: e.target.value })); setSaved(false) }}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </Field>
                <Field label="Telefon">
                  <input value={form.phone} onChange={e => { setForm(f => ({ ...f, phone: e.target.value })); setSaved(false) }}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </Field>
              </div>
              <Field label="Website">
                <input value={form.website} onChange={e => { setForm(f => ({ ...f, website: e.target.value })); setSaved(false) }}
                  placeholder="https://…" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </Field>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={form.contact_public}
                  onChange={e => { setForm(f => ({ ...f, contact_public: e.target.checked })); setSaved(false) }}
                  className="w-4 h-4 accent-blue-600" />
                <span className="text-sm text-gray-700">E-Mail und Telefon öffentlich anzeigen</span>
              </label>
            </div>

            {saveError && <div className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl">{saveError}</div>}

            <div className="flex items-center gap-3">
              <button type="submit" disabled={saving}
                className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50">
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      {children}
    </div>
  )
}
