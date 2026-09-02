import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { Job } from '@/hooks/useJobs';
import { todayDisplayDateKey, toLocalDateKey } from '@/lib/datetime';

interface SafetyCheck {
  hazardType: string;
  isPresent: boolean;
  requiresStopWork: boolean;
  notes: string;
}

interface CreateJobData {
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  latitude?: number;
  longitude?: number;
  lossType: 'cat1' | 'cat2' | 'cat3';
  lossClass?: 'class1' | 'class2' | 'class3' | 'class4';
  notes?: string;
  // Claim info fields
  claimId?: string;
  dateOfLoss?: Date;
  sourceOfLoss?: string;
  affectedAreas?: string;
  affectedMaterials?: string;
  claimSummary?: string;
  safetyChecks: SafetyCheck[];
  safetyOverrideAuthorized?: boolean;
}

export function useCreateJob() {
  const { user, tenantId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateJobData) => {
      if (!user || !tenantId) {
        throw new Error('User must be authenticated');
      }

      const requiresStopWork = data.safetyChecks.some(
        (check) => check.isPresent && check.requiresStopWork
      );

      if (requiresStopWork && !data.safetyOverrideAuthorized) {
        throw new Error('Supervisor override required for critical hazards');
      }

      const nowIso = new Date().toISOString();

      // Insert the job
      const { data: job, error: jobError } = await supabase
        .from('jobs')
        .insert({
          tenant_id: tenantId,
          created_by: user.id,
          customer_name: data.customerName,
          customer_phone: data.customerPhone || null,
          customer_email: data.customerEmail || null,
          address: data.address,
          city: data.city,
          state: data.state,
          zip_code: data.zipCode,
          latitude: data.latitude || null,
          longitude: data.longitude || null,
          loss_type: data.lossType,
          loss_class: data.lossClass || 'class1',
          notes: data.notes || null,
          // Claim info fields
          claim_id: data.claimId || null,
          start_date: todayDisplayDateKey(),
          date_of_loss: data.dateOfLoss ? toLocalDateKey(data.dateOfLoss) : null,
          source_of_loss: data.sourceOfLoss || null,
          affected_areas: data.affectedAreas || null,
          affected_materials: data.affectedMaterials || null,
          claim_summary: data.claimSummary || null,
          status: 'drying',
          safety_completed: !requiresStopWork || !!data.safetyOverrideAuthorized,
          safety_completed_at:
            !requiresStopWork || data.safetyOverrideAuthorized ? nowIso : null,
          safety_completed_by:
            !requiresStopWork || data.safetyOverrideAuthorized ? user.id : null,
        })
        .select()
        .single();

      if (jobError) {
        throw jobError;
      }

      // Insert safety checks
      const safetyChecksToInsert = data.safetyChecks
        .filter((check) => check.isPresent || check.notes)
        .map((check) => ({
          job_id: job.id,
          hazard_type: check.hazardType,
          is_hazard_present: check.isPresent,
          requires_stop_work: check.isPresent && check.requiresStopWork,
          notes: check.notes || null,
          supervisor_override_at:
            check.isPresent && check.requiresStopWork && data.safetyOverrideAuthorized
              ? nowIso
              : null,
          supervisor_override_by:
            check.isPresent && check.requiresStopWork && data.safetyOverrideAuthorized
              ? user.id
              : null,
        }));

      if (safetyChecksToInsert.length > 0) {
        const { error: safetyError } = await supabase
          .from('job_safety_checks')
          .insert(safetyChecksToInsert);

        if (safetyError) {
          console.error('Error inserting safety checks:', safetyError);
        }
      }

      // Log usage event for billing
      const now = new Date();
      const billingPeriodStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const billingPeriodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      await supabase.from('usage_logs').insert({
        tenant_id: tenantId,
        user_id: user.id,
        job_id: job.id,
        event_type: 'job_created',
        billing_period_start: billingPeriodStart.toISOString().split('T')[0],
        billing_period_end: billingPeriodEnd.toISOString().split('T')[0],
      });

      return job;
    },
    onSuccess: (job) => {
      // Seed the detail query before navigate(`/jobs/${job.id}`) so JobDetail
      // has data immediately and does not render blank while the fetch races.
      queryClient.setQueryData(['job', job.id], job);
      queryClient.setQueriesData<Job[]>({ queryKey: ['jobs'] }, (existing) => {
        if (!existing) return [job];
        if (existing.some((item) => item.id === job.id)) return existing;
        return [job, ...existing];
      });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toast.success('Job created successfully');
    },
    onError: (error) => {
      console.error('Error creating job:', error);
      toast.error('Failed to create job');
    },
  });
}
