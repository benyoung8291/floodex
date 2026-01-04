import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { getPhotoUrl } from '@/hooks/useJobPhotos';
import { FloorPlan, getFloorPlanThumbnailUrl } from '@/hooks/useFloorPlans';

export type Job = Tables<'jobs'> & {
  claim_id?: string | null;
  date_of_loss?: string | null;
  loss_class?: string | null;
  source_of_loss?: string | null;
  affected_areas?: string | null;
  affected_materials?: string | null;
  claim_summary?: string | null;
};
export type Chamber = Tables<'drying_chambers'>;
export type Reading = Tables<'moisture_readings'>;
export type Equipment = Tables<'equipment'>;
export type EquipmentAssignment = Tables<'equipment_assignments'>;
export type Photo = Tables<'job_photos'>;

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

export interface ReportReading extends Reading {
  chamber_name: string;
}

export interface ReportEquipmentAssignment extends EquipmentAssignment {
  equipment: Equipment;
  chamber_name: string;
}

export interface ReportPhoto extends Photo {
  url: string;
}

export interface ReportFloorPlan extends FloorPlan {
  thumbnail_url: string | null;
}

export interface JobReportData {
  job: Job;
  chambers: Chamber[];
  readings: ReportReading[];
  equipmentAssignments: ReportEquipmentAssignment[];
  photos: ReportPhoto[];
  workLogs: WorkLog[];
  damageAssessments: DamageAssessment[];
  floorPlans: ReportFloorPlan[];
  tenant: Tables<'tenants'> | null;
}

export function useJobReportData(jobId: string | undefined, dateRange?: { start: Date; end: Date }) {
  return useQuery({
    queryKey: ['job-report-data', jobId, dateRange?.start?.toISOString(), dateRange?.end?.toISOString()],
    queryFn: async (): Promise<JobReportData | null> => {
      if (!jobId) return null;

      // Fetch job details
      const { data: job, error: jobError } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', jobId)
        .maybeSingle();

      if (jobError) throw jobError;
      if (!job) return null;

      // Fetch chambers
      const { data: chambers, error: chambersError } = await supabase
        .from('drying_chambers')
        .select('*')
        .eq('job_id', jobId)
        .order('name');

      if (chambersError) throw chambersError;

      // Fetch readings with optional date filter
      let readingsQuery = supabase
        .from('moisture_readings')
        .select('*')
        .eq('job_id', jobId)
        .order('logged_at', { ascending: true });

      if (dateRange?.start) {
        readingsQuery = readingsQuery.gte('logged_at', dateRange.start.toISOString());
      }
      if (dateRange?.end) {
        readingsQuery = readingsQuery.lte('logged_at', dateRange.end.toISOString());
      }

      const { data: readings, error: readingsError } = await readingsQuery;
      if (readingsError) throw readingsError;

      // Map chamber names to readings
      const chamberMap = new Map(chambers?.map(c => [c.id, c.name]) || []);
      const reportReadings: ReportReading[] = (readings || []).map(r => ({
        ...r,
        chamber_name: chamberMap.get(r.chamber_id) || 'Unknown',
      }));

      // Fetch equipment assignments
      const { data: assignments, error: assignmentsError } = await supabase
        .from('equipment_assignments')
        .select('*, equipment:equipment_id(*)')
        .eq('job_id', jobId)
        .order('assigned_at', { ascending: true });

      if (assignmentsError) throw assignmentsError;

      const reportAssignments: ReportEquipmentAssignment[] = (assignments || []).map(a => ({
        ...a,
        equipment: a.equipment as Equipment,
        chamber_name: chamberMap.get(a.chamber_id) || 'Unknown',
      }));

      // Fetch photos
      const { data: photos, error: photosError } = await supabase
        .from('job_photos')
        .select('*')
        .eq('job_id', jobId)
        .order('taken_at', { ascending: true });

      if (photosError) throw photosError;

      const reportPhotos: ReportPhoto[] = (photos || []).map(p => ({
        ...p,
        url: getPhotoUrl(p.storage_path),
      }));

      // Fetch work logs
      const { data: workLogs, error: workLogsError } = await supabase
        .from('job_work_logs')
        .select('*')
        .eq('job_id', jobId)
        .order('attendance_date', { ascending: true });

      if (workLogsError) throw workLogsError;

      // Fetch damage assessments
      const { data: damageAssessments, error: damageError } = await supabase
        .from('damage_assessments')
        .select('*')
        .eq('job_id', jobId)
        .order('created_at', { ascending: true });

      if (damageError) throw damageError;

      // Fetch floor plans
      const { data: floorPlans, error: floorPlansError } = await supabase
        .from('floor_plans')
        .select('*')
        .eq('job_id', jobId)
        .order('floor_number', { ascending: true });

      if (floorPlansError) throw floorPlansError;

      const reportFloorPlans: ReportFloorPlan[] = (floorPlans || []).map(fp => ({
        ...fp,
        thumbnail_url: getFloorPlanThumbnailUrl(fp.thumbnail_path),
      }));

      // Fetch tenant for branding
      const { data: tenant } = await supabase
        .from('tenants')
        .select('*')
        .eq('id', job.tenant_id)
        .maybeSingle();

      return {
        job: job as Job,
        chambers: chambers || [],
        readings: reportReadings,
        equipmentAssignments: reportAssignments,
        photos: reportPhotos,
        workLogs: (workLogs || []) as WorkLog[],
        damageAssessments: (damageAssessments || []) as DamageAssessment[],
        floorPlans: reportFloorPlans,
        tenant,
      };
    },
    enabled: !!jobId,
  });
}

// Helper to group readings by day
export function groupReadingsByDay(readings: ReportReading[]): Map<string, ReportReading[]> {
  const groups = new Map<string, ReportReading[]>();
  
  readings.forEach(reading => {
    const date = new Date(reading.logged_at).toLocaleDateString('en-US');
    const existing = groups.get(date) || [];
    existing.push(reading);
    groups.set(date, existing);
  });
  
  return groups;
}

// Helper to group readings by chamber
export function groupReadingsByChamber(readings: ReportReading[]): Map<string, ReportReading[]> {
  const groups = new Map<string, ReportReading[]>();
  
  readings.forEach(reading => {
    const existing = groups.get(reading.chamber_id) || [];
    existing.push(reading);
    groups.set(reading.chamber_id, existing);
  });
  
  return groups;
}

// Calculate equipment hours
export function calculateEquipmentHours(assignment: ReportEquipmentAssignment): number {
  const start = new Date(assignment.assigned_at);
  const end = assignment.removed_at ? new Date(assignment.removed_at) : new Date();
  return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60) * 10) / 10;
}
