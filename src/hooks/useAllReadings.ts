import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Tables } from '@/integrations/supabase/types';

type MoistureReading = Tables<'moisture_readings'>;
type Job = Tables<'jobs'>;

export interface ReadingWithDetails extends MoistureReading {
  chamber_name: string;
  job_customer_name: string;
}

export interface JobWithChambers extends Job {
  chamber_count: number;
  reading_count: number;
  latest_reading_at: string | null;
  latest_gpp: number | null;
}

// Fetch jobs with chamber and reading counts for job selector
export function useJobsWithChambers() {
  const { user, effectiveTenantId } = useAuth();

  return useQuery({
    queryKey: ['jobs-with-chambers', effectiveTenantId],
    queryFn: async () => {
      if (!effectiveTenantId) return [];
      
      // Get all jobs for the tenant
      const { data: jobs, error: jobsError } = await supabase
        .from('jobs')
        .select('*')
        .eq('tenant_id', effectiveTenantId)
        .order('created_at', { ascending: false });

      if (jobsError) throw jobsError;

      // Get chamber counts per job
      const { data: chambers, error: chambersError } = await supabase
        .from('drying_chambers')
        .select('job_id')
        .eq('tenant_id', effectiveTenantId);

      if (chambersError) throw chambersError;

      // Get reading counts and latest readings per job
      const { data: readings, error: readingsError } = await supabase
        .from('moisture_readings')
        .select('job_id, logged_at, gpp')
        .eq('tenant_id', effectiveTenantId)
        .eq('reading_type', 'ambient')
        .order('logged_at', { ascending: false });

      if (readingsError) throw readingsError;

      // Aggregate data
      const chamberCounts = chambers?.reduce((acc, c) => {
        acc[c.job_id] = (acc[c.job_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) ?? {};

      const readingAggregates = readings?.reduce((acc, r) => {
        if (!acc[r.job_id]) {
          acc[r.job_id] = {
            count: 0,
            latest_at: r.logged_at,
            latest_gpp: r.gpp,
          };
        }
        acc[r.job_id].count++;
        return acc;
      }, {} as Record<string, { count: number; latest_at: string; latest_gpp: number | null }>) ?? {};

      return (jobs || []).map((job) => ({
        ...job,
        chamber_count: chamberCounts[job.id] || 0,
        reading_count: readingAggregates[job.id]?.count || 0,
        latest_reading_at: readingAggregates[job.id]?.latest_at || null,
        latest_gpp: readingAggregates[job.id]?.latest_gpp || null,
      })) as JobWithChambers[];
    },
    enabled: !!user && !!effectiveTenantId,
  });
}

// Fetch all readings for a job (across all chambers)
export function useAllJobReadings(jobId: string | undefined) {
  return useQuery({
    queryKey: ['all-job-readings', jobId],
    queryFn: async () => {
      if (!jobId) throw new Error('Job ID required');

      const { data, error } = await supabase
        .from('moisture_readings')
        .select(`
          *,
          drying_chambers!inner(name)
        `)
        .eq('job_id', jobId)
        .order('logged_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      return (data || []).map((reading) => ({
        ...reading,
        chamber_name: (reading.drying_chambers as unknown as { name: string })?.name || 'Unknown',
      }));
    },
    enabled: !!jobId,
  });
}

// Fetch recent readings across all jobs (for the main Readings page without job selected)
export function useRecentReadings(limit = 20) {
  const { user, effectiveTenantId } = useAuth();

  return useQuery({
    queryKey: ['recent-readings', effectiveTenantId, limit],
    queryFn: async () => {
      if (!effectiveTenantId) return [];
      
      const { data, error } = await supabase
        .from('moisture_readings')
        .select(`
          *,
          drying_chambers!inner(name, job_id),
          jobs!inner(customer_name)
        `)
        .eq('tenant_id', effectiveTenantId)
        .order('logged_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return (data || []).map((reading) => ({
        ...reading,
        chamber_name: (reading.drying_chambers as unknown as { name: string })?.name || 'Unknown',
        job_customer_name: (reading.jobs as unknown as { customer_name: string })?.customer_name || 'Unknown',
      })) as ReadingWithDetails[];
    },
    enabled: !!user && !!effectiveTenantId,
  });
}

// Get reading stats for dashboard
export function useReadingsStats() {
  const { user, effectiveTenantId } = useAuth();

  return useQuery({
    queryKey: ['readings-stats', effectiveTenantId],
    queryFn: async () => {
      if (!effectiveTenantId) {
        return { todayCount: 0, weekCount: 0, avgGpp: null, jobsNearTarget: 0 };
      }
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayISO = today.toISOString();

      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weekAgoISO = weekAgo.toISOString();

      // Get readings count today
      const { count: todayCount, error: todayError } = await supabase
        .from('moisture_readings')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', effectiveTenantId)
        .gte('logged_at', todayISO);

      if (todayError) throw todayError;

      // Get readings count this week
      const { count: weekCount, error: weekError } = await supabase
        .from('moisture_readings')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', effectiveTenantId)
        .gte('logged_at', weekAgoISO);

      if (weekError) throw weekError;

      // Get average GPP across active jobs (jobs not completed)
      const { data: activeJobsData, error: activeJobsError } = await supabase
        .from('jobs')
        .select('id')
        .eq('tenant_id', effectiveTenantId)
        .neq('status', 'completed');

      if (activeJobsError) throw activeJobsError;

      const activeJobIds = activeJobsData?.map((j) => j.id) || [];

      let avgGpp = null;
      let jobsNearTarget = 0;

      if (activeJobIds.length > 0) {
        // Get latest ambient reading per job and calculate average
        const { data: latestReadings, error: readingsError } = await supabase
          .from('moisture_readings')
          .select('job_id, gpp, logged_at')
          .eq('tenant_id', effectiveTenantId)
          .in('job_id', activeJobIds)
          .eq('reading_type', 'ambient')
          .order('logged_at', { ascending: false });

        if (readingsError) throw readingsError;

        // Get latest per job
        const latestByJob = new Map<string, number>();
        for (const r of latestReadings || []) {
          if (!latestByJob.has(r.job_id) && r.gpp) {
            latestByJob.set(r.job_id, r.gpp);
          }
        }

        const gppValues = Array.from(latestByJob.values());
        if (gppValues.length > 0) {
          avgGpp = Math.round((gppValues.reduce((a, b) => a + b, 0) / gppValues.length) * 10) / 10;
        }

        // Get chambers with targets to calculate jobs approaching target
        const { data: chambers, error: chambersError } = await supabase
          .from('drying_chambers')
          .select('id, job_id, target_gpp')
          .eq('tenant_id', effectiveTenantId)
          .in('job_id', activeJobIds)
          .not('target_gpp', 'is', null);

        if (chambersError) throw chambersError;

        // For each chamber with a target, check if latest reading is within 30%
        for (const chamber of chambers || []) {
          const { data: latestReading } = await supabase
            .from('moisture_readings')
            .select('gpp')
            .eq('chamber_id', chamber.id)
            .eq('reading_type', 'ambient')
            .order('logged_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (latestReading?.gpp && chamber.target_gpp) {
            if (latestReading.gpp <= chamber.target_gpp * 1.3) {
              jobsNearTarget++;
            }
          }
        }
      }

      return {
        todayCount: todayCount || 0,
        weekCount: weekCount || 0,
        avgGpp,
        jobsNearTarget,
      };
    },
    enabled: !!user && !!effectiveTenantId,
  });
}
