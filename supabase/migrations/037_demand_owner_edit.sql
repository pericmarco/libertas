-- ─────────────────────────────────────────
-- Eigene Forderungen bearbeiten
--
-- Bisher konnten Autor:innen ihre Forderung nur zurückziehen, nicht ändern
-- (bewusst, damit sich der Inhalt nach Unterstützung nicht unbemerkt wandelt).
-- Auf Wunsch wird Bearbeiten jetzt erlaubt — mit Transparenz: edited_at wird
-- gesetzt und im UI als „bearbeitet" angezeigt.
-- ─────────────────────────────────────────

ALTER TABLE public.demands ADD COLUMN IF NOT EXISTS edited_at timestamptz;

DROP POLICY IF EXISTS "Autor bearbeitet eigene Forderung" ON public.demands;
CREATE POLICY "Autor bearbeitet eigene Forderung" ON public.demands
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
