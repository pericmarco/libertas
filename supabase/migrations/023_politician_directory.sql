-- ─────────────────────────────────────────
-- Politiker Phase B: öffentliches Verzeichnis + Selbstverwaltung
--
-- Ausgangslage:
--   • `politicians` war bisher eine reine Anzeige-/Seed-Tabelle (Name, Partei,
--     Funktion, Themen, Reaktionsquote) — öffentlich lesbar, aber ohne
--     Detailinhalt und ohne Verbindung zu einem echten Konto.
--   • `profiles` mit role='politician' + politician_verified ist der Account,
--     der offiziell auf Forderungen antworten darf (Migration 021).
--
-- Ziel dieses Schritts (mit Marco abgestimmt):
--   Das Verzeichnis wird zum pflegbaren "Repository". Das Lybertas-Team legt
--   aus den per E-Mail zugesandten Infos einen Eintrag an. Meldet sich der/die
--   Mandatsträger:in später mit genau der hinterlegten E-Mail an, kann er/sie
--   den eigenen Eintrag ÜBERNEHMEN und selbst aktuell halten — ohne dass das
--   Team jede Änderung von Hand einpflegt.
--
-- Sicherheitsprinzip:
--   • Öffentlich ist NUR das Lesen.
--   • Anlegen/Löschen: ausschließlich Admin.
--   • Bearbeiten: der/die Eigentümer:in (claimed_by = auth.uid()) ODER Admin.
--   • Vertrauensfelder (verified, response_rate, claimed_by) kann NUR ein Admin
--     ändern — ein Politiker darf sich weder selbst verifizieren noch seine
--     Reaktionsquote schönen (per Trigger erzwungen).
-- ─────────────────────────────────────────

-- 1) Verzeichnis-Felder ergänzen ---------------------------------------------
ALTER TABLE politicians
  ADD COLUMN IF NOT EXISTS slug           text,
  ADD COLUMN IF NOT EXISTS bio            text,
  ADD COLUMN IF NOT EXISTS email          text,
  ADD COLUMN IF NOT EXISTS phone          text,
  ADD COLUMN IF NOT EXISTS website        text,
  ADD COLUMN IF NOT EXISTS constituency   text,          -- Gremium / Wahlkreis
  ADD COLUMN IF NOT EXISTS contact_public boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS verified       boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS claimed_by     uuid REFERENCES profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS updated_at     timestamptz NOT NULL DEFAULT now();

-- 2) Slug-Erzeugung ----------------------------------------------------------
--    Aus dem Namen einen URL-tauglichen, eindeutigen Slug bauen
--    ("Sarah Müller" → "sarah-mueller", bei Kollision "-2", "-3", …).
CREATE OR REPLACE FUNCTION public.politician_slugify(p_name text)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  base text;
BEGIN
  base := lower(coalesce(p_name, ''));
  base := replace(base, 'ß', 'ss');
  base := translate(base, 'äöüàáâãéèêëíìîïóòôõúùûñç', 'aouaaaaeeeeiiiioooouuunc');
  base := regexp_replace(base, '[^a-z0-9]+', '-', 'g');
  base := btrim(base, '-');
  IF base = '' THEN base := 'politiker'; END IF;
  RETURN base;
END;
$$;

CREATE OR REPLACE FUNCTION public.politician_unique_slug(p_name text, p_id uuid)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  base      text := public.politician_slugify(p_name);
  candidate text := base;
  n         integer := 1;
BEGIN
  WHILE EXISTS (
    SELECT 1 FROM politicians
    WHERE slug = candidate AND (p_id IS NULL OR id <> p_id)
  ) LOOP
    n := n + 1;
    candidate := base || '-' || n;
  END LOOP;
  RETURN candidate;
END;
$$;

-- 3) Backfill für bestehende Zeilen -----------------------------------------
UPDATE politicians
   SET slug = public.politician_unique_slug(name, id)
 WHERE slug IS NULL OR slug = '';

-- Ab jetzt eindeutig erzwingen.
CREATE UNIQUE INDEX IF NOT EXISTS politicians_slug_key ON politicians (slug);
CREATE INDEX IF NOT EXISTS politicians_claimed_by_idx ON politicians (claimed_by);

-- 4) Trigger: Slug beim Insert füllen, updated_at pflegen --------------------
CREATE OR REPLACE FUNCTION public.politicians_set_defaults()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.slug IS NULL OR btrim(NEW.slug) = '' THEN
    NEW.slug := public.politician_unique_slug(NEW.name, NEW.id);
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS politicians_set_defaults_ins ON politicians;
CREATE TRIGGER politicians_set_defaults_ins
  BEFORE INSERT ON politicians
  FOR EACH ROW EXECUTE FUNCTION public.politicians_set_defaults();

-- 5) Trigger: Vertrauensfelder schützen + updated_at bei Update --------------
--    Nur ein Admin darf verified / response_rate / claimed_by setzen. Für alle
--    anderen (auch für den/die Eigentümer:in beim Selbst-Bearbeiten) werden
--    diese Felder auf den alten Wert zurückgesetzt.
CREATE OR REPLACE FUNCTION public.politicians_guard_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT is_admin() THEN
    NEW.verified      := OLD.verified;
    NEW.response_rate := OLD.response_rate;
    NEW.claimed_by    := OLD.claimed_by;
  END IF;
  IF NEW.slug IS NULL OR btrim(NEW.slug) = '' THEN
    NEW.slug := OLD.slug;
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS politicians_guard_update_trg ON politicians;
CREATE TRIGGER politicians_guard_update_trg
  BEFORE UPDATE ON politicians
  FOR EACH ROW EXECUTE FUNCTION public.politicians_guard_update();

-- 6) RLS + Datenschutz für Kontaktfelder -------------------------------------
--    Bisher gab die Basistabelle ALLES öffentlich heraus (Policy "Öffentlich
--    lesbar", USING true) — damit wären auch E-Mail/Telefon eines Eintrags
--    für jeden lesbar, selbst wenn der/die Politiker:in das nicht möchte.
--
--    Neues Modell:
--      • Öffentlich gelesen wird NUR über die View `politicians_public`, die
--        E-Mail und Telefon ausblendet, solange contact_public = false ist.
--      • Die Basistabelle darf man direkt nur noch für den EIGENEN Eintrag
--        (claimed_by = auth.uid()) oder als Admin lesen — nötig fürs
--        Selbst-Bearbeiten (dort braucht man die echten Kontaktdaten).
ALTER TABLE politicians ENABLE ROW LEVEL SECURITY;

-- Alte, zu weite öffentliche SELECT-Policy(s) entfernen.
DO $$
DECLARE pol record;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'politicians' AND cmd = 'SELECT'
  LOOP
    EXECUTE format('DROP POLICY %I ON public.politicians', pol.policyname);
  END LOOP;
END $$;

DROP POLICY IF EXISTS "Eigener Eintrag oder Admin lesbar" ON politicians;
CREATE POLICY "Eigener Eintrag oder Admin lesbar" ON politicians
  FOR SELECT TO authenticated
  USING (claimed_by = auth.uid() OR is_admin());

DROP POLICY IF EXISTS "Admin legt Politiker an" ON politicians;
CREATE POLICY "Admin legt Politiker an" ON politicians
  FOR INSERT TO authenticated
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Eigentümer oder Admin bearbeitet" ON politicians;
CREATE POLICY "Eigentümer oder Admin bearbeitet" ON politicians
  FOR UPDATE TO authenticated
  USING (claimed_by = auth.uid() OR is_admin())
  WITH CHECK (claimed_by = auth.uid() OR is_admin());

DROP POLICY IF EXISTS "Admin löscht Politiker" ON politicians;
CREATE POLICY "Admin löscht Politiker" ON politicians
  FOR DELETE TO authenticated
  USING (is_admin());

-- Anon soll die Basistabelle gar nicht mehr direkt treffen (Lesen nur via View).
REVOKE SELECT ON public.politicians FROM anon;

-- Öffentliche Lese-View: maskiert persönliche Kontaktdaten.
--    security_invoker=false → läuft mit Rechten des Owners und umgeht damit
--    die (jetzt enge) RLS der Basistabelle; die Maskierung passiert hier.
DROP VIEW IF EXISTS public.politicians_public;
CREATE VIEW public.politicians_public
WITH (security_invoker = false) AS
  SELECT
    id, slug, name, party, role, constituency, district_id, topics, bio,
    CASE WHEN contact_public THEN email END AS email,
    CASE WHEN contact_public THEN phone END AS phone,
    website,                       -- eine Website ist ohnehin öffentlich
    contact_public, verified, response_rate, avatar_url, claimed_by, updated_at
  FROM public.politicians;

GRANT SELECT ON public.politicians_public TO anon, authenticated;

-- 7b) Passenden, noch nicht übernommenen Eintrag zur eigenen E-Mail finden.
--     Gibt höchstens den EINEN Eintrag zurück, dessen hinterlegte E-Mail der
--     Anmelde-E-Mail entspricht — für den "Wir haben einen Eintrag für Sie
--     gefunden"-Hinweis auf der Selbstverwaltungsseite. Kein Fremdzugriff.
CREATE OR REPLACE FUNCTION public.claimable_politician_entry()
RETURNS TABLE (slug text, name text, party text, role text)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT p.slug, p.name, p.party, p.role
  FROM politicians p
  JOIN auth.users u ON u.id = auth.uid()
  WHERE p.claimed_by IS NULL
    AND p.email IS NOT NULL
    AND lower(btrim(p.email)) = lower(btrim(u.email))
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.claimable_politician_entry() FROM public;
GRANT EXECUTE ON FUNCTION public.claimable_politician_entry() TO authenticated;

-- 7) Selbst-Übernahme per E-Mail ---------------------------------------------
--    Der/die angemeldete Nutzer:in kann einen noch nicht übernommenen Eintrag
--    für sich reklamieren, WENN die im Eintrag hinterlegte E-Mail exakt der
--    eigenen Anmelde-E-Mail entspricht. Läuft als SECURITY DEFINER, prüft die
--    Identität aber streng serverseitig — niemand kann einen fremden Eintrag
--    übernehmen.
CREATE OR REPLACE FUNCTION public.claim_politician_entry(p_slug text)
RETURNS TABLE (ok boolean, reason text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid        uuid := auth.uid();
  user_email text;
  entry      politicians%ROWTYPE;
BEGIN
  IF uid IS NULL THEN
    RETURN QUERY SELECT false, 'NOT_AUTHENTICATED'; RETURN;
  END IF;

  SELECT email INTO user_email FROM auth.users WHERE id = uid;

  SELECT * INTO entry FROM politicians WHERE slug = p_slug;
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'NOT_FOUND'; RETURN;
  END IF;

  IF entry.claimed_by IS NOT NULL THEN
    RETURN QUERY SELECT (entry.claimed_by = uid), 'ALREADY_CLAIMED'; RETURN;
  END IF;

  IF entry.email IS NULL OR user_email IS NULL
     OR lower(btrim(entry.email)) <> lower(btrim(user_email)) THEN
    RETURN QUERY SELECT false, 'EMAIL_MISMATCH'; RETURN;
  END IF;

  UPDATE politicians SET claimed_by = uid WHERE id = entry.id;
  RETURN QUERY SELECT true, 'CLAIMED';
END;
$$;

REVOKE ALL ON FUNCTION public.claim_politician_entry(text) FROM public;
GRANT EXECUTE ON FUNCTION public.claim_politician_entry(text) TO authenticated;

-- 8) Verweis für die Detailseite: offizielle Antworten eines Eintrags lassen
--    sich über claimed_by ↔ demand_responses.user_id verknüpfen (bereits
--    öffentlich lesbar aus Migration 021, kein weiterer Schritt nötig).
