import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface TenantWithStats {
  id: string;
  name: string;
  contact_email: string | null;
  subscription_status: string;
  subscription_tier_id: string | null;
  trial_ends_at: string | null;
  created_at: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  user_count: number;
  job_count: number;
  reading_count: number;
  tier_name: string | null;
}

export interface PlatformStats {
  totalTenants: number;
  activeUsers: number;
  mrr: number;
  trialTenants: number;
  activeTenants: number;
  cancelledTenants: number;
  totalJobs: number;
  totalReadings: number;
}

export interface TenantDetail extends TenantWithStats {
  address: string | null;
  contact_phone: string | null;
  logo_url: string | null;
  temperature_unit: string;
  humidity_ratio_unit: string;
}

export function usePlatformStats() {
  return useQuery({
    queryKey: ['admin', 'platform-stats'],
    queryFn: async (): Promise<PlatformStats> => {
      // Get tenant counts by status
      const { data: tenants, error: tenantsError } = await supabase
        .from('tenants')
        .select('id, subscription_status, subscription_tier_id');
      
      if (tenantsError) throw tenantsError;

      // Get active users count (profiles with tenant_id)
      const { count: userCount, error: usersError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .not('tenant_id', 'is', null);
      
      if (usersError) throw usersError;

      // Get tier prices for MRR calculation
      const { data: tiers, error: tiersError } = await supabase
        .from('subscription_tiers')
        .select('id, monthly_price');
      
      if (tiersError) throw tiersError;

      const tierPriceMap = new Map(tiers?.map(t => [t.id, Number(t.monthly_price)]) || []);

      // Calculate stats
      const totalTenants = tenants?.length || 0;
      const trialTenants = tenants?.filter(t => t.subscription_status === 'trial').length || 0;
      const activeTenants = tenants?.filter(t => t.subscription_status === 'active').length || 0;
      const cancelledTenants = tenants?.filter(t => t.subscription_status === 'cancelled').length || 0;

      // Calculate MRR from active subscriptions
      const mrr = tenants?.reduce((sum, t) => {
        if (t.subscription_status === 'active' && t.subscription_tier_id) {
          return sum + (tierPriceMap.get(t.subscription_tier_id) || 0);
        }
        return sum;
      }, 0) || 0;

      // Get total jobs and readings
      const { count: jobCount } = await supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true });

      const { count: readingCount } = await supabase
        .from('moisture_readings')
        .select('*', { count: 'exact', head: true });

      return {
        totalTenants,
        activeUsers: userCount || 0,
        mrr,
        trialTenants,
        activeTenants,
        cancelledTenants,
        totalJobs: jobCount || 0,
        totalReadings: readingCount || 0,
      };
    },
  });
}

export function useAdminTenants(search?: string, statusFilter?: string) {
  return useQuery({
    queryKey: ['admin', 'tenants', search, statusFilter],
    queryFn: async (): Promise<TenantWithStats[]> => {
      // Get all tenants with tier info
      let query = supabase
        .from('tenants')
        .select(`
          id,
          name,
          contact_email,
          subscription_status,
          subscription_tier_id,
          trial_ends_at,
          created_at,
          stripe_customer_id,
          stripe_subscription_id,
          subscription_tiers (name)
        `)
        .order('created_at', { ascending: false });

      if (search) {
        query = query.or(`name.ilike.%${search}%,contact_email.ilike.%${search}%`);
      }

      if (statusFilter && statusFilter !== 'all') {
        query = query.eq('subscription_status', statusFilter as "active" | "cancelled" | "free" | "past_due" | "trial");
      }

      const { data: tenants, error: tenantsError } = await query;
      if (tenantsError) throw tenantsError;

      // Get user counts per tenant
      const { data: userCounts } = await supabase
        .from('profiles')
        .select('tenant_id')
        .not('tenant_id', 'is', null);

      // Get job counts per tenant
      const { data: jobCounts } = await supabase
        .from('jobs')
        .select('tenant_id');

      // Get reading counts per tenant
      const { data: readingCounts } = await supabase
        .from('moisture_readings')
        .select('tenant_id');

      // Aggregate counts
      const userCountMap = new Map<string, number>();
      userCounts?.forEach(u => {
        if (u.tenant_id) {
          userCountMap.set(u.tenant_id, (userCountMap.get(u.tenant_id) || 0) + 1);
        }
      });

      const jobCountMap = new Map<string, number>();
      jobCounts?.forEach(j => {
        jobCountMap.set(j.tenant_id, (jobCountMap.get(j.tenant_id) || 0) + 1);
      });

      const readingCountMap = new Map<string, number>();
      readingCounts?.forEach(r => {
        readingCountMap.set(r.tenant_id, (readingCountMap.get(r.tenant_id) || 0) + 1);
      });

      return tenants?.map(t => ({
        id: t.id,
        name: t.name,
        contact_email: t.contact_email,
        subscription_status: t.subscription_status,
        subscription_tier_id: t.subscription_tier_id,
        trial_ends_at: t.trial_ends_at,
        created_at: t.created_at,
        stripe_customer_id: t.stripe_customer_id,
        stripe_subscription_id: t.stripe_subscription_id,
        user_count: userCountMap.get(t.id) || 0,
        job_count: jobCountMap.get(t.id) || 0,
        reading_count: readingCountMap.get(t.id) || 0,
        tier_name: (t.subscription_tiers as any)?.name || null,
      })) || [];
    },
  });
}

export function useAdminTenantDetail(tenantId: string | undefined) {
  return useQuery({
    queryKey: ['admin', 'tenant-detail', tenantId],
    queryFn: async (): Promise<TenantDetail | null> => {
      if (!tenantId) return null;

      const { data: tenant, error } = await supabase
        .from('tenants')
        .select(`
          *,
          subscription_tiers (name)
        `)
        .eq('id', tenantId)
        .single();

      if (error) throw error;

      // Get counts
      const { count: userCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tenantId);

      const { count: jobCount } = await supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tenantId);

      const { count: readingCount } = await supabase
        .from('moisture_readings')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tenantId);

      return {
        ...tenant,
        user_count: userCount || 0,
        job_count: jobCount || 0,
        reading_count: readingCount || 0,
        tier_name: (tenant.subscription_tiers as any)?.name || null,
      };
    },
    enabled: !!tenantId,
  });
}

export function useTenantUsers(tenantId: string | undefined) {
  return useQuery({
    queryKey: ['admin', 'tenant-users', tenantId],
    queryFn: async () => {
      if (!tenantId) return [];

      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('tenant_id', tenantId);

      if (error) throw error;

      // Get roles for these users
      const userIds = profiles?.map(p => p.id) || [];
      const { data: roles } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .in('user_id', userIds);

      const roleMap = new Map<string, string[]>();
      roles?.forEach(r => {
        if (!roleMap.has(r.user_id)) {
          roleMap.set(r.user_id, []);
        }
        roleMap.get(r.user_id)?.push(r.role);
      });

      return profiles?.map(p => ({
        ...p,
        roles: roleMap.get(p.id) || [],
      })) || [];
    },
    enabled: !!tenantId,
  });
}

export function useTenantJobs(tenantId: string | undefined) {
  return useQuery({
    queryKey: ['admin', 'tenant-jobs', tenantId],
    queryFn: async () => {
      if (!tenantId) return [];

      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data || [];
    },
    enabled: !!tenantId,
  });
}

export function useTenantUsageLogs(tenantId: string | undefined) {
  return useQuery({
    queryKey: ['admin', 'tenant-usage', tenantId],
    queryFn: async () => {
      if (!tenantId) return [];

      const { data, error } = await supabase
        .from('usage_logs')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data || [];
    },
    enabled: !!tenantId,
  });
}

export function useRecentTenantSignups(limit = 5) {
  return useQuery({
    queryKey: ['admin', 'recent-signups', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tenants')
        .select('id, name, contact_email, created_at, subscription_status')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    },
  });
}

export function useTenantGrowthData() {
  return useQuery({
    queryKey: ['admin', 'tenant-growth'],
    queryFn: async () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data, error } = await supabase
        .from('tenants')
        .select('created_at')
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Group by day
      const dailyCounts: Record<string, number> = {};
      data?.forEach(t => {
        const date = new Date(t.created_at).toISOString().split('T')[0];
        dailyCounts[date] = (dailyCounts[date] || 0) + 1;
      });

      // Fill in missing days
      const result = [];
      const currentDate = new Date(thirtyDaysAgo);
      const today = new Date();
      
      while (currentDate <= today) {
        const dateStr = currentDate.toISOString().split('T')[0];
        result.push({
          date: dateStr,
          count: dailyCounts[dateStr] || 0,
        });
        currentDate.setDate(currentDate.getDate() + 1);
      }

      return result;
    },
  });
}

export function useSubscriptionDistribution() {
  return useQuery({
    queryKey: ['admin', 'subscription-distribution'],
    queryFn: async () => {
      const { data: tenants, error } = await supabase
        .from('tenants')
        .select('subscription_status, subscription_tier_id, subscription_tiers(name)');

      if (error) throw error;

      const distribution: Record<string, number> = {};
      tenants?.forEach(t => {
        const label = t.subscription_status === 'trial' 
          ? 'Trial' 
          : (t.subscription_tiers as any)?.name || 'Free';
        distribution[label] = (distribution[label] || 0) + 1;
      });

      return Object.entries(distribution).map(([name, value]) => ({
        name,
        value,
      }));
    },
  });
}
