'use client' // Error-Boundaries müssen Client Components sein

import { useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'

// Letzte Auffangebene: greift nur, wenn selbst das Root-Layout abstürzt.
// Ersetzt dabei das gesamte Layout — deshalb eigene <html>/<body>-Tags und
// bewusst ohne Abhängigkeit von CityProvider & Co., die genau hier gerade
// gescheitert sein könnten.
export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html lang="de">
      <body style={{ margin: 0, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <main
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f9fafb',
            padding: '24px',
          }}
        >
          <div
            style={{
              maxWidth: '420px',
              textAlign: 'center',
              background: '#fff',
              border: '1px solid #f3f4f6',
              borderRadius: '16px',
              padding: '32px 28px',
            }}
          >
            <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', margin: '0 0 8px' }}>
              Etwas ist schiefgelaufen
            </h1>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 20px', lineHeight: 1.5 }}>
              Der Fehler wurde automatisch gemeldet. Versuch es gerne noch einmal.
            </p>
            <button
              onClick={() => unstable_retry()}
              style={{
                background: '#2563eb',
                color: '#fff',
                border: 'none',
                borderRadius: '10px',
                padding: '10px 20px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Erneut versuchen
            </button>
          </div>
        </main>
      </body>
    </html>
  )
}
