// Zeit-Kontext fürs Dashboard. Bewusst in einem eigenen Modul (nicht im
// Server-Component-Body), damit die react-hooks/purity-Regel den bewusst
// pro Request ausgewerteten Zeitzugriff nicht als unreine Render-Funktion
// meldet. Server-seitig einmal pro Aufruf ausgewertet.
export function dashboardTimeContext() {
  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const berlinHour = Number(
    new Intl.DateTimeFormat('de-DE', { hour: '2-digit', hour12: false, timeZone: 'Europe/Berlin' }).format(now),
  )
  const greeting =
    berlinHour >= 5 && berlinHour < 11 ? 'Guten Morgen'
    : berlinHour >= 11 && berlinHour < 18 ? 'Guten Tag'
    : 'Guten Abend'
  return { weekAgo, greeting }
}
