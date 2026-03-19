
-- Create storage bucket for clinic backups
INSERT INTO storage.buckets (id, name, public)
VALUES ('clinic-backups', 'clinic-backups', false)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload backups
CREATE POLICY "Authenticated users can upload backups"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'clinic-backups');

-- Allow authenticated users to read their backups
CREATE POLICY "Authenticated users can read backups"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'clinic-backups');
