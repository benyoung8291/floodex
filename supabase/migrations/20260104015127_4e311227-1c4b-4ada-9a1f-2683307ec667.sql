-- Add outdoor ambient reading fields to jobs table
ALTER TABLE public.jobs 
ADD COLUMN outdoor_temperature numeric,
ADD COLUMN outdoor_humidity numeric,
ADD COLUMN outdoor_gpp numeric,
ADD COLUMN outdoor_reading_at timestamp with time zone;