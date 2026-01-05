-- Add Stripe price and product IDs to subscription tiers
ALTER TABLE public.subscription_tiers 
ADD COLUMN IF NOT EXISTS stripe_price_id text,
ADD COLUMN IF NOT EXISTS stripe_product_id text;