import * as Sentry from '@sentry/nextjs'

// Serverseitiges Fehler-Monitoring. Nur aktiv, wenn NEXT_PUBLIC_SENTRY_DSN
// gesetzt ist — ohne DSN wird init() zum No-op, nichts sendet, nichts bricht.
// Der DSN ist bewusst NEXT_PUBLIC (wie der Supabase-Key): keine Geheimzahl,
// sondern eine Zieladresse — dieselbe Variable läuft auch im Client
// (instrumentation-client.ts) und im Edge-Runtime (sentry.edge.config.ts).
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Datenschutz: keine IP-Adressen, Cookies oder Request-Header automatisch
  // mitschicken. Diese Plattform verarbeitet echte Namen und Kontaktdaten —
  // die dürfen nicht unbemerkt in einem Drittanbieter-Tool landen.
  sendDefaultPii: false,

  // Sparsam samplen, damit der kostenlose Plan lange reicht.
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Im Build-Log nicht nach jedem Request loggen.
  debug: false,
})
