import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Json } from '@/integrations/supabase/types';

export interface FloorPlan {
  id: string;
  job_id: string;
  tenant_id: string;
  name: string;
  floor_number: number;
  canvas_data: Json;
  thumbnail_path: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export const useJobFloorPlans = (jobId: string) => {
  const { effectiveTenantId } = useAuth();
  
  return useQuery({
    queryKey: ['floor-plans', jobId, effectiveTenantId],
    queryFn: async () => {
      if (!effectiveTenantId) return [];
      
      const { data, error } = await supabase
        .from('floor_plans')
        .select('*')
        .eq('job_id', jobId)
        .eq('tenant_id', effectiveTenantId)
        .order('floor_number', { ascending: true });

      if (error) throw error;
      return data as FloorPlan[];
    },
    enabled: !!jobId && !!effectiveTenantId,
  });
};

export const useFloorPlan = (planId: string) => {
  return useQuery({
    queryKey: ['floor-plan', planId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('floor_plans')
        .select('*')
        .eq('id', planId)
        .maybeSingle();

      if (error) throw error;
      return data as FloorPlan | null;
    },
    enabled: !!planId,
  });
};

export const useCreateFloorPlan = () => {
  const queryClient = useQueryClient();
  const { user, effectiveTenantId } = useAuth();

  return useMutation({
    mutationFn: async (data: {
      job_id: string;
      name: string;
      floor_number: number;
      canvas_data: object;
      thumbnail?: Blob;
    }) => {
      if (!user || !effectiveTenantId) throw new Error('Not authenticated');

      let thumbnailPath: string | null = null;

      // Upload thumbnail if provided
      if (data.thumbnail) {
        const fileName = `${effectiveTenantId}/${data.job_id}/${crypto.randomUUID()}.png`;
        const { error: uploadError } = await supabase.storage
          .from('floor-plans')
          .upload(fileName, data.thumbnail, {
            contentType: 'image/png',
          });

        if (uploadError) throw uploadError;
        thumbnailPath = fileName;
      }

      const { data: plan, error } = await supabase
        .from('floor_plans')
        .insert({
          job_id: data.job_id,
          tenant_id: effectiveTenantId,
          name: data.name,
          floor_number: data.floor_number,
          canvas_data: data.canvas_data as Json,
          thumbnail_path: thumbnailPath,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return plan;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['floor-plans', variables.job_id] });
    },
  });
};

export const useUpdateFloorPlan = () => {
  const queryClient = useQueryClient();
  const { effectiveTenantId } = useAuth();

  return useMutation({
    mutationFn: async (data: {
      id: string;
      job_id: string;
      name?: string;
      floor_number?: number;
      canvas_data?: object;
      thumbnail?: Blob;
    }) => {
      if (!effectiveTenantId) throw new Error('Not authenticated');

      let thumbnailPath: string | undefined;

      // Upload new thumbnail if provided
      if (data.thumbnail) {
        const fileName = `${effectiveTenantId}/${data.job_id}/${crypto.randomUUID()}.png`;
        const { error: uploadError } = await supabase.storage
          .from('floor-plans')
          .upload(fileName, data.thumbnail, {
            contentType: 'image/png',
          });

        if (uploadError) throw uploadError;
        thumbnailPath = fileName;
      }

      const updateData: Record<string, unknown> = {};
      if (data.name !== undefined) updateData.name = data.name;
      if (data.floor_number !== undefined) updateData.floor_number = data.floor_number;
      if (data.canvas_data !== undefined) updateData.canvas_data = data.canvas_data;
      if (thumbnailPath !== undefined) updateData.thumbnail_path = thumbnailPath;

      const { data: plan, error } = await supabase
        .from('floor_plans')
        .update(updateData)
        .eq('id', data.id)
        .select()
        .single();

      if (error) throw error;
      return plan;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['floor-plans', variables.job_id] });
      queryClient.invalidateQueries({ queryKey: ['floor-plan', variables.id] });
    },
  });
};

export const useDeleteFloorPlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, jobId }: { id: string; jobId: string }) => {
      // Get the plan to delete thumbnail
      const { data: plan } = await supabase
        .from('floor_plans')
        .select('thumbnail_path')
        .eq('id', id)
        .single();

      // Delete thumbnail from storage if exists
      if (plan?.thumbnail_path) {
        await supabase.storage.from('floor-plans').remove([plan.thumbnail_path]);
      }

      const { error } = await supabase
        .from('floor_plans')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { id, jobId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['floor-plans', data.jobId] });
    },
  });
};

// Link a reading to a floor plan marker
export const useLinkReadingToMarker = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      readingId,
      floorPlanId,
      markerId,
      jobId,
    }: {
      readingId: string;
      floorPlanId: string;
      markerId: string;
      jobId: string;
    }) => {
      const { error } = await supabase
        .from('moisture_readings')
        .update({
          floor_plan_id: floorPlanId,
          marker_id: markerId,
        })
        .eq('id', readingId);

      if (error) throw error;
      return { readingId, floorPlanId, markerId, jobId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['floor-plan-readings', data.floorPlanId] });
      queryClient.invalidateQueries({ queryKey: ['readings'] });
    },
  });
};

// Unlink a reading from a floor plan marker
export const useUnlinkReadingFromMarker = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      readingId,
      floorPlanId,
      jobId,
    }: {
      readingId: string;
      floorPlanId: string;
      jobId: string;
    }) => {
      const { error } = await supabase
        .from('moisture_readings')
        .update({
          floor_plan_id: null,
          marker_id: null,
        })
        .eq('id', readingId);

      if (error) throw error;
      return { readingId, floorPlanId, jobId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['floor-plan-readings', data.floorPlanId] });
      queryClient.invalidateQueries({ queryKey: ['readings'] });
    },
  });
};

// Get readings linked to a specific floor plan
export const useFloorPlanReadings = (floorPlanId: string | undefined) => {
  return useQuery({
    queryKey: ['floor-plan-readings', floorPlanId],
    queryFn: async () => {
      if (!floorPlanId) return [];
      
      const { data, error } = await supabase
        .from('moisture_readings')
        .select('*')
        .eq('floor_plan_id', floorPlanId);

      if (error) throw error;
      return data;
    },
    enabled: !!floorPlanId,
  });
};

// Get all readings for a job (for linking dialog)
export const useJobReadingsForLinking = (jobId: string | undefined) => {
  return useQuery({
    queryKey: ['job-readings-linking', jobId],
    queryFn: async () => {
      if (!jobId) return [];
      
      const { data, error } = await supabase
        .from('moisture_readings')
        .select('*')
        .eq('job_id', jobId)
        .order('logged_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!jobId,
  });
};

export const getFloorPlanThumbnailUrl = (path: string | null): string | null => {
  if (!path) return null;
  const { data } = supabase.storage.from('floor-plans').getPublicUrl(path);
  return data.publicUrl;
};

/**
 * Upload a background image for a floor plan
 */
export const uploadBackgroundImage = async (
  blob: Blob,
  tenantId: string,
  jobId: string
): Promise<string> => {
  const filename = `bg_${Date.now()}_${crypto.randomUUID().slice(0, 8)}.jpg`;
  const storagePath = `${tenantId}/backgrounds/${jobId}/${filename}`;
  
  const { error } = await supabase.storage
    .from('floor-plans')
    .upload(storagePath, blob, { contentType: 'image/jpeg' });

  if (error) throw error;
  return storagePath;
};

/**
 * Get public URL for a background image
 */
export const getBackgroundImageUrl = (path: string | null): string | null => {
  if (!path) return null;
  const { data } = supabase.storage.from('floor-plans').getPublicUrl(path);
  return data.publicUrl;
};
