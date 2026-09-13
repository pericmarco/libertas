import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, CalendarClock, MapPin, Landmark } from 'lucide-react'
import { STATUS_META, daysLeft, type ProcessRow } from '@/lib/participation/process'

// Kompakte Karte für ein Beteiligungsverfahren (Network-Liste + Mitmachen-Hub).
export default function ProcessCard({ p }: { p: ProcessRow }) {
  const st = STATUS_META[p.status]
  const left = daysLeft(p.ends_at)
  return (
    <Link
      href={`/beteiligungen/${p.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_6px_24px_-14px_rgba(15,23,42,0.18)] transition-all hover:border-blue-200 hover:shadow-[0_12px_30px_-16px_rgba(15,23,42,0.28)]"
    >
      {p.image_url ? (
        <div className="relative h-40 w-full">
          <Image src={p.image_url} alt="" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
          <span className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-semibold ${st.badge}`}>{st.label}</span>
          {left != null && left > 0 && (
            <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/45 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
              <CalendarClock size={12} /> {left} {left === 1 ? 'Tag' : 'Tage'}
            </span>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-3 px-5 pt-5">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><Landmark size={20} /></span>
          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${st.badge}`}>{st.label}</span>
          {left != null && left > 0 && (
            <span className="ml-auto inline-flex items-center gap-1 text-xs text-gray-400">
              <CalendarClock size={13} /> noch {left} {left === 1 ? 'Tag' : 'Tage'}
            </span>
          )}
        </div>
      )}

      <div className="flex flex-1 flex-col p-5">
        {p.area && <div className="mb-1 inline-flex items-center gap-1 text-xs text-gray-400"><MapPin size={12} /> {p.area}</div>}
        <h3 className="text-lg font-semibold leading-snug text-gray-900 transition-colors group-hover:text-blue-700">{p.title}</h3>
        {p.subtitle && <p className="mt-1 text-sm leading-relaxed text-gray-500 line-clamp-2">{p.subtitle}</p>}
        <div className="mt-4 flex items-center gap-1.5 text-sm font-medium text-blue-600">
          {p.status === 'beteiligung_laeuft' ? 'Jetzt mitmachen' : 'Ansehen'}
          <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
        </div>
      </div>
    </Link>
  )
}
