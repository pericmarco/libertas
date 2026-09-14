import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs/config";

// Sicherheits-Header für alle Antworten. Bewusst ohne strenge Content-Security-
// Policy — die müsste erst gegen Karte (MapLibre/basemap.de), Supabase und
// Vercel-Analytics getestet werden, sonst bricht sie Funktionen. HSTS setzt
// Vercel bereits selbst.
const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },                       // kein Einbetten in fremde iframes (Clickjacking)
  { key: "X-Content-Type-Options", value: "nosniff" },             // kein MIME-Sniffing
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self)" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

// Bündelt Source-Maps zu Sentry hoch (nur wirksam mit SENTRY_AUTH_TOKEN in
// Vercel — ohne Token übersprungen, der Build bricht deshalb nie ab). org/
// project sind unkritisch, solange kein Upload passiert.
export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: true,
  // Kein Tunnel-Route (Ad-Blocker-Umgehung) und kein automatisches
  // Vercel-Cron-Monitoring — beides unnötige Komplexität für den Start.
  widenClientFileUpload: false,
  webpack: {
    treeshake: { removeDebugLogging: true },
    automaticVercelMonitors: false,
  },
});
