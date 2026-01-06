import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface JobForm {
  id: string;
  tenant_id: string;
  job_id: string;
  template_id: string | null;
  form_type: string;
  title: string;
  field_values: Record<string, any>;
  status: 'draft' | 'pending_signature' | 'signed' | 'voided';
  created_by: string;
  created_at: string;
  updated_at: string;
  signed_at: string | null;
  signed_document_path: string | null;
  voided_at: string | null;
  voided_by: string | null;
  voided_reason: string | null;
}

export interface FormSignature {
  id: string;
  tenant_id: string;
  form_id: string;
  signer_type: 'technician' | 'customer' | 'supervisor' | 'witness';
  signer_name: string;
  signer_email: string | null;
  signature_image_path: string;
  ip_address: string | null;
  user_agent: string | null;
  latitude: number | null;
  longitude: number | null;
  signed_at: string;
}

export function useJobForms(jobId: string) {
  const { effectiveTenantId } = useAuth();

  return useQuery({
    queryKey: ['job-forms', jobId, effectiveTenantId],
    queryFn: async () => {
      if (!effectiveTenantId) return [];
      
      const { data, error } = await supabase
        .from('job_forms')
        .select('*')
        .eq('job_id', jobId)
        .eq('tenant_id', effectiveTenantId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as JobForm[];
    },
    enabled: !!jobId && !!effectiveTenantId,
  });
}

export function useJobForm(formId: string) {
  return useQuery({
    queryKey: ['job-form', formId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('job_forms')
        .select('*')
        .eq('id', formId)
        .maybeSingle();

      if (error) throw error;
      return data as JobForm | null;
    },
    enabled: !!formId,
  });
}

export function useFormSignatures(formId: string) {
  return useQuery({
    queryKey: ['form-signatures', formId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('form_signatures')
        .select('*')
        .eq('form_id', formId)
        .order('signed_at', { ascending: true });

      if (error) throw error;
      return data as FormSignature[];
    },
    enabled: !!formId,
  });
}

export function useCreateJobForm() {
  const queryClient = useQueryClient();
  const { user, effectiveTenantId } = useAuth();

  return useMutation({
    mutationFn: async (data: {
      job_id: string;
      template_id?: string;
      form_type: string;
      title: string;
      field_values: Record<string, any>;
    }) => {
      if (!effectiveTenantId || !user) throw new Error('Not authenticated');

      const { data: form, error } = await supabase
        .from('job_forms')
        .insert({
          tenant_id: effectiveTenantId,
          job_id: data.job_id,
          template_id: data.template_id || null,
          form_type: data.form_type,
          title: data.title,
          field_values: data.field_values,
          status: 'draft',
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return form as JobForm;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['job-forms', variables.job_id] });
      toast.success('Form created');
    },
    onError: (error) => {
      toast.error('Failed to create form: ' + error.message);
    },
  });
}

export function useUpdateJobForm() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      id: string;
      field_values?: Record<string, any>;
      status?: JobForm['status'];
      signed_at?: string;
      signed_document_path?: string;
    }) => {
      const { data: form, error } = await supabase
        .from('job_forms')
        .update({
          field_values: data.field_values,
          status: data.status,
          signed_at: data.signed_at,
          signed_document_path: data.signed_document_path,
        })
        .eq('id', data.id)
        .select()
        .single();

      if (error) throw error;
      return form as JobForm;
    },
    onSuccess: (form) => {
      queryClient.invalidateQueries({ queryKey: ['job-forms', form.job_id] });
      queryClient.invalidateQueries({ queryKey: ['job-form', form.id] });
    },
    onError: (error) => {
      toast.error('Failed to update form: ' + error.message);
    },
  });
}

export function useVoidJobForm() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: { id: string; reason: string }) => {
      if (!user) throw new Error('Not authenticated');

      const { data: form, error } = await supabase
        .from('job_forms')
        .update({
          status: 'voided',
          voided_at: new Date().toISOString(),
          voided_by: user.id,
          voided_reason: data.reason,
        })
        .eq('id', data.id)
        .select()
        .single();

      if (error) throw error;
      return form as JobForm;
    },
    onSuccess: (form) => {
      queryClient.invalidateQueries({ queryKey: ['job-forms', form.job_id] });
      queryClient.invalidateQueries({ queryKey: ['job-form', form.id] });
      toast.success('Form voided');
    },
    onError: (error) => {
      toast.error('Failed to void form: ' + error.message);
    },
  });
}

export function useCreateFormSignature() {
  const queryClient = useQueryClient();
  const { effectiveTenantId } = useAuth();

  return useMutation({
    mutationFn: async (data: {
      form_id: string;
      job_id: string;
      signer_type: FormSignature['signer_type'];
      signer_name: string;
      signer_email?: string;
      signature_blob: Blob;
      latitude?: number;
      longitude?: number;
    }) => {
      if (!effectiveTenantId) throw new Error('No tenant');

      // Upload signature image
      const timestamp = Date.now();
      const path = `${effectiveTenantId}/${data.job_id}/signatures/sig_${data.form_id}_${data.signer_type}_${timestamp}.png`;

      const { error: uploadError } = await supabase.storage
        .from('signed-documents')
        .upload(path, data.signature_blob, {
          contentType: 'image/png',
        });

      if (uploadError) throw uploadError;

      // Create signature record
      const { data: signature, error } = await supabase
        .from('form_signatures')
        .insert({
          tenant_id: effectiveTenantId,
          form_id: data.form_id,
          signer_type: data.signer_type,
          signer_name: data.signer_name,
          signer_email: data.signer_email || null,
          signature_image_path: path,
          ip_address: null, // Could be fetched from an API
          user_agent: navigator.userAgent,
          latitude: data.latitude || null,
          longitude: data.longitude || null,
        })
        .select()
        .single();

      if (error) throw error;
      return signature as FormSignature;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['form-signatures', variables.form_id] });
      toast.success('Signature captured');
    },
    onError: (error) => {
      toast.error('Failed to save signature: ' + error.message);
    },
  });
}

export function getSignatureUrl(path: string): string {
  const { data } = supabase.storage
    .from('signed-documents')
    .getPublicUrl(path);
  return data.publicUrl;
}
