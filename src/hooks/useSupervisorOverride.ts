import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const overrideCodeQueryKey = ['supervisor-override-code'] as const;

/** Whether the company has a supervisor override code configured (never returns the code). */
export function useHasOverrideCode() {
  const { effectiveTenantId } = useAuth();

  return useQuery({
    queryKey: [...overrideCodeQueryKey, effectiveTenantId],
    enabled: !!effectiveTenantId,
    staleTime: 60_000,
    queryFn: async (): Promise<boolean> => {
      const { data, error } = await supabase.rpc('tenant_has_override_code');
      if (error) throw error;
      return Boolean(data);
    },
  });
}

/** Sets or clears the supervisor override code. The code is only ever stored hashed, server-side. */
export function useSetOverrideCode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (code: string | null) => {
      const { data, error } = await supabase.rpc('set_supervisor_override_code', {
        _code: code ?? '',
      });
      if (error) throw error;
      return Boolean(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: overrideCodeQueryKey });
    },
  });
}

/** Server-side check of a supervisor override code. */
export async function verifySupervisorOverride(code: string): Promise<boolean> {
  const { data, error } = await supabase.rpc('verify_supervisor_override', { _code: code });
  if (error) throw error;
  return Boolean(data);
}
