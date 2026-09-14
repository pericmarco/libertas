-- ─────────────────────────────────────────
-- Admin-Rolle stadtbezogen machen
--
-- Befund: is_admin() prüft nur "hat diese Person role='admin'" — ohne jede
-- Stadt-Kenntnis. Das war unproblematisch, solange nur Marco und Tobi Admin
-- sind. Es wird zum echten Loch, sobald die erste externe Kommune (Dormagen,
-- Bergisch Gladbach …) eigenes Verwaltungspersonal mit Moderationsrechten
-- bekommt — genau das verspricht das City-Produkt ("Verwaltung moderiert").
-- Die einzige Rolle, die dafür heute reicht, ist role='admin' — und die gilt
-- laut jeder Policy, die is_admin() nutzt, über ALLE Städte hinweg.
--
-- Lösung: admin_scope_city_id auf profiles.
--   NULL      → globaler Admin (heutiges Verhalten, Marco + Tobi) — unverändert
--   <city_id> → Admin NUR für genau diese Stadt
--
-- is_admin() bleibt unverändert (Rollen-Check ohne Bezug), wird aber an jeder
-- Stelle ersetzt, wo eine Zeile eine Stadt hat oder über eine Fremdreferenz
-- einer Stadt zuzuordnen ist. Für die Plattform-Tabelle `cities` selbst bleibt
-- ausschließlich der globale Admin zuständig (bewusste Einschränkung — ein
-- Stadt-Admin soll nicht mal die eigene Marke/Domain selbst ändern können).
--
-- Zusätzlich zwei Schutzlücken geschlossen, die derselben Ursache entspringen
-- (fehlender Schutz von city_id nach dem Anlegen einer Zeile):
--   • Ohne Sperre könnte irgendwer mit UPDATE-Recht auf eine eigene Zeile
--     (z. B. eine selbst bearbeitete Forderung, Migration 037) deren city_id
--     einfach umschreiben und sie damit in eine fremde Stadt verschieben.
--   • Ohne Sperre könnte ein künftiger Stadt-Admin admin_scope_city_id am
--     eigenen Profil auf NULL setzen und sich damit selbst zum globalen
--     Admin befördern.
-- ─────────────────────────────────────────

-- 1) Stadtbezogener Wirkungskreis am Profil ----------------------------------
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS admin_scope_city_id uuid REFERENCES public.cities(id) ON DELETE SET NULL;

COMMENT ON COLUMN public.profiles.admin_scope_city_id IS
  'NULL = globaler Admin (alle Städte). Gesetzt = Admin nur für diese Stadt. Nur relevant, wenn role = ''admin''.';

-- 2) Geprüfte Helfer ----------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_global_admin()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin' AND admin_scope_city_id IS NULL
  );
$$;

-- Admin für GENAU diese Stadt (globale Admins schließt das ein).
CREATE OR REPLACE FUNCTION public.is_city_admin(p_city_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT p_city_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
      AND (admin_scope_city_id IS NULL OR admin_scope_city_id = p_city_id)
  );
$$;

-- Für Tabellen ohne eigene city_id, aber mit eindeutigem Bezug über eine
-- Forderung (demand_moderation, demand_responses, demand_reports).
CREATE OR REPLACE FUNCTION public.is_admin_for_demand(p_demand_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.demands d
    WHERE d.id = p_demand_id AND public.is_city_admin(d.city_id)
  );
$$;

-- 3) city_id nach dem Anlegen sperren -----------------------------------------
--    Gilt für Inhalts-Tabellen, bei denen eine Verschiebung in eine fremde
--    Stadt nur ein Missbrauchsfall wäre, nie eine legitime Selbstbedienung.
--    profiles.city_id ist bewusst NICHT gesperrt — die eigene Heimatstadt zu
--    wechseln, ist ein Nutzer-Feature, kein Bug.
CREATE OR REPLACE FUNCTION public.lock_city_id_on_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.city_id IS DISTINCT FROM OLD.city_id AND NOT public.is_global_admin() THEN
    NEW.city_id := OLD.city_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS demands_lock_city               ON public.demands;
DROP TRIGGER IF EXISTS votes_lock_city                 ON public.votes;
DROP TRIGGER IF EXISTS politicians_lock_city            ON public.politicians;
DROP TRIGGER IF EXISTS topics_lock_city                 ON public.topics;
DROP TRIGGER IF EXISTS events_lock_city                 ON public.events;
DROP TRIGGER IF EXISTS participation_processes_lock_city ON public.participation_processes;

CREATE TRIGGER demands_lock_city                BEFORE UPDATE ON public.demands
  FOR EACH ROW EXECUTE FUNCTION public.lock_city_id_on_update();
CREATE TRIGGER votes_lock_city                  BEFORE UPDATE ON public.votes
  FOR EACH ROW EXECUTE FUNCTION public.lock_city_id_on_update();
CREATE TRIGGER politicians_lock_city             BEFORE UPDATE ON public.politicians
  FOR EACH ROW EXECUTE FUNCTION public.lock_city_id_on_update();
CREATE TRIGGER topics_lock_city                  BEFORE UPDATE ON public.topics
  FOR EACH ROW EXECUTE FUNCTION public.lock_city_id_on_update();
CREATE TRIGGER events_lock_city                  BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.lock_city_id_on_update();
CREATE TRIGGER participation_processes_lock_city BEFORE UPDATE ON public.participation_processes
  FOR EACH ROW EXECUTE FUNCTION public.lock_city_id_on_update();

-- 4) admin_scope_city_id gegen Selbst-Ausweitung sperren ----------------------
--    Nur ein globaler Admin darf den Wirkungskreis irgendeines Profils ändern
--    — sonst könnte sich ein Stadt-Admin selbst auf NULL (= global) setzen.
CREATE OR REPLACE FUNCTION public.prevent_admin_scope_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  jwt_role text;
BEGIN
  jwt_role := coalesce(
    nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role',
    ''
  );
  IF NEW.admin_scope_city_id IS DISTINCT FROM OLD.admin_scope_city_id
     AND jwt_role IN ('authenticated', 'anon')
     AND NOT public.is_global_admin() THEN
    NEW.admin_scope_city_id := OLD.admin_scope_city_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_prevent_admin_scope_escalation ON public.profiles;
CREATE TRIGGER profiles_prevent_admin_scope_escalation BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_admin_scope_escalation();

-- 5) Bestehende Rollen-Eskalationssperre verschärfen --------------------------
--    Bisher: "irgendein Admin" darf role/party/politician_title/verified
--    ändern. Jetzt zusätzlich: role='admin' zu vergeben oder zu entziehen
--    bleibt AUSSCHLIESSLICH globalen Admins vorbehalten — ein Stadt-Admin
--    könnte sonst über einen Rollenwechsel eine neue, sogar globale
--    Admin-Zeile erzeugen. Alle anderen Rollenwechsel bleiben an
--    is_city_admin(city_id) der betroffenen Zeile gebunden.
CREATE OR REPLACE FUNCTION public.prevent_role_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  jwt_role text;
BEGIN
  jwt_role := coalesce(
    nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role',
    ''
  );
  IF NEW.role IS DISTINCT FROM OLD.role AND jwt_role IN ('authenticated', 'anon') THEN
    IF (NEW.role = 'admin' OR OLD.role = 'admin') AND NOT public.is_global_admin() THEN
      NEW.role := OLD.role;
    ELSIF NOT public.is_city_admin(NEW.city_id) THEN
      NEW.role := OLD.role;
    END IF;
  END IF;

  -- Politiker-Vertrauensfelder weiterhin nur für Admins der betroffenen Stadt.
  IF jwt_role IN ('authenticated', 'anon') AND NOT public.is_city_admin(NEW.city_id) THEN
    NEW.party               := OLD.party;
    NEW.politician_title    := OLD.politician_title;
    NEW.politician_verified := OLD.politician_verified;
  END IF;
  RETURN NEW;
END;
$$;

-- 6) Bestehende Policies auf den passenden Wirkungskreis umstellen ------------

-- demand_moderation (interne Triage, kein eigenes city_id → über Forderung)
DROP POLICY IF EXISTS "Admins lesen Moderation" ON public.demand_moderation;
CREATE POLICY "Admins lesen Moderation" ON public.demand_moderation
  FOR SELECT USING (public.is_admin_for_demand(demand_id));
DROP POLICY IF EXISTS "Admins erstellen Moderation" ON public.demand_moderation;
CREATE POLICY "Admins erstellen Moderation" ON public.demand_moderation
  FOR INSERT WITH CHECK (public.is_admin_for_demand(demand_id));
DROP POLICY IF EXISTS "Admins ändern Moderation" ON public.demand_moderation;
CREATE POLICY "Admins ändern Moderation" ON public.demand_moderation
  FOR UPDATE USING (public.is_admin_for_demand(demand_id)) WITH CHECK (public.is_admin_for_demand(demand_id));

-- demands: Admin-Bearbeitung/Löschung + Mängel-Triage-Sicht
DROP POLICY IF EXISTS "Admins bearbeiten Forderungen" ON public.demands;
CREATE POLICY "Admins bearbeiten Forderungen" ON public.demands
  FOR UPDATE USING (public.is_city_admin(city_id)) WITH CHECK (public.is_city_admin(city_id));
DROP POLICY IF EXISTS "Admins löschen Forderungen" ON public.demands;
CREATE POLICY "Admins löschen Forderungen" ON public.demands
  FOR DELETE USING (public.is_city_admin(city_id));

DROP POLICY IF EXISTS "Forderungen lesbar (angemeldet)" ON public.demands;
CREATE POLICY "Forderungen lesbar (angemeldet)" ON public.demands
  FOR SELECT TO authenticated
  USING (
    submission_type IS DISTINCT FROM 'mangel'
    OR user_id = auth.uid()
    OR public.is_city_admin(city_id)
  );

-- profiles: Rollenvergabe/-pflege nur durch Admin der jeweiligen Stadt
DROP POLICY IF EXISTS "Admins verwalten Profile" ON public.profiles;
CREATE POLICY "Admins verwalten Profile" ON public.profiles
  FOR UPDATE USING (public.is_city_admin(city_id));

-- votes (Stadtumfragen): Löschen nur Admin der Stadt
DROP POLICY IF EXISTS "Admins löschen Umfragen" ON public.votes;
CREATE POLICY "Admins löschen Umfragen" ON public.votes
  FOR DELETE USING (public.is_city_admin(city_id));

-- demand_responses: Löschen eigener Antwort oder Admin der betroffenen Stadt
DROP POLICY IF EXISTS "Eigene Antwort oder Admin löschen" ON public.demand_responses;
CREATE POLICY "Eigene Antwort oder Admin löschen" ON public.demand_responses
  FOR DELETE TO authenticated
  USING (user_id = auth.uid() OR public.is_admin_for_demand(demand_id));

-- demand_reports: Lesen/Bearbeiten nur Melder:in oder Admin der betroffenen Stadt
DROP POLICY IF EXISTS "Eigene Meldungen und Admins lesen" ON public.demand_reports;
CREATE POLICY "Eigene Meldungen und Admins lesen" ON public.demand_reports
  FOR SELECT USING (auth.uid() = reporter_id OR public.is_admin_for_demand(demand_id));

DROP POLICY IF EXISTS "Admins ändern Meldungen" ON public.demand_reports;
CREATE POLICY "Admins ändern Meldungen" ON public.demand_reports
  FOR UPDATE USING (public.is_admin_for_demand(demand_id)) WITH CHECK (public.is_admin_for_demand(demand_id));

-- politicians: Verzeichnispflege nur Admin der jeweiligen Stadt
DROP POLICY IF EXISTS "Eigener Eintrag oder Admin lesbar" ON public.politicians;
CREATE POLICY "Eigener Eintrag oder Admin lesbar" ON public.politicians
  FOR SELECT TO authenticated
  USING (claimed_by = auth.uid() OR public.is_city_admin(city_id));

DROP POLICY IF EXISTS "Admin legt Politiker an" ON public.politicians;
CREATE POLICY "Admin legt Politiker an" ON public.politicians
  FOR INSERT TO authenticated
  WITH CHECK (public.is_city_admin(city_id));

DROP POLICY IF EXISTS "Eigentümer oder Admin bearbeitet" ON public.politicians;
CREATE POLICY "Eigentümer oder Admin bearbeitet" ON public.politicians
  FOR UPDATE TO authenticated
  USING (claimed_by = auth.uid() OR public.is_city_admin(city_id))
  WITH CHECK (claimed_by = auth.uid() OR public.is_city_admin(city_id));

DROP POLICY IF EXISTS "Admin löscht Politiker" ON public.politicians;
CREATE POLICY "Admin löscht Politiker" ON public.politicians
  FOR DELETE TO authenticated
  USING (public.is_city_admin(city_id));

CREATE OR REPLACE FUNCTION public.politicians_guard_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_city_admin(OLD.city_id) THEN
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

-- cities: Markenpflege/Vertragsstatus bleibt ausschließlich globalen Admins
-- vorbehalten — bewusst KEIN is_city_admin() hier, auch nicht für die eigene
-- Stadt, solange es kein Self-Service-Whitelabel-Konzept gibt.
DROP POLICY IF EXISTS "Admin pflegt Städte" ON public.cities;
CREATE POLICY "Admin pflegt Städte" ON public.cities
  FOR ALL TO authenticated
  USING (public.is_global_admin()) WITH CHECK (public.is_global_admin());

-- events: Ändern/Löschen durch Admin der betroffenen Stadt
DROP POLICY IF EXISTS "Ersteller oder Admin ändern Events" ON public.events;
CREATE POLICY "Ersteller oder Admin ändern Events" ON public.events
  FOR UPDATE USING (created_by = auth.uid() OR public.is_city_admin(city_id));
DROP POLICY IF EXISTS "Ersteller oder Admin löschen Events" ON public.events;
CREATE POLICY "Ersteller oder Admin löschen Events" ON public.events
  FOR DELETE USING (created_by = auth.uid() OR public.is_city_admin(city_id));

-- participation_processes: Ändern/Löschen durch Admin der betroffenen Stadt
DROP POLICY IF EXISTS "Ersteller oder Admin ändern Verfahren" ON public.participation_processes;
CREATE POLICY "Ersteller oder Admin ändern Verfahren" ON public.participation_processes
  FOR UPDATE USING (created_by = auth.uid() OR public.is_city_admin(city_id));
DROP POLICY IF EXISTS "Ersteller oder Admin löschen Verfahren" ON public.participation_processes;
CREATE POLICY "Ersteller oder Admin löschen Verfahren" ON public.participation_processes
  FOR DELETE USING (created_by = auth.uid() OR public.is_city_admin(city_id));

-- 7) Explizite city_id-Angabe beim Anlegen bleibt globalen Admins vorbehalten -
--    (z. B. um Startinhalte für eine neue Stadt anzulegen). Ein Stadt-Admin
--    landet — wie jede normale Nutzerin — immer in der eigenen Stadt.
CREATE OR REPLACE FUNCTION public.set_city_id_from_context()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_city uuid;
BEGIN
  IF NEW.city_id IS NOT NULL AND (auth.uid() IS NULL OR public.is_global_admin()) THEN
    RETURN NEW;
  END IF;

  SELECT city_id INTO v_city FROM profiles WHERE id = auth.uid();

  IF v_city IS NULL AND jsonb_exists(to_jsonb(NEW), 'district_id') THEN
    SELECT d.city_id INTO v_city
    FROM districts d
    WHERE d.id = (to_jsonb(NEW)->>'district_id')::uuid;
  END IF;

  IF v_city IS NULL THEN
    SELECT id INTO v_city FROM cities ORDER BY created_at LIMIT 1;
  END IF;

  NEW.city_id := v_city;
  RETURN NEW;
END;
$$;
