import * as Sentry from '@sentry/nextjs'

// Fehler-Monitoring im Edge-Runtime (u. a. proxy.ts / lib/supabase/middleware.ts
// laufen dort). Gleiche Grundsätze wie sentry.server.config.ts.
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  sendDefaultPii: false,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  debug: false,
})
