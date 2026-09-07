REVOKE ALL ON FUNCTION public.tenant_has_unlimited(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.job_edits_allowed(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.tenant_has_unlimited(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.job_edits_allowed(uuid) TO service_role;