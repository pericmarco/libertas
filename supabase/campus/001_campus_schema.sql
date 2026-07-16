-- ═══════════════════════════════════════════════════════════════════
-- LYBERTAS Campus — konsolidiertes Schema (Instanz: Fresenius Campus Köln)
--
-- ⚠️  NUR in der CAMPUS-Supabase ausführen (grvtakhbdrhcjtownthw),
--     NICHT in Köln! Oben im Dashboard das richtige Projekt prüfen.
--
-- Dies ist der zusammengeführte Endstand des Köln-Schemas (schema.sql +
-- 21 Migrationen), bereinigt um Köln-Ballast und mit den Sicherheits-
-- Härtungen (Namensschutz, Selbst-Freischaltungs-Schutz, öffentliche
-- Lese-Policies). Rollen sind generalisiert, sodass Studienservice /
-- Prüfungsamt / Hochschulleitung offiziell antworten können.
--
-- Idempotent genug für einen sauberen ersten Lauf auf leerer DB.
-- ═══════════════════════════════════════════════════════════════════

CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ─────────────── Tabellen ───────────────

CREATE TABLE regions (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text NOT NULL,
  city       text NOT NULL,
  state      text NOT NULL DEFAULT 'Nordrhein-Westfalen',
  created_at timestamptz DEFAULT now()
);

-- „districts" = die Zuordnungs-Einheit. In Campus: Fachbereiche.
CREATE TABLE districts (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  city        text NOT NULL,
  state       text NOT NULL DEFAULT 'Nordrhein-Westfalen',
  population  integer,
  region_id   uuid REFERENCES regions(id),
  created_at  timestamptz DEFAULT now()
);

-- Zielwerte für den Repräsentativitäts-Score (in Campus vorerst leer).
CREATE TABLE district_demographics (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  region_id  uuid REFERENCES regions(id),
  category   text,
  label      text,
  percentage numeric
);

CREATE TABLE profiles (
  id                  uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name           text,
  username            text CHECK (username IS NULL OR username ~ '^[A-Za-z0-9_.]{3,24}$'),
  district_id         uuid REFERENCES districts(id),
  age_group           text,
  gender              text,
  avatar_url          text,
  role                text NOT NULL DEFAULT 'citizen'
    CHECK (role IN ('citizen','city','politician','admin','studienservice','pruefungsamt','hochschulleitung')),
  party               text,       -- Badge-Text der offiziellen Antwort (Campus: Stelle)
  politician_title    text,
  politician_verified boolean NOT NULL DEFAULT false,
  created_at          timestamptz DEFAULT now()
);
CREATE UNIQUE INDEX profiles_username_unique ON profiles (lower(username));

-- City-spezifische Tabellen (in Campus leer, damit gemeinsamer Code nicht bricht)
CREATE TABLE politicians (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL, party text, role text, district_id uuid REFERENCES districts(id),
  topics text[], response_rate integer DEFAULT 0, avatar_url text, created_at timestamptz DEFAULT now()
);

CREATE TABLE elections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL, election_date date, expected_year integer, description text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL, description text, category text,
  district_id uuid REFERENCES districts(id),
  status text DEFAULT 'active' CHECK (status IN ('active','pending','resolved')),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE news (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL, summary text, category text, source text, source_url text,
  district_id uuid REFERENCES districts(id),
  published_at timestamptz DEFAULT now()
);

CREATE TABLE votes (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title                text NOT NULL, description text,
  district_id          uuid REFERENCES districts(id),
  target_district_id   uuid REFERENCES districts(id),
  ends_at              timestamptz,
  total_votes          integer DEFAULT 0,
  representation_score integer DEFAULT 0,
  is_partner_vote      boolean DEFAULT false,
  partner_name         text,
  created_at           timestamptz DEFAULT now()
);

CREATE TABLE vote_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vote_id uuid REFERENCES votes(id) ON DELETE CASCADE,
  label text NOT NULL, description text, count integer DEFAULT 0
);

CREATE TABLE vote_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vote_id uuid REFERENCES votes(id) ON DELETE CASCADE,
  option_id uuid REFERENCES vote_options(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  UNIQUE(vote_id, user_id)
);

CREATE TABLE demands (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title              text NOT NULL,
  description        text,
  solution           text,
  category           text,
  tags               text[],
  submission_type    text CHECK (submission_type IS NULL OR submission_type IN ('mangel','wiederkehrend','vorschlag')),
  location_scope     text,
  location_type      text,
  location           text,
  addressees         text[],
  frequency          text,
  affected_groups    text[],
  impacts            text[],
  solution_direction text,
  feedback_wanted    text CHECK (feedback_wanted IS NULL OR feedback_wanted IN ('stadt','politik','beide','unsicher')),
  lat                double precision,
  lng                double precision,
  locations          jsonb,
  address            text,
  district_id        uuid REFERENCES districts(id),
  user_id            uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  relevance_score    integer DEFAULT 0,
  status             text DEFAULT 'eingereicht'
    CHECK (status IN ('eingereicht','geprüft','bearbeitet','umgesetzt','abgelehnt','zurückgezogen')),
  created_at         timestamptz DEFAULT now()
);
CREATE INDEX idx_demands_title_trgm ON demands USING gin (title gin_trgm_ops);
CREATE INDEX idx_demands_tags ON demands USING gin (tags);
CREATE INDEX idx_demands_lat_lng ON demands (lat, lng) WHERE lat IS NOT NULL AND lng IS NOT NULL;

CREATE TABLE demand_arguments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  demand_id uuid REFERENCES demands(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id),
  type text,
  text text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(demand_id, user_id)
);

CREATE TABLE demand_argument_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  argument_id uuid REFERENCES demand_arguments(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  UNIQUE(argument_id, user_id)
);

CREATE TABLE demand_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  demand_id uuid REFERENCES demands(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  author text,
  role text,
  party text,
  position text,
  text text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE demand_moderation (
  demand_id uuid PRIMARY KEY REFERENCES demands(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'neu'
    CHECK (status IN ('neu','in_pruefung','freigegeben','ueberarbeitung','weitergeleitet','zurueckgestellt')),
  note text,
  updated_at timestamptz DEFAULT now()
);

-- ─────────────── Funktionen ───────────────

CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin');
$$;

CREATE OR REPLACE FUNCTION is_city_or_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('city','admin'));
$$;

-- Offizielle Antwort erlaubt für freigeschaltete Antwort-Rollen (City +
-- Campus). Name ist historisch; deckt Politik UND Hochschulstellen ab.
CREATE OR REPLACE FUNCTION is_verified_politician()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
      AND role IN ('politician','studienservice','pruefungsamt','hochschulleitung')
      AND politician_verified = true
  );
$$;

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  BEGIN
    INSERT INTO public.profiles (id, full_name, username, district_id)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name',
            NULLIF(NEW.raw_user_meta_data->>'username',''),
            NULLIF(NEW.raw_user_meta_data->>'district_id','')::uuid)
    ON CONFLICT (id) DO NOTHING;
  EXCEPTION WHEN unique_violation OR check_violation THEN
    INSERT INTO public.profiles (id, full_name, district_id)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name',
            NULLIF(NEW.raw_user_meta_data->>'district_id','')::uuid)
    ON CONFLICT (id) DO NOTHING;
  END;
  RETURN NEW;
END;
$$;

-- Selbst-Freischaltung verhindern: nur Admins ändern role + Politiker-Felder.
CREATE OR REPLACE FUNCTION prevent_role_escalation()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE jwt_role text;
BEGIN
  jwt_role := coalesce(nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role', '');
  IF jwt_role IN ('authenticated','anon') AND NOT is_admin() THEN
    NEW.role := OLD.role;
    NEW.party := OLD.party;
    NEW.politician_title := OLD.politician_title;
    NEW.politician_verified := OLD.politician_verified;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION recount_relevance()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE target uuid := COALESCE(NEW.demand_id, OLD.demand_id);
BEGIN
  UPDATE demands SET relevance_score = (SELECT COUNT(*) FROM demand_arguments WHERE demand_id = target)
    WHERE id = target;
  RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION recount_votes()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE target uuid := COALESCE(NEW.vote_id, OLD.vote_id);
BEGIN
  UPDATE vote_options o SET count = (SELECT COUNT(*) FROM vote_responses r WHERE r.option_id = o.id)
    WHERE o.vote_id = target;
  UPDATE votes SET total_votes = (SELECT COUNT(*) FROM vote_responses r WHERE r.vote_id = target)
    WHERE id = target;
  RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION vote_participant_demographics(v_id uuid)
RETURNS TABLE(age_group text, gender text, district_id uuid)
LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT p.age_group, p.gender, p.district_id
  FROM vote_responses vr JOIN profiles p ON p.id = vr.user_id
  WHERE vr.vote_id = v_id;
$$;

CREATE OR REPLACE FUNCTION withdraw_demand(d_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE demands SET status = 'zurückgezogen' WHERE id = d_id AND user_id = auth.uid();
  IF NOT FOUND THEN RAISE EXCEPTION 'Nicht berechtigt oder Forderung nicht gefunden'; END IF;
END;
$$;

CREATE OR REPLACE FUNCTION enforce_demand_rate_limit()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF is_admin() THEN RETURN NEW; END IF;
  IF (SELECT COUNT(*) FROM demands WHERE user_id = NEW.user_id AND created_at > now() - interval '24 hours') >= 3 THEN
    RAISE EXCEPTION 'RATE_LIMIT_DAY';
  END IF;
  IF (SELECT COUNT(*) FROM demands WHERE user_id = NEW.user_id AND created_at > now() - interval '7 days') >= 10 THEN
    RAISE EXCEPTION 'RATE_LIMIT_WEEK';
  END IF;
  RETURN NEW;
END;
$$;

-- Identität der offiziellen Antwort serverseitig setzen (kein Spoofing).
CREATE OR REPLACE FUNCTION set_response_identity()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE prof record;
BEGIN
  SELECT full_name, party, role, politician_verified INTO prof FROM profiles WHERE id = auth.uid();
  IF prof.role NOT IN ('politician','studienservice','pruefungsamt','hochschulleitung')
     OR NOT COALESCE(prof.politician_verified, false) THEN
    RAISE EXCEPTION 'NOT_VERIFIED_RESPONDER';
  END IF;
  IF NEW.position IS NULL OR NEW.position NOT IN ('unterstuetzung','gegenargument','alternative') THEN
    RAISE EXCEPTION 'INVALID_LABEL';
  END IF;
  IF NEW.text IS NULL OR length(btrim(NEW.text)) < 10 THEN
    RAISE EXCEPTION 'RESPONSE_TOO_SHORT';
  END IF;
  NEW.user_id := auth.uid();
  NEW.author  := prof.full_name;
  NEW.party   := prof.party;   -- Badge = Stelle (z. B. „Prüfungsamt")
  NEW.role    := prof.role;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION similar_demands(q text)
RETURNS TABLE(id uuid, title text, relevance_score integer, status text, sim real)
LANGUAGE sql STABLE AS $$
  SELECT d.id, d.title, d.relevance_score, d.status,
         GREATEST(similarity(d.title, q), word_similarity(q, d.title)) AS sim
  FROM demands d
  WHERE d.status <> 'zurückgezogen'
    AND (similarity(d.title, q) > 0.2 OR word_similarity(q, d.title) > 0.35 OR d.title ILIKE '%'||q||'%')
  ORDER BY sim DESC LIMIT 4;
$$;

-- ─────────────── Trigger ───────────────

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

CREATE TRIGGER protect_role BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION prevent_role_escalation();

CREATE TRIGGER demand_arguments_relevance AFTER INSERT OR UPDATE OR DELETE ON demand_arguments
  FOR EACH ROW EXECUTE FUNCTION recount_relevance();

CREATE TRIGGER vote_responses_recount AFTER INSERT OR UPDATE OR DELETE ON vote_responses
  FOR EACH ROW EXECUTE FUNCTION recount_votes();

CREATE TRIGGER demands_rate_limit BEFORE INSERT ON demands
  FOR EACH ROW EXECUTE FUNCTION enforce_demand_rate_limit();

CREATE TRIGGER demand_responses_identity BEFORE INSERT ON demand_responses
  FOR EACH ROW EXECUTE FUNCTION set_response_identity();

-- ─────────────── RLS ───────────────

ALTER TABLE regions               ENABLE ROW LEVEL SECURITY;
ALTER TABLE districts             ENABLE ROW LEVEL SECURITY;
ALTER TABLE district_demographics ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles              ENABLE ROW LEVEL SECURITY;
ALTER TABLE politicians           ENABLE ROW LEVEL SECURITY;
ALTER TABLE elections             ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics                ENABLE ROW LEVEL SECURITY;
ALTER TABLE news                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE vote_options          ENABLE ROW LEVEL SECURITY;
ALTER TABLE vote_responses        ENABLE ROW LEVEL SECURITY;
ALTER TABLE demands               ENABLE ROW LEVEL SECURITY;
ALTER TABLE demand_arguments      ENABLE ROW LEVEL SECURITY;
ALTER TABLE demand_argument_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE demand_responses      ENABLE ROW LEVEL SECURITY;
ALTER TABLE demand_moderation     ENABLE ROW LEVEL SECURITY;

-- Öffentlich lesbare Referenz-/Inhaltstabellen
CREATE POLICY "lesbar" ON regions               FOR SELECT USING (true);
CREATE POLICY "lesbar" ON districts             FOR SELECT USING (true);
CREATE POLICY "lesbar" ON district_demographics FOR SELECT USING (true);
CREATE POLICY "lesbar" ON politicians           FOR SELECT USING (true);
CREATE POLICY "lesbar" ON elections             FOR SELECT USING (true);
CREATE POLICY "lesbar" ON topics                FOR SELECT USING (true);
CREATE POLICY "lesbar" ON news                  FOR SELECT USING (true);
CREATE POLICY "lesbar" ON votes                 FOR SELECT USING (true);
CREATE POLICY "lesbar" ON vote_options          FOR SELECT USING (true);
CREATE POLICY "lesbar" ON demand_arguments      FOR SELECT USING (true);
CREATE POLICY "lesbar" ON demand_argument_likes FOR SELECT USING (true);
CREATE POLICY "lesbar" ON demand_responses      FOR SELECT USING (true);

-- Profile: authentifizierte lesen alle (für Nutzernamen/Rollen), anon keine
-- (per Grant-Revoke unten). Eigene/Admin bearbeiten.
CREATE POLICY "Profile lesbar"           ON profiles FOR SELECT USING (true);
CREATE POLICY "Profil erstellen"         ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Eigenes Profil bearbeiten"ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins verwalten Profile" ON profiles FOR UPDATE USING (is_admin());

-- Umfragen anlegen/löschen
CREATE POLICY "Stadt/Admin erstellen Umfragen" ON votes FOR INSERT WITH CHECK (is_city_or_admin());
CREATE POLICY "Admins löschen Umfragen"        ON votes FOR DELETE USING (is_admin());
CREATE POLICY "Stadt/Admin erstellen Optionen" ON vote_options FOR INSERT WITH CHECK (is_city_or_admin());

-- Abstimmen (mit Zielgruppen-Prüfung) + eigene Stimme lesen
CREATE POLICY "Abstimmen" ON vote_responses FOR INSERT WITH CHECK (
  auth.uid() = user_id
  AND (
    (SELECT v.target_district_id FROM votes v WHERE v.id = vote_id) IS NULL
    OR (SELECT v.target_district_id FROM votes v WHERE v.id = vote_id) =
       (SELECT p.district_id FROM profiles p WHERE p.id = auth.uid())
  )
);
CREATE POLICY "Eigene Stimme lesen" ON vote_responses FOR SELECT USING (auth.uid() = user_id);

-- Anliegen: angemeldete sehen alles, Gäste nur echte/aktive (keine Mängel)
CREATE POLICY "Anliegen lesbar (angemeldet)" ON demands FOR SELECT TO authenticated USING (true);
CREATE POLICY "Öffentliche Anliegen lesbar"  ON demands FOR SELECT TO anon
  USING (submission_type IS DISTINCT FROM 'mangel' AND status <> 'zurückgezogen');
CREATE POLICY "Anliegen einreichen"          ON demands FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins bearbeiten Anliegen"   ON demands FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admins löschen Anliegen"      ON demands FOR DELETE USING (is_admin());

-- Positionen/Beiträge
CREATE POLICY "Position beziehen"  ON demand_arguments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Position ändern"    ON demand_arguments FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Position löschen"   ON demand_arguments FOR DELETE USING (auth.uid() = user_id);

-- Likes
CREATE POLICY "Beitrag liken"     ON demand_argument_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Like zurücknehmen" ON demand_argument_likes FOR DELETE USING (auth.uid() = user_id);

-- Offizielle Antworten
CREATE POLICY "Stelle antwortet offiziell" ON demand_responses FOR INSERT TO authenticated WITH CHECK (is_verified_politician());
CREATE POLICY "Eigene Antwort ändern"      ON demand_responses FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Eigene Antwort/Admin löschen" ON demand_responses FOR DELETE TO authenticated USING (user_id = auth.uid() OR is_admin());

-- Moderation: nur Admins
CREATE POLICY "Admins lesen Moderation"    ON demand_moderation FOR SELECT USING (is_admin());
CREATE POLICY "Admins erstellen Moderation"ON demand_moderation FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admins ändern Moderation"   ON demand_moderation FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());

-- ─────────────── Grants ───────────────

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;
-- Namensschutz: nicht angemeldete Besucher bekommen KEINE Profildaten.
REVOKE SELECT ON public.profiles FROM anon;

-- ─────────────── Minimaler Seed (nur damit die App startet) ───────────────
-- Name muss zu campusConfig.labels.orgName passen (Wiring-Schritt).
INSERT INTO regions (name, city) VALUES ('Hochschule Fresenius · Campus Köln', 'Köln');

-- Fachbereiche (Platzhalter — bitte an den echten Campus Köln anpassen)
INSERT INTO districts (name, city, region_id)
SELECT x.name, 'Köln', (SELECT id FROM regions WHERE name = 'Hochschule Fresenius · Campus Köln')
FROM (VALUES
  ('Wirtschaft & Medien'),
  ('Gesundheit & Soziales'),
  ('Psychologie'),
  ('Chemie & Biologie')
) AS x(name);
