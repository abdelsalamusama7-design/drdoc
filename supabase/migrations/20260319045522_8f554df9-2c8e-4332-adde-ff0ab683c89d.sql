CREATE POLICY "Authenticated users can update backups"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'clinic-backups')
WITH CHECK (bucket_id = 'clinic-backups');