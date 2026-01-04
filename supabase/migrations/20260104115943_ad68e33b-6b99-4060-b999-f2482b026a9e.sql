-- Add background image path column to floor_plans table
ALTER TABLE floor_plans 
ADD COLUMN background_image_path text NULL;