import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ActivityEvent {
  occurred_at: string;
  tenant_id: string | null;
  tenant_name: string | null;
  actor_id: string | null;
  actor_name: string | null;
  event_type: string;
  entity_id: string | null;
  job_id: string | null;
  job_label: string | null;
  summary: string;
}

export interface ActivityStats {
  eventsToday: number;
  eventsWeek: number;
  activeTenantsWeek: number;
  jobsThisWeek: number;
  topTenantName: string | null;
  topTenantEvents: number | null;
}

export interface ActivityFilters {
  tenantId?: string | null;
  eventTypes?: string[] | null;
  since?: string | null;
  search?: string | null;
  limit?: number;
  offset?: number;
}

export const ACTIVITY_EVENT_LABELS: Record<string, string> = {
  job_created: 'Job created',
  report_unlocked: 'Report unlocked',
  reading_logged: 'Reading logged',
  photo_added: 'Photo added',
  work_log_added: 'Work log',
  form_created: 'Form started',
  form_signed: 'Form signed',
  cost_item_added: 'Cost item',
  estimate_created: 'Estimate',
  damage_assessment_added: 'Damage assessment',
  floor_plan_created: 'Floor plan',
  equipment_assigned: 'Equipment assigned',
  share_link_created: 'Share link',
  team_invited: 'Team invite',
  user_signed_up: 'User joined',
  subscription_event: 'Subscription',
};

export function useAdminActivity(filters: ActivityFilters = {}) {
  const { tenantId = null, eventTypes = null, since = null, search = null, limit = 100, offset = 0 } = filters;

  return useQuery({
    queryKey: ['admin', 'activity', tenantId, eventTypes, since, search, limit, offset],
    staleTime: 15_000,
    queryFn: async (): Promise<ActivityEvent[]> => {
      const { data, error } = await supabase.rpc('admin_activity_feed', {
        p_tenant_id: tenantId,
        p_event_types: eventTypes && eventTypes.length ? eventTypes : null,
        p_since: since,
        p_search: search,
        p_limit: limit,
        p_offset: offset,
      });
      if (error) throw error;
      return (data ?? []) as ActivityEvent[];
    },
  });
}

export function useAdminActivityStats() {
  return useQuery({
    queryKey: ['admin', 'activity-stats'],
    staleTime: 30_000,
    queryFn: async (): Promise<ActivityStats> => {
      const { data, error } = await supabase.rpc('admin_activity_stats');
      if (error) throw error;
      const raw = (data ?? {}) as Record<string, unknown>;
      return {
        eventsToday: Number(raw.eventsToday ?? 0),
        eventsWeek: Number(raw.eventsWeek ?? 0),
        activeTenantsWeek: Number(raw.activeTenantsWeek ?? 0),
        jobsThisWeek: Number(raw.jobsThisWeek ?? 0),
        topTenantName: (raw.topTenantName as string | null) ?? null,
        topTenantEvents: raw.topTenantEvents == null ? null : Number(raw.topTenantEvents),
      };
    },
  });
}
