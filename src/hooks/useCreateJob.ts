import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

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
  notes?: string;
  safetyChecks: SafetyCheck[];
}

export function useCreateJob() {
  const { user, tenantId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateJobData) => {
      if (!user || !tenantId) {
        throw new Error('User must be authenticated');
      }

      // Check if any safety checks require stop work
      const requiresStopWork = data.safetyChecks.some(
        (check) => check.isPresent && check.requiresStopWork
      );

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
          notes: data.notes || null,
          status: 'emergency',
          safety_completed: !requiresStopWork,
          safety_completed_at: !requiresStopWork ? new Date().toISOString() : null,
          safety_completed_by: !requiresStopWork ? user.id : null,
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toast.success('Job created successfully');
    },
    onError: (error) => {
      console.error('Error creating job:', error);
      toast.error('Failed to create job');
    },
  });
}
