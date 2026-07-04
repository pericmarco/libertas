-- ─────────────────────────────────────────
-- Fix: "permission denied for table profiles" beim Onboarding/Login
--
-- 003_roles.sql hat das UPDATE-Recht auf profiles auf einzelne Spalten
-- beschränkt (ohne "id"). PostgREST-Upserts (INSERT ... ON CONFLICT DO
-- UPDATE) fassen aber auch die id-Spalte an → Rechte-Fehler bei jedem
-- Profil-Update. Der Spalten-Rechte-Ansatz ist mit PostgREST zu fragil.
--
-- Fix: Tabellen-Rechte auf den (funktionierenden) Supabase-Standard
-- zurücksetzen und den Schutz der role-Spalte gegen Selbst-Beförderung
-- über einen BEFORE-UPDATE-Trigger lösen.
-- ─────────────────────────────────────────

-- 1. Tabellen-Rechte auf Supabase-Standard zurücksetzen
REVOKE ALL ON public.profiles FROM authenticated, anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated, anon;

-- 2. Selbst-Beförderung verhindern: Ein normaler Nutzer (authenticated/
--    anon über PostgREST) darf seine role nicht ändern. Aufrufe über den
--    SQL-Editor / service_role haben keinen request.jwt.claims-Kontext
--    und dürfen role weiterhin setzen (so vergeben wir Admin-Rechte).
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
  IF NEW.role IS DISTINCT FROM OLD.role AND jwt_role IN ('authenticated', 'anon') THEN
    NEW.role := OLD.role;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_profile_role ON public.profiles;
CREATE TRIGGER protect_profile_role
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_role_escalation();
