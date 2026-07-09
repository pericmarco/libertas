'use client'

import {
  ThumbsUp, ThumbsDown, Lightbulb, MessageSquare, ChevronRight,
  Car, Shield, Leaf, Home, Users, GraduationCap, Building2, Tag,
  type LucideIcon,
} from 'lucide-react'

export const RELEVANCE_THRESHOLD = 50

export type Demand = {
  id: string
  title: string
  description: string | null
  category: string
  tags: string[] | null
  relevance_score: number
  status: string
}

const statusColors: Record<string, string> = {
  eingereicht: 'bg-emerald-50 text-emerald-600',
  geprüft:     'bg-yellow-100 text-yellow-700',
  bearbeitet:  'bg-blue-100 text-blue-700',
  umgesetzt:   'bg-green-100 text-green-700',
  abgelehnt:   'bg-red-100 text-red-600',
}

const statusLabels: Record<string, string> = {
  eingereicht: 'Eingereicht',
  geprüft:     'Geprüft',
  bearbeitet:  'In Bearbeitung',
  umgesetzt:   'Umgesetzt',
  abgelehnt:   'Abgelehnt',
}

// Icon je Themenbereich fuer das Badge oben links.
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

// Leichter Glanz-/Reflection-Verlauf fuer den Premium-Look.
const GLASS_BG = {
  backgroundImage:
    'radial-gradient(130% 90% at 0% 0%, rgba(255,255,255,0.95), rgba(255,255,255,0) 45%), linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
}

type Props = {
  demand: Demand
  areas: string[]
  position?: string
  textCount: number
  /** 'row' = feste Breite für horizontale Reihen, 'list' = volle Breite */
  variant?: 'row' | 'list'
  /** Bereich fuer das Icon-Badge (z. B. der Kategorie-Abschnitt); sonst erster Bereich */
  iconCategory?: string
  onOpen: (id: string) => void
  onToggleSupport: (e: React.MouseEvent, id: string) => void
}

export default function DemandCard({
  demand: d,
  areas,
  position,
  textCount,
  variant = 'list',
  iconCategory,
  onOpen,
  onToggleSupport,
}: Props) {
  const progress = Math.min((d.relevance_score / RELEVANCE_THRESHOLD) * 100, 100)
  const snippet = d.description
    ? d.description.length > 100 ? d.description.slice(0, 100) + '…' : d.description
    : null

  const Icon = CATEGORY_ICON[iconCategory ?? areas[0]] ?? Tag

  return (
    <div
      onClick={() => onOpen(d.id)}
      style={GLASS_BG}
      className={`group flex flex-col cursor-pointer rounded-3xl border border-gray-100 p-6
        shadow-[0_10px_35px_-15px_rgba(15,23,42,0.18)] transition-all duration-300
        hover:-translate-y-1 hover:border-blue-100 hover:shadow-[0_22px_50px_-18px_rgba(15,23,42,0.28)]
        motion-reduce:transition-none motion-reduce:hover:translate-y-0 ${
        variant === 'row' ? 'w-[290px] shrink-0 snap-start' : 'w-full'
      }`}
    >
      {/* Kopf: Icon-Badge + Bereiche + Status */}
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600 shrink-0">
          <Icon size={18} strokeWidth={1.9} />
        </div>
        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 pt-1.5">
          {areas.slice(0, 2).map((a, i) => (
            <span key={a} className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500">
              {i > 0 && <span className="text-gray-300">·</span>}
              {a}
            </span>
          ))}
          {areas.length > 2 && <span className="text-xs text-gray-400">+{areas.length - 2}</span>}
          <span className="text-gray-300 text-sm">·</span>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColors[d.status] ?? 'bg-gray-100 text-gray-500'}`}>
            {statusLabels[d.status] ?? d.status}
          </span>
        </div>
      </div>

      {/* Titel + Beschreibung */}
      <div className="text-lg font-semibold text-gray-900 leading-snug mt-4 mb-1.5">{d.title}</div>
      {snippet && <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">{snippet}</p>}

      {/* Relevanz + Aktionen (am Kartenboden) */}
      <div className="mt-auto pt-6">
        <div className="text-xs text-gray-400 mb-2">{d.relevance_score} / {RELEVANCE_THRESHOLD} Relevanzpunkte</div>
        <div className="w-full bg-gray-100 rounded-full h-1.5 mb-4 overflow-hidden">
          <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>

        <div className="flex items-center justify-between gap-2">
          {position === 'unterstützend' ? (
            <button
              onClick={(e) => onToggleSupport(e, d.id)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold bg-blue-600 text-white shadow-sm shadow-blue-600/20 hover:bg-blue-700 transition-colors shrink-0"
            >
              <ThumbsUp size={15} className="fill-white" />
              Unterstützt
            </button>
          ) : position === 'alternative' ? (
            <span className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold bg-orange-50 text-orange-600 shrink-0">
              <Lightbulb size={15} />
              Alternative
            </span>
          ) : position === 'gegenargument' ? (
            <span className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold bg-red-50 text-red-500 shrink-0">
              <ThumbsDown size={15} />
              Gegenargument
            </span>
          ) : (
            <button
              onClick={(e) => onToggleSupport(e, d.id)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors shrink-0"
            >
              <ThumbsUp size={15} />
              Unterstützen
            </button>
          )}

          <div className="flex items-center gap-2.5 shrink-0 text-gray-400">
            {textCount > 0 && (
              <span className="flex items-center gap-1 text-xs">
                <MessageSquare size={14} />
                {textCount} {textCount === 1 ? 'Beitrag' : 'Beiträge'}
              </span>
            )}
            <ChevronRight size={16} className="text-gray-300" />
          </div>
        </div>
      </div>
    </div>
  )
}
