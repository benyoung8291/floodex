-- Create floor_plans table
CREATE TABLE public.floor_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  name text NOT NULL DEFAULT 'Floor Plan',
  floor_number integer DEFAULT 1,
  canvas_data jsonb NOT NULL,
  thumbnail_path text,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.floor_plans ENABLE ROW LEVEL SECURITY;

-- RLS policy
CREATE POLICY "Users can manage floor plans"
ON public.floor_plans FOR ALL
USING (tenant_id = get_user_tenant_id(auth.uid()))
WITH CHECK (tenant_id = get_user_tenant_id(auth.uid()));

-- Updated at trigger
CREATE TRIGGER update_floor_plans_updated_at
  BEFORE UPDATE ON public.floor_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Create storage bucket for floor plan thumbnails
INSERT INTO storage.buckets (id, name, public)
VALUES ('floor-plans', 'floor-plans', true);

-- Storage policies
CREATE POLICY "Users can upload floor plan thumbnails"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'floor-plans');

CREATE POLICY "Users can view floor plan thumbnails"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'floor-plans');

CREATE POLICY "Users can update floor plan thumbnails"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'floor-plans');

CREATE POLICY "Users can delete floor plan thumbnails"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'floor-plans');