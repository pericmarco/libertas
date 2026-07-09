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

// Backstop gegen zu viele DOM-Marker: darüber wird die Karte auf älteren
// Handys spürbar zäh. Die Aufrufer limitieren ihre Abfragen bereits (≤200);
// greift dieses Limit, fehlen die ältesten Pins zuerst.
const MAX_DISPLAY_PINS = 400

type Props = {
  className?: string
  center?: LngLat
  zoom?: number
  /** false = statische Vorschau (kein Zoom/Pan, keine Zoom-Buttons) */
  interactive?: boolean
  /** Karte in scrollbaren Seiten: 1 Finger scrollt die Seite, 2 Finger bewegen die Karte */
  cooperative?: boolean
  /** „Mein Standort"-Button anzeigen (nur bei interaktiven Karten sinnvoll) */
  geolocate?: boolean
  /** Kartenausschnitt einmalig auf alle Pins einpassen (ab 2 Pins) */
  fit?: boolean
  // Anzeige-Modus. Im Picker-Modus zusätzlich als Kontext-Pins gerendert
  // (z. B. bereits gemeldete Mängel), nicht als Auswahl.
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
  cooperative = false,
  geolocate = false,
  fit = false,
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
  const readyRef = useRef(false)
  const fittedRef = useRef(false)
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
          cooperativeGestures: cooperative,
          locale: {
            'CooperativeGesturesHandler.WindowsHelpText': 'Zum Zoomen Strg + Scrollen verwenden',
            'CooperativeGesturesHandler.MacHelpText': 'Zum Zoomen ⌘ + Scrollen verwenden',
            'CooperativeGesturesHandler.MobileHelpText': 'Karte mit zwei Fingern bewegen',
          },
        })
        map.addControl(new ml.AttributionControl({ compact: true, customAttribution: ATTRIBUTION }), 'bottom-right')
        if (interactive) map.addControl(new ml.NavigationControl({ showCompass: false }), 'top-right')
        if (interactive && geolocate) {
          map.addControl(new ml.GeolocateControl({
            positionOptions: { enableHighAccuracy: true },
            showUserLocation: true,
          }), 'top-right')
        }
        if (pickerRef.current) {
          map.on('click', (e) => {
            const p = { lng: e.lngLat.lng, lat: e.lngLat.lat }
            const cur = valueRef.current ?? []
            const next = maxRef.current <= 1 ? [p] : [...cur, p].slice(-maxRef.current)
            onChangeRef.current?.(next)
          })
        }
        mapRef.current = map
        map.on('load', () => { if (!cancelled) { readyRef.current = true; setReady(true); map.resize() } })
        // Nur harte Fehler vor dem ersten Rendern (Style nicht ladbar) werfen
        // die Karte auf den Fallback. Einzelne Kachel-Fehler danach — etwa
        // eine fehlende Kachel bei hohem Zoom oder ein kurzer Netz-Aussetzer —
        // dürfen die bereits sichtbare Karte nicht abräumen.
        map.on('error', () => {
          if (!cancelled && !readyRef.current && !map.isStyleLoaded()) setFailed(true)
        })
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

  // Marker mit den Daten synchronisieren. Anzeige-Pins (`pins`) werden auch
  // im Picker-Modus gerendert — als Kontext (z. B. bereits gemeldete Mängel)
  // mit Popup, aber ohne Einfluss auf die Auswahl.
  useEffect(() => {
    const ml = mlRef.current
    const map = mapRef.current
    if (!ml || !map || !ready) return
    markersRef.current.forEach(m => m.remove())
    markersRef.current = []

    const display: MapPin[] = (pins ?? []).slice(0, MAX_DISPLAY_PINS)
    const selection: MapPin[] = picker ? (value ?? []) : []

    for (const p of display) {
      const marker = new ml.Marker({ color: p.color ?? '#2563EB' })
        .setLngLat([p.lng, p.lat])
        .addTo(map)
      if (p.title || p.meta || p.href) {
        const popup = new ml.Popup({ offset: 24, closeButton: false }).setDOMContent(buildPopupContent(p))
        marker.setPopup(popup)
      } else if (!picker && onPinClick && p.id) {
        const el = marker.getElement()
        el.style.cursor = 'pointer'
        el.addEventListener('click', () => onPinClick(p.id!))
      }
      markersRef.current.push(marker)
    }
    for (const p of selection) {
      markersRef.current.push(
        new ml.Marker({ color: p.color ?? '#2563EB' }).setLngLat([p.lng, p.lat]).addTo(map)
      )
    }

    // Ausschnitt einmalig auf alle Pins einpassen (z. B. mehrere Orte auf
    // der Detailseite) — danach nicht mehr, damit Nutzer-Zoom erhalten bleibt.
    if (fit && !fittedRef.current) {
      const all = [...display, ...selection]
      if (all.length >= 2) {
        const bounds = new ml.LngLatBounds()
        for (const p of all) bounds.extend([p.lng, p.lat])
        map.fitBounds(bounds, { padding: 56, maxZoom: 16, animate: false })
        fittedRef.current = true
      }
    }
  }, [ready, picker, pins, value, onPinClick, fit])

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
