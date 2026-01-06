import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface EstimateLineItem {
  id: string;
  name: string;
  description?: string;
  category: string;
  quantity: number;
  unit_type: string;
  unit_rate: number;
  total_amount: number;
  is_billable: boolean;
}

export interface JobEstimate {
  id: string;
  job_id: string;
  tenant_id: string;
  estimate_number: string;
  status: 'draft' | 'sent' | 'accepted' | 'declined' | 'expired';
  valid_until: string | null;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string | null;
  customer_address: string | null;
  line_items: EstimateLineItem[];
  subtotal: number;
  tax_rate: number | null;
  tax_amount: number | null;
  discount_amount: number | null;
  discount_description: string | null;
  total_amount: number;
  scope_of_work: string | null;
  terms_and_conditions: string | null;
  notes: string | null;
  customer_notes: string | null;
  created_by: string;
  sent_at: string | null;
  sent_to_email: string | null;
  viewed_at: string | null;
  accepted_at: string | null;
  declined_at: string | null;
  decline_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateEstimateData {
  job_id: string;
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  customer_address?: string;
  line_items: EstimateLineItem[];
  subtotal: number;
  tax_rate?: number;
  tax_amount?: number;
  discount_amount?: number;
  discount_description?: string;
  total_amount: number;
  scope_of_work?: string;
  terms_and_conditions?: string;
  notes?: string;
  customer_notes?: string;
  valid_until?: string;
}

export interface UpdateEstimateData extends Partial<CreateEstimateData> {
  id: string;
  status?: JobEstimate['status'];
}

// Helper to transform DB response to typed estimate
const transformEstimate = (data: any): JobEstimate => ({
  ...data,
  line_items: (data.line_items || []) as EstimateLineItem[],
});

// Fetch all estimates for a job
export const useJobEstimates = (jobId: string | undefined) => {
  const { effectiveTenantId } = useAuth();

  return useQuery({
    queryKey: ['job-estimates', jobId, effectiveTenantId],
    queryFn: async () => {
      if (!jobId || !effectiveTenantId) return [];

      const { data, error } = await supabase
        .from('job_estimates')
        .select('*')
        .eq('job_id', jobId)
        .eq('tenant_id', effectiveTenantId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(transformEstimate);
    },
    enabled: !!jobId && !!effectiveTenantId,
  });
};

// Fetch single estimate
export const useEstimate = (estimateId: string | undefined) => {
  const { effectiveTenantId } = useAuth();

  return useQuery({
    queryKey: ['estimate', estimateId, effectiveTenantId],
    queryFn: async () => {
      if (!estimateId || !effectiveTenantId) return null;

      const { data, error } = await supabase
        .from('job_estimates')
        .select('*')
        .eq('id', estimateId)
        .eq('tenant_id', effectiveTenantId)
        .single();

      if (error) throw error;
      return transformEstimate(data);
    },
    enabled: !!estimateId && !!effectiveTenantId,
  });
};

// Generate next estimate number
export const useGenerateEstimateNumber = () => {
  const { effectiveTenantId } = useAuth();

  return useQuery({
    queryKey: ['next-estimate-number', effectiveTenantId],
    queryFn: async () => {
      if (!effectiveTenantId) return 'EST-0001';

      const year = new Date().getFullYear();
      const prefix = `EST-${year}-`;

      const { data, error } = await supabase
        .from('job_estimates')
        .select('estimate_number')
        .eq('tenant_id', effectiveTenantId)
        .ilike('estimate_number', `${prefix}%`)
        .order('estimate_number', { ascending: false })
        .limit(1);

      if (error) throw error;

      if (!data || data.length === 0) {
        return `${prefix}0001`;
      }

      const lastNumber = data[0].estimate_number;
      const numPart = parseInt(lastNumber.replace(prefix, ''), 10);
      const nextNum = (numPart + 1).toString().padStart(4, '0');
      return `${prefix}${nextNum}`;
    },
    enabled: !!effectiveTenantId,
  });
};

// Create estimate
export const useCreateEstimate = () => {
  const queryClient = useQueryClient();
  const { user, effectiveTenantId } = useAuth();

  return useMutation({
    mutationFn: async (data: CreateEstimateData & { estimate_number: string }) => {
      if (!user || !effectiveTenantId) throw new Error('Not authenticated');

      const insertData = {
        estimate_number: data.estimate_number,
        job_id: data.job_id,
        tenant_id: effectiveTenantId,
        created_by: user.id,
        customer_name: data.customer_name,
        customer_email: data.customer_email,
        customer_phone: data.customer_phone,
        customer_address: data.customer_address,
        line_items: data.line_items as unknown as Record<string, unknown>[],
        subtotal: data.subtotal,
        tax_rate: data.tax_rate,
        tax_amount: data.tax_amount,
        discount_amount: data.discount_amount,
        discount_description: data.discount_description,
        total_amount: data.total_amount,
        scope_of_work: data.scope_of_work,
        terms_and_conditions: data.terms_and_conditions,
        notes: data.notes,
        customer_notes: data.customer_notes,
        valid_until: data.valid_until,
      };

      const { data: result, error } = await supabase
        .from('job_estimates')
        .insert(insertData as any)
        .select()
        .single();

      if (error) throw error;
      return transformEstimate(result);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['job-estimates', data.job_id] });
      queryClient.invalidateQueries({ queryKey: ['next-estimate-number'] });
      toast.success('Estimate created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create estimate');
      console.error('Create estimate error:', error);
    },
  });
};

// Update estimate
export const useUpdateEstimate = () => {
  const queryClient = useQueryClient();
  const { effectiveTenantId } = useAuth();

  return useMutation({
    mutationFn: async ({ id, ...data }: UpdateEstimateData) => {
      if (!effectiveTenantId) throw new Error('No tenant');

      const updateData: Record<string, unknown> = { ...data };
      if (data.line_items) {
        updateData.line_items = data.line_items as unknown as Record<string, unknown>[];
      }

      const { data: result, error } = await supabase
        .from('job_estimates')
        .update(updateData)
        .eq('id', id)
        .eq('tenant_id', effectiveTenantId)
        .select()
        .single();

      if (error) throw error;
      return transformEstimate(result);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['job-estimates', data.job_id] });
      queryClient.invalidateQueries({ queryKey: ['estimate', data.id] });
      toast.success('Estimate updated');
    },
    onError: (error) => {
      toast.error('Failed to update estimate');
      console.error('Update estimate error:', error);
    },
  });
};

// Send estimate
export const useSendEstimate = () => {
  const queryClient = useQueryClient();
  const { effectiveTenantId } = useAuth();

  return useMutation({
    mutationFn: async ({ id, email }: { id: string; email?: string }) => {
      if (!effectiveTenantId) throw new Error('No tenant');

      const { data, error } = await supabase
        .from('job_estimates')
        .update({
          status: 'sent',
          sent_at: new Date().toISOString(),
          sent_to_email: email || null,
        })
        .eq('id', id)
        .eq('tenant_id', effectiveTenantId)
        .select()
        .single();

      if (error) throw error;
      return transformEstimate(data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['job-estimates', data.job_id] });
      queryClient.invalidateQueries({ queryKey: ['estimate', data.id] });
      toast.success('Estimate marked as sent');
    },
    onError: (error) => {
      toast.error('Failed to send estimate');
      console.error('Send estimate error:', error);
    },
  });
};

// Accept estimate
export const useAcceptEstimate = () => {
  const queryClient = useQueryClient();
  const { effectiveTenantId } = useAuth();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!effectiveTenantId) throw new Error('No tenant');

      const { data, error } = await supabase
        .from('job_estimates')
        .update({
          status: 'accepted',
          accepted_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('tenant_id', effectiveTenantId)
        .select()
        .single();

      if (error) throw error;
      return transformEstimate(data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['job-estimates', data.job_id] });
      queryClient.invalidateQueries({ queryKey: ['estimate', data.id] });
      toast.success('Estimate accepted');
    },
    onError: (error) => {
      toast.error('Failed to accept estimate');
      console.error('Accept estimate error:', error);
    },
  });
};

// Decline estimate
export const useDeclineEstimate = () => {
  const queryClient = useQueryClient();
  const { effectiveTenantId } = useAuth();

  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      if (!effectiveTenantId) throw new Error('No tenant');

      const { data, error } = await supabase
        .from('job_estimates')
        .update({
          status: 'declined',
          declined_at: new Date().toISOString(),
          decline_reason: reason || null,
        })
        .eq('id', id)
        .eq('tenant_id', effectiveTenantId)
        .select()
        .single();

      if (error) throw error;
      return transformEstimate(data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['job-estimates', data.job_id] });
      queryClient.invalidateQueries({ queryKey: ['estimate', data.id] });
      toast.success('Estimate declined');
    },
    onError: (error) => {
      toast.error('Failed to decline estimate');
      console.error('Decline estimate error:', error);
    },
  });
};

// Delete estimate
export const useDeleteEstimate = () => {
  const queryClient = useQueryClient();
  const { effectiveTenantId } = useAuth();

  return useMutation({
    mutationFn: async ({ id, jobId }: { id: string; jobId: string }) => {
      if (!effectiveTenantId) throw new Error('No tenant');

      const { error } = await supabase
        .from('job_estimates')
        .delete()
        .eq('id', id)
        .eq('tenant_id', effectiveTenantId);

      if (error) throw error;
      return { id, jobId };
    },
    onSuccess: ({ jobId }) => {
      queryClient.invalidateQueries({ queryKey: ['job-estimates', jobId] });
      toast.success('Estimate deleted');
    },
    onError: (error) => {
      toast.error('Failed to delete estimate');
      console.error('Delete estimate error:', error);
    },
  });
};
