CREATE TABLE IF NOT EXISTS public.tenant_security_settings (
  tenant_id uuid PRIMARY KEY REFERENCES public.tenants(id) ON DELETE CASCADE,
  override_code_hash text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.tenant_security_settings TO service_role;
ALTER TABLE public.tenant_security_settings ENABLE ROW LEVEL SECURITY;

INSERT INTO public.tenant_security_settings (tenant_id, override_code_hash)
SELECT id, supervisor_override_code_hash
FROM public.tenants
WHERE supervisor_override_code_hash IS NOT NULL
ON CONFLICT (tenant_id) DO UPDATE SET override_code_hash = EXCLUDED.override_code_hash;

ALTER TABLE public.tenants DROP COLUMN IF EXISTS supervisor_override_code_hash;

CREATE OR REPLACE FUNCTION public.tenant_has_override_code()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.tenant_security_settings s
    WHERE s.tenant_id = public.get_user_tenant_id(auth.uid())
      AND s.override_code_hash IS NOT NULL
  )
$$;

CREATE OR REPLACE FUNCTION public.verify_supervisor_override(_code text)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tenant_id uuid := public.get_user_tenant_id(auth.uid());
  v_hash text;
BEGIN
  IF v_tenant_id IS NULL OR _code IS NULL OR btrim(_code) = '' THEN
    RETURN false;
  END IF;

  SELECT override_code_hash INTO v_hash
  FROM public.tenant_security_settings WHERE tenant_id = v_tenant_id;

  IF v_hash IS NULL THEN
    RETURN false;
  END IF;

  RETURN v_hash = encode(sha256(convert_to(v_tenant_id::text || ':' || _code, 'utf8')), 'hex');
END;
$$;

CREATE OR REPLACE FUNCTION public.set_supervisor_override_code(_code text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tenant_id uuid := public.get_user_tenant_id(auth.uid());
BEGIN
  IF v_tenant_id IS NULL THEN
    RAISE EXCEPTION 'No company is linked to this account' USING ERRCODE = '42501';
  END IF;

  IF NOT (public.has_role(auth.uid(), 'tenant_admin') OR public.has_role(auth.uid(), 'super_admin')) THEN
    RAISE EXCEPTION 'Only company admins can change the supervisor override code' USING ERRCODE = '42501';
  END IF;

  IF _code IS NULL OR btrim(_code) = '' THEN
    UPDATE public.tenant_security_settings SET override_code_hash = NULL, updated_at = now()
    WHERE tenant_id = v_tenant_id;
    RETURN false;
  END IF;

  IF length(btrim(_code)) < 4 THEN
    RAISE EXCEPTION 'Override code must be at least 4 characters' USING ERRCODE = '22023';
  END IF;

  INSERT INTO public.tenant_security_settings (tenant_id, override_code_hash)
  VALUES (v_tenant_id, encode(sha256(convert_to(v_tenant_id::text || ':' || _code, 'utf8')), 'hex'))
  ON CONFLICT (tenant_id) DO UPDATE
    SET override_code_hash = EXCLUDED.override_code_hash, updated_at = now();

  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.tenant_has_override_code() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.verify_supervisor_override(text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.set_supervisor_override_code(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.tenant_has_override_code() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.verify_supervisor_override(text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.set_supervisor_override_code(text) TO authenticated, service_role;
