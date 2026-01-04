import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SharedJobData {
  job: {
    id: string;
    customer_name: string;
    address: string;
    city?: string;
    state?: string;
    zip_code?: string;
    status: string;
    days_drying: number;
    loss_type: string;
    start_date: string;
    outdoor_temperature?: number;
    outdoor_humidity?: number;
    outdoor_gpp?: number;
  };
  company: {
    name: string;
    logo_url?: string;
    contact_phone?: string;
    contact_email?: string;
  };
  permissions: {
    can_view_photos: boolean;
    can_view_readings: boolean;
    can_view_documents: boolean;
    can_view_floor_plans: boolean;
    can_view_equipment: boolean;
    can_view_work_logs: boolean;
  };
  chambers?: Array<{
    id: string;
    name: string;
    target_gpp?: number;
    dry_standard_percent?: number;
  }>;
  photos?: Array<{
    id: string;
    storage_path: string;
    caption?: string;
    tag: string;
    taken_at: string;
    has_annotations?: boolean;
  }>;
  readings?: Array<{
    id: string;
    chamber_id: string;
    reading_type: string;
    temperature: number;
    relative_humidity: number;
    gpp?: number;
    moisture_content?: number;
    material_type?: string;
    logged_at: string;
  }>;
  documents?: Array<{
    id: string;
    title: string;
    form_type: string;
    status: string;
    signed_at?: string;
    created_at: string;
  }>;
  floorPlans?: Array<{
    id: string;
    name: string;
    floor_number?: number;
    thumbnail_path?: string;
    background_image_path?: string;
  }>;
  equipment?: Array<{
    id: string;
    assigned_at: string;
    equipment: {
      id: string;
      name: string;
      type: string;
      serial_number?: string;
    };
    chamber: {
      id: string;
      name: string;
    };
  }>;
  workLogs?: Array<{
    id: string;
    attendance_date: string;
    log_type: string;
    summary?: string;
    work_completed?: string[];
  }>;
}

export interface SharedJobError {
  error: string;
  requiresPin?: boolean;
}

export function useSharedJobData() {
  const [data, setData] = useState<SharedJobData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<SharedJobError | null>(null);
  const [requiresPin, setRequiresPin] = useState(false);

  const fetchData = useCallback(async (token: string, pin?: string) => {
    setLoading(true);
    setError(null);

    try {
      const { data: responseData, error: invokeError } = await supabase.functions.invoke(
        'get-shared-job',
        {
          body: { token, pin },
        }
      );

      if (invokeError) {
        throw new Error(invokeError.message || 'Failed to fetch shared job');
      }

      if (responseData?.error) {
        if (responseData.requiresPin) {
          setRequiresPin(true);
          setError({ error: 'PIN required', requiresPin: true });
        } else {
          setError({ error: responseData.error });
        }
        setData(null);
      } else {
        setData(responseData as SharedJobData);
        setRequiresPin(false);
        setError(null);
      }
    } catch (err) {
      console.error('Error fetching shared job:', err);
      setError({ error: err instanceof Error ? err.message : 'Failed to load shared job' });
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback((token: string, pin?: string) => {
    fetchData(token, pin);
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    requiresPin,
    fetchData,
    refresh,
  };
}
