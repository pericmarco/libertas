-- ─────────────────────────────────────────────────────────────
-- Profil-Präferenzen: öffentliche Namensanzeige + Benachrichtigungen
--
-- show_real_name: Nutzer kann wählen, ob der (freiwillige) Klarname
--   öffentlich statt nur des Nutzernamens erscheint. Default: nur Nutzername.
-- notification_prefs: welche Benachrichtigungen der Nutzer erhalten möchte
--   (neuer Beitrag im Stadtteil, Antwort auf eigenen Beitrag, Antwort von
--   Stadt/Politik, Statusänderung, neue Umfrage, neues Projekt …).
--   Als jsonb, damit neue Ereignistypen (Petition, Bürgeridee) ohne
--   Schemaänderung ergänzt werden können.
--
-- Beide gehören zur eigenen Zeile → die bestehende Owner-Update-Policy auf
-- profiles deckt Lesen/Schreiben bereits ab. Kein zusätzliches RLS nötig.
-- ─────────────────────────────────────────────────────────────

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS show_real_name boolean NOT NULL DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notification_prefs jsonb NOT NULL DEFAULT '{}'::jsonb;
