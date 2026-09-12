import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, MapPin, Users } from 'lucide-react'
import { VORHABEN_STATUS, KAT_META, type Vorhaben } from '@/lib/kommune/vorhaben'

// Kompakte Karte für ein Vorhaben (Übersicht).
export default function VorhabenCard({ v }: { v: Vorhaben }) {
  const st = VORHABEN_STATUS[v.status]
  const kat = KAT_META[v.kategorie]
  const currentPhase = v.phases.find(p => p.state === 'current')

  return (
    <Link
      href={`/vorhaben/${v.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_6px_24px_-14px_rgba(15,23,42,0.18)] transition-all hover:border-blue-200 hover:shadow-[0_12px_30px_-16px_rgba(15,23,42,0.28)]"
    >
      {v.image ? (
        <div className="relative h-40 w-full">
          <Image src={v.image} alt="" fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
          <span className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-semibold ${st.badge}`}>{st.label}</span>
        </div>
      ) : (
        <div className="flex items-center gap-3 px-5 pt-5">
          <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl ${kat.accent}`}>{kat.emoji}</span>
          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${st.badge}`}>{st.label}</span>
        </div>
      )}

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-1 flex items-center gap-2 text-xs text-gray-400">
          <span>{v.kategorie}</span>
          <span className="inline-flex items-center gap-1"><MapPin size={12} /> {v.district}</span>
        </div>
        <h3 className="text-lg font-semibold leading-snug text-gray-900 transition-colors group-hover:text-blue-700">{v.title}</h3>
        <p className="mt-1 text-sm leading-relaxed text-gray-500 line-clamp-2">{v.subtitle}</p>

        {currentPhase && (
          <div className="mt-3 inline-flex w-fit items-center gap-1.5 rounded-full bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-600">
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: st.dot }} /> Aktuell: {currentPhase.label}
          </div>
        )}

        <div className="mt-4 flex items-center justify-between">
          <span className="inline-flex items-center gap-1 text-xs text-gray-400"><Users size={13} /> {v.interest.toLocaleString('de-DE')} Interessierte</span>
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600">
            Ansehen <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  )
}
