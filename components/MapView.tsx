'use client'

import { useEffect, useRef, useState } from 'react'
import 'maplibre-gl/dist/maplibre-gl.css'
import type { Map as MLMap, Marker } from 'maplibre-gl'

// Amtliche Hintergrundkarte (basemap.de Web Vektor / BKG) — kein API-Schlüssel nötig.
const STYLE_URL = 'https://sgx.geodatenzentrum.de/gdz_basemapde_vektor/styles/bm_web_col.json'
const ATTRIBUTION = '© GeoBasis-DE / BKG (2026) CC BY 4.0'
const COLOGNE = { lng: 6.9578, lat: 50.9367 }

export type LngLat = { lng: number; lat: number }
export type MapPin = LngLat & { id?: string; color?: string }

type Props = {
  className?: string
  center?: LngLat
  zoom?: number
  // Anzeige-Modus
  pins?: MapPin[]
  onPinClick?: (id: string) => void
  // Auswahl-Modus (Standort setzen)
  picker?: boolean
  maxPins?: number
  value?: LngLat[]
  onChange?: (pins: LngLat[]) => void
}

export default function MapView({
  className,
  center = COLOGNE,
  zoom = 12,
  pins,
  onPinClick,
  picker = false,
  maxPins = 1,
  value = [],
  onChange,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<MLMap | null>(null)
  const mlRef = useRef<typeof import('maplibre-gl') | null>(null)
  const markersRef = useRef<Marker[]>([])
  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(false)

  // Aktuelle Props für den einmaligen Init-Effekt (ohne Neu-Initialisierung).
  const pickerRef = useRef(picker)
  const maxRef = useRef(maxPins)
  const valueRef = useRef(value)
  const onChangeRef = useRef(onChange)
  useEffect(() => {
    pickerRef.current = picker
    maxRef.current = maxPins
    valueRef.current = value
    onChangeRef.current = onChange
  })

  // Karte einmalig initialisieren (maplibre wird erst hier nachgeladen).
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const ml = (await import('maplibre-gl')).default
        if (cancelled || !containerRef.current) return
        mlRef.current = ml
        const map = new ml.Map({
          container: containerRef.current,
          style: STYLE_URL,
          center: [center.lng, center.lat],
          zoom,
          attributionControl: false,
        })
        map.addControl(new ml.AttributionControl({ compact: true, customAttribution: ATTRIBUTION }), 'bottom-right')
        map.addControl(new ml.NavigationControl({ showCompass: false }), 'top-right')
        if (pickerRef.current) {
          map.on('click', (e) => {
            const p = { lng: e.lngLat.lng, lat: e.lngLat.lat }
            const cur = valueRef.current ?? []
            const next = maxRef.current <= 1 ? [p] : [...cur, p].slice(-maxRef.current)
            onChangeRef.current?.(next)
          })
        }
        map.on('load', () => { if (!cancelled) setReady(true) })
        map.on('error', () => { if (!cancelled) setFailed(true) })
        mapRef.current = map
      } catch {
        if (!cancelled) setFailed(true)
      }
    })()
    return () => { cancelled = true; mapRef.current?.remove(); mapRef.current = null }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Marker mit den Daten synchronisieren.
  useEffect(() => {
    const ml = mlRef.current
    const map = mapRef.current
    if (!ml || !map || !ready) return
    markersRef.current.forEach(m => m.remove())
    markersRef.current = []
    const list: MapPin[] = picker ? (value ?? []) : (pins ?? [])
    for (const p of list) {
      const marker = new ml.Marker({ color: p.color ?? '#2563EB' })
        .setLngLat([p.lng, p.lat])
        .addTo(map)
      if (!picker && onPinClick && p.id) {
        const el = marker.getElement()
        el.style.cursor = 'pointer'
        el.addEventListener('click', () => onPinClick(p.id!))
      }
      markersRef.current.push(marker)
    }
  }, [ready, picker, pins, value, onPinClick])

  if (failed) {
    return (
      <div className={className}>
        <div className="flex h-full w-full items-center justify-center rounded-xl bg-gray-100 text-sm text-gray-400">
          Karte gerade nicht verfügbar
        </div>
      </div>
    )
  }

  return <div ref={containerRef} className={className} />
}
