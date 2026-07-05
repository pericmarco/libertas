-- ─────────────────────────────────────────
-- Block 3 (Backlog): Admin-Bereich
--
-- - is_admin(): zentrale Rollen-Prüfung für Policies/Trigger
-- - demand_moderation: interner Moderationsstatus + Notizen in eigener
--   Tabelle mit Admin-only-RLS — demands ist öffentlich lesbar, interne
--   Notizen dürfen dort nicht landen
-- - Admins dürfen Forderungen bearbeiten/löschen und Rollen vergeben
-- - prevent_role_escalation lässt Admin-Rollenvergabe über die App zu
--   (bisher blockierte der Trigger JEDE Rollenänderung aus Client-Kontext,
--   auch die von Admins)
-- - 'politician' als vierte Rolle vorbereitet
-- ─────────────────────────────────────────

CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin');
$$;

-- Politiker-Rolle erlauben
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('citizen', 'city', 'politician', 'admin'));

-- Interner Moderationsstatus, getrennt vom öffentlichen Status
CREATE TABLE demand_moderation (
  demand_id  uuid PRIMARY KEY REFERENCES demands(id) ON DELETE CASCADE,
  status     text NOT NULL DEFAULT 'neu'
    CHECK (status IN ('neu','in_pruefung','freigegeben','ueberarbeitung','weitergeleitet','zurueckgestellt')),
  note       text,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE demand_moderation ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins lesen Moderation" ON demand_moderation
  FOR SELECT USING (is_admin());
CREATE POLICY "Admins erstellen Moderation" ON demand_moderation
  FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admins ändern Moderation" ON demand_moderation
  FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());

-- Admins dürfen Forderungen anpassen, zurückstellen und löschen
CREATE POLICY "Admins bearbeiten Forderungen" ON demands
  FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admins löschen Forderungen" ON demands
  FOR DELETE USING (is_admin());

-- Löschen einer Forderung räumt abhängige Zeilen mit ab
ALTER TABLE demand_arguments DROP CONSTRAINT demand_arguments_demand_id_fkey;
ALTER TABLE demand_arguments ADD CONSTRAINT demand_arguments_demand_id_fkey
  FOREIGN KEY (demand_id) REFERENCES demands(id) ON DELETE CASCADE;
ALTER TABLE demand_responses DROP CONSTRAINT demand_responses_demand_id_fkey;
ALTER TABLE demand_responses ADD CONSTRAINT demand_responses_demand_id_fkey
  FOREIGN KEY (demand_id) REFERENCES demands(id) ON DELETE CASCADE;

-- Admins dürfen Profile verwalten (Rollenvergabe per Klick)
CREATE POLICY "Admins verwalten Profile" ON profiles
  FOR UPDATE USING (is_admin());

-- Rollen-Schutz: Selbst-Beförderung weiter blockiert, Admins ausgenommen
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
  IF NEW.role IS DISTINCT FROM OLD.role
     AND jwt_role IN ('authenticated', 'anon')
     AND NOT is_admin() THEN
    NEW.role := OLD.role;
  END IF;
  RETURN NEW;
END;
$$;
