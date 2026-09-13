import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { parseHost, productForSlug } from '@/lib/city/host'

// Pfade, die auf einem Kommunal-Host NICHT nach /kommune umgeschrieben werden:
// geteilte Auth-/Rechts-/Asset-/API-Routen und der Kommunal-Baum selbst.
const NO_MUNI_REWRITE = [
  '/kommune', '/api', '/auth', '/_next', '/login', '/register',
  '/passwort-vergessen', '/passwort-neu', '/impressum', '/datenschutz',
  '/manifest', '/icon', '/apple-icon', '/robots', '/sitemap', '/favicon',
]

function shouldRewriteToKommune(pathname: string): boolean {
  if (pathname.includes('.')) return false // Dateien (Assets) nie umschreiben
  return !NO_MUNI_REWRITE.some(p => pathname === p || pathname.startsWith(p + '/'))
}

const PUBLIC_PATHS = [
  '/', '/login', '/register', '/passwort-vergessen', '/impressum', '/datenschutz',
  // Info- und Rechtsseiten: müssen ohne Anmeldung lesbar sein. Die
  // Barrierefreiheitserklärung verlangt das nach BITV 2.0 sogar ausdrücklich.
  '/nutzungsbedingungen', '/community-richtlinien', '/barrierefreiheit', '/hilfe',
  // Öffentliche Lese-Ansicht (ohne Login): Dashboard-Überblick,
  // Forderungsübersicht + Stadtumfragen. Mitmachen (Position, Unterstützen,
  // Abstimmen, Einreichen) erfordert weiter eine Anmeldung; die Seiten
  // selbst leiten dann zur Registrierung.
  '/dashboard', '/forderungen', '/abstimmungen', '/politiker', '/beteiligungen',
  // Neue Hauptnavigation (öffentlich lesbar wie oben): Feed, Karte, Mitmachen, Stadt
  '/feed', '/karte', '/mitmachen', '/ueberblick', '/events', '/politik-kompass',
  // PWA-Assets müssen ohne Login ladbar sein
  '/manifest.webmanifest', '/icon', '/apple-icon',
]

function isPublicPath(pathname: string) {
  if (PUBLIC_PATHS.includes(pathname) || pathname.startsWith('/auth/callback')) return true
  // Forderungs-Detailseiten sind öffentlich lesbar — aber NICHT das
  // Einreichungsformular (/forderungen/neu), das eine Anmeldung braucht.
  if (pathname.startsWith('/forderungen/') && pathname !== '/forderungen/neu' && !pathname.endsWith('/bearbeiten')) return true
  // Beteiligungsverfahren: Liste + Detail öffentlich, Anlegen (/neu) nur angemeldet
  if (pathname.startsWith('/beteiligungen/') && pathname !== '/beteiligungen/neu') return true
  // Frontend-only Demo-Profile (Partei + Politiker) — ohne Login teilbar (Marketing)
  if (pathname.startsWith('/politiker/beispiel')) return true
  // Politiker-Verzeichnis + Detailseiten sind öffentlich lesbar — aber NICHT
  // die Selbstverwaltung (/politiker/mein-profil), die eine Anmeldung braucht.
  if (pathname.startsWith('/politiker/') && pathname !== '/politiker/mein-profil') return true
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

  // ── Kommunal-Host (z. B. musterstadt.lybertas.de): eigener Route-Tree ──
  // Nur für 'municipal'-Städte aktiv → Netzwerk-Hosts (app.lybertas.de/Köln)
  // laufen komplett unverändert durch den bestehenden Zweig darunter.
  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host')
  const { slug } = parseHost(host)
  if (productForSlug(slug) === 'municipal') {
    const pathname = request.nextUrl.pathname
    if (shouldRewriteToKommune(pathname)) {
      const rewriteUrl = request.nextUrl.clone()
      rewriteUrl.pathname = '/kommune' + (pathname === '/' ? '' : pathname)
      const res = NextResponse.rewrite(rewriteUrl, { request })
      // Aufgefrischte Auth-Cookies mitnehmen.
      supabaseResponse.cookies.getAll().forEach(c => res.cookies.set(c))
      return res
    }
    // Geteilte Pfade (Login/Impressum/Assets) laufen normal; die Kommunal-Demo
    // ist öffentlich, daher hier keine Login-Umleitung.
    return supabaseResponse
  }

  if (!user && !isPublicPath(request.nextUrl.pathname)) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    loginUrl.search = ''
    return NextResponse.redirect(loginUrl)
  }

  return supabaseResponse
}
