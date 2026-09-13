-- ─────────────────────────────────────────
-- Bilder für Forderungen & Mängelmeldungen
--
-- Bürger:innen können beim Einreichen Fotos anhängen (z. B. das Schlagloch,
-- die kaputte Bank). Speicherung im öffentlichen Storage-Bucket 'demand-images';
-- die öffentlichen URLs werden in demands.image_urls abgelegt.
-- ─────────────────────────────────────────

ALTER TABLE public.demands ADD COLUMN IF NOT EXISTS image_urls text[];

-- Öffentlicher Bucket (Bilder sind mit der Forderung ohnehin öffentlich sichtbar)
INSERT INTO storage.buckets (id, name, public)
VALUES ('demand-images', 'demand-images', true)
ON CONFLICT (id) DO NOTHING;

-- Hochladen: nur angemeldete Nutzer:innen, in ihren eigenen Ordner (uid/…)
DROP POLICY IF EXISTS "demand-images upload" ON storage.objects;
CREATE POLICY "demand-images upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'demand-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Lesen: öffentlich (der Bucket ist public; Policy dokumentiert es zusätzlich)
DROP POLICY IF EXISTS "demand-images read" ON storage.objects;
CREATE POLICY "demand-images read" ON storage.objects
  FOR SELECT USING (bucket_id = 'demand-images');

-- Löschen: nur Eigentümer:in der Datei
DROP POLICY IF EXISTS "demand-images delete own" ON storage.objects;
CREATE POLICY "demand-images delete own" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'demand-images' AND owner = auth.uid());
