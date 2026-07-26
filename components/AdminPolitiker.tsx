'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PARTEI_FARBEN } from '@/lib/stadtteilDaten'
import { Politician, POLITICIAN_COLUMNS, partyColor, onPartyText, initials } from '@/lib/politiker'
import { Plus, ChevronDown, Trash2, BadgeCheck, Link2, Link2Off, ExternalLink } from 'lucide-react'
import Link from 'next/link'

// Leeres Formular für einen neuen bzw. bearbeiteten Eintrag
type FormState = {
  name: string; party: string; role: string; constituency: string
  email: string; phone: string; website: string; topics: string; bio: string
  response_rate: number; verified: boolean; contact_public: boolean
}
const EMPTY: FormState = {
  name: '', party: '', role: '', constituency: '',
  email: '', phone: '', website: '', topics: '', bio: '',
  response_rate: 0, verified: false, contact_public: true,
}

function toForm(p: Politician): FormState {
  return {
    name: p.name ?? '', party: p.party ?? '', role: p.role ?? '', constituency: p.constituency ?? '',
    email: p.email ?? '', phone: p.phone ?? '', website: p.website ?? '',
    topics: (p.topics ?? []).join(', '), bio: p.bio ?? '',
    response_rate: p.response_rate ?? 0, verified: p.verified ?? false, contact_public: p.contact_public ?? true,
  }
}

function toRow(f: FormState) {
  return {
    name: f.name.trim(),
    party: f.party.trim() || null,
    role: f.role.trim() || null,
    constituency: f.constituency.trim() || null,
    email: f.email.trim() || null,
    phone: f.phone.trim() || null,
    website: f.website.trim() || null,
    topics: f.topics.split(',').map(t => t.trim()).filter(Boolean),
    bio: f.bio.trim() || null,
    response_rate: Math.max(0, Math.min(100, Number(f.response_rate) || 0)),
    verified: f.verified,
    contact_public: f.contact_public,
  }
}

export default function AdminPolitiker() {
  const [entries, setEntries] = useState<Politician[]>([])
  const [expanded, setExpanded] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState<FormState>(EMPTY)
  const [newForm, setNewForm] = useState<FormState>(EMPTY)
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState('')

  async function load() {
    const supabase = createClient()
    const { data } = await supabase
      .from('politicians')
      .select(POLITICIAN_COLUMNS)
      .order('verified', { ascending: false })
      .order('name')
    if (data) setEntries(data as Politician[])
  }
  useEffect(() => { load() }, [])

  function openEditor(p: Politician) {
    setExpanded(expanded === p.id ? null : p.id)
    setFeedback('')
    setForm(toForm(p))
  }

  async function saveEntry(id: string) {
    setSaving(true); setFeedback('')
    const supabase = createClient()
    const { error } = await supabase.from('politicians').update(toRow(form)).eq('id', id)
    setSaving(false)
    if (error) { setFeedback('Fehler: ' + error.message); return }
    setFeedback('Gespeichert')
    await load()
  }

  async function createEntry(e: React.FormEvent) {
    e.preventDefault()
    if (!newForm.name.trim()) return
    setSaving(true); setFeedback('')
    const supabase = createClient()
    const { error } = await supabase.from('politicians').insert(toRow(newForm))
    setSaving(false)
    if (error) { setFeedback('Fehler: ' + error.message); return }
    setNewForm(EMPTY); setCreating(false)
    await load()
  }

  async function deleteEntry(id: string) {
    if (!window.confirm('Diesen Verzeichniseintrag endgültig löschen?')) return
    const supabase = createClient()
    const { error } = await supabase.from('politicians').delete().eq('id', id)
    if (error) { setFeedback('Fehler: ' + error.message); return }
    setExpanded(null)
    await load()
  }

  async function unlink(id: string) {
    if (!window.confirm('Verknüpfung zum Konto lösen? Der/die Politiker:in kann den Eintrag danach nicht mehr selbst bearbeiten (bis zur erneuten Übernahme per E-Mail).')) return
    const supabase = createClient()
    const { error } = await supabase.from('politicians').update({ claimed_by: null }).eq('id', id)
    if (error) { setFeedback('Fehler: ' + error.message); return }
    await load()
  }

  const partyList = Object.keys(PARTEI_FARBEN).filter(n => n !== 'Weitere')

  return (
    <div>
      <datalist id="admin-parteien-liste">
        {partyList.map(n => <option key={n} value={n} />)}
      </datalist>

      {/* Kopf: Anzahl + Neu-Button */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-gray-500">{entries.length} Einträge im Verzeichnis</div>
        <button
          onClick={() => { setCreating(c => !c); setNewForm(EMPTY); setFeedback('') }}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors"
        >
          <Plus size={15} /> Neuer Eintrag
        </button>
      </div>

      {feedback && (
        <div className={`text-sm px-3 py-2 rounded-lg mb-4 ${feedback.startsWith('Fehler') ? 'text-red-600 bg-red-50' : 'text-green-600 bg-green-50'}`}>{feedback}</div>
      )}

      {/* Neuanlage */}
      {creating && (
        <form onSubmit={createEntry} className="bg-white rounded-2xl border border-blue-200 p-5 mb-4 flex flex-col gap-3">
          <div className="text-sm font-semibold text-gray-900 mb-1">Neuen Eintrag anlegen</div>
          <PolitikerFields form={newForm} setForm={setNewForm} />
          <div className="flex items-center gap-2">
            <button type="submit" disabled={saving || !newForm.name.trim()}
              className="px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-40">
              {saving ? 'Anlegen…' : 'Eintrag anlegen'}
            </button>
            <button type="button" onClick={() => setCreating(false)} className="text-sm text-gray-400 hover:text-gray-600">Abbrechen</button>
          </div>
        </form>
      )}

      {/* Liste */}
      <div className="flex flex-col gap-3">
        {entries.length === 0 && !creating && (
          <div className="text-center py-16 text-gray-400 text-sm">Noch keine Einträge. Lege den ersten aus den zugesandten Infos an.</div>
        )}
        {entries.map(p => {
          const isOpen = expanded === p.id
          return (
            <div key={p.id} className="bg-white rounded-2xl border border-gray-100 p-5">
              <button onClick={() => openEditor(p)} className="w-full text-left">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {p.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.avatar_url} alt={p.name} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shrink-0"
                        style={{ background: partyColor(p.party), color: onPartyText(p.party) }}>
                        {initials(p.name)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-gray-900 truncate">{p.name}</span>
                        {p.verified && <BadgeCheck size={14} className="text-blue-500 shrink-0" />}
                      </div>
                      <div className="text-xs text-gray-400 truncate">
                        {[p.party, p.role].filter(Boolean).join(' · ') || '—'}
                        {p.claimed_by
                          ? <span className="text-green-600"> · verknüpft</span>
                          : <span className="text-gray-400"> · nicht verknüpft</span>}
                      </div>
                    </div>
                  </div>
                  <ChevronDown size={16} className={`text-gray-300 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </div>
              </button>

              {isOpen && (
                <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col gap-3">
                  <PolitikerFields form={form} setForm={setForm} admin />

                  <div className="flex flex-wrap items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                      <input type="checkbox" checked={form.verified} onChange={e => setForm(f => ({ ...f, verified: e.target.checked }))} className="w-4 h-4 accent-blue-600" />
                      <BadgeCheck size={14} className="text-blue-500" /> Verifiziert
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                      <input type="checkbox" checked={form.contact_public} onChange={e => setForm(f => ({ ...f, contact_public: e.target.checked }))} className="w-4 h-4 accent-blue-600" />
                      Kontakt öffentlich
                    </label>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <span>Reaktionsquote</span>
                      <input type="number" min={0} max={100} value={form.response_rate}
                        onChange={e => setForm(f => ({ ...f, response_rate: Number(e.target.value) }))}
                        className="w-20 px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      <span className="text-gray-400">%</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <button onClick={() => saveEntry(p.id)} disabled={saving}
                        className="px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-40">
                        {saving ? 'Speichern…' : 'Speichern'}
                      </button>
                      <Link href={`/politiker/${p.slug}`} target="_blank" className="flex items-center gap-1 text-sm text-gray-400 hover:text-blue-600 transition-colors">
                        Öffentlich <ExternalLink size={13} />
                      </Link>
                    </div>
                    <div className="flex items-center gap-4">
                      {p.claimed_by ? (
                        <span className="flex items-center gap-1.5 text-xs text-green-600"><Link2 size={13} /> mit Konto verknüpft</span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-xs text-gray-400"><Link2Off size={13} /> Übernahme per E-Mail offen</span>
                      )}
                      {p.claimed_by && (
                        <button onClick={() => unlink(p.id)} className="text-xs text-gray-400 hover:text-orange-600 transition-colors">Verknüpfung lösen</button>
                      )}
                      <button onClick={() => deleteEntry(p.id)} className="flex items-center gap-1 text-sm text-gray-400 hover:text-red-600 transition-colors">
                        <Trash2 size={14} /> Löschen
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Gemeinsame Feldergruppe für Neuanlage + Bearbeitung
function PolitikerFields({ form, setForm, admin }: { form: FormState; setForm: React.Dispatch<React.SetStateAction<FormState>>; admin?: boolean }) {
  const inp = 'w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
  const set = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm(f => ({ ...f, [k]: e.target.value }))
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <L label="Name *"><input value={form.name} onChange={set('name')} className={inp} /></L>
        <L label="Partei"><input value={form.party} list="admin-parteien-liste" onChange={set('party')} placeholder="z. B. GRÜNE" className={inp} /></L>
        <L label="Funktion"><input value={form.role} onChange={set('role')} placeholder="z. B. Ratsmitglied" className={inp} /></L>
        <L label="Gremium / Wahlkreis"><input value={form.constituency} onChange={set('constituency')} placeholder="z. B. Bezirksvertretung Innenstadt" className={inp} /></L>
        <L label="E-Mail"><input type="email" value={form.email} onChange={set('email')} placeholder="für Übernahme + Kontakt" className={inp} /></L>
        <L label="Telefon"><input value={form.phone} onChange={set('phone')} className={inp} /></L>
      </div>
      <L label="Website"><input value={form.website} onChange={set('website')} placeholder="https://…" className={inp} /></L>
      <L label="Themenschwerpunkte (Komma-getrennt)"><input value={form.topics} onChange={set('topics')} placeholder="Wohnen, Verkehr, Umwelt" className={inp} /></L>
      <L label="Kurzvorstellung"><textarea value={form.bio} onChange={set('bio')} rows={admin ? 3 : 4} className={inp + ' resize-none'} /></L>
    </div>
  )
}

function L({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
      {children}
    </div>
  )
}
