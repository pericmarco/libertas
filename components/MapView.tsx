'use client'

import { useEffect, useRef, useState } from 'react'
import 'maplibre-gl/dist/maplibre-gl.css'
import type { Map as MLMap, Marker } from 'maplibre-gl'

// Amtliche Hintergrundkarte (basemap.de Web Vektor / BKG) — kein API-Schlüssel nötig.
const STYLE_URL = 'https://sgx.geodatenzentrum.de/gdz_basemapde_vektor/styles/bm_web_col.json'
const ATTRIBUTION = '© GeoBasis-DE / BKG (2026) CC BY 4.0'
const COLOGNE = { lng: 6.9578, lat: 50.9367 }

export type LngLat = { lng: number; lat: number }
export type MapPin = LngLat & {
  id?: string
  color?: string
  title?: string
  meta?: string
  href?: string
}

// Popup-Inhalt XSS-sicher aufbauen (Titel kommen aus Nutzereingaben).
function buildPopupContent(p: MapPin): HTMLElement {
  const el = document.createElement('div')
  el.style.cssText = 'min-width:150px;max-width:220px'
  if (p.title) {
    const t = document.createElement('div')
    t.textContent = p.title
    t.style.cssText = 'font-weight:600;font-size:13px;color:#111827;line-height:1.3'
    el.appendChild(t)
  }
  if (p.meta) {
    const m = document.createElement('div')
    m.textContent = p.meta
    m.style.cssText = 'font-size:11px;color:#6B7280;margin-top:3px'
    el.appendChild(m)
  }
  if (p.href) {
    const a = document.createElement('a')
    a.href = p.href
    a.textContent = 'Öffnen →'
    a.style.cssText = 'display:inline-block;margin-top:7px;font-size:12px;font-weight:600;color:#2563EB;text-decoration:none'
    el.appendChild(a)
  }
  return el
}

type Props = {
  className?: string
  center?: LngLat
  zoom?: number
  /** false = statische Vorschau (kein Zoom/Pan, keine Zoom-Buttons) */
  interactive?: boolean
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
  interactive = true,
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
  const roRef = useRef<ResizeObserver | null>(null)
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
          interactive,
        })
        map.addControl(new ml.AttributionControl({ compact: true, customAttribution: ATTRIBUTION }), 'bottom-right')
        if (interactive) map.addControl(new ml.NavigationControl({ showCompass: false }), 'top-right')
        if (pickerRef.current) {
          map.on('click', (e) => {
            const p = { lng: e.lngLat.lng, lat: e.lngLat.lat }
            const cur = valueRef.current ?? []
            const next = maxRef.current <= 1 ? [p] : [...cur, p].slice(-maxRef.current)
            onChangeRef.current?.(next)
          })
        }
        mapRef.current = map
        map.on('load', () => { if (!cancelled) { setReady(true); map.resize() } })
        map.on('error', () => { if (!cancelled) setFailed(true) })
        // Container-Größe beobachten — fixt die leere Karte, wenn sie erst
        // durch Layout Größe bekommt (z. B. im Vollbild-Overlay).
        if (typeof ResizeObserver !== 'undefined' && containerRef.current) {
          const ro = new ResizeObserver(() => map.resize())
          ro.observe(containerRef.current)
          roRef.current = ro
        }
        // Nach dem ersten Frame noch einmal sicher neu vermessen.
        requestAnimationFrame(() => { if (!cancelled) map.resize() })
      } catch {
        if (!cancelled) setFailed(true)
      }
    })()
    return () => {
      cancelled = true
      roRef.current?.disconnect(); roRef.current = null
      mapRef.current?.remove(); mapRef.current = null
    }
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
      if (!picker) {
        if (p.title || p.meta || p.href) {
          const popup = new ml.Popup({ offset: 24, closeButton: false }).setDOMContent(buildPopupContent(p))
          marker.setPopup(popup)
        } else if (onPinClick && p.id) {
          const el = marker.getElement()
          el.style.cursor = 'pointer'
          el.addEventListener('click', () => onPinClick(p.id!))
        }
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
