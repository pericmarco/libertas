import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PUBLIC_PATHS = [
  '/', '/login', '/register', '/impressum', '/datenschutz',
  // Öffentliche Lese-Ansicht (ohne Login): Dashboard-Überblick,
  // Forderungsübersicht + Stadtumfragen. Mitmachen (Position, Unterstützen,
  // Abstimmen, Einreichen) erfordert weiter eine Anmeldung; die Seiten
  // selbst leiten dann zur Registrierung.
  '/dashboard', '/forderungen', '/abstimmungen',
  // PWA-Assets müssen ohne Login ladbar sein
  '/manifest.webmanifest', '/icon', '/apple-icon',
]

function isPublicPath(pathname: string) {
  if (PUBLIC_PATHS.includes(pathname) || pathname.startsWith('/auth/callback')) return true
  // Forderungs-Detailseiten sind öffentlich lesbar — aber NICHT das
  // Einreichungsformular (/forderungen/neu), das eine Anmeldung braucht.
  if (pathname.startsWith('/forderungen/') && pathname !== '/forderungen/neu') return true
  // Frontend-only Demo-Profile (Partei + Politiker) — ohne Login teilbar (Marketing)
  if (pathname.startsWith('/politiker/beispiel')) return true
  return false
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Fail closed: if config is missing or the auth check itself errors, treat
  // the request as unauthenticated (denies protected paths) rather than
  // skipping the check and letting everything through. Public paths are
  // unaffected either way, so this can't reintroduce a site-wide crash.
  let user = null
  if (!url || !key) {
    console.error('Supabase env vars missing in proxy — treating all requests as unauthenticated')
  } else {
    try {
      const supabase = createServerClient(url, key, {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
            supabaseResponse = NextResponse.next({ request })
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            )
          },
        },
      })

      // Do not run any logic between createServerClient and getUser — this call
      // refreshes the auth session cookie when the access token has expired.
      user = (await supabase.auth.getUser()).data.user
    } catch (err) {
      console.error('Proxy auth check failed, treating as unauthenticated:', err)
    }
  }

  if (!user && !isPublicPath(request.nextUrl.pathname)) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    loginUrl.search = ''
    return NextResponse.redirect(loginUrl)
  }

  return supabaseResponse
}
