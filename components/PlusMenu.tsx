'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Megaphone, Wrench, BarChart3, Building2, FileText, Lightbulb, X, Lock, ChevronRight } from 'lucide-react'

// Zentrales Erstell-Menü hinter dem Plus-Button. Bündelt die vorhandenen
// Formulare und zeigt geplante Beitragsarten transparent als „Bald verfügbar".
// Rollen: Bürger dürfen Forderung + Mangel; Umfrage/Projekt nur verifizierte
// Stadt-/Politik-Accounts.

type Kind = {
  key: string
  label: string
  desc: string
  icon: typeof Megaphone
  tint: string // Tailwind-Klassen für das Icon-Badge
  official?: boolean // nur für verifizierte Stadt-/Politik-Accounts
  soon?: boolean
  href?: string
}

const KINDS: Kind[] = [
  { key: 'forderung', label: 'Forderung', desc: 'Ein Anliegen einbringen, das andere unterstützen können.', icon: Megaphone, tint: 'bg-blue-50 text-blue-600', href: '/forderungen/neu' },
  { key: 'mangel', label: 'Mangel melden', desc: 'Einen konkreten Missstand vor Ort melden.', icon: Wrench, tint: 'bg-orange-50 text-orange-600', href: '/forderungen/neu' },
  { key: 'umfrage', label: 'Umfrage erstellen', desc: 'Die Bürgerschaft zu einer Frage abstimmen lassen.', icon: BarChart3, tint: 'bg-emerald-50 text-emerald-600', official: true, href: '/abstimmungen' },
  { key: 'projekt', label: 'Projekt von Stadt & Politik', desc: 'Ein Vorhaben vorstellen und zur Diskussion stellen.', icon: Building2, tint: 'bg-purple-50 text-purple-600', official: true, soon: true },
  { key: 'petition', label: 'Petition', desc: 'Ein formelles Anliegen mit Unterschriften.', icon: FileText, tint: 'bg-gray-100 text-gray-500', soon: true },
  { key: 'idee', label: 'Bürgeridee', desc: 'Eine kreative Idee oder ein Konzept für deinen Ort.', icon: Lightbulb, tint: 'bg-gray-100 text-gray-500', soon: true },
]

export default function PlusMenu({
  open,
  onClose,
  loggedIn,
  canOfficial,
}: {
  open: boolean
  onClose: () => void
  loggedIn: boolean
  canOfficial: boolean
}) {
  const router = useRouter()

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [open])

  if (!open) return null

  function pick(k: Kind) {
    if (k.soon) return
    if (!loggedIn) { onClose(); router.push('/register'); return }
    if (k.official && !canOfficial) return // gesperrt: Hinweis bleibt sichtbar
    if (k.href) { onClose(); router.push(k.href) }
  }

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-black/40 sm:items-center"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Beitrag erstellen"
    >
      <div
        className="w-full sm:max-w-md max-h-[85vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-white pb-[calc(env(safe-area-inset-bottom)+0.5rem)] shadow-[0_-8px_40px_-12px_rgba(15,23,42,0.25)]"
        onClick={e => e.stopPropagation()}
      >
        {/* Griff + Kopf */}
        <div className="sticky top-0 bg-white rounded-t-3xl px-5 pt-3 pb-2">
          <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-gray-200 sm:hidden" />
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">Beitrag erstellen</h2>
            <button onClick={onClose} aria-label="Schließen" className="text-gray-400 hover:text-gray-700">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-1.5 px-4 pb-4 pt-1">
          {KINDS.map(k => {
            const Icon = k.icon
            const locked = k.official && !canOfficial && loggedIn
            const disabled = k.soon
            return (
              <button
                key={k.key}
                onClick={() => pick(k)}
                disabled={disabled}
                className={`group flex items-center gap-3.5 rounded-2xl border p-4 text-left transition-all ${
                  disabled
                    ? 'cursor-not-allowed border-gray-100 bg-gray-50/50'
                    : locked
                    ? 'border-gray-100 bg-white'
                    : 'border-gray-100 bg-white hover:border-blue-200 hover:shadow-sm'
                }`}
              >
                <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${k.tint}`}>
                  <Icon size={20} strokeWidth={1.9} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className={`font-semibold ${disabled ? 'text-gray-400' : 'text-gray-900'}`}>{k.label}</span>
                    {k.soon && (
                      <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-600">Bald verfügbar</span>
                    )}
                    {locked && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-500">
                        <Lock size={10} /> Nur verifiziert
                      </span>
                    )}
                  </span>
                  <span className={`mt-0.5 block text-xs leading-relaxed ${disabled ? 'text-gray-300' : 'text-gray-500'}`}>
                    {locked ? 'Nur verifizierte Stadt- oder Politik-Accounts können das veröffentlichen.' : k.desc}
                  </span>
                </span>
                {!disabled && !locked && <ChevronRight size={17} className="shrink-0 text-gray-300 group-hover:text-blue-400" />}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
