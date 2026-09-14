import * as Sentry from '@sentry/nextjs'

// Fehler-Monitoring im Browser. Läuft vor der React-Hydration — genau
// richtig, um auch sehr frühe Client-Fehler einzufangen.
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  sendDefaultPii: false,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  debug: false,
})

// Damit ein hängender/fehlschlagender Seitenwechsel als Breadcrumb auftaucht.
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart
