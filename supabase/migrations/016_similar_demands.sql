-- ─────────────────────────────────────────
-- Block 4 (Backlog #8, Stufe 1): Ähnliche Forderungen erkennen
--
-- Trigramm-Ähnlichkeit auf Titeln (pg_trgm) — findet auch Tippfehler
-- und Umformulierungen, ganz ohne KI-Infrastruktur. Die Funktion läuft
-- mit Aufrufer-Rechten (demands ist öffentlich lesbar), zurückgezogene
-- Forderungen werden nicht vorgeschlagen.
-- ─────────────────────────────────────────

CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS idx_demands_title_trgm
  ON demands USING gin (title gin_trgm_ops);

CREATE OR REPLACE FUNCTION similar_demands(q text)
RETURNS TABLE(id uuid, title text, relevance_score integer, status text, sim real)
LANGUAGE sql STABLE
AS $$
  SELECT d.id, d.title, d.relevance_score, d.status,
         GREATEST(similarity(d.title, q), word_similarity(q, d.title)) AS sim
  FROM demands d
  WHERE d.status <> 'zurückgezogen'
    AND (
      similarity(d.title, q) > 0.2
      OR word_similarity(q, d.title) > 0.35
      OR d.title ILIKE '%' || q || '%'
    )
  ORDER BY sim DESC
  LIMIT 4;
$$;
