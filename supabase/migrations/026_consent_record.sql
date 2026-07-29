-- ─────────────────────────────────────────
-- Einwilligungs-Nachweis (DSGVO Art. 7 Abs. 1 — Nachweisbarkeit)
--
-- Bei der Registrierung bestätigt der/die Nutzer:in per Pflicht-Häkchen die
-- Datenschutzerklärung (und mind. 16 Jahre). Damit die Einwilligung belegbar
-- ist, halten wir Zeitpunkt und Version fest.
--
-- Gespeichert wird beides serverseitig im Profil-Trigger aus den signUp-
-- Metadaten (terms_accepted / consent_version) — der Client kann den
-- Zeitstempel also nicht fälschen.
-- ─────────────────────────────────────────

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS consent_at      timestamptz,
  ADD COLUMN IF NOT EXISTS consent_version text;

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
BEGIN
  BEGIN
    INSERT INTO public.profiles (id, full_name, username, district_id, consent_at, consent_version)
    VALUES (
      NEW.id,
      NEW.raw_user_meta_data->>'full_name',
      NULLIF(NEW.raw_user_meta_data->>'username', ''),
      NULLIF(NEW.raw_user_meta_data->>'district_id', '')::uuid,
      v_consent_at,
      v_consent_version
    )
    ON CONFLICT (id) DO NOTHING;
  EXCEPTION WHEN unique_violation OR check_violation THEN
    -- Nutzername vergeben oder ungültig: Konto trotzdem anlegen,
    -- Name wird später im Profil gewählt
    INSERT INTO public.profiles (id, full_name, district_id, consent_at, consent_version)
    VALUES (
      NEW.id,
      NEW.raw_user_meta_data->>'full_name',
      NULLIF(NEW.raw_user_meta_data->>'district_id', '')::uuid,
      v_consent_at,
      v_consent_version
    )
    ON CONFLICT (id) DO NOTHING;
  END;
  RETURN NEW;
END;
$$;
