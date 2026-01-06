import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { CostTemplate } from './useCostTemplates';

export interface JobCostItem {
  id: string;
  job_id: string;
  tenant_id: string;
  template_id: string | null;
  name: string;
  description: string | null;
  category: string;
  unit_type: string;
  quantity: number;
  unit_rate: number;
  total_amount: number;
  is_billable: boolean;
  added_by: string;
  created_at: string;
  updated_at: string;
}

export interface CreateJobCostItemData {
  job_id: string;
  template_id?: string;
  name: string;
  description?: string;
  category: string;
  unit_type: string;
  quantity: number;
  unit_rate: number;
  is_billable?: boolean;
}

export interface UpdateJobCostItemData {
  id: string;
  name?: string;
  description?: string;
  category?: string;
  unit_type?: string;
  quantity?: number;
  unit_rate?: number;
  is_billable?: boolean;
}

export interface CostSummary {
  totalBillable: number;
  totalNonBillable: number;
  grandTotal: number;
  byCategory: Record<string, { billable: number; nonBillable: number; total: number }>;
  itemCount: number;
}

export function useJobCostItems(jobId: string | undefined) {
  return useQuery({
    queryKey: ['job-cost-items', jobId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('job_cost_items')
        .select('*')
        .eq('job_id', jobId!)
        .order('category', { ascending: true })
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as JobCostItem[];
    },
    enabled: !!jobId,
  });
}

export function useJobCostSummary(jobId: string | undefined) {
  const { data: items } = useJobCostItems(jobId);

  const summary: CostSummary = {
    totalBillable: 0,
    totalNonBillable: 0,
    grandTotal: 0,
    byCategory: {},
    itemCount: items?.length || 0,
  };

  if (items) {
    items.forEach((item) => {
      const amount = Number(item.total_amount);
      
      if (!summary.byCategory[item.category]) {
        summary.byCategory[item.category] = { billable: 0, nonBillable: 0, total: 0 };
      }

      if (item.is_billable) {
        summary.totalBillable += amount;
        summary.byCategory[item.category].billable += amount;
      } else {
        summary.totalNonBillable += amount;
        summary.byCategory[item.category].nonBillable += amount;
      }

      summary.byCategory[item.category].total += amount;
      summary.grandTotal += amount;
    });
  }

  return summary;
}

export function useCreateJobCostItem() {
  const queryClient = useQueryClient();
  const { tenantId, user } = useAuth();

  return useMutation({
    mutationFn: async (data: CreateJobCostItemData) => {
      const { data: result, error } = await supabase
        .from('job_cost_items')
        .insert({
          ...data,
          tenant_id: tenantId!,
          added_by: user!.id,
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['job-cost-items', variables.job_id] });
      toast.success('Cost item added');
    },
    onError: (error) => {
      console.error('Error creating cost item:', error);
      toast.error('Failed to add cost item');
    },
  });
}

export function useUpdateJobCostItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: UpdateJobCostItemData) => {
      const { data: result, error } = await supabase
        .from('job_cost_items')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result as JobCostItem;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['job-cost-items', result.job_id] });
      toast.success('Cost item updated');
    },
    onError: (error) => {
      console.error('Error updating cost item:', error);
      toast.error('Failed to update cost item');
    },
  });
}

export function useDeleteJobCostItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, jobId }: { id: string; jobId: string }) => {
      const { error } = await supabase
        .from('job_cost_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return jobId;
    },
    onSuccess: (jobId) => {
      queryClient.invalidateQueries({ queryKey: ['job-cost-items', jobId] });
      toast.success('Cost item removed');
    },
    onError: (error) => {
      console.error('Error deleting cost item:', error);
      toast.error('Failed to remove cost item');
    },
  });
}

export function useApplyTemplateToJob() {
  const queryClient = useQueryClient();
  const { tenantId, user } = useAuth();

  return useMutation({
    mutationFn: async ({ jobId, template }: { jobId: string; template: CostTemplate }) => {
      const { data: result, error } = await supabase
        .from('job_cost_items')
        .insert({
          job_id: jobId,
          tenant_id: tenantId!,
          template_id: template.id,
          name: template.name,
          description: template.description,
          category: template.category,
          unit_type: template.unit_type,
          quantity: 1,
          unit_rate: template.default_rate,
          is_billable: true,
          added_by: user!.id,
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['job-cost-items', variables.jobId] });
      toast.success('Template applied');
    },
    onError: (error) => {
      console.error('Error applying template:', error);
      toast.error('Failed to apply template');
    },
  });
}

export function useApplyAutoTemplates() {
  const queryClient = useQueryClient();
  const { tenantId, user } = useAuth();

  return useMutation({
    mutationFn: async ({ jobId, templates }: { jobId: string; templates: CostTemplate[] }) => {
      if (templates.length === 0) return [];

      const items = templates.map((template) => ({
        job_id: jobId,
        tenant_id: tenantId!,
        template_id: template.id,
        name: template.name,
        description: template.description,
        category: template.category,
        unit_type: template.unit_type,
        quantity: 1,
        unit_rate: template.default_rate,
        is_billable: true,
        added_by: user!.id,
      }));

      const { data: result, error } = await supabase
        .from('job_cost_items')
        .insert(items)
        .select();

      if (error) throw error;
      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['job-cost-items', variables.jobId] });
      if (variables.templates.length > 0) {
        toast.success(`${variables.templates.length} default items added`);
      }
    },
    onError: (error) => {
      console.error('Error applying auto templates:', error);
      toast.error('Failed to apply default items');
    },
  });
}

export interface EquipmentCostSuggestion {
  equipment_id: string;
  equipment_name: string;
  equipment_type: string;
  daily_rate: number;
  days_deployed: number;
  total_cost: number;
}

export function useEquipmentCostSuggestions(jobId: string | undefined) {
  return useQuery({
    queryKey: ['equipment-cost-suggestions', jobId],
    queryFn: async () => {
      if (!jobId) return [];

      // Get all equipment assignments for this job (including removed ones to calculate full duration)
      const { data: assignments, error: assignmentError } = await supabase
        .from('equipment_assignments')
        .select(`
          id,
          equipment_id,
          assigned_at,
          removed_at,
          equipment:equipment_id (id, name, type, daily_rate)
        `)
        .eq('job_id', jobId);

      if (assignmentError) throw assignmentError;

      // Calculate days deployed for each piece of equipment
      const suggestions: EquipmentCostSuggestion[] = [];
      const equipmentDays = new Map<string, { 
        equipment: any; 
        totalMs: number;
      }>();

      assignments?.forEach((assignment: any) => {
        const equipment = assignment.equipment;
        if (!equipment || !equipment.daily_rate || Number(equipment.daily_rate) <= 0) return;

        const assignedAt = new Date(assignment.assigned_at);
        const removedAt = assignment.removed_at ? new Date(assignment.removed_at) : new Date();
        const durationMs = removedAt.getTime() - assignedAt.getTime();

        if (equipmentDays.has(equipment.id)) {
          equipmentDays.get(equipment.id)!.totalMs += durationMs;
        } else {
          equipmentDays.set(equipment.id, { equipment, totalMs: durationMs });
        }
      });

      equipmentDays.forEach(({ equipment, totalMs }) => {
        const daysDeployed = Math.max(1, Math.ceil(totalMs / (1000 * 60 * 60 * 24)));
        const dailyRate = Number(equipment.daily_rate);
        
        suggestions.push({
          equipment_id: equipment.id,
          equipment_name: equipment.name,
          equipment_type: equipment.type,
          daily_rate: dailyRate,
          days_deployed: daysDeployed,
          total_cost: dailyRate * daysDeployed,
        });
      });

      return suggestions;
    },
    enabled: !!jobId,
  });
}

export function useAddEquipmentCosts() {
  const queryClient = useQueryClient();
  const { tenantId, user } = useAuth();

  return useMutation({
    mutationFn: async ({ jobId, suggestions }: { jobId: string; suggestions: EquipmentCostSuggestion[] }) => {
      if (suggestions.length === 0) return [];

      const items = suggestions.map((suggestion) => ({
        job_id: jobId,
        tenant_id: tenantId!,
        name: `${suggestion.equipment_name} (${suggestion.days_deployed} days)`,
        description: `Equipment rental: ${suggestion.equipment_type}`,
        category: 'equipment',
        unit_type: 'per_day',
        quantity: suggestion.days_deployed,
        unit_rate: suggestion.daily_rate,
        is_billable: true,
        added_by: user!.id,
      }));

      const { data: result, error } = await supabase
        .from('job_cost_items')
        .insert(items)
        .select();

      if (error) throw error;
      return result;
    },
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({ queryKey: ['job-cost-items', variables.jobId] });
      if (result && result.length > 0) {
        toast.success(`Added ${result.length} equipment cost items`);
      }
    },
    onError: (error) => {
      console.error('Error adding equipment costs:', error);
      toast.error('Failed to add equipment costs');
    },
  });
}
