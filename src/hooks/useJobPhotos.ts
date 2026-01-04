import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { Json } from '@/integrations/supabase/types';

export type PhotoTag = 'before' | 'during' | 'after' | 'damage' | 'equipment' | 'moisture' | 'safety' | 'thermal' | 'overview' | 'mud_map' | 'other';

export interface JobPhoto {
  id: string;
  job_id: string;
  tenant_id: string;
  storage_path: string;
  tag: PhotoTag;
  caption: string | null;
  latitude: number | null;
  longitude: number | null;
  taken_by: string;
  taken_at: string;
  created_at: string;
  annotation_data: Json | null;
  has_annotations: boolean;
}

export interface CreatePhotoInput {
  job_id: string;
  storage_path: string;
  tag: PhotoTag;
  caption?: string;
  latitude?: number | null;
  longitude?: number | null;
}

export interface UpdatePhotoInput {
  id: string;
  tag?: PhotoTag;
  caption?: string;
  annotation_data?: Json | null;
  has_annotations?: boolean;
}

// Fetch photos for a specific job
export const useJobPhotos = (jobId: string) => {
  return useQuery({
    queryKey: ['job-photos', jobId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('job_photos')
        .select('*')
        .eq('job_id', jobId)
        .order('taken_at', { ascending: false });

      if (error) throw error;
      return data as JobPhoto[];
    },
    enabled: !!jobId,
  });
};

// Fetch all photos across all jobs for the tenant
export const useAllPhotos = () => {
  return useQuery({
    queryKey: ['all-photos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('job_photos')
        .select('*')
        .order('taken_at', { ascending: false });

      if (error) throw error;
      return data as JobPhoto[];
    },
  });
};

// Create a new photo record
export const useCreatePhoto = () => {
  const queryClient = useQueryClient();
  const { user, tenantId } = useAuth();

  return useMutation({
    mutationFn: async (input: CreatePhotoInput) => {
      if (!user || !tenantId) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('job_photos')
        .insert({
          job_id: input.job_id,
          tenant_id: tenantId,
          storage_path: input.storage_path,
          tag: input.tag,
          caption: input.caption || null,
          latitude: input.latitude || null,
          longitude: input.longitude || null,
          taken_by: user.id,
          taken_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data as JobPhoto;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['job-photos', data.job_id] });
      queryClient.invalidateQueries({ queryKey: ['all-photos'] });
      toast.success('Photo saved successfully');
    },
    onError: (error) => {
      console.error('Error creating photo:', error);
      toast.error('Failed to save photo');
    },
  });
};

// Update a photo record
export const useUpdatePhoto = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdatePhotoInput) => {
      const { id, ...updates } = input;
      
      const { data, error } = await supabase
        .from('job_photos')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as JobPhoto;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['job-photos', data.job_id] });
      queryClient.invalidateQueries({ queryKey: ['all-photos'] });
    },
    onError: (error) => {
      console.error('Error updating photo:', error);
      toast.error('Failed to update photo');
    },
  });
};

// Delete a photo
export const useDeletePhoto = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (photo: JobPhoto) => {
      // First, delete from storage
      const { error: storageError } = await supabase.storage
        .from('job-photos')
        .remove([photo.storage_path]);

      if (storageError) {
        console.error('Storage deletion error:', storageError);
        // Continue with DB deletion even if storage fails
      }

      // Then, delete from database
      const { error: dbError } = await supabase
        .from('job_photos')
        .delete()
        .eq('id', photo.id);

      if (dbError) throw dbError;
      return photo;
    },
    onSuccess: (photo) => {
      queryClient.invalidateQueries({ queryKey: ['job-photos', photo.job_id] });
      queryClient.invalidateQueries({ queryKey: ['all-photos'] });
      toast.success('Photo deleted');
    },
    onError: (error) => {
      console.error('Error deleting photo:', error);
      toast.error('Failed to delete photo');
    },
  });
};

// Get the public URL for a photo
export const getPhotoUrl = (storagePath: string): string => {
  const { data } = supabase.storage
    .from('job-photos')
    .getPublicUrl(storagePath);
  return data.publicUrl;
};

// Photo tag configuration
export const PHOTO_TAGS: Record<PhotoTag, { label: string; color: string; icon: string }> = {
  before: { label: 'Before', color: 'bg-blue-500', icon: 'Clock' },
  during: { label: 'During', color: 'bg-yellow-500', icon: 'Loader' },
  after: { label: 'After', color: 'bg-green-500', icon: 'CheckCircle' },
  damage: { label: 'Damage', color: 'bg-red-500', icon: 'AlertTriangle' },
  equipment: { label: 'Equipment', color: 'bg-purple-500', icon: 'Wrench' },
  moisture: { label: 'Moisture', color: 'bg-cyan-500', icon: 'Droplet' },
  safety: { label: 'Safety', color: 'bg-orange-500', icon: 'Shield' },
  thermal: { label: 'Thermal', color: 'bg-pink-500', icon: 'Thermometer' },
  overview: { label: 'Overview', color: 'bg-indigo-500', icon: 'Eye' },
  mud_map: { label: 'Mud Map', color: 'bg-amber-600', icon: 'Map' },
  other: { label: 'Other', color: 'bg-gray-500', icon: 'Image' },
};
