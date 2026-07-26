-- ─────────────────────────────────────────
-- Fix zu 023: öffentliche Politiker-Liste über SECURITY-DEFINER-Funktion
--
-- Problem: Die View `politicians_public` (security_invoker=false) läuft mit
-- den Rechten ihres Owners — der auf Supabase aber weiterhin der RLS der
-- Basistabelle unterliegt. Da die Basistabelle seit 023 nur noch den EIGENEN
-- Eintrag bzw. Admins lesen lässt, gab die View für anonyme Besucher 0 Zeilen
-- zurück (das Verzeichnis blieb leer).
--
-- Lösung: Statt einer View eine SECURITY-DEFINER-Funktion — genau das Muster,
-- mit dem is_admin() & Co. hier zuverlässig die RLS umgehen. Die Funktion
-- maskiert E-Mail/Telefon weiterhin, solange contact_public=false ist. Sie ist
-- STABLE, daher lässt sie sich per PostgREST wie eine Tabelle filtern/sortieren
-- (.rpc('politicians_public').eq('slug', …), .order(…) …).
-- ─────────────────────────────────────────

DROP VIEW IF EXISTS public.politicians_public;

CREATE OR REPLACE FUNCTION public.politicians_public()
RETURNS TABLE (
  id             uuid,
  slug           text,
  name           text,
  party          text,
  role           text,
  constituency   text,
  district_id    uuid,
  topics         text[],
  bio            text,
  email          text,
  phone          text,
  website        text,
  contact_public boolean,
  verified       boolean,
  response_rate  integer,
  avatar_url     text,
  claimed_by     uuid,
  updated_at     timestamptz
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT
    id, slug, name, party, role, constituency, district_id, topics, bio,
    CASE WHEN contact_public THEN email END AS email,
    CASE WHEN contact_public THEN phone END AS phone,
    website, contact_public, verified, response_rate, avatar_url, claimed_by, updated_at
  FROM politicians;
$$;

REVOKE ALL ON FUNCTION public.politicians_public() FROM public;
GRANT EXECUTE ON FUNCTION public.politicians_public() TO anon, authenticated;
