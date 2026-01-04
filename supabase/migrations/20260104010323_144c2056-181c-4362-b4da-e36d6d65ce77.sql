-- Add onboarding tracking columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN onboarding_completed boolean NOT NULL DEFAULT false,
ADD COLUMN onboarding_step integer NOT NULL DEFAULT 0;