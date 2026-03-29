
DO $$
BEGIN
  -- Создаем storage bucket
  INSERT INTO storage.buckets (id, name, public) VALUES ('grenade-media', 'grenade-media', true)
  ON CONFLICT (id) DO NOTHING;

  -- Политики для storage (с обработкой дубликатов)
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can view media' AND tablename = 'objects') THEN
    CREATE POLICY "Anyone can view media" ON storage.objects FOR SELECT USING (bucket_id = 'grenade-media');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can upload media' AND tablename = 'objects') THEN
    CREATE POLICY "Authenticated users can upload media" ON storage.objects FOR INSERT WITH CHECK (
      bucket_id = 'grenade-media' AND auth.role() = 'authenticated'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own media' AND tablename = 'objects') THEN
    CREATE POLICY "Users can update own media" ON storage.objects FOR UPDATE USING (
      bucket_id = 'grenade-media' AND auth.uid()::text = (storage.foldername(name))[1]
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete own media' AND tablename = 'objects') THEN
    CREATE POLICY "Users can delete own media" ON storage.objects FOR DELETE USING (
      bucket_id = 'grenade-media' AND auth.uid()::text = (storage.foldername(name))[1]
    );
  END IF;
END $$;
