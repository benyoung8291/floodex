-- Add humidity ratio unit preference to tenants table
ALTER TABLE public.tenants 
ADD COLUMN humidity_ratio_unit text NOT NULL DEFAULT 'GPP';