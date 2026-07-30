-- ─────────────────────────────────────────
-- Multi-City Schritt 1: Mandanten-Fundament
--
-- Ziel (aus dem Konzept):
--   • Viele Städte in EINER Datenbank / EINEM Vercel-Projekt, sauber getrennt.
--   • Jede Stadt einzeln erreichbar (Subdomain) und später unter EIGENEM Namen
--     vermietbar (White-Label) — ohne Code-Deploy pro Stadt.
--   • Stadt-Daten müssen jederzeit sauber auswertbar und übergebbar sein
--     (das ist unser Verkaufsprodukt) — dafür muss JEDE Zeile ihrer Stadt
--     eindeutig zuordenbar sein.
--
-- Dieser Schritt ist bewusst NICHT-BRECHEND:
--   Es werden nur Tabellen/Spalten ERGÄNZT und mit Köln vorbefüllt. Die App
--   kennt city_id noch nicht und läuft unverändert weiter. RLS-Verschärfung
--   und Subdomain-Routing kommen als eigene Schritte danach.
--
-- Hierarchie ab jetzt:  cities (Kunde)  →  regions (Gebiet)  →  districts
-- ─────────────────────────────────────────

-- 1) Mandanten-Tabelle ------------------------------------------------------
CREATE TABLE IF NOT EXISTS cities (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Adressierung
  slug         text NOT NULL UNIQUE,          -- 'koeln' → koeln.lybertas.de
  name         text NOT NULL,                 -- 'Köln'
  state        text DEFAULT 'Nordrhein-Westfalen',
  population   integer,                       -- für Repräsentativitäts-Vergleiche

  -- White-Label: Auftritt unter dem Namen der Stadt. Alles hier ist Daten,
  -- kein Code — eine neue Stadt ist damit EIN Datensatz, kein Deployment.
  brand_name      text,                       -- z. B. 'Köln entscheidet' (leer = 'Lybertas')
  logo_url        text,
  primary_color   text NOT NULL DEFAULT '#2563EB',
  custom_domain   text UNIQUE,                -- z. B. 'mitreden.koeln' (statt Subdomain)
  show_powered_by boolean NOT NULL DEFAULT true,  -- „powered by Lybertas" ein/aus

  -- Vertrieb & Betrieb
  status       text NOT NULL DEFAULT 'demo'
    CHECK (status IN ('demo','pilot','aktiv','pausiert','beendet')),
  is_listed    boolean NOT NULL DEFAULT true, -- Musterstadt ggf. nicht öffentlich listen
  contact_email text,

  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE cities IS
  'Mandant = eine Stadt/Kommune. Trägt Adressierung (Subdomain/Domain), '
  'White-Label-Branding und den Vertriebsstatus.';

-- 2) Erste Stadt: Köln ------------------------------------------------------
INSERT INTO cities (slug, name, state, status, brand_name)
VALUES ('koeln', 'Köln', 'Nordrhein-Westfalen', 'pilot', NULL)
ON CONFLICT (slug) DO NOTHING;

-- 3) city_id an alle stadt-bezogenen Tabellen -------------------------------
--    Zunächst NULLBAR, damit nichts bricht; direkt danach befüllt.
ALTER TABLE regions     ADD COLUMN IF NOT EXISTS city_id uuid REFERENCES cities(id) ON DELETE RESTRICT;
ALTER TABLE districts   ADD COLUMN IF NOT EXISTS city_id uuid REFERENCES cities(id) ON DELETE RESTRICT;
ALTER TABLE profiles    ADD COLUMN IF NOT EXISTS city_id uuid REFERENCES cities(id) ON DELETE SET NULL;
ALTER TABLE demands     ADD COLUMN IF NOT EXISTS city_id uuid REFERENCES cities(id) ON DELETE RESTRICT;
ALTER TABLE votes       ADD COLUMN IF NOT EXISTS city_id uuid REFERENCES cities(id) ON DELETE RESTRICT;
ALTER TABLE politicians ADD COLUMN IF NOT EXISTS city_id uuid REFERENCES cities(id) ON DELETE RESTRICT;
ALTER TABLE topics      ADD COLUMN IF NOT EXISTS city_id uuid REFERENCES cities(id) ON DELETE RESTRICT;
ALTER TABLE elections   ADD COLUMN IF NOT EXISTS city_id uuid REFERENCES cities(id) ON DELETE RESTRICT;

-- Hinweis: Kind-Tabellen (comments, demand_supports, demand_arguments,
-- demand_responses, demand_moderation, demand_reports, vote_options,
-- vote_responses) hängen eindeutig an ihrem Eltern-Datensatz und erben die
-- Stadt darüber. Sie brauchen keine eigene Spalte — für Auswertung und Export
-- reicht der Join über demand_id bzw. vote_id.

-- 4) Bestandsdaten Köln zuordnen -------------------------------------------
UPDATE regions     SET city_id = (SELECT id FROM cities WHERE slug = 'koeln') WHERE city_id IS NULL;
UPDATE districts   SET city_id = (SELECT id FROM cities WHERE slug = 'koeln') WHERE city_id IS NULL;
UPDATE profiles    SET city_id = (SELECT id FROM cities WHERE slug = 'koeln') WHERE city_id IS NULL;
UPDATE demands     SET city_id = (SELECT id FROM cities WHERE slug = 'koeln') WHERE city_id IS NULL;
UPDATE votes       SET city_id = (SELECT id FROM cities WHERE slug = 'koeln') WHERE city_id IS NULL;
UPDATE politicians SET city_id = (SELECT id FROM cities WHERE slug = 'koeln') WHERE city_id IS NULL;
UPDATE topics      SET city_id = (SELECT id FROM cities WHERE slug = 'koeln') WHERE city_id IS NULL;
UPDATE elections   SET city_id = (SELECT id FROM cities WHERE slug = 'koeln') WHERE city_id IS NULL;

-- 5) Ab jetzt Pflicht (Inhalte ohne Stadt darf es nicht geben) --------------
--    profiles bleibt nullbar: ein frisch registriertes Konto bekommt die
--    Stadt beim Onboarding bzw. über die Subdomain zugewiesen.
ALTER TABLE regions     ALTER COLUMN city_id SET NOT NULL;
ALTER TABLE districts   ALTER COLUMN city_id SET NOT NULL;
ALTER TABLE demands     ALTER COLUMN city_id SET NOT NULL;
ALTER TABLE votes       ALTER COLUMN city_id SET NOT NULL;
ALTER TABLE politicians ALTER COLUMN city_id SET NOT NULL;
ALTER TABLE topics      ALTER COLUMN city_id SET NOT NULL;
ALTER TABLE elections   ALTER COLUMN city_id SET NOT NULL;

-- 6) Indizes — jede Abfrage filtert künftig nach Stadt ----------------------
CREATE INDEX IF NOT EXISTS regions_city_idx     ON regions (city_id);
CREATE INDEX IF NOT EXISTS districts_city_idx   ON districts (city_id);
CREATE INDEX IF NOT EXISTS profiles_city_idx    ON profiles (city_id);
CREATE INDEX IF NOT EXISTS demands_city_idx     ON demands (city_id);
CREATE INDEX IF NOT EXISTS votes_city_idx       ON votes (city_id);
CREATE INDEX IF NOT EXISTS politicians_city_idx ON politicians (city_id);
CREATE INDEX IF NOT EXISTS topics_city_idx      ON topics (city_id);
CREATE INDEX IF NOT EXISTS elections_city_idx   ON elections (city_id);

-- 7) Öffentliche Stadt-Auflösung (für Subdomain → Branding) -----------------
--    Liefert nur das, was der Browser fürs Rendern braucht — keine
--    Vertriebsdaten (contact_email, status) an die Öffentlichkeit.
CREATE OR REPLACE FUNCTION public.city_by_host(p_slug text, p_domain text DEFAULT NULL)
RETURNS TABLE (
  id uuid, slug text, name text, brand_name text, logo_url text,
  primary_color text, show_powered_by boolean
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT c.id, c.slug, c.name, c.brand_name, c.logo_url, c.primary_color, c.show_powered_by
  FROM cities c
  WHERE c.status <> 'beendet'
    AND (c.slug = p_slug OR (p_domain IS NOT NULL AND c.custom_domain = p_domain))
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.city_by_host(text, text) FROM public;
GRANT EXECUTE ON FUNCTION public.city_by_host(text, text) TO anon, authenticated;

-- 8) Stadt des angemeldeten Nutzers ----------------------------------------
--    DER vertrauenswürdige Anker fürs Schreiben und für private Daten:
--    kommt aus der Datenbank, nicht aus einem Client-Header (eine Subdomain
--    kann der Browser behaupten — die Profil-Zugehörigkeit nicht).
CREATE OR REPLACE FUNCTION public.current_city_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT city_id FROM profiles WHERE id = auth.uid();
$$;

-- 9) cities: öffentlich lesbar (Branding), Pflege nur durch Admin -----------
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Städte öffentlich lesbar" ON cities;
CREATE POLICY "Städte öffentlich lesbar" ON cities
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin pflegt Städte" ON cities;
CREATE POLICY "Admin pflegt Städte" ON cities
  FOR ALL TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

-- Vertriebsfelder nicht an die Öffentlichkeit: anon liest Städte
-- ausschließlich über city_by_host().
REVOKE SELECT ON public.cities FROM anon;
