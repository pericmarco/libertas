import type { NextConfig } from "next";

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

export default nextConfig;
