import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { Tables, TablesInsert } from '@/integrations/supabase/types';

export type JobShareLink = Tables<'job_share_links'>;

// Generate a secure random token
function generateToken(): string {
  const array = new Uint8Array(24);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// Hash a PIN using SHA-256
async function hashPin(pin: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(pin);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function useJobShareLinks(jobId?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['job-share-links', jobId],
    queryFn: async () => {
      if (!jobId) return [];
      
      const { data, error } = await supabase
        .from('job_share_links')
        .select('*')
        .eq('job_id', jobId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as JobShareLink[];
    },
    enabled: !!user && !!jobId,
  });
}

export interface CreateShareLinkData {
  jobId: string;
  recipientName?: string;
  recipientEmail?: string;
  accessType?: 'full' | 'photos_only' | 'summary_only';
  pin?: string;
  expiresAt?: Date;
  canViewPhotos?: boolean;
  canViewReadings?: boolean;
  canViewDocuments?: boolean;
  canViewFloorPlans?: boolean;
  canViewEquipment?: boolean;
  canViewWorkLogs?: boolean;
}

export function useCreateShareLink() {
  const queryClient = useQueryClient();
  const { user, tenantId } = useAuth();

  return useMutation({
    mutationFn: async (data: CreateShareLinkData) => {
      if (!user || !tenantId) throw new Error('Not authenticated');

      const token = generateToken();
      const pinHash = data.pin ? await hashPin(data.pin) : null;

      const insert: TablesInsert<'job_share_links'> = {
        tenant_id: tenantId,
        job_id: data.jobId,
        token,
        access_type: data.accessType || 'full',
        pin_hash: pinHash,
        recipient_name: data.recipientName || null,
        recipient_email: data.recipientEmail || null,
        expires_at: data.expiresAt?.toISOString() || null,
        can_view_photos: data.canViewPhotos ?? true,
        can_view_readings: data.canViewReadings ?? true,
        can_view_documents: data.canViewDocuments ?? true,
        can_view_floor_plans: data.canViewFloorPlans ?? true,
        can_view_equipment: data.canViewEquipment ?? false,
        can_view_work_logs: data.canViewWorkLogs ?? false,
        created_by: user.id,
      };

      const { data: result, error } = await supabase
        .from('job_share_links')
        .insert(insert)
        .select()
        .single();

      if (error) throw error;
      return result as JobShareLink;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['job-share-links', variables.jobId] });
      toast.success('Share link created');
    },
    onError: (error) => {
      console.error('Failed to create share link:', error);
      toast.error('Failed to create share link');
    },
  });
}

export function useRevokeShareLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ linkId, jobId }: { linkId: string; jobId: string }) => {
      const { error } = await supabase
        .from('job_share_links')
        .update({ revoked_at: new Date().toISOString() })
        .eq('id', linkId);

      if (error) throw error;
      return { linkId, jobId };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['job-share-links', result.jobId] });
      toast.success('Share link revoked');
    },
    onError: (error) => {
      console.error('Failed to revoke share link:', error);
      toast.error('Failed to revoke share link');
    },
  });
}

export function useDeleteShareLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ linkId, jobId }: { linkId: string; jobId: string }) => {
      const { error } = await supabase
        .from('job_share_links')
        .delete()
        .eq('id', linkId);

      if (error) throw error;
      return { linkId, jobId };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['job-share-links', result.jobId] });
      toast.success('Share link deleted');
    },
    onError: (error) => {
      console.error('Failed to delete share link:', error);
      toast.error('Failed to delete share link');
    },
  });
}

// Generate the share URL
export function getShareUrl(token: string): string {
  return `${window.location.origin}/share/${token}`;
}
