'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutGrid, Map, Handshake, Landmark, Plus, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useCity, useCityBrand } from '@/lib/city/context'
import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import PlusMenu from '@/components/PlusMenu'
import MainMenu from '@/components/layout/MainMenu'
import { tenant } from '@/lib/tenant'

// Hauptnavigation: Feed · Karte · ➕ · Mitmachen · Stadt.
// „Mitmachen" bündelt alle Beteiligungsformate (Forderungen, Abstimmungen/
// Umfragen … später Bürgerbudget, Vorhaben, Verfahren). „Stadt" bündelt Politik,
// Zahlen und Wirkung. „Forderungen", „Politiker", „Wirkung", „Dashboard",
// „Abstimmungen" haben keinen eigenen Punkt mehr — ihre Routen bleiben
// erreichbar (aus Feed/Plus/Mitmachen/Stadt verlinkt).
type NavItem = { href: string; label: string; icon: typeof LayoutGrid; show?: boolean; match?: string[] }

export default function Navbar() {
  const brand = useCityBrand()
  const city = useCity()
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [role, setRole] = useState<string>('citizen')
  const [verified, setVerified] = useState(false)
  const [plusOpen, setPlusOpen] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }) => {
      setUser(data.user)
      if (data.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, politician_verified')
          .eq('id', data.user.id)
          .single()
        setRole(profile?.role ?? 'citizen')
        setVerified(profile?.politician_verified === true)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (!session?.user) { setRole('citizen'); setVerified(false) }
    })

    return () => subscription.unsubscribe()
  }, [])

  const isAdmin = role === 'admin'
  // Verifizierte institutionelle Accounts dürfen Umfragen/Projekte veröffentlichen.
  const canOfficial = role === 'admin' || role === 'city' || (role === 'politician' && verified)

  const leftItems: NavItem[] = [
    { href: '/feed', label: 'Feed', icon: LayoutGrid },
    { href: '/karte', label: 'Karte', icon: Map, show: tenant.modules.karte },
  ]
  const rightItems: NavItem[] = [
    { href: '/mitmachen', label: 'Mitmachen', icon: Handshake, match: ['/forderungen', '/abstimmungen'] },
    { href: '/ueberblick', label: 'Stadt', icon: Landmark, match: ['/politiker', '/wirkung', '/dashboard'] },
  ]
  const left = leftItems.filter(i => i.show !== false)
  const right = rightItems.filter(i => i.show !== false)
  const topLinks = [...left, ...right]

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const navLink = (active: boolean) =>
    cn('flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
      active ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50')

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')
  // Ein Nav-Punkt ist auch aktiv, wenn eine seiner „untergeordneten" Routen offen ist.
  const itemActive = (item: NavItem) => isActive(item.href) || (item.match?.some(isActive) ?? false)

  const cell = (item: NavItem) => {
    const active = itemActive(item)
    return (
      <Link
        key={item.href}
        href={item.href}
        className={cn('flex flex-col items-center justify-center gap-1 transition-colors',
          active ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900')}
      >
        <item.icon size={20} strokeWidth={active ? 2.5 : 1.8} />
        <span className="text-[10px] font-medium max-w-full truncate px-0.5">{item.label}</span>
      </Link>
    )
  }

  return (
    <>
      {/* Desktop Top-Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-full flex items-center justify-between">
          <Link href={user ? '/feed' : '/'} className="flex items-center gap-2">
            <Image src="/logo.svg" alt={`${brand} Logo`} width={32} height={32} className="w-8 h-8" priority unoptimized />
            <span className="font-semibold text-gray-900">{brand}</span>
            {city.is_demo && (
              <span className="hidden sm:inline text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                Beispiel
              </span>
            )}
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {topLinks.map(item => (
              <Link key={item.href} href={item.href} className={navLink(itemActive(item))}>
                <item.icon size={16} />
                {item.label}
              </Link>
            ))}
            {isAdmin && (
              <Link href="/admin" className={navLink(isActive('/admin'))}>
                <ShieldCheck size={16} /> Admin
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-2">
            {/* „+ Beitrag" öffnet dasselbe Menü wie der mobile FAB */}
            <button
              onClick={() => setPlusOpen(true)}
              className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
            >
              <Plus size={16} /> Beitrag
            </button>

            {/* Alles Weitere (Profil, Admin, Info & Rechtliches, Abmelden)
                liegt im Hauptmenü — wie bei großen Plattformen üblich. */}
            <MainMenu
              loggedIn={!!user}
              isAdmin={isAdmin}
              isDemo={city.is_demo}
              onLogout={handleLogout}
            />
          </div>
        </div>
      </header>

      {/* Mobile Bottom-Navigation mit zentralem Plus-FAB */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 pb-safe">
        <div className="grid grid-cols-5 h-16">
          {left.map(cell)}
          {left.length < 2 && <span />}

          {/* zentraler FAB — erhöht über der Leiste */}
          <div className="relative flex items-center justify-center">
            <button
              onClick={() => setPlusOpen(true)}
              aria-label="Beitrag erstellen"
              className="absolute -top-5 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-600/30 hover:bg-blue-700 active:scale-95 transition-all"
            >
              <Plus size={26} />
            </button>
          </div>

          {right.map(cell)}
          {right.length < 2 && <span />}
        </div>
      </nav>

      <PlusMenu open={plusOpen} onClose={() => setPlusOpen(false)} loggedIn={!!user} canOfficial={canOfficial} />
    </>
  )
}
