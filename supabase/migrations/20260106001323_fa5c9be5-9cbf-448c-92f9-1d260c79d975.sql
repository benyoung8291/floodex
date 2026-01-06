-- Allow super_admin to insert subscription tiers
CREATE POLICY "super_admin_insert_tiers"
ON public.subscription_tiers FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- Allow super_admin to update subscription tiers
CREATE POLICY "super_admin_update_tiers"
ON public.subscription_tiers FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'));