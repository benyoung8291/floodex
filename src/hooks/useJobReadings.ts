import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import type { Tables, TablesInsert } from '@/integrations/supabase/types';

type DryingChamber = Tables<'drying_chambers'>;
type MoistureReading = Tables<'moisture_readings'>;

// Fetch job details
export function useJob(jobId: string | undefined) {
  return useQuery({
    queryKey: ['job', jobId],
    queryFn: async () => {
      if (!jobId) throw new Error('Job ID required');
      
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', jobId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!jobId,
  });
}

// Fetch chambers for a job
export function useJobChambers(jobId: string | undefined) {
  return useQuery({
    queryKey: ['chambers', jobId],
    queryFn: async () => {
      if (!jobId) throw new Error('Job ID required');
      
      const { data, error } = await supabase
        .from('drying_chambers')
        .select('*')
        .eq('job_id', jobId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data;
    },
    enabled: !!jobId,
  });
}

// Fetch readings for a specific chamber
export function useChamberReadings(chamberId: string | undefined) {
  return useQuery({
    queryKey: ['readings', chamberId],
    queryFn: async () => {
      if (!chamberId) throw new Error('Chamber ID required');
      
      const { data, error } = await supabase
        .from('moisture_readings')
        .select('*')
        .eq('chamber_id', chamberId)
        .order('logged_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!chamberId,
  });
}

// Fetch latest reading per chamber for a job (supports both ambient and all types)
export function useLatestReadings(jobId: string | undefined, includeAllTypes: boolean = false) {
  return useQuery({
    queryKey: ['latest-readings', jobId, includeAllTypes],
    queryFn: async () => {
      if (!jobId) throw new Error('Job ID required');
      
      // Get all readings for this job, ordered by logged_at desc
      let query = supabase
        .from('moisture_readings')
        .select('*')
        .eq('job_id', jobId)
        .order('logged_at', { ascending: false });
      
      // Only filter for ambient if not including all types
      if (!includeAllTypes) {
        query = query.eq('reading_type', 'ambient');
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Group by chamber and take the latest
      const latestByChamberId = new Map<string, MoistureReading>();
      for (const reading of data || []) {
        if (!latestByChamberId.has(reading.chamber_id)) {
          latestByChamberId.set(reading.chamber_id, reading);
        }
      }
      
      return latestByChamberId;
    },
    enabled: !!jobId,
  });
}

// Fetch latest material reading per chamber for a job
export function useLatestMaterialReadings(jobId: string | undefined) {
  return useQuery({
    queryKey: ['latest-material-readings', jobId],
    queryFn: async () => {
      if (!jobId) throw new Error('Job ID required');
      
      const { data, error } = await supabase
        .from('moisture_readings')
        .select('*')
        .eq('job_id', jobId)
        .eq('reading_type', 'material')
        .order('logged_at', { ascending: false });
      
      if (error) throw error;
      
      // Group by chamber and take the latest material reading
      const latestByChamberId = new Map<string, MoistureReading>();
      for (const reading of data || []) {
        if (!latestByChamberId.has(reading.chamber_id)) {
          latestByChamberId.set(reading.chamber_id, reading);
        }
      }
      
      return latestByChamberId;
    },
    enabled: !!jobId,
  });
}

// Create a new drying chamber
export function useCreateChamber() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user, effectiveTenantId } = useAuth();

  return useMutation({
    mutationFn: async (data: { jobId: string; name: string; targetGpp?: number; dryStandardPercent?: number }) => {
      if (!user || !effectiveTenantId) throw new Error('Not authenticated');

      const chamber: TablesInsert<'drying_chambers'> = {
        job_id: data.jobId,
        tenant_id: effectiveTenantId,
        name: data.name,
        target_gpp: data.targetGpp || null,
        dry_standard_percent: data.dryStandardPercent || null,
      };

      const { data: result, error } = await supabase
        .from('drying_chambers')
        .insert(chamber)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['chambers', variables.jobId] });
      toast({
        title: 'Chamber created',
        description: `${variables.name} added to job`,
      });
    },
    onError: (error) => {
      console.error('Failed to create chamber:', error);
      toast({
        title: 'Error',
        description: 'Failed to create drying chamber',
        variant: 'destructive',
      });
    },
  });
}

// Create a new moisture reading
export function useCreateReading() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user, effectiveTenantId } = useAuth();

  return useMutation({
    mutationFn: async (data: {
      chamberId: string;
      jobId: string;
      readingType: 'ambient' | 'material';
      temperature: number;
      relativeHumidity: number;
      gpp: number;
      materialType?: string;
      moistureContent?: number;
    }) => {
      if (!user || !effectiveTenantId) throw new Error('Not authenticated');

      const reading: TablesInsert<'moisture_readings'> = {
        chamber_id: data.chamberId,
        job_id: data.jobId,
        tenant_id: effectiveTenantId,
        reading_type: data.readingType,
        temperature: data.temperature,
        relative_humidity: data.relativeHumidity,
        gpp: data.gpp,
        material_type: data.materialType || null,
        moisture_content: data.moistureContent || null,
        logged_by: user.id,
      };

      const { data: result, error } = await supabase
        .from('moisture_readings')
        .insert(reading)
        .select()
        .single();

      if (error) throw error;

      // Log usage for billing
      const now = new Date();
      const billingPeriodStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const billingPeriodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

      await supabase.from('usage_logs').insert({
        tenant_id: effectiveTenantId,
        event_type: 'reading_logged',
        job_id: data.jobId,
        user_id: user.id,
        billing_period_start: billingPeriodStart,
        billing_period_end: billingPeriodEnd,
      });

      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['readings', variables.chamberId] });
      queryClient.invalidateQueries({ queryKey: ['latest-readings', variables.jobId] });
      toast({
        title: 'Reading logged',
        description: `${variables.readingType === 'ambient' ? 'Ambient' : 'Material'} reading saved`,
      });
    },
    onError: (error) => {
      console.error('Failed to log reading:', error);
      toast({
        title: 'Error',
        description: 'Failed to save reading',
        variant: 'destructive',
      });
    },
  });
}

// Create a new moisture reading and link it to a floor plan marker
export function useCreateAndLinkReading() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user, effectiveTenantId } = useAuth();

  return useMutation({
    mutationFn: async (data: {
      chamberId: string;
      jobId: string;
      floorPlanId: string;
      markerId: string;
      readingType: 'ambient' | 'material';
      temperature: number;
      relativeHumidity: number;
      gpp: number;
      materialType?: string;
      moistureContent?: number;
    }) => {
      if (!user || !effectiveTenantId) throw new Error('Not authenticated');

      const reading: TablesInsert<'moisture_readings'> = {
        chamber_id: data.chamberId,
        job_id: data.jobId,
        tenant_id: effectiveTenantId,
        reading_type: data.readingType,
        temperature: data.temperature,
        relative_humidity: data.relativeHumidity,
        gpp: data.gpp,
        material_type: data.materialType || null,
        moisture_content: data.moistureContent || null,
        logged_by: user.id,
        floor_plan_id: data.floorPlanId,
        marker_id: data.markerId,
      };

      const { data: result, error } = await supabase
        .from('moisture_readings')
        .insert(reading)
        .select()
        .single();

      if (error) throw error;

      // Log usage for billing
      const now = new Date();
      const billingPeriodStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const billingPeriodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

      await supabase.from('usage_logs').insert({
        tenant_id: effectiveTenantId,
        event_type: 'reading_logged',
        job_id: data.jobId,
        user_id: user.id,
        billing_period_start: billingPeriodStart,
        billing_period_end: billingPeriodEnd,
      });

      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['readings', variables.chamberId] });
      queryClient.invalidateQueries({ queryKey: ['latest-readings', variables.jobId] });
      queryClient.invalidateQueries({ queryKey: ['floor-plan-readings', variables.floorPlanId] });
      queryClient.invalidateQueries({ queryKey: ['all-readings', variables.jobId] });
      toast({
        title: 'Reading saved & linked',
        description: 'Reading created and linked to marker',
      });
    },
    onError: (error) => {
      console.error('Failed to create and link reading:', error);
      toast({
        title: 'Error',
        description: 'Failed to save reading',
        variant: 'destructive',
      });
    },
  });
}

// Update outdoor ambient reading on a job
export function useUpdateOutdoorReading() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: {
      jobId: string;
      temperature: number;
      humidity: number;
      gpp: number;
    }) => {
      const { error } = await supabase
        .from('jobs')
        .update({
          outdoor_temperature: data.temperature,
          outdoor_humidity: data.humidity,
          outdoor_gpp: data.gpp,
          outdoor_reading_at: new Date().toISOString(),
        })
        .eq('id', data.jobId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['job', variables.jobId] });
      toast({
        title: 'Outdoor reading saved',
        description: 'Reference conditions updated',
      });
    },
    onError: (error) => {
      console.error('Failed to update outdoor reading:', error);
      toast({
        title: 'Error',
        description: 'Failed to save outdoor reading',
        variant: 'destructive',
      });
    },
  });
}

// Fetch safety checks for a job
export function useJobSafetyChecks(jobId: string | undefined) {
  return useQuery({
    queryKey: ['safety-checks', jobId],
    queryFn: async () => {
      if (!jobId) throw new Error('Job ID required');
      
      const { data, error } = await supabase
        .from('job_safety_checks')
        .select('*')
        .eq('job_id', jobId);
      
      if (error) throw error;
      return data;
    },
    enabled: !!jobId,
  });
}
