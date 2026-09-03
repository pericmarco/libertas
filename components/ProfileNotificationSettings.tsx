'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Bell, Eye, CheckCircle2 } from 'lucide-react'

// Benachrichtigungs-Präferenzen + öffentliche Namensanzeige. Speichert in
// profiles.notification_prefs (jsonb) und profiles.show_real_name. Defensiv:
// fehlen die Spalten noch (Migration 031 nicht eingespielt), bleibt die
// Ansicht nutzbar und meldet beim Speichern einen freundlichen Hinweis.
// Die tatsächliche Zustellung (E-Mail/Push) folgt in einer späteren Stufe.

type Prefs = Record<string, boolean>

const EVENTS: { key: string; label: string; soon?: boolean }[] = [
  { key: 'stadtteilBeitrag', label: 'Neuer Beitrag in meinem Stadtteil' },
  { key: 'antwortEigen', label: 'Antwort auf meinen Beitrag' },
  { key: 'antwortStadt', label: 'Antwort der Stadt oder eines politischen Accounts' },
  { key: 'statusAenderung', label: 'Statusänderung bei einer Forderung oder einem Mangel' },
  { key: 'neueUmfrage', label: 'Neue Umfrage in meinem Stadtteil' },
  { key: 'neuesProjekt', label: 'Neues Projekt von Stadt oder Politik' },
  { key: 'neuePetition', label: 'Neue Petition oder Bürgeridee', soon: true },
]

const DEFAULTS: Prefs = {
  stadtteilBeitrag: true, antwortEigen: true, antwortStadt: true,
  statusAenderung: true, neueUmfrage: true, neuesProjekt: true,
}

function Toggle({ on, onClick, disabled }: { on: boolean; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      disabled={disabled}
      onClick={onClick}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
        disabled ? 'cursor-not-allowed bg-gray-100' : on ? 'bg-blue-600' : 'bg-gray-200'
      }`}
    >
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-all ${on ? 'left-[22px]' : 'left-0.5'}`} />
    </button>
  )
}

export default function ProfileNotificationSettings() {
  const [uid, setUid] = useState<string | null>(null)
  const [hasName, setHasName] = useState(false)
  const [showRealName, setShowRealName] = useState(false)
  const [prefs, setPrefs] = useState<Prefs>(DEFAULTS)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [note, setNote] = useState('')

  useEffect(() => {
    const supabase = createClient()
    async function load() {
      const { data: userData } = await supabase.auth.getUser()
      const id = userData.user?.id ?? null
      setUid(id)
      if (!id) return
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, show_real_name, notification_prefs')
        .eq('id', id)
        .single()
      if (error || !data) return // Spalten evtl. noch nicht vorhanden — Defaults bleiben
      setHasName(!!data.full_name)
      setShowRealName(data.show_real_name === true)
      if (data.notification_prefs && typeof data.notification_prefs === 'object') {
        setPrefs({ ...DEFAULTS, ...(data.notification_prefs as Prefs) })
      }
    }
    load()
  }, [])

  async function save() {
    if (!uid) return
    setSaving(true); setSaved(false); setNote('')
    const supabase = createClient()
    const { error } = await supabase
      .from('profiles')
      .update({ show_real_name: showRealName, notification_prefs: prefs })
      .eq('id', uid)
    setSaving(false)
    if (error) {
      setNote('Konnte noch nicht gespeichert werden — diese Einstellungen werden mit dem nächsten Update aktiv.')
      return
    }
    setSaved(true)
  }

  const toggle = (key: string) => { setPrefs(p => ({ ...p, [key]: !p[key] })); setSaved(false) }

  return (
    <div className="mt-6 flex flex-col gap-6">
      {/* Öffentliche Anzeige */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6">
        <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
          <Eye size={14} /> Öffentliche Anzeige
        </div>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="text-sm font-medium text-gray-900">Meinen Namen öffentlich anzeigen</div>
            <p className="mt-0.5 text-xs leading-relaxed text-gray-500">
              {hasName
                ? 'Zeigt deinen Klarnamen zusätzlich zum Nutzernamen. Standardmäßig erscheint nur dein Nutzername.'
                : 'Du hast keinen Namen hinterlegt — ohne Namen erscheint immer nur dein Nutzername.'}
            </p>
          </div>
          <Toggle on={showRealName} disabled={!hasName} onClick={() => { setShowRealName(v => !v); setSaved(false) }} />
        </div>
      </div>

      {/* Benachrichtigungen */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6">
        <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
          <Bell size={14} /> Benachrichtigungen
        </div>
        <div className="flex flex-col divide-y divide-gray-50">
          {EVENTS.map(ev => (
            <div key={ev.key} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
              <span className="flex flex-wrap items-center gap-2 text-sm text-gray-700">
                {ev.label}
                {ev.soon && <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-600">Bald verfügbar</span>}
              </span>
              <Toggle on={!ev.soon && prefs[ev.key] === true} disabled={ev.soon} onClick={() => toggle(ev.key)} />
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs leading-relaxed text-gray-400">
          Du bestimmst, worüber du informiert wirst. Die Zustellung (E-Mail/Push) wird schrittweise aktiviert.
        </p>

        <div className="mt-5 flex items-center gap-3">
          <button
            onClick={save}
            disabled={saving}
            className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Speichern…' : 'Einstellungen speichern'}
          </button>
          {saved && <span className="flex items-center gap-1.5 text-sm font-medium text-green-600"><CheckCircle2 size={16} /> Gespeichert</span>}
        </div>
        {note && <div className="mt-3 rounded-xl bg-amber-50 px-4 py-2.5 text-sm text-amber-700">{note}</div>}
      </div>
    </div>
  )
}
