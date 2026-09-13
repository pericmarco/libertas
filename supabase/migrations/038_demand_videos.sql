-- ─────────────────────────────────────────
-- Kurze Videos für Forderungen & Mängelmeldungen
--
-- Bürger:innen können einen kurzen Clip anhängen (z. B. die gefährliche
-- Kreuzung). Selbst gehostet im Bucket 'demand-videos' — mit hartem Limit
-- (50 MB, per Bucket serverseitig erzwungen) und erlaubten Videotypen.
-- Pro Forderung genau ein Video (demands.video_url).
-- ─────────────────────────────────────────

ALTER TABLE public.demands ADD COLUMN IF NOT EXISTS video_url text;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('demand-videos', 'demand-videos', true, 52428800,
        ARRAY['video/mp4', 'video/quicktime', 'video/webm'])
ON CONFLICT (id) DO NOTHING;

-- Hochladen: nur angemeldet, in den eigenen Ordner
DROP POLICY IF EXISTS "demand-videos upload" ON storage.objects;
CREATE POLICY "demand-videos upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'demand-videos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Lesen: öffentlich
DROP POLICY IF EXISTS "demand-videos read" ON storage.objects;
CREATE POLICY "demand-videos read" ON storage.objects
  FOR SELECT USING (bucket_id = 'demand-videos');

-- Löschen: nur Eigentümer:in
DROP POLICY IF EXISTS "demand-videos delete own" ON storage.objects;
CREATE POLICY "demand-videos delete own" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'demand-videos' AND owner = auth.uid());
