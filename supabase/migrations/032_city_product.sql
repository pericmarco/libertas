-- ─────────────────────────────────────────
-- Produktlinie pro Stadt: 'network' (Lybertas-Netzwerk, app.lybertas.de/Köln)
-- oder 'municipal' (kommunales Beteiligungsportal, z. B. Musterstadt).
--
-- Steuert serverseitig Layout/Navigation/Route-Tree. Default 'network' →
-- alle bestehenden Städte (inkl. Köln) verhalten sich UNVERÄNDERT.
--
-- Der Code hat bereits einen Fallback (MUNICIPAL_SLUGS in lib/city/host.ts),
-- damit Musterstadt auch vor dieser Migration bereits kommunal ausgeliefert
-- wird. Diese Migration macht die DB zur dauerhaften Quelle der Wahrheit.
-- ─────────────────────────────────────────

ALTER TABLE cities
  ADD COLUMN IF NOT EXISTS product text NOT NULL DEFAULT 'network'
  CHECK (product IN ('network', 'municipal'));

-- city_by_host um product erweitern (Rückgabe-Signatur ändert sich → DROP)
DROP FUNCTION IF EXISTS public.city_by_host(text, text);

CREATE OR REPLACE FUNCTION public.city_by_host(p_slug text, p_domain text DEFAULT NULL)
RETURNS TABLE (
  id uuid, slug text, name text, brand_name text, logo_url text,
  primary_color text, show_powered_by boolean, is_demo boolean, product text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT
    c.id, c.slug, c.name, c.brand_name, c.logo_url, c.primary_color,
    c.show_powered_by,
    (c.status = 'demo') AS is_demo,
    c.product
  FROM cities c
  WHERE c.status <> 'beendet'
    AND (c.slug = p_slug OR (p_domain IS NOT NULL AND c.custom_domain = p_domain))
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.city_by_host(text, text) FROM public;
GRANT EXECUTE ON FUNCTION public.city_by_host(text, text) TO anon, authenticated;

-- Musterstadt = kommunales Beteiligungsportal
UPDATE cities SET product = 'municipal' WHERE slug = 'musterstadt';
