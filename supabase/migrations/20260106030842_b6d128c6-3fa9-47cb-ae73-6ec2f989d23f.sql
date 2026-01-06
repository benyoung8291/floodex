-- Add daily_rate column to equipment table
ALTER TABLE public.equipment 
ADD COLUMN daily_rate numeric DEFAULT 0;

-- Add comment for clarity
COMMENT ON COLUMN public.equipment.daily_rate IS 'Daily rental rate for cost calculations';