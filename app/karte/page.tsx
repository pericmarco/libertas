'use client'

import { useEffect, useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import { createClient } from '@/lib/supabase/client'
import { useCity } from '@/lib/city/context'
import { tenant } from '@/lib/tenant'
import type { MapPin } from '@/components/MapView'
import {
  Megaphone, Wrench, BarChart3, Building2, Newspaper, X, Landmark, UserRound, MapPin as PinIcon, ChevronRight,
} from 'lucide-react'
import {
  STADTTEILE, BEZIRK, PARTEI_FARBEN, ergebnisKompakt, type Stadtteil,
} from '@/lib/stadtteilDaten'

const MapView = dynamic(() => import('@/components/MapView'), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-gray-100 animate-pulse" />,
})

const FORDERUNG_COLOR = '#2563EB'
const MANGEL_COLOR = '#EA580C'
const STATUS_LABEL: Record<string, string> = {
  eingereicht: 'Eingereicht', geprüft: 'Geprüft', bearbeitet: 'In Bearbeitung',
  umgesetzt: 'Umgesetzt', abgelehnt: 'Abgelehnt',
}
const nf = new Intl.NumberFormat('de-DE')
const pf = new Intl.NumberFormat('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 })

type Row = { id: string; title: string; category: string | null; status: string; lat: number | null; lng: number | null; location: string | null; mangel: boolean }
type LayerKey = 'forderungen' | 'maengel' | 'umfragen' | 'projekte' | 'infos'

const LAYERS: { key: LayerKey; label: string; icon: typeof Megaphone; color: string; soon?: boolean }[] = [
  { key: 'forderungen', label: 'Forderungen', icon: Megaphone, color: FORDERUNG_COLOR },
  { key: 'maengel', label: 'Mängel', icon: Wrench, color: MANGEL_COLOR },
  { key: 'umfragen', label: 'Umfragen', icon: BarChart3, color: '#059669', soon: true },
  { key: 'projekte', label: 'Projekte', icon: Building2, color: '#7C3AED', soon: true },
  { key: 'infos', label: 'Infos', icon: Newspaper, color: '#6B7280', soon: true },
]

export default function KartePage() {
  const city = useCity()
  const isKoeln = tenant.productLine === 'city' && city.slug === 'koeln'
  const [rows, setRows] = useState<Row[]>([])
  const [active, setActive] = useState<Record<LayerKey, boolean>>({
    forderungen: true, maengel: true, umfragen: false, projekte: false, infos: false,
  })
  const [sheet, setSheet] = useState<Stadtteil | null>(null)

  useEffect(() => {
    const supabase = createClient()
    async function load() {
      const { data: userData } = await supabase.auth.getUser()
      const uid = userData.user?.id ?? null
      // Forderungen (öffentlich) + eigene Mängel (Mängel sind nicht öffentlich)
      const [{ data: ford }, mang] = await Promise.all([
        supabase.from('demands')
          .select('id, title, category, status, lat, lng, location')
          .eq('city_id', city.id).neq('status', 'zurückgezogen')
          .or('submission_type.is.null,submission_type.neq.mangel')
          .not('lat', 'is', null).limit(200),
        uid
          ? supabase.from('demands')
              .select('id, title, category, status, lat, lng, location')
              .eq('city_id', city.id).eq('user_id', uid).eq('submission_type', 'mangel')
              .neq('status', 'zurückgezogen').not('lat', 'is', null).limit(200)
          : Promise.resolve({ data: [] as never[] }),
      ])
      const all: Row[] = [
        ...(ford ?? []).map(d => ({ ...d, mangel: false })),
        ...((mang.data ?? []) as Row[]).map(d => ({ ...d, mangel: true })),
      ]
      setRows(all)
    }
    load()
  }, [city.id])

  const pins: MapPin[] = useMemo(() => rows
    .filter(r => r.lat != null && r.lng != null)
    .filter(r => (r.mangel ? active.maengel : active.forderungen))
    .map(r => ({
      id: r.id,
      lng: r.lng as number,
      lat: r.lat as number,
      title: r.title,
      meta: `${r.mangel ? 'Mangel' : (r.category ?? 'Forderung')} · ${STATUS_LABEL[r.status] ?? r.status}`,
      href: `/forderungen/${r.id}`,
      color: r.mangel ? MANGEL_COLOR : FORDERUNG_COLOR,
    })), [rows, active])

  const countFor = (name: string) =>
    rows.filter(r => !r.mangel && (r.location ?? '').toLowerCase().includes(name.toLowerCase())).length

  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen bg-gray-50">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6">
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Karte</h1>
            <p className="mt-0.5 text-sm text-gray-500">Was passiert wo in {city.name}?</p>
          </div>

          {/* Layer-Umschalter */}
          <div className="mb-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {LAYERS.map(l => {
              const on = active[l.key] && !l.soon
              return (
                <button
                  key={l.key}
                  disabled={l.soon}
                  onClick={() => setActive(a => ({ ...a, [l.key]: !a[l.key] }))}
                  className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                    l.soon
                      ? 'cursor-not-allowed border-gray-100 bg-gray-50 text-gray-300'
                      : on
                      ? 'border-transparent text-white'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                  }`}
                  style={on ? { backgroundColor: l.color } : undefined}
                >
                  <l.icon size={14} />
                  {l.label}
                  {l.soon && <span className="rounded-full bg-amber-50 px-1.5 py-0.5 text-[9px] font-semibold text-amber-600">bald</span>}
                </button>
              )
            })}
          </div>

          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
            <MapView pins={pins} cooperative className="h-[52vh] min-h-[320px] w-full" />
          </div>

          {/* Stadtteile — anklickbar (Info-Bottom-Sheet). Echte klickbare
              Flächen (GeoJSON-Polygone) folgen als nächste Ausbaustufe. */}
          {isKoeln && (
            <div className="mt-5">
              <h2 className="mb-2 text-sm font-semibold text-gray-900">Stadtteile im {BEZIRK.name}</h2>
              <div className="flex flex-wrap gap-2">
                {STADTTEILE.map(s => (
                  <button
                    key={s.name}
                    onClick={() => setSheet(s)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:border-blue-300 hover:text-blue-600"
                  >
                    <PinIcon size={13} className="text-gray-400" /> {s.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {sheet && <DistrictSheet s={sheet} forderungen={countFor(sheet.name)} onClose={() => setSheet(null)} />}
    </>
  )
}

function DistrictSheet({ s, forderungen, onClose }: { s: Stadtteil; forderungen: number; onClose: () => void }) {
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])
  const rows = ergebnisKompakt(s)
  const max = Math.max(...rows.map(r => r.anteil), 1)
  const staerkste = s.ergebnis[0]

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/40 sm:items-center" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="w-full sm:max-w-md max-h-[88vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-white pb-[calc(env(safe-area-inset-bottom)+1rem)]"
        onClick={e => e.stopPropagation()}
      >
        <div className="sticky top-0 rounded-t-3xl bg-white px-5 pt-3 pb-2">
          <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-gray-200 sm:hidden" />
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-gray-900">{s.name}</h2>
              <p className="text-xs text-gray-500">Stadtbezirk {BEZIRK.name}</p>
            </div>
            <button onClick={onClose} aria-label="Schließen" className="text-gray-400 hover:text-gray-700"><X size={20} /></button>
          </div>
        </div>

        <div className="px-5 pb-5">
          {/* Kennzahlen */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-xl border border-gray-100 px-3 py-2.5">
              <div className="font-bold text-gray-900 tabular-nums">{nf.format(s.einwohner)}</div>
              <div className="text-[11px] text-gray-500">Einwohner*innen</div>
            </div>
            <div className="rounded-xl border border-gray-100 px-3 py-2.5">
              <div className="font-bold text-gray-900 tabular-nums">{pf.format(s.wahlbeteiligung)} %</div>
              <div className="text-[11px] text-gray-500">Wahlbeteiligung</div>
            </div>
            <div className="rounded-xl border border-gray-100 px-3 py-2.5">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: PARTEI_FARBEN[staerkste.partei] }} />
                <span className="font-bold text-gray-900">{staerkste.partei}</span>
              </div>
              <div className="text-[11px] text-gray-500">stärkste Kraft</div>
            </div>
          </div>

          {/* Zuständigkeit */}
          <div className="mt-4 space-y-1.5 rounded-xl bg-gray-50 p-4">
            <p className="flex items-center gap-2 text-sm text-gray-600">
              <Landmark size={15} className="shrink-0 text-gray-400" /> Zuständig: <span className="font-medium text-gray-900">{BEZIRK.gremium}</span>
            </p>
            <p className="flex items-center gap-2 text-sm text-gray-600">
              <UserRound size={15} className="shrink-0 text-gray-400" /> Bezirksbürgermeisterin: <span className="font-medium text-gray-900">{BEZIRK.buergermeisterin}, {BEZIRK.buergermeisterinPartei}</span>
            </p>
          </div>

          {/* Bezirksvertretung / Mehrheitsverhältnisse */}
          <h3 className="mt-4 mb-2 text-sm font-semibold text-gray-900">Ratswahl 2025 in {s.name}</h3>
          <ul className="space-y-2">
            {rows.map(r => (
              <li key={r.partei} className="grid grid-cols-[84px_1fr_46px] items-center gap-3">
                <span className="truncate text-sm font-medium text-gray-900">{r.partei}</span>
                <span className="h-2 overflow-hidden rounded-full bg-gray-100">
                  <span className="block h-full rounded-full" style={{ width: `${(r.anteil / max) * 100}%`, backgroundColor: PARTEI_FARBEN[r.partei] ?? PARTEI_FARBEN['Weitere'] }} />
                </span>
                <span className="text-right text-sm tabular-nums text-gray-500">{pf.format(r.anteil)} %</span>
              </li>
            ))}
          </ul>

          {/* Lokale Inhalte */}
          <Link
            href="/feed"
            onClick={onClose}
            className="mt-5 flex items-center justify-between rounded-xl border border-gray-100 bg-white px-4 py-3 transition-colors hover:border-blue-200"
          >
            <span className="text-sm font-medium text-gray-700">
              {forderungen} {forderungen === 1 ? 'Forderung' : 'Forderungen'} in {s.name}
            </span>
            <ChevronRight size={16} className="text-gray-300" />
          </Link>
          <p className="mt-3 text-center text-xs text-gray-400">{BEZIRK.quelle}</p>
        </div>
      </div>
    </div>
  )
}
