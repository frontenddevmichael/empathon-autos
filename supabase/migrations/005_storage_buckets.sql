-- Storage buckets + policies.
-- Creates the buckets this app uploads to (none existed) with public read and
-- admin write via storage.objects policies.

INSERT INTO storage.buckets (id, name, public)
VALUES
  ('vehicle-media', 'vehicle-media', true),
  ('lot-media', 'lot-media', true),
  ('client-logos', 'client-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Public read + authenticated (admin) write for each bucket.
DO $$
DECLARE
  b text;
BEGIN
  FOREACH b IN ARRAY ARRAY['vehicle-media', 'lot-media', 'client-logos']
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Public read %s" ON storage.objects', b);
    EXECUTE format('DROP POLICY IF EXISTS "Admin write %s" ON storage.objects', b);
    EXECUTE format('CREATE POLICY "Public read %s" ON storage.objects FOR SELECT USING (bucket_id = %L)', b, b);
    EXECUTE format('CREATE POLICY "Admin write %s" ON storage.objects FOR ALL USING (auth.role() = ''authenticated'' AND bucket_id = %L) WITH CHECK (auth.role() = ''authenticated'' AND bucket_id = %L)', b, b, b);
  END LOOP;
END;
$$;
