import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface WorkLog {
  id: string;
  job_id: string;
  tenant_id: string;
  logged_by: string;
  attendance_date: string;
  log_type: string;
  summary: string | null;
  work_completed: string[] | null;
  equipment_notes: string | null;
  created_at: string;
  updated_at: string;
}

interface CreateWorkLogData {
  jobId: string;
  attendanceDate: Date;
  logType: string;
  summary?: string;
  workCompleted?: string[];
  equipmentNotes?: string;
}

interface UpdateWorkLogData {
  id: string;
  attendanceDate?: Date;
  logType?: string;
  summary?: string;
  workCompleted?: string[];
  equipmentNotes?: string;
}

export function useJobWorkLogs(jobId: string | undefined) {
  return useQuery({
    queryKey: ['work-logs', jobId],
    queryFn: async () => {
      if (!jobId) return [];
      
      const { data, error } = await supabase
        .from('job_work_logs')
        .select('*')
        .eq('job_id', jobId)
        .order('attendance_date', { ascending: false });
      
      if (error) throw error;
      return data as WorkLog[];
    },
    enabled: !!jobId,
  });
}

export function useCreateWorkLog() {
  const { user, tenantId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateWorkLogData) => {
      if (!user || !tenantId) {
        throw new Error('User must be authenticated');
      }

      const { data: workLog, error } = await supabase
        .from('job_work_logs')
        .insert({
          job_id: data.jobId,
          tenant_id: tenantId,
          logged_by: user.id,
          attendance_date: data.attendanceDate.toISOString().split('T')[0],
          log_type: data.logType,
          summary: data.summary || null,
          work_completed: data.workCompleted || null,
          equipment_notes: data.equipmentNotes || null,
        })
        .select()
        .single();

      if (error) throw error;
      return workLog;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['work-logs', variables.jobId] });
      toast.success('Work log added');
    },
    onError: (error) => {
      console.error('Error creating work log:', error);
      toast.error('Failed to add work log');
    },
  });
}

export function useUpdateWorkLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateWorkLogData) => {
      const updateData: any = {};
      if (data.attendanceDate) updateData.attendance_date = data.attendanceDate.toISOString().split('T')[0];
      if (data.logType) updateData.log_type = data.logType;
      if (data.summary !== undefined) updateData.summary = data.summary || null;
      if (data.workCompleted !== undefined) updateData.work_completed = data.workCompleted || null;
      if (data.equipmentNotes !== undefined) updateData.equipment_notes = data.equipmentNotes || null;

      const { data: workLog, error } = await supabase
        .from('job_work_logs')
        .update(updateData)
        .eq('id', data.id)
        .select()
        .single();

      if (error) throw error;
      return workLog;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['work-logs', data.job_id] });
      toast.success('Work log updated');
    },
    onError: (error) => {
      console.error('Error updating work log:', error);
      toast.error('Failed to update work log');
    },
  });
}

export function useDeleteWorkLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, jobId }: { id: string; jobId: string }) => {
      const { error } = await supabase
        .from('job_work_logs')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { id, jobId };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['work-logs', variables.jobId] });
      toast.success('Work log deleted');
    },
    onError: (error) => {
      console.error('Error deleting work log:', error);
      toast.error('Failed to delete work log');
    },
  });
}
