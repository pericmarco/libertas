-- ─────────────────────────────────────────
-- Politiker Phase A: verifizierte Politiker-Accounts + offizielle Antworten
--
-- Prinzip (mit Marco abgestimmt): Berechtigungen werden von Hand vergeben.
-- Ein Politiker registriert sich normal (ist zunächst Bürger). Ein Admin
-- setzt Rolle = politician, trägt Partei + Funktion ein und schaltet den
-- Account frei (politician_verified). Erst dann darf er offiziell auf
-- Forderungen antworten. Das Badge an der Antwort ist der Parteiname.
--
-- Identität der Antwort (Name + Partei) wird serverseitig aus dem Profil
-- gesetzt — nicht aus Client-Eingaben —, damit niemand eine falsche Partei
-- oder einen fremden Namen an seine Antwort hängen kann.
-- ─────────────────────────────────────────

-- 1) Politiker-Identität am Profil (nur Admin setzt diese Felder).
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS party               text,
  ADD COLUMN IF NOT EXISTS politician_title    text,
  ADD COLUMN IF NOT EXISTS politician_verified boolean NOT NULL DEFAULT false;

-- 2) Helper: ist der aktuelle Nutzer ein freigeschalteter Politiker?
CREATE OR REPLACE FUNCTION is_verified_politician()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
      AND role = 'politician'
      AND politician_verified = true
  );
$$;

-- 3) demand_responses account-verknüpfen (Tabelle existiert bereits, leer).
--    Bestehende Spalten werden weiterverwendet:
--      author   = Anzeigename des Politikers (aus dem Profil)
--      role     = 'politician'
--      position = Label (unterstuetzung | gegenargument | alternative)
--      text     = Antworttext
--    Neu:
ALTER TABLE demand_responses
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS party   text;

-- 4) Identität serverseitig setzen (Client liefert nur position + text).
CREATE OR REPLACE FUNCTION set_response_identity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE prof record;
BEGIN
  SELECT full_name, party, role, politician_verified
    INTO prof
    FROM profiles WHERE id = auth.uid();

  IF prof.role <> 'politician' OR NOT COALESCE(prof.politician_verified, false) THEN
    RAISE EXCEPTION 'NOT_VERIFIED_POLITICIAN';
  END IF;

  IF NEW.position IS NULL OR NEW.position NOT IN ('unterstuetzung', 'gegenargument', 'alternative') THEN
    RAISE EXCEPTION 'INVALID_LABEL';
  END IF;

  IF NEW.text IS NULL OR length(btrim(NEW.text)) < 10 THEN
    RAISE EXCEPTION 'RESPONSE_TOO_SHORT';
  END IF;

  NEW.user_id := auth.uid();
  NEW.author  := prof.full_name;
  NEW.party   := prof.party;
  NEW.role    := 'politician';
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS demand_responses_identity ON demand_responses;
CREATE TRIGGER demand_responses_identity
  BEFORE INSERT ON demand_responses
  FOR EACH ROW EXECUTE FUNCTION set_response_identity();

-- 5) RLS: öffentlich lesbar (offizielle Antworten sind attributierbar/öffentlich),
--    Einfügen nur für verifizierte Politiker, Ändern/Löschen nur eigene oder Admin.
ALTER TABLE demand_responses ENABLE ROW LEVEL SECURITY;

-- Vorhandene SELECT-Policies (aus der ursprünglichen Tabellenanlage)
-- entfernen, damit genau eine klare öffentliche Lese-Policy gilt.
DO $$
DECLARE pol record;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'demand_responses' AND cmd = 'SELECT'
  LOOP
    EXECUTE format('DROP POLICY %I ON public.demand_responses', pol.policyname);
  END LOOP;
END $$;

CREATE POLICY "Antworten öffentlich lesbar" ON demand_responses
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Politiker antwortet offiziell" ON demand_responses;
CREATE POLICY "Politiker antwortet offiziell" ON demand_responses
  FOR INSERT TO authenticated
  WITH CHECK (is_verified_politician());

DROP POLICY IF EXISTS "Eigene Antwort ändern" ON demand_responses;
CREATE POLICY "Eigene Antwort ändern" ON demand_responses
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Eigene Antwort oder Admin löschen" ON demand_responses;
CREATE POLICY "Eigene Antwort oder Admin löschen" ON demand_responses
  FOR DELETE TO authenticated
  USING (user_id = auth.uid() OR is_admin());

-- 6) Selbst-Freischaltung verhindern: nur Admins dürfen role UND die
--    Politiker-Felder ändern. Für alle anderen werden diese Felder bei
--    einem Update auf den alten Wert zurückgesetzt (belt & suspenders —
--    zusätzlich zur role-Schranke, die is_verified_politician() ohnehin
--    verlangt).
CREATE OR REPLACE FUNCTION public.prevent_role_escalation()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  jwt_role text;
BEGIN
  jwt_role := coalesce(
    nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role',
    ''
  );
  IF jwt_role IN ('authenticated', 'anon') AND NOT is_admin() THEN
    NEW.role                := OLD.role;
    NEW.party               := OLD.party;
    NEW.politician_title    := OLD.politician_title;
    NEW.politician_verified := OLD.politician_verified;
  END IF;
  RETURN NEW;
END;
$$;
