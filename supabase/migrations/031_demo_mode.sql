-- ─────────────────────────────────────────
-- Demo-Modus für Vertriebs-Instanzen
--
-- Städte mit status = 'demo' (z. B. Musterstadt) werden an Kommunen und
-- Mandatsträger:innen verschickt, damit sie das Produkt ansehen können.
-- Die Zielgruppe dort will NICHT mitmachen, sondern BEWERTEN — deshalb:
--   • keine Anmeldung/Registrierung (sonst Hürde + Karteileichen)
--   • dauerhafter Hinweis, dass es sich um ein Beispiel handelt
--
-- Dafür muss die öffentliche Stadt-Auflösung den Demo-Status mitliefern.
-- Weiterhin werden KEINE Vertriebsdaten (contact_email, roher status)
-- herausgegeben — nur das abgeleitete Kennzeichen is_demo.
-- ─────────────────────────────────────────

DROP FUNCTION IF EXISTS public.city_by_host(text, text);

CREATE OR REPLACE FUNCTION public.city_by_host(p_slug text, p_domain text DEFAULT NULL)
RETURNS TABLE (
  id uuid, slug text, name text, brand_name text, logo_url text,
  primary_color text, show_powered_by boolean, is_demo boolean
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT
    c.id, c.slug, c.name, c.brand_name, c.logo_url, c.primary_color,
    c.show_powered_by,
    (c.status = 'demo') AS is_demo
  FROM cities c
  WHERE c.status <> 'beendet'
    AND (c.slug = p_slug OR (p_domain IS NOT NULL AND c.custom_domain = p_domain))
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.city_by_host(text, text) FROM public;
GRANT EXECUTE ON FUNCTION public.city_by_host(text, text) TO anon, authenticated;
