-- Create the job-photos storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('job-photos', 'job-photos', true);

-- RLS: Users can upload photos to their tenant's folder
CREATE POLICY "Users can upload photos to their tenant folder"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'job-photos' AND
  (storage.foldername(name))[1] = get_user_tenant_id(auth.uid())::text
);

-- RLS: Users can view their tenant's photos
CREATE POLICY "Users can view their tenant photos"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'job-photos' AND
  (storage.foldername(name))[1] = get_user_tenant_id(auth.uid())::text
);

-- RLS: Users can delete their tenant's photos
CREATE POLICY "Users can delete their tenant photos"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'job-photos' AND
  (storage.foldername(name))[1] = get_user_tenant_id(auth.uid())::text
);

-- Add annotation support to job_photos table
ALTER TABLE job_photos 
ADD COLUMN annotation_data jsonb DEFAULT NULL,
ADD COLUMN has_annotations boolean DEFAULT false;