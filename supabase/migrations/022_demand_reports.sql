-- ─────────────────────────────────────────
-- User-Meldungen zu Forderungen
--
-- Angemeldete Nutzer können eine Forderung melden (Spam, Beleidigung,
-- Falschinformation …). Die Meldungen erscheinen im Admin-Bereich zur
-- Sichtung. Eine Meldung pro Nutzer und Forderung.
-- ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS demand_reports (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  demand_id   uuid NOT NULL REFERENCES demands(id) ON DELETE CASCADE,
  reporter_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason      text NOT NULL
    CHECK (reason IN ('spam','beleidigung','falsch','duplikat','unangemessen','sonstiges')),
  note        text,
  status      text NOT NULL DEFAULT 'offen'
    CHECK (status IN ('offen','erledigt','verworfen')),
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (demand_id, reporter_id)
);

ALTER TABLE demand_reports ENABLE ROW LEVEL SECURITY;

-- Angemeldete Nutzer melden Forderungen (nur im eigenen Namen)
CREATE POLICY "Nutzer melden Forderungen" ON demand_reports
  FOR INSERT WITH CHECK (auth.uid() = reporter_id);

-- Nutzer sehen ihre eigenen Meldungen; Admins sehen alle
CREATE POLICY "Eigene Meldungen und Admins lesen" ON demand_reports
  FOR SELECT USING (auth.uid() = reporter_id OR is_admin());

-- Admins erledigen oder verwerfen Meldungen
CREATE POLICY "Admins ändern Meldungen" ON demand_reports
  FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());

CREATE INDEX IF NOT EXISTS idx_demand_reports_demand ON demand_reports (demand_id);
CREATE INDEX IF NOT EXISTS idx_demand_reports_status ON demand_reports (status);
