import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { Tables, TablesInsert } from '@/integrations/supabase/types';

type Equipment = Tables<'equipment'>;
type EquipmentAssignment = Tables<'equipment_assignments'>;

// Fetch all equipment for tenant
export function useEquipment() {
  const { effectiveTenantId } = useAuth();

  return useQuery({
    queryKey: ['equipment', effectiveTenantId],
    queryFn: async () => {
      if (!effectiveTenantId) return [];

      const { data, error } = await supabase
        .from('equipment')
        .select('*')
        .eq('tenant_id', effectiveTenantId)
        .order('type', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;
      return data as Equipment[];
    },
    enabled: !!effectiveTenantId,
  });
}

// Fetch equipment assignments for a job
export function useEquipmentAssignments(jobId: string | undefined) {
  const { effectiveTenantId } = useAuth();

  return useQuery({
    queryKey: ['equipment-assignments', jobId, effectiveTenantId],
    queryFn: async () => {
      if (!jobId || !effectiveTenantId) return [];

      const { data, error } = await supabase
        .from('equipment_assignments')
        .select(`
          *,
          equipment:equipment_id (*)
        `)
        .eq('job_id', jobId)
        .eq('tenant_id', effectiveTenantId)
        .is('removed_at', null);

      if (error) throw error;
      return data as (EquipmentAssignment & { equipment: Equipment })[];
    },
    enabled: !!jobId && !!effectiveTenantId,
  });
}

// Create new equipment
export function useCreateEquipment() {
  const queryClient = useQueryClient();
  const { effectiveTenantId } = useAuth();

  return useMutation({
    mutationFn: async (data: { name: string; type: string; serialNumber?: string; dailyRate?: number }) => {
      if (!effectiveTenantId) throw new Error('No tenant ID');

      const { error, data: equipment } = await supabase
        .from('equipment')
        .insert({
          tenant_id: effectiveTenantId,
          name: data.name,
          type: data.type,
          serial_number: data.serialNumber || null,
          daily_rate: data.dailyRate || 0,
          is_available: true,
        })
        .select()
        .single();

      if (error) throw error;
      return equipment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      toast.success('Equipment added');
    },
    onError: (error) => {
      toast.error('Failed to add equipment: ' + error.message);
    },
  });
}

// Update equipment
export function useUpdateEquipment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { id: string; name?: string; type?: string; serialNumber?: string; dailyRate?: number }) => {
      const updates: Partial<TablesInsert<'equipment'>> = {};
      if (data.name !== undefined) updates.name = data.name;
      if (data.type !== undefined) updates.type = data.type;
      if (data.serialNumber !== undefined) updates.serial_number = data.serialNumber;
      if (data.dailyRate !== undefined) updates.daily_rate = data.dailyRate;

      const { error, data: equipment } = await supabase
        .from('equipment')
        .update(updates)
        .eq('id', data.id)
        .select()
        .single();

      if (error) throw error;
      return equipment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      toast.success('Equipment updated');
    },
    onError: (error) => {
      toast.error('Failed to update equipment: ' + error.message);
    },
  });
}

// Delete equipment
export function useDeleteEquipment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('equipment')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      toast.success('Equipment deleted');
    },
    onError: (error) => {
      toast.error('Failed to delete equipment: ' + error.message);
    },
  });
}

// Assign equipment to a chamber
export function useAssignEquipment() {
  const queryClient = useQueryClient();
  const { effectiveTenantId, user } = useAuth();

  return useMutation({
    mutationFn: async (data: { equipmentId: string; chamberId: string; jobId: string }) => {
      if (!effectiveTenantId || !user) throw new Error('Not authenticated');

      // Insert assignment
      const { error: assignError } = await supabase
        .from('equipment_assignments')
        .insert({
          equipment_id: data.equipmentId,
          chamber_id: data.chamberId,
          job_id: data.jobId,
          tenant_id: effectiveTenantId,
          assigned_by: user.id,
        });

      if (assignError) throw assignError;

      // Update equipment availability
      const { error: updateError } = await supabase
        .from('equipment')
        .update({ is_available: false })
        .eq('id', data.equipmentId);

      if (updateError) throw updateError;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      queryClient.invalidateQueries({ queryKey: ['equipment-assignments', variables.jobId] });
      toast.success('Equipment assigned');
    },
    onError: (error) => {
      toast.error('Failed to assign equipment: ' + error.message);
    },
  });
}

// Unassign equipment from a chamber
export function useUnassignEquipment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { assignmentId: string; equipmentId: string; jobId: string }) => {
      // Update assignment with removed_at
      const { error: removeError } = await supabase
        .from('equipment_assignments')
        .update({ removed_at: new Date().toISOString() })
        .eq('id', data.assignmentId);

      if (removeError) throw removeError;

      // Update equipment availability
      const { error: updateError } = await supabase
        .from('equipment')
        .update({ is_available: true })
        .eq('id', data.equipmentId);

      if (updateError) throw updateError;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      queryClient.invalidateQueries({ queryKey: ['equipment-assignments', variables.jobId] });
      toast.success('Equipment unassigned');
    },
    onError: (error) => {
      toast.error('Failed to unassign equipment: ' + error.message);
    },
  });
}
