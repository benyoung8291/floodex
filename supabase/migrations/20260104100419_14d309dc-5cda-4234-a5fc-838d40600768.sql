-- Add floor plan linking columns to moisture_readings
ALTER TABLE public.moisture_readings
ADD COLUMN floor_plan_id uuid REFERENCES floor_plans(id) ON DELETE SET NULL,
ADD COLUMN marker_id text;

-- Create index for efficient lookups
CREATE INDEX idx_moisture_readings_floor_plan ON public.moisture_readings(floor_plan_id) WHERE floor_plan_id IS NOT NULL;