export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      damage_assessments: {
        Row: {
          area_name: string
          chamber_id: string | null
          created_at: string
          id: string
          is_restorable: boolean
          job_id: string
          material_type: string
          notes: string | null
          status: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          area_name: string
          chamber_id?: string | null
          created_at?: string
          id?: string
          is_restorable?: boolean
          job_id: string
          material_type: string
          notes?: string | null
          status?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          area_name?: string
          chamber_id?: string | null
          created_at?: string
          id?: string
          is_restorable?: boolean
          job_id?: string
          material_type?: string
          notes?: string | null
          status?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "damage_assessments_chamber_id_fkey"
            columns: ["chamber_id"]
            isOneToOne: false
            referencedRelation: "drying_chambers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "damage_assessments_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "damage_assessments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      drying_chambers: {
        Row: {
          created_at: string
          dry_standard_percent: number | null
          id: string
          job_id: string
          name: string
          target_gpp: number | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          dry_standard_percent?: number | null
          id?: string
          job_id: string
          name: string
          target_gpp?: number | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          dry_standard_percent?: number | null
          id?: string
          job_id?: string
          name?: string
          target_gpp?: number | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "drying_chambers_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "drying_chambers_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment: {
        Row: {
          created_at: string
          id: string
          is_available: boolean
          name: string
          serial_number: string | null
          tenant_id: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_available?: boolean
          name: string
          serial_number?: string | null
          tenant_id: string
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_available?: boolean
          name?: string
          serial_number?: string | null
          tenant_id?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "equipment_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment_assignments: {
        Row: {
          assigned_at: string
          assigned_by: string
          chamber_id: string
          equipment_id: string
          id: string
          job_id: string
          removed_at: string | null
          tenant_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by: string
          chamber_id: string
          equipment_id: string
          id?: string
          job_id: string
          removed_at?: string | null
          tenant_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string
          chamber_id?: string
          equipment_id?: string
          id?: string
          job_id?: string
          removed_at?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "equipment_assignments_chamber_id_fkey"
            columns: ["chamber_id"]
            isOneToOne: false
            referencedRelation: "drying_chambers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipment_assignments_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipment_assignments_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipment_assignments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      job_photos: {
        Row: {
          annotation_data: Json | null
          caption: string | null
          created_at: string
          has_annotations: boolean | null
          id: string
          job_id: string
          latitude: number | null
          longitude: number | null
          storage_path: string
          tag: string
          taken_at: string
          taken_by: string
          tenant_id: string
        }
        Insert: {
          annotation_data?: Json | null
          caption?: string | null
          created_at?: string
          has_annotations?: boolean | null
          id?: string
          job_id: string
          latitude?: number | null
          longitude?: number | null
          storage_path: string
          tag: string
          taken_at?: string
          taken_by: string
          tenant_id: string
        }
        Update: {
          annotation_data?: Json | null
          caption?: string | null
          created_at?: string
          has_annotations?: boolean | null
          id?: string
          job_id?: string
          latitude?: number | null
          longitude?: number | null
          storage_path?: string
          tag?: string
          taken_at?: string
          taken_by?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_photos_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_photos_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      job_safety_checks: {
        Row: {
          created_at: string
          hazard_type: string
          id: string
          is_hazard_present: boolean
          job_id: string
          notes: string | null
          requires_stop_work: boolean
          supervisor_override_at: string | null
          supervisor_override_by: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          hazard_type: string
          id?: string
          is_hazard_present?: boolean
          job_id: string
          notes?: string | null
          requires_stop_work?: boolean
          supervisor_override_at?: string | null
          supervisor_override_by?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          hazard_type?: string
          id?: string
          is_hazard_present?: boolean
          job_id?: string
          notes?: string | null
          requires_stop_work?: boolean
          supervisor_override_at?: string | null
          supervisor_override_by?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_safety_checks_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      job_work_logs: {
        Row: {
          attendance_date: string
          created_at: string
          equipment_notes: string | null
          id: string
          job_id: string
          log_type: string
          logged_by: string
          summary: string | null
          tenant_id: string
          updated_at: string
          work_completed: string[] | null
        }
        Insert: {
          attendance_date: string
          created_at?: string
          equipment_notes?: string | null
          id?: string
          job_id: string
          log_type?: string
          logged_by: string
          summary?: string | null
          tenant_id: string
          updated_at?: string
          work_completed?: string[] | null
        }
        Update: {
          attendance_date?: string
          created_at?: string
          equipment_notes?: string | null
          id?: string
          job_id?: string
          log_type?: string
          logged_by?: string
          summary?: string | null
          tenant_id?: string
          updated_at?: string
          work_completed?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "job_work_logs_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_work_logs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          address: string
          affected_areas: string | null
          affected_materials: string | null
          city: string | null
          claim_id: string | null
          claim_summary: string | null
          created_at: string
          created_by: string
          customer_email: string | null
          customer_name: string
          customer_phone: string | null
          date_of_loss: string | null
          days_drying: number
          id: string
          latitude: number | null
          longitude: number | null
          loss_class: string | null
          loss_type: Database["public"]["Enums"]["water_category"]
          notes: string | null
          outdoor_gpp: number | null
          outdoor_humidity: number | null
          outdoor_reading_at: string | null
          outdoor_temperature: number | null
          safety_completed: boolean
          safety_completed_at: string | null
          safety_completed_by: string | null
          source_of_loss: string | null
          start_date: string
          state: string | null
          status: Database["public"]["Enums"]["job_status"]
          tenant_id: string
          updated_at: string
          zip_code: string | null
        }
        Insert: {
          address: string
          affected_areas?: string | null
          affected_materials?: string | null
          city?: string | null
          claim_id?: string | null
          claim_summary?: string | null
          created_at?: string
          created_by: string
          customer_email?: string | null
          customer_name: string
          customer_phone?: string | null
          date_of_loss?: string | null
          days_drying?: number
          id?: string
          latitude?: number | null
          longitude?: number | null
          loss_class?: string | null
          loss_type?: Database["public"]["Enums"]["water_category"]
          notes?: string | null
          outdoor_gpp?: number | null
          outdoor_humidity?: number | null
          outdoor_reading_at?: string | null
          outdoor_temperature?: number | null
          safety_completed?: boolean
          safety_completed_at?: string | null
          safety_completed_by?: string | null
          source_of_loss?: string | null
          start_date?: string
          state?: string | null
          status?: Database["public"]["Enums"]["job_status"]
          tenant_id: string
          updated_at?: string
          zip_code?: string | null
        }
        Update: {
          address?: string
          affected_areas?: string | null
          affected_materials?: string | null
          city?: string | null
          claim_id?: string | null
          claim_summary?: string | null
          created_at?: string
          created_by?: string
          customer_email?: string | null
          customer_name?: string
          customer_phone?: string | null
          date_of_loss?: string | null
          days_drying?: number
          id?: string
          latitude?: number | null
          longitude?: number | null
          loss_class?: string | null
          loss_type?: Database["public"]["Enums"]["water_category"]
          notes?: string | null
          outdoor_gpp?: number | null
          outdoor_humidity?: number | null
          outdoor_reading_at?: string | null
          outdoor_temperature?: number | null
          safety_completed?: boolean
          safety_completed_at?: string | null
          safety_completed_by?: string | null
          source_of_loss?: string | null
          start_date?: string
          state?: string | null
          status?: Database["public"]["Enums"]["job_status"]
          tenant_id?: string
          updated_at?: string
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "jobs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      moisture_readings: {
        Row: {
          chamber_id: string
          created_at: string
          gpp: number | null
          id: string
          job_id: string
          logged_at: string
          logged_by: string
          material_type: string | null
          moisture_content: number | null
          reading_type: string
          relative_humidity: number
          temperature: number
          tenant_id: string
        }
        Insert: {
          chamber_id: string
          created_at?: string
          gpp?: number | null
          id?: string
          job_id: string
          logged_at?: string
          logged_by: string
          material_type?: string | null
          moisture_content?: number | null
          reading_type: string
          relative_humidity: number
          temperature: number
          tenant_id: string
        }
        Update: {
          chamber_id?: string
          created_at?: string
          gpp?: number | null
          id?: string
          job_id?: string
          logged_at?: string
          logged_by?: string
          material_type?: string | null
          moisture_content?: number | null
          reading_type?: string
          relative_humidity?: number
          temperature?: number
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "moisture_readings_chamber_id_fkey"
            columns: ["chamber_id"]
            isOneToOne: false
            referencedRelation: "drying_chambers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "moisture_readings_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "moisture_readings_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          onboarding_completed: boolean
          onboarding_step: number
          phone: string | null
          tenant_id: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          onboarding_completed?: boolean
          onboarding_step?: number
          phone?: string | null
          tenant_id?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          onboarding_completed?: boolean
          onboarding_step?: number
          phone?: string | null
          tenant_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_tiers: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          is_free_tier: boolean
          jobs_included: number
          monthly_price: number
          name: string
          overage_price_per_job: number
          overage_price_per_reading: number
          readings_included: number
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          is_free_tier?: boolean
          jobs_included?: number
          monthly_price?: number
          name: string
          overage_price_per_job?: number
          overage_price_per_reading?: number
          readings_included?: number
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          is_free_tier?: boolean
          jobs_included?: number
          monthly_price?: number
          name?: string
          overage_price_per_job?: number
          overage_price_per_reading?: number
          readings_included?: number
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      tenants: {
        Row: {
          address: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          humidity_ratio_unit: string
          id: string
          logo_url: string | null
          name: string
          report_certification_text: string | null
          report_customer_label: string | null
          report_footer_text: string | null
          report_header_text: string | null
          report_technician_label: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_status: Database["public"]["Enums"]["subscription_status"]
          subscription_tier_id: string | null
          supervisor_override_code: string | null
          temperature_unit: string
          trial_ends_at: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          humidity_ratio_unit?: string
          id?: string
          logo_url?: string | null
          name: string
          report_certification_text?: string | null
          report_customer_label?: string | null
          report_footer_text?: string | null
          report_header_text?: string | null
          report_technician_label?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: Database["public"]["Enums"]["subscription_status"]
          subscription_tier_id?: string | null
          supervisor_override_code?: string | null
          temperature_unit?: string
          trial_ends_at?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          humidity_ratio_unit?: string
          id?: string
          logo_url?: string | null
          name?: string
          report_certification_text?: string | null
          report_customer_label?: string | null
          report_footer_text?: string | null
          report_header_text?: string | null
          report_technician_label?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: Database["public"]["Enums"]["subscription_status"]
          subscription_tier_id?: string | null
          supervisor_override_code?: string | null
          temperature_unit?: string
          trial_ends_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenants_subscription_tier_id_fkey"
            columns: ["subscription_tier_id"]
            isOneToOne: false
            referencedRelation: "subscription_tiers"
            referencedColumns: ["id"]
          },
        ]
      }
      usage_logs: {
        Row: {
          billing_period_end: string
          billing_period_start: string
          created_at: string
          event_type: string
          id: string
          job_id: string | null
          tenant_id: string
          user_id: string | null
        }
        Insert: {
          billing_period_end: string
          billing_period_start: string
          created_at?: string
          event_type: string
          id?: string
          job_id?: string | null
          tenant_id: string
          user_id?: string | null
        }
        Update: {
          billing_period_end?: string
          billing_period_start?: string
          created_at?: string
          event_type?: string
          id?: string
          job_id?: string | null
          tenant_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "usage_logs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          tenant_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          tenant_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          tenant_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_tenant_id: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "super_admin" | "tenant_admin" | "supervisor" | "technician"
      job_status: "emergency" | "drying" | "ready" | "completed"
      subscription_status:
        | "trial"
        | "free"
        | "active"
        | "past_due"
        | "cancelled"
      water_category: "cat1" | "cat2" | "cat3"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["super_admin", "tenant_admin", "supervisor", "technician"],
      job_status: ["emergency", "drying", "ready", "completed"],
      subscription_status: ["trial", "free", "active", "past_due", "cancelled"],
      water_category: ["cat1", "cat2", "cat3"],
    },
  },
} as const
