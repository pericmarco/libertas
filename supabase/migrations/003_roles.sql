-- ─────────────────────────────────────────
-- Rollen: citizen (Standard) / city (Stadtverwaltung) / admin
--
-- Column-Level-Lockdown ist Pflicht: die bestehende Policy
-- "Eigenes Profil bearbeiten" erlaubt jedem Nutzer ein UPDATE auf die
-- eigene Zeile, OHNE einzuschränken welche Spalten geändert werden
-- dürfen. Ohne das REVOKE/GRANT unten könnte sich jeder Nutzer über
-- das Client-SDK selbst auf role='admin' setzen.
-- ─────────────────────────────────────────

ALTER TABLE profiles ADD COLUMN role text NOT NULL DEFAULT 'citizen'
  CHECK (role IN ('citizen', 'city', 'admin'));

REVOKE UPDATE ON public.profiles FROM authenticated;
GRANT UPDATE (full_name, district_id, age_group, gender, avatar_url)
  ON public.profiles TO authenticated;
