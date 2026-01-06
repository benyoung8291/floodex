import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface DamageAssessment {
  id: string;
  job_id: string;
  tenant_id: string;
  chamber_id: string | null;
  area_name: string;
  material_type: string;
  is_restorable: boolean;
  status: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface CreateDamageAssessmentData {
  jobId: string;
  chamberId?: string;
  areaName: string;
  materialType: string;
  isRestorable: boolean;
  status?: string;
  notes?: string;
}

interface UpdateDamageAssessmentData {
  id: string;
  areaName?: string;
  materialType?: string;
  isRestorable?: boolean;
  status?: string;
  notes?: string;
}

export function useJobDamageAssessments(jobId: string | undefined) {
  return useQuery({
    queryKey: ['damage-assessments', jobId],
    queryFn: async () => {
      if (!jobId) return [];
      
      const { data, error } = await supabase
        .from('damage_assessments')
        .select('*')
        .eq('job_id', jobId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as DamageAssessment[];
    },
    enabled: !!jobId,
  });
}

export function useCreateDamageAssessment() {
  const { effectiveTenantId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateDamageAssessmentData) => {
      if (!effectiveTenantId) {
        throw new Error('User must be authenticated');
      }

      const { data: assessment, error } = await supabase
        .from('damage_assessments')
        .insert({
          job_id: data.jobId,
          tenant_id: effectiveTenantId,
          chamber_id: data.chamberId || null,
          area_name: data.areaName,
          material_type: data.materialType,
          is_restorable: data.isRestorable,
          status: data.status || 'pending',
          notes: data.notes || null,
        })
        .select()
        .single();

      if (error) throw error;
      return assessment;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['damage-assessments', variables.jobId] });
      toast.success('Damage assessment added');
    },
    onError: (error) => {
      console.error('Error creating damage assessment:', error);
      toast.error('Failed to add damage assessment');
    },
  });
}

export function useUpdateDamageAssessment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateDamageAssessmentData) => {
      const updateData: any = {};
      if (data.areaName !== undefined) updateData.area_name = data.areaName;
      if (data.materialType !== undefined) updateData.material_type = data.materialType;
      if (data.isRestorable !== undefined) updateData.is_restorable = data.isRestorable;
      if (data.status !== undefined) updateData.status = data.status;
      if (data.notes !== undefined) updateData.notes = data.notes || null;

      const { data: assessment, error } = await supabase
        .from('damage_assessments')
        .update(updateData)
        .eq('id', data.id)
        .select()
        .single();

      if (error) throw error;
      return assessment;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['damage-assessments', data.job_id] });
      toast.success('Damage assessment updated');
    },
    onError: (error) => {
      console.error('Error updating damage assessment:', error);
      toast.error('Failed to update damage assessment');
    },
  });
}

export function useDeleteDamageAssessment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, jobId }: { id: string; jobId: string }) => {
      const { error } = await supabase
        .from('damage_assessments')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { id, jobId };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['damage-assessments', variables.jobId] });
      toast.success('Damage assessment deleted');
    },
    onError: (error) => {
      console.error('Error deleting damage assessment:', error);
      toast.error('Failed to delete damage assessment');
    },
  });
}
