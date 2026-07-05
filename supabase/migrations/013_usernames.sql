-- ─────────────────────────────────────────
-- Block 2 (Backlog): Nutzernamen
--
-- Öffentlich sichtbar ist künftig der Nutzername, der Klarname bleibt
-- intern gespeichert. Eindeutigkeit case-insensitive. Format-Regeln
-- (3–24 Zeichen, Buchstaben/Zahlen/Punkt/Unterstrich) per CHECK.
--
-- handle_new_user übernimmt den Nutzernamen aus den signUp-Metadaten.
-- Kollisionen dürfen die Kontoerstellung NICHT abbrechen (der Trigger
-- läuft im selben Statement wie der auth.users-Insert) — in dem Fall
-- wird das Profil ohne Nutzernamen angelegt und der Nutzer wählt später
-- im Profil einen freien Namen.
-- ─────────────────────────────────────────

ALTER TABLE profiles ADD COLUMN username text
  CHECK (username IS NULL OR username ~ '^[A-Za-z0-9_.]{3,24}$');

CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_unique
  ON profiles (lower(username));

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  BEGIN
    INSERT INTO public.profiles (id, full_name, username, district_id)
    VALUES (
      NEW.id,
      NEW.raw_user_meta_data->>'full_name',
      NULLIF(NEW.raw_user_meta_data->>'username', ''),
      NULLIF(NEW.raw_user_meta_data->>'district_id', '')::uuid
    )
    ON CONFLICT (id) DO NOTHING;
  EXCEPTION WHEN unique_violation OR check_violation THEN
    -- Nutzername vergeben oder ungültig: Konto trotzdem anlegen,
    -- Name wird später im Profil gewählt
    INSERT INTO public.profiles (id, full_name, district_id)
    VALUES (
      NEW.id,
      NEW.raw_user_meta_data->>'full_name',
      NULLIF(NEW.raw_user_meta_data->>'district_id', '')::uuid
    )
    ON CONFLICT (id) DO NOTHING;
  END;
  RETURN NEW;
END;
$$;
