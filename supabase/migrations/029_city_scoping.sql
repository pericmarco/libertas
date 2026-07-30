-- ─────────────────────────────────────────
-- Multi-City Schritt 4: Stadt-Zuordnung erzwingen + Verzeichnis pro Stadt
--
-- Grundsatz: Die Stadt eines neuen Inhalts wird IMMER serverseitig gesetzt —
-- aus dem Profil der/des Erstellenden. Eine Client-Angabe wird verworfen.
-- Damit kann niemand Inhalte in eine fremde Stadt schreiben, auch nicht durch
-- direkte API-Aufrufe. (Die Subdomain taugt dafür nicht: die kann ein Browser
-- behaupten — die Profil-Zugehörigkeit kommt aus der Datenbank.)
--
-- Ausnahme: Admins dürfen die Stadt bewusst explizit angeben (z. B. um einen
-- Politiker-Eintrag für eine andere Stadt anzulegen).
-- ─────────────────────────────────────────

-- 1) Stadt automatisch bestimmen -------------------------------------------
CREATE OR REPLACE FUNCTION public.set_city_id_from_context()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_city uuid;
BEGIN
  -- Eine ausdrücklich gesetzte Stadt wird akzeptiert von Admins sowie bei
  -- Stammdatenpflege ohne Anmeldung (SQL-Editor/Service-Role). Normale
  -- Nutzer:innen können die Stadt damit NICHT selbst bestimmen — für sie
  -- greift immer die Ableitung unten.
  IF NEW.city_id IS NOT NULL AND (auth.uid() IS NULL OR is_admin()) THEN
    RETURN NEW;
  END IF;

  -- 1. Stadt der/des Erstellenden
  SELECT city_id INTO v_city FROM profiles WHERE id = auth.uid();

  -- 2. sonst über den gewählten Stadtteil
  IF v_city IS NULL AND jsonb_exists(to_jsonb(NEW), 'district_id') THEN
    SELECT d.city_id INTO v_city
    FROM districts d
    WHERE d.id = (to_jsonb(NEW)->>'district_id')::uuid;
  END IF;

  -- 3. sonst Standardstadt (damit nie eine Zeile ohne Stadt entsteht)
  IF v_city IS NULL THEN
    SELECT id INTO v_city FROM cities ORDER BY created_at LIMIT 1;
  END IF;

  NEW.city_id := v_city;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS demands_set_city     ON demands;
DROP TRIGGER IF EXISTS votes_set_city       ON votes;
DROP TRIGGER IF EXISTS politicians_set_city ON politicians;
DROP TRIGGER IF EXISTS topics_set_city      ON topics;

CREATE TRIGGER demands_set_city     BEFORE INSERT ON demands
  FOR EACH ROW EXECUTE FUNCTION public.set_city_id_from_context();
CREATE TRIGGER votes_set_city       BEFORE INSERT ON votes
  FOR EACH ROW EXECUTE FUNCTION public.set_city_id_from_context();
CREATE TRIGGER politicians_set_city BEFORE INSERT ON politicians
  FOR EACH ROW EXECUTE FUNCTION public.set_city_id_from_context();
CREATE TRIGGER topics_set_city      BEFORE INSERT ON topics
  FOR EACH ROW EXECUTE FUNCTION public.set_city_id_from_context();

-- 2) Neue Konten bekommen ihre Stadt ---------------------------------------
--    Die Stadt kommt aus der Subdomain, auf der registriert wurde
--    (Metadatum city_slug); fehlt sie, gilt die Standardstadt.
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_consent_at      timestamptz := CASE
    WHEN NEW.raw_user_meta_data->>'terms_accepted' = 'true' THEN now()
    ELSE NULL
  END;
  v_consent_version text := NULLIF(NEW.raw_user_meta_data->>'consent_version', '');
  v_city            uuid;
BEGIN
  SELECT id INTO v_city FROM cities
   WHERE slug = NULLIF(NEW.raw_user_meta_data->>'city_slug', '');
  IF v_city IS NULL THEN
    SELECT id INTO v_city FROM cities ORDER BY created_at LIMIT 1;
  END IF;

  BEGIN
    INSERT INTO public.profiles (id, full_name, username, district_id, city_id, consent_at, consent_version)
    VALUES (
      NEW.id,
      NEW.raw_user_meta_data->>'full_name',
      NULLIF(NEW.raw_user_meta_data->>'username', ''),
      NULLIF(NEW.raw_user_meta_data->>'district_id', '')::uuid,
      v_city,
      v_consent_at,
      v_consent_version
    )
    ON CONFLICT (id) DO NOTHING;
  EXCEPTION WHEN unique_violation OR check_violation THEN
    INSERT INTO public.profiles (id, full_name, district_id, city_id, consent_at, consent_version)
    VALUES (
      NEW.id,
      NEW.raw_user_meta_data->>'full_name',
      NULLIF(NEW.raw_user_meta_data->>'district_id', '')::uuid,
      v_city,
      v_consent_at,
      v_consent_version
    )
    ON CONFLICT (id) DO NOTHING;
  END;
  RETURN NEW;
END;
$$;

-- 3) Politiker-Verzeichnis pro Stadt ---------------------------------------
--    Die alte, parameterlose Fassung muss weg, sonst wäre der Aufruf
--    mehrdeutig (Funktions-Überladung).
DROP FUNCTION IF EXISTS public.politicians_public();

CREATE OR REPLACE FUNCTION public.politicians_public(p_city_id uuid DEFAULT NULL)
RETURNS TABLE (
  id             uuid,
  slug           text,
  name           text,
  party          text,
  role           text,
  constituency   text,
  district_id    uuid,
  city_id        uuid,
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
    p.id, p.slug, p.name, p.party, p.role, p.constituency, p.district_id, p.city_id,
    p.topics, p.bio,
    CASE WHEN p.contact_public THEN p.email END,
    CASE WHEN p.contact_public THEN p.phone END,
    p.website, p.contact_public, p.verified, p.response_rate, p.avatar_url,
    p.claimed_by, p.updated_at
  FROM politicians p
  WHERE p_city_id IS NULL OR p.city_id = p_city_id;
$$;

REVOKE ALL ON FUNCTION public.politicians_public(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.politicians_public(uuid) TO anon, authenticated;
