'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Car, Shield, Leaf, Home, Users, GraduationCap, Building2, Tag,
  MessageSquare, ChevronRight, ThumbsUp, ThumbsDown, Lightbulb,
  Landmark, BadgeCheck, Newspaper, ExternalLink, ArrowRight, CalendarClock,
  type LucideIcon,
} from 'lucide-react'
import type { FeedItem } from '@/lib/feed'
import { STATUS_LABEL } from '@/lib/feed'

const RELEVANCE_THRESHOLD = 50

const CATEGORY_ICON: Record<string, LucideIcon> = {
  'Verkehr & Mobilität': Car,
  'Sicherheit & Ordnung': Shield,
  'Umwelt & Sauberkeit': Leaf,
  'Wohnen': Home,
  'Soziales & Zusammenleben': Users,
  'Bildung & Betreuung': GraduationCap,
  'Stadtentwicklung & öffentlicher Raum': Building2,
  'Sonstiges': Tag,
}

const STATUS_STYLE: Record<string, string> = {
  eingereicht: 'bg-emerald-50 text-emerald-600',
  geprüft: 'bg-yellow-100 text-yellow-700',
  bearbeitet: 'bg-blue-100 text-blue-700',
  umgesetzt: 'bg-green-100 text-green-700',
  abgelehnt: 'bg-red-100 text-red-600',
  zurückgezogen: 'bg-gray-100 text-gray-500',
}

export default function FeedCard({ item, isDemo }: { item: FeedItem; isDemo?: boolean }) {
  if (item.type === 'forderung') return <ForderungCard item={item} />
  if (item.type === 'umfrage') return <UmfrageCard item={item} isDemo={isDemo} />
  return <InfoCard item={item} />
}

function CardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-[0_6px_24px_-14px_rgba(15,23,42,0.18)]">
      {children}
    </div>
  )
}

function ForderungCard({ item }: { item: Extract<FeedItem, { type: 'forderung' }> }) {
  const [open, setOpen] = useState(false)
  const Icon = CATEGORY_ICON[item.areas[0]] ?? Tag
  const progress = Math.min((item.relevance / RELEVANCE_THRESHOLD) * 100, 100)
  const long = (item.description?.length ?? 0) > 120
  const snippet = item.description
    ? (long && !open ? item.description.slice(0, 120).trimEnd() + '…' : item.description)
    : null

  return (
    <CardShell>
      {/* Kopf: Kategorie · Stadtteil · Status */}
      <div className="flex items-center gap-2.5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <Icon size={17} strokeWidth={1.9} />
        </span>
        <div className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-0.5 text-sm">
          <span className="font-medium text-gray-700 truncate">{item.areas[0]}</span>
          {item.location && <><span className="text-gray-300">·</span><span className="text-gray-400 truncate">{item.location}</span></>}
        </div>
        <span className={`ml-auto shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLE[item.status] ?? 'bg-gray-100 text-gray-500'}`}>
          {STATUS_LABEL[item.status] ?? item.status}
        </span>
      </div>

      <Link href={`/forderungen/${item.id}`} className="mt-3 block">
        <h3 className="text-lg font-semibold leading-snug text-gray-900 hover:text-blue-700 transition-colors">{item.title}</h3>
      </Link>

      {snippet && (
        <p className="mt-1.5 text-sm leading-relaxed text-gray-500">
          {snippet}{' '}
          {long && (
            <button onClick={() => setOpen(o => !o)} className="font-medium text-blue-600 hover:text-blue-700">
              {open ? 'Weniger' : 'Mehr lesen'}
            </button>
          )}
        </p>
      )}

      {/* Relevanz */}
      <div className="mt-4">
        <div className="mb-1.5 text-xs text-gray-500">
          <span className="font-bold text-gray-900 tabular-nums">{item.relevance}</span> / {RELEVANCE_THRESHOLD} Relevanzpunkte
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
          <div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Zähler */}
      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
        <span className="inline-flex items-center gap-1"><ThumbsUp size={13} className="text-emerald-500" /> {item.supports} Unterstützungen</span>
        <span className="inline-flex items-center gap-1"><ThumbsDown size={13} className="text-orange-500" /> {item.counters} Gegenargumente</span>
        <span className="inline-flex items-center gap-1"><Lightbulb size={13} className="text-blue-500" /> {item.alternatives} Alternativen</span>
      </div>

      {/* Diskussion (eingeklappt) */}
      <Link
        href={`/forderungen/${item.id}#diskussion`}
        className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 text-sm"
      >
        <span className="inline-flex items-center gap-2 font-medium text-blue-600">
          <MessageSquare size={15} /> {item.beitraege} {item.beitraege === 1 ? 'Beitrag' : 'Beiträge'} anzeigen
        </span>
        <ChevronRight size={16} className="text-gray-300" />
      </Link>
    </CardShell>
  )
}

function UmfrageCard({ item, isDemo }: { item: Extract<FeedItem, { type: 'umfrage' }>; isDemo?: boolean }) {
  return (
    <CardShell>
      <div className="flex items-center gap-2.5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
          <Landmark size={17} strokeWidth={1.9} />
        </span>
        <div className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-0.5">
          <span className="inline-flex items-center gap-1 font-semibold text-gray-900">
            {item.sender} <BadgeCheck size={15} className="text-blue-500" />
          </span>
          {item.district && <><span className="text-gray-300">·</span><span className="text-sm text-gray-400">{item.district}</span></>}
        </div>
        <span className="ml-auto shrink-0 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-600">Neue Umfrage</span>
      </div>

      {isDemo && (
        <span className="mt-2 inline-block rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-600">Beispiel</span>
      )}

      <h3 className="mt-3 text-lg font-semibold leading-snug text-gray-900">{item.title}</h3>
      {item.description && <p className="mt-1.5 text-sm leading-relaxed text-gray-500">{item.description}</p>}

      <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
        <span className="inline-flex items-center gap-1.5">
          {item.totalVotes} Stimmen
          {item.endsAt && <><span className="text-gray-300">·</span><CalendarClock size={12} /> bis {new Date(item.endsAt).toLocaleDateString('de-DE', { day: 'numeric', month: 'short' })}</>}
        </span>
      </div>

      <Link
        href="/abstimmungen"
        className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 text-sm font-medium text-blue-600"
      >
        Jetzt abstimmen
        <ArrowRight size={16} />
      </Link>
    </CardShell>
  )
}

function InfoCard({ item }: { item: Extract<FeedItem, { type: 'info' }> }) {
  const date = new Date(item.createdAt).toLocaleDateString('de-DE', { day: 'numeric', month: 'long' })
  const categoryColors: Record<string, string> = {
    Verkehr: 'bg-blue-100 text-blue-700',
    Politik: 'bg-purple-100 text-purple-700',
    Veranstaltung: 'bg-green-100 text-green-700',
    Umwelt: 'bg-emerald-100 text-emerald-700',
  }
  return (
    <CardShell>
      <div className="flex items-center gap-2.5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-500">
          <Newspaper size={17} strokeWidth={1.9} />
        </span>
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          {item.category && (
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${categoryColors[item.category] ?? 'bg-gray-100 text-gray-600'}`}>{item.category}</span>
          )}
          <span className="text-xs text-gray-400">{date}{item.district ? ` · ${item.district}` : ''}</span>
        </div>
        {item.sourceUrl && (
          <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" className="ml-auto shrink-0 text-gray-300 hover:text-blue-500" aria-label="Quelle öffnen">
            <ExternalLink size={15} />
          </a>
        )}
      </div>
      <h3 className="mt-3 font-semibold leading-snug text-gray-900">{item.title}</h3>
      {item.summary && <p className="mt-1.5 text-sm leading-relaxed text-gray-500">{item.summary}</p>}
      {item.source && <div className="mt-1.5 text-xs text-gray-400">Quelle: {item.source}</div>}
    </CardShell>
  )
}
