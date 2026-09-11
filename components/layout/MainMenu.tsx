'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import {
  Menu, X, User as UserIcon, ShieldCheck, LogOut, LogIn,
  HelpCircle, Users, FileText, Accessibility, Lock, Building2,
} from 'lucide-react'

type Props = {
  loggedIn: boolean
  isAdmin: boolean
  isDemo: boolean
  onLogout: () => void
}

type Item = { href: string; label: string; icon: typeof Menu }

// Info- und Rechtsseiten — in jeder Stadt gleich. Die Barrierefreiheits-
// erklärung muss nach BITV 2.0 von jeder Seite erreichbar sein; da dieses
// Menü in der Top-Bar überall liegt, ist das hier erfüllt (zusätzlich steht
// sie im Fuß der Startseite).
const INFO_ITEMS: Item[] = [
  { href: '/hilfe', label: 'Hilfe & FAQ', icon: HelpCircle },
  { href: '/community-richtlinien', label: 'Community-Richtlinien', icon: Users },
  { href: '/nutzungsbedingungen', label: 'Nutzungsbedingungen', icon: FileText },
  { href: '/barrierefreiheit', label: 'Barrierefreiheit', icon: Accessibility },
  { href: '/datenschutz', label: 'Datenschutz', icon: Lock },
  { href: '/impressum', label: 'Impressum', icon: Building2 },
]

export default function MainMenu({ loggedIn, isAdmin, isDemo, onLogout }: Props) {
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const pathname = usePathname()

  // Beim Seitenwechsel schließen
  useEffect(() => { setOpen(false) }, [pathname])

  // Escape schließt und gibt den Fokus zurück; Klick außerhalb schließt.
  useEffect(() => {
    if (!open) return

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpen(false)
        buttonRef.current?.focus()
      }
    }
    function onClick(e: MouseEvent) {
      const t = e.target as Node
      if (panelRef.current?.contains(t) || buttonRef.current?.contains(t)) return
      setOpen(false)
    }

    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onClick)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onClick)
    }
  }, [open])

  const row = 'flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors'

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setOpen(o => !o)}
        aria-label={open ? 'Menü schließen' : 'Menü öffnen'}
        aria-expanded={open}
        aria-controls="hauptmenue"
        className="p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors"
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      {open && (
        <div
          id="hauptmenue"
          ref={panelRef}
          className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl border border-gray-100 shadow-lg py-2 z-50"
        >
          {/* Konto */}
          {loggedIn && (
            <>
              <Link href="/profil" className={row}>
                <UserIcon size={16} className="text-gray-400" /> Profil
              </Link>
              {isAdmin && (
                <Link href="/admin" className={row}>
                  <ShieldCheck size={16} className="text-gray-400" /> Admin
                </Link>
              )}
              <div className="border-t border-gray-100 my-2" />
            </>
          )}

          {/* Info & Rechtliches */}
          <div className="px-4 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">
            Info &amp; Rechtliches
          </div>
          {INFO_ITEMS.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className={row}>
              <Icon size={16} className="text-gray-400" /> {label}
            </Link>
          ))}

          {/* Abmelden bzw. Anmelden — in der Demo gibt es bewusst keine Konten */}
          {(loggedIn || !isDemo) && <div className="border-t border-gray-100 my-2" />}
          {loggedIn ? (
            <button onClick={onLogout} className={`${row} w-full text-left`}>
              <LogOut size={16} className="text-gray-400" /> Abmelden
            </button>
          ) : !isDemo && (
            <Link href="/login" className={row}>
              <LogIn size={16} className="text-gray-400" /> Anmelden
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
