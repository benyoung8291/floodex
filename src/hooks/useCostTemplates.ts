import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface CostTemplate {
  id: string;
  tenant_id: string;
  name: string;
  description: string | null;
  category: string;
  unit_type: string;
  default_rate: number;
  is_auto_added: boolean;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface CreateCostTemplateData {
  name: string;
  description?: string;
  category: string;
  unit_type: string;
  default_rate: number;
  is_auto_added?: boolean;
  is_active?: boolean;
  sort_order?: number;
}

export interface UpdateCostTemplateData extends Partial<CreateCostTemplateData> {
  id: string;
}

export const COST_CATEGORIES = [
  { value: 'equipment', label: 'Equipment' },
  { value: 'labor', label: 'Labor' },
  { value: 'materials', label: 'Materials' },
  { value: 'services', label: 'Services' },
  { value: 'travel', label: 'Travel' },
  { value: 'misc', label: 'Miscellaneous' },
] as const;

export const UNIT_TYPES = [
  { value: 'per_day', label: 'Per Day' },
  { value: 'per_hour', label: 'Per Hour' },
  { value: 'per_unit', label: 'Per Unit' },
  { value: 'flat_rate', label: 'Flat Rate' },
  { value: 'per_sqft', label: 'Per Sq Ft' },
  { value: 'per_mile', label: 'Per Mile' },
] as const;

export function useCostTemplates() {
  const { tenantId } = useAuth();

  return useQuery({
    queryKey: ['cost-templates', tenantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cost_line_item_templates')
        .select('*')
        .eq('tenant_id', tenantId!)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data as CostTemplate[];
    },
    enabled: !!tenantId,
  });
}

export function useActiveCostTemplates() {
  const { tenantId } = useAuth();

  return useQuery({
    queryKey: ['cost-templates', tenantId, 'active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cost_line_item_templates')
        .select('*')
        .eq('tenant_id', tenantId!)
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data as CostTemplate[];
    },
    enabled: !!tenantId,
  });
}

export function useAutoAddCostTemplates() {
  const { tenantId } = useAuth();

  return useQuery({
    queryKey: ['cost-templates', tenantId, 'auto-add'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cost_line_item_templates')
        .select('*')
        .eq('tenant_id', tenantId!)
        .eq('is_active', true)
        .eq('is_auto_added', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data as CostTemplate[];
    },
    enabled: !!tenantId,
  });
}

export function useCreateCostTemplate() {
  const queryClient = useQueryClient();
  const { tenantId } = useAuth();

  return useMutation({
    mutationFn: async (data: CreateCostTemplateData) => {
      const { data: result, error } = await supabase
        .from('cost_line_item_templates')
        .insert({
          ...data,
          tenant_id: tenantId!,
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cost-templates'] });
      toast.success('Cost template created');
    },
    onError: (error) => {
      console.error('Error creating cost template:', error);
      toast.error('Failed to create cost template');
    },
  });
}

export function useUpdateCostTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: UpdateCostTemplateData) => {
      const { data: result, error } = await supabase
        .from('cost_line_item_templates')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cost-templates'] });
      toast.success('Cost template updated');
    },
    onError: (error) => {
      console.error('Error updating cost template:', error);
      toast.error('Failed to update cost template');
    },
  });
}

export function useDeleteCostTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('cost_line_item_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cost-templates'] });
      toast.success('Cost template deleted');
    },
    onError: (error) => {
      console.error('Error deleting cost template:', error);
      toast.error('Failed to delete cost template');
    },
  });
}
