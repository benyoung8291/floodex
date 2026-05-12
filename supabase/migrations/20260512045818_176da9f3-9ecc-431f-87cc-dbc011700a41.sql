INSERT INTO public.subscriptions (tenant_id, environment, stripe_customer_id, stripe_subscription_id, status, price_lookup_key, current_period_end, cancel_at_period_end, updated_at)
VALUES ('07d20748-8d1c-42ff-8a77-2f471d1f9ca7','sandbox','','sub_1TW8MURi5yfEWfAwsjwLXwNc','active','starter_monthly','2026-06-12T04:56:03Z',false, now())
ON CONFLICT (stripe_subscription_id) DO UPDATE SET status=EXCLUDED.status, price_lookup_key=EXCLUDED.price_lookup_key, current_period_end=EXCLUDED.current_period_end, updated_at=now();

UPDATE public.tenants
SET subscription_status='active', subscription_tier_id='819ab1b1-e327-493d-bd76-253c894cc9e7', stripe_subscription_id='sub_1TW8MURi5yfEWfAwsjwLXwNc'
WHERE id='07d20748-8d1c-42ff-8a77-2f471d1f9ca7';