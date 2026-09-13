'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import { createClient } from '@/lib/supabase/client'
import { ChevronLeft, Camera, X, Lock } from 'lucide-react'

const inputCls = 'w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
const labelCls = 'mb-1.5 block text-sm font-medium text-gray-700'

function makeImagePath(uid: string, i: number, ext: string): string {
  return `${uid}/${Date.now()}-edit-${i}.${ext}`
}

export default function ForderungBearbeiten() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [ready, setReady] = useState(false)
  const [allowed, setAllowed] = useState(false)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [solution, setSolution] = useState('')
  const [existing, setExisting] = useState<string[]>([])          // schon gespeicherte Bild-URLs
  const [added, setAdded] = useState<{ file: File; url: string }[]>([]) // neue lokale Bilder

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const supabase = createClient()
    async function load() {
      const { data: userData } = await supabase.auth.getUser()
      const uid = userData.user?.id ?? null
      const { data: d } = await supabase.from('demands').select('*').eq('id', id).single()
      if (d && uid && d.user_id === uid) {
        setAllowed(true)
        setTitle(d.title ?? '')
        setDescription(d.description ?? '')
        setSolution(d.solution ?? '')
        setExisting(Array.isArray(d.image_urls) ? d.image_urls : [])
      }
      setReady(true)
    }
    load()
  }, [id])

  const totalImages = existing.length + added.length
  function addPhotos(files: FileList | null) {
    if (!files) return
    const room = 4 - totalImages
    const next = Array.from(files).slice(0, room).map(file => ({ file, url: URL.createObjectURL(file) }))
    setAdded(prev => [...prev, ...next].slice(0, 4 - existing.length))
  }
  function removeExisting(url: string) { setExisting(prev => prev.filter(u => u !== url)) }
  function removeAdded(url: string) { setAdded(prev => prev.filter(p => p.url !== url)); URL.revokeObjectURL(url) }

  const valid = title.trim().length >= 3

  async function save() {
    if (!valid) return
    setSaving(true); setError('')
    const supabase = createClient()
    const { data: userData } = await supabase.auth.getUser()
    const uid = userData.user?.id
    if (!uid) { router.push('/login'); return }

    // Neue Bilder hochladen (best effort)
    const newUrls: string[] = []
    for (let i = 0; i < added.length; i++) {
      const f = added[i].file
      const ext = (f.name.split('.').pop() || 'jpg').toLowerCase()
      const path = makeImagePath(uid, i, ext)
      const { error: upErr } = await supabase.storage.from('demand-images').upload(path, f, { upsert: false })
      if (!upErr) {
        const { data: pub } = supabase.storage.from('demand-images').getPublicUrl(path)
        if (pub?.publicUrl) newUrls.push(pub.publicUrl)
      }
    }

    const image_urls = [...existing, ...newUrls]
    const payload: Record<string, unknown> = {
      title: title.trim(),
      description: description.trim() || null,
      solution: solution.trim() || null,
      image_urls: image_urls.length > 0 ? image_urls : null,
      edited_at: new Date().toISOString(),
    }
    let { error: e } = await supabase.from('demands').update(payload).eq('id', id)
    // Fallback: sind image_urls/edited_at noch nicht angelegt (Migration fehlt),
    // wenigstens den Text speichern.
    if (e && /image_urls|edited_at|column|schema cache/i.test(e.message)) {
      ({ error: e } = await supabase.from('demands').update({ title: payload.title, description: payload.description, solution: payload.solution }).eq('id', id))
    }
    setSaving(false)
    if (e) { setError('Konnte nicht gespeichert werden: ' + e.message); return }
    router.push(`/forderungen/${id}`)
  }

  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen bg-gray-50">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 py-8">
          {!ready ? (
            <div className="h-64 animate-pulse rounded-2xl bg-gray-100" />
          ) : !allowed ? (
            <div className="rounded-2xl border border-gray-100 bg-white px-6 py-12 text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-400"><Lock size={24} /></div>
              <h1 className="text-xl font-bold text-gray-900">Nicht bearbeitbar</h1>
              <p className="mx-auto mt-1 max-w-sm text-sm text-gray-500">Du kannst nur deine eigenen Anliegen bearbeiten.</p>
              <Link href={`/forderungen/${id}`} className="mt-5 inline-block rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700">Zur Forderung</Link>
            </div>
          ) : (
            <>
              <Link href={`/forderungen/${id}`} className="inline-flex items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-gray-900">
                <ChevronLeft size={15} /> Zurück
              </Link>
              <h1 className="mt-3 text-2xl font-bold text-gray-900">Anliegen bearbeiten</h1>
              <p className="mt-0.5 text-sm text-gray-500">Deine Änderungen werden als „bearbeitet“ gekennzeichnet.</p>

              <div className="mt-6 flex flex-col gap-5">
                <div className="rounded-2xl border border-gray-100 bg-white p-5">
                  <div><label className={labelCls}>Titel *</label><input className={inputCls} value={title} onChange={e => setTitle(e.target.value)} /></div>
                  <div className="mt-4"><label className={labelCls}>Das Problem</label><textarea rows={4} className={`${inputCls} resize-none`} value={description} onChange={e => setDescription(e.target.value)} /></div>
                  <div className="mt-4"><label className={labelCls}>Gewünschte Veränderung</label><textarea rows={3} className={`${inputCls} resize-none`} value={solution} onChange={e => setSolution(e.target.value)} /></div>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-white p-5">
                  <div className="text-sm font-semibold text-gray-900">Fotos <span className="font-normal text-gray-400">(bis zu 4)</span></div>
                  <div className="mt-3 flex flex-wrap gap-3">
                    {existing.map((url, i) => (
                      <div key={url} className="relative h-20 w-20 overflow-hidden rounded-xl border border-gray-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt={`Foto ${i + 1}`} className="h-full w-full object-cover" />
                        <button onClick={() => removeExisting(url)} aria-label="Foto entfernen" className="absolute right-1 top-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-black/55 text-white hover:bg-black/75"><X size={12} /></button>
                      </div>
                    ))}
                    {added.map((p, i) => (
                      <div key={p.url} className="relative h-20 w-20 overflow-hidden rounded-xl border border-gray-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={p.url} alt={`Neu ${i + 1}`} className="h-full w-full object-cover" />
                        <button onClick={() => removeAdded(p.url)} aria-label="Foto entfernen" className="absolute right-1 top-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-black/55 text-white hover:bg-black/75"><X size={12} /></button>
                      </div>
                    ))}
                    {totalImages < 4 && (
                      <label className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-gray-300 text-gray-400 hover:border-blue-300 hover:text-blue-500">
                        <Camera size={20} />
                        <span className="text-[10px] font-medium">Foto</span>
                        <input type="file" accept="image/*" multiple className="hidden" onChange={e => { addPhotos(e.target.files); e.target.value = '' }} />
                      </label>
                    )}
                  </div>
                </div>

                {error && <div className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</div>}

                <div className="flex items-center justify-end gap-3">
                  <Link href={`/forderungen/${id}`} className="rounded-xl px-5 py-3 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900">Abbrechen</Link>
                  <button onClick={save} disabled={!valid || saving} className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40">
                    {saving ? 'Wird gespeichert…' : 'Änderungen speichern'}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </>
  )
}
