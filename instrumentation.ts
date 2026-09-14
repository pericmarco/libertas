import * as Sentry from '@sentry/nextjs'

// Next.js ruft register() einmal beim Serverstart auf — lädt je nach
// Laufzeitumgebung die passende Sentry-Konfiguration.
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config')
  }
  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config')
  }
}

// Fängt Fehler aus Server Components, Route Handlers, Server Actions und
// dem Proxy — ohne DSN (siehe sentry.server.config.ts) tut das nichts.
export const onRequestError = Sentry.captureRequestError
