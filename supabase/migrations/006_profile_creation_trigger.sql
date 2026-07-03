-- ─────────────────────────────────────────
-- Fix: Name + Stadtteil aus der Registrierung gehen verloren
--
-- Bei aktivierter "Confirm email"-Option hat der Browser direkt nach
-- supabase.auth.signUp() noch KEINE Session (erst nach Klick auf den
-- Bestätigungslink). Der bisherige `profiles`-Insert in register.tsx
-- lief als anonymer Client und wurde von RLS ("Profil erstellen" ON
-- profiles FOR INSERT WITH CHECK (auth.uid() = id)) still blockiert —
-- ohne dass der Fehler angezeigt wurde. full_name und district_id
-- gingen dadurch bei jeder Registrierung verloren.
--
-- Fix: Ein Trigger auf auth.users (läuft serverseitig, unabhängig von
-- RLS/Session) legt das Profil direkt bei der Kontoerstellung an, aus
-- den Metadaten die signUp() im User-Objekt mitgibt.
-- ─────────────────────────────────────────

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, district_id)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NULLIF(NEW.raw_user_meta_data->>'district_id', '')::uuid
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
