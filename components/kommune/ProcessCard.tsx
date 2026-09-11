import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Users, MessageSquare, Heart, CalendarClock } from 'lucide-react'
import { STATUS_META, daysLeft, type ParticipationProcess } from '@/lib/kommune/demo'

// Kompakte Karte für eine Beteiligung (Start + Beteiligungen-Liste).
export default function ProcessCard({ p }: { p: ParticipationProcess }) {
  const st = STATUS_META[p.status]
  const left = daysLeft(p.end)
  return (
    <Link
      href={`/beteiligungen/${p.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_6px_24px_-14px_rgba(15,23,42,0.18)] transition-all hover:border-blue-200 hover:shadow-[0_12px_30px_-16px_rgba(15,23,42,0.28)]"
    >
      {p.image ? (
        <div className="relative h-40 w-full">
          <Image src={p.image} alt="" fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
          <span className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-semibold ${st.badge}`}>{st.label}</span>
          {left != null && left > 0 && (
            <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/45 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
              <CalendarClock size={12} /> {left} {left === 1 ? 'Tag' : 'Tage'}
            </span>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-3 px-5 pt-5">
          <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl ${p.accent}`}>{p.emoji}</span>
          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${st.badge}`}>{st.label}</span>
          {left != null && left > 0 && (
            <span className="ml-auto inline-flex items-center gap-1 text-xs text-gray-400">
              <CalendarClock size={13} /> noch {left} {left === 1 ? 'Tag' : 'Tage'}
            </span>
          )}
        </div>
      )}

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-semibold leading-snug text-gray-900 group-hover:text-blue-700 transition-colors">{p.title}</h3>
        <p className="mt-1 text-sm leading-relaxed text-gray-500 line-clamp-2">{p.subtitle}</p>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
          {p.stats.teilnehmende > 0 && <span className="inline-flex items-center gap-1"><Users size={13} className="text-gray-400" /> {p.stats.teilnehmende.toLocaleString('de-DE')} Teilnehmende</span>}
          {p.stats.beitraege > 0 && <span className="inline-flex items-center gap-1"><MessageSquare size={13} className="text-gray-400" /> {p.stats.beitraege} Beiträge</span>}
          {p.stats.reaktionen > 0 && <span className="inline-flex items-center gap-1"><Heart size={13} className="text-gray-400" /> {p.stats.reaktionen} Reaktionen</span>}
        </div>

        <div className="mt-4 flex items-center gap-1.5 text-sm font-medium text-blue-600">
          {p.status === 'beteiligung_laeuft' ? 'Jetzt beteiligen' : 'Ansehen'}
          <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
        </div>
      </div>
    </Link>
  )
}
