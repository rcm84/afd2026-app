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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      audit_log: {
        Row: {
          action: string
          actor_id: string | null
          entity: string
          event_id: string | null
          id: number
          occurred_at: string
          record_key: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          entity: string
          event_id?: string | null
          id?: never
          occurred_at?: string
          record_key: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          entity?: string
          event_id?: string | null
          id?: never
          occurred_at?: string
          record_key?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      checkin_attempts: {
        Row: {
          actor_id: string
          client_scanned_at: string
          device_id: string
          event_id: string
          operation_id: string
          participant_id: string | null
          received_at: string
          result: string
          submitted_token: string
        }
        Insert: {
          actor_id: string
          client_scanned_at: string
          device_id: string
          event_id: string
          operation_id: string
          participant_id?: string | null
          received_at?: string
          result: string
          submitted_token: string
        }
        Update: {
          actor_id?: string
          client_scanned_at?: string
          device_id?: string
          event_id?: string
          operation_id?: string
          participant_id?: string | null
          received_at?: string
          result?: string
          submitted_token?: string
        }
        Relationships: [
          {
            foreignKeyName: "checkin_attempts_event_id_device_id_fkey"
            columns: ["event_id", "device_id"]
            isOneToOne: false
            referencedRelation: "checkin_devices"
            referencedColumns: ["event_id", "id"]
          },
          {
            foreignKeyName: "checkin_attempts_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checkin_attempts_event_id_participant_id_fkey"
            columns: ["event_id", "participant_id"]
            isOneToOne: false
            referencedRelation: "participants"
            referencedColumns: ["event_id", "id"]
          },
        ]
      }
      checkin_devices: {
        Row: {
          active: boolean
          created_at: string
          event_id: string
          id: string
          label: string
          user_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          event_id: string
          id?: string
          label: string
          user_id: string
        }
        Update: {
          active?: boolean
          created_at?: string
          event_id?: string
          id?: string
          label?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "checkin_devices_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      checkins: {
        Row: {
          actor_id: string
          client_scanned_at: string
          device_id: string
          event_id: string
          participant_id: string
          received_at: string
        }
        Insert: {
          actor_id: string
          client_scanned_at: string
          device_id: string
          event_id: string
          participant_id: string
          received_at?: string
        }
        Update: {
          actor_id?: string
          client_scanned_at?: string
          device_id?: string
          event_id?: string
          participant_id?: string
          received_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "checkins_event_id_device_id_fkey"
            columns: ["event_id", "device_id"]
            isOneToOne: false
            referencedRelation: "checkin_devices"
            referencedColumns: ["event_id", "id"]
          },
          {
            foreignKeyName: "checkins_event_id_participant_id_fkey"
            columns: ["event_id", "participant_id"]
            isOneToOne: true
            referencedRelation: "participants"
            referencedColumns: ["event_id", "id"]
          },
        ]
      }
      commission_members: {
        Row: {
          commission_id: string
          event_id: string
          role: string
          user_id: string
        }
        Insert: {
          commission_id: string
          event_id: string
          role?: string
          user_id: string
        }
        Update: {
          commission_id?: string
          event_id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "commission_members_event_id_commission_id_fkey"
            columns: ["event_id", "commission_id"]
            isOneToOne: false
            referencedRelation: "commissions"
            referencedColumns: ["event_id", "id"]
          },
          {
            foreignKeyName: "commission_members_event_id_user_id_fkey"
            columns: ["event_id", "user_id"]
            isOneToOne: false
            referencedRelation: "event_memberships"
            referencedColumns: ["event_id", "user_id"]
          },
        ]
      }
      commission_shifts: {
        Row: {
          commission_id: string
          ends_at: string
          event_id: string
          id: string
          location_text: string
          starts_at: string
          title: string
        }
        Insert: {
          commission_id: string
          ends_at: string
          event_id: string
          id?: string
          location_text?: string
          starts_at: string
          title: string
        }
        Update: {
          commission_id?: string
          ends_at?: string
          event_id?: string
          id?: string
          location_text?: string
          starts_at?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "commission_shifts_event_id_commission_id_fkey"
            columns: ["event_id", "commission_id"]
            isOneToOne: false
            referencedRelation: "commissions"
            referencedColumns: ["event_id", "id"]
          },
        ]
      }
      commission_tasks: {
        Row: {
          assignee_id: string | null
          commission_id: string
          description: string
          due_at: string | null
          event_id: string
          id: string
          status: string
          title: string
          updated_at: string
          version: number
        }
        Insert: {
          assignee_id?: string | null
          commission_id: string
          description?: string
          due_at?: string | null
          event_id: string
          id?: string
          status?: string
          title: string
          updated_at?: string
          version?: number
        }
        Update: {
          assignee_id?: string | null
          commission_id?: string
          description?: string
          due_at?: string | null
          event_id?: string
          id?: string
          status?: string
          title?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "commission_tasks_commission_id_assignee_id_fkey"
            columns: ["commission_id", "assignee_id"]
            isOneToOne: false
            referencedRelation: "commission_members"
            referencedColumns: ["commission_id", "user_id"]
          },
          {
            foreignKeyName: "commission_tasks_event_id_commission_id_fkey"
            columns: ["event_id", "commission_id"]
            isOneToOne: false
            referencedRelation: "commissions"
            referencedColumns: ["event_id", "id"]
          },
        ]
      }
      commissions: {
        Row: {
          description: string
          event_id: string
          id: string
          name: string
          scope: string
        }
        Insert: {
          description?: string
          event_id: string
          id?: string
          name: string
          scope?: string
        }
        Update: {
          description?: string
          event_id?: string
          id?: string
          name?: string
          scope?: string
        }
        Relationships: [
          {
            foreignKeyName: "commissions_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_memberships: {
        Row: {
          active: boolean
          event_id: string
          role: string
          user_id: string
        }
        Insert: {
          active?: boolean
          event_id: string
          role: string
          user_id: string
        }
        Update: {
          active?: boolean
          event_id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_memberships_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          active_release_id: string | null
          city: string
          created_at: string
          ends_on: string
          id: string
          name: string
          privacy_notice: string
          privacy_version: string
          public_revision: number
          registration_open: boolean
          slug: string
          starts_on: string
          timezone: string
        }
        Insert: {
          active_release_id?: string | null
          city: string
          created_at?: string
          ends_on: string
          id?: string
          name: string
          privacy_notice: string
          privacy_version: string
          public_revision?: number
          registration_open?: boolean
          slug: string
          starts_on: string
          timezone?: string
        }
        Update: {
          active_release_id?: string | null
          city?: string
          created_at?: string
          ends_on?: string
          id?: string
          name?: string
          privacy_notice?: string
          privacy_version?: string
          public_revision?: number
          registration_open?: boolean
          slug?: string
          starts_on?: string
          timezone?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_active_release_fk"
            columns: ["id", "active_release_id"]
            isOneToOne: false
            referencedRelation: "schedule_releases"
            referencedColumns: ["event_id", "id"]
          },
        ]
      }
      food_menu_items: {
        Row: {
          currency: string
          description: string
          event_id: string
          id: string
          name: string
          price_amount: number
          service_date: string
          stall_id: string
          status: string
          updated_at: string
          version: number
        }
        Insert: {
          currency: string
          description?: string
          event_id: string
          id?: string
          name: string
          price_amount: number
          service_date: string
          stall_id: string
          status?: string
          updated_at?: string
          version?: number
        }
        Update: {
          currency?: string
          description?: string
          event_id?: string
          id?: string
          name?: string
          price_amount?: number
          service_date?: string
          stall_id?: string
          status?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "food_menu_items_event_id_stall_id_fkey"
            columns: ["event_id", "stall_id"]
            isOneToOne: false
            referencedRelation: "food_stalls"
            referencedColumns: ["event_id", "id"]
          },
        ]
      }
      food_stalls: {
        Row: {
          commission_id: string
          event_id: string
          hours_text: string
          id: string
          is_published: boolean
          location_text: string
          name: string
          public_contact: string
          public_responsible_name: string
          updated_at: string
          version: number
        }
        Insert: {
          commission_id: string
          event_id: string
          hours_text: string
          id?: string
          is_published?: boolean
          location_text: string
          name: string
          public_contact: string
          public_responsible_name: string
          updated_at?: string
          version?: number
        }
        Update: {
          commission_id?: string
          event_id?: string
          hours_text?: string
          id?: string
          is_published?: boolean
          location_text?: string
          name?: string
          public_contact?: string
          public_responsible_name?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "food_stalls_event_id_commission_id_fkey"
            columns: ["event_id", "commission_id"]
            isOneToOne: false
            referencedRelation: "commissions"
            referencedColumns: ["event_id", "id"]
          },
        ]
      }
      lodging_assignments: {
        Row: {
          commission_id: string
          created_at: string
          event_id: string
          id: string
          lodging_id: string
          notes: string
          participant_id: string
          status: string
        }
        Insert: {
          commission_id: string
          created_at?: string
          event_id: string
          id?: string
          lodging_id: string
          notes?: string
          participant_id: string
          status: string
        }
        Update: {
          commission_id?: string
          created_at?: string
          event_id?: string
          id?: string
          lodging_id?: string
          notes?: string
          participant_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "lodging_assignments_event_id_commission_id_fkey"
            columns: ["event_id", "commission_id"]
            isOneToOne: false
            referencedRelation: "commissions"
            referencedColumns: ["event_id", "id"]
          },
          {
            foreignKeyName: "lodging_assignments_event_id_lodging_id_fkey"
            columns: ["event_id", "lodging_id"]
            isOneToOne: false
            referencedRelation: "lodgings"
            referencedColumns: ["event_id", "id"]
          },
          {
            foreignKeyName: "lodging_assignments_event_id_participant_id_fkey"
            columns: ["event_id", "participant_id"]
            isOneToOne: false
            referencedRelation: "participants"
            referencedColumns: ["event_id", "id"]
          },
        ]
      }
      lodgings: {
        Row: {
          address: string
          availability_as_of: string
          capacity_available: number
          capacity_total: number
          commission_id: string
          currency: string
          distance_m: number | null
          event_id: string
          id: string
          is_published: boolean
          kind: string
          name: string
          price_amount: number
          price_unit: string
          public_contact: string
          updated_at: string
          version: number
        }
        Insert: {
          address: string
          availability_as_of?: string
          capacity_available: number
          capacity_total: number
          commission_id: string
          currency: string
          distance_m?: number | null
          event_id: string
          id?: string
          is_published?: boolean
          kind: string
          name: string
          price_amount: number
          price_unit: string
          public_contact: string
          updated_at?: string
          version?: number
        }
        Update: {
          address?: string
          availability_as_of?: string
          capacity_available?: number
          capacity_total?: number
          commission_id?: string
          currency?: string
          distance_m?: number | null
          event_id?: string
          id?: string
          is_published?: boolean
          kind?: string
          name?: string
          price_amount?: number
          price_unit?: string
          public_contact?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "lodgings_event_id_commission_id_fkey"
            columns: ["event_id", "commission_id"]
            isOneToOne: false
            referencedRelation: "commissions"
            referencedColumns: ["event_id", "id"]
          },
        ]
      }
      notices: {
        Row: {
          audience: string
          body: string
          commission_id: string | null
          event_id: string
          expires_at: string | null
          id: string
          is_published: boolean
          priority: string
          published_at: string | null
          title: string
          updated_at: string
          version: number
        }
        Insert: {
          audience?: string
          body: string
          commission_id?: string | null
          event_id: string
          expires_at?: string | null
          id?: string
          is_published?: boolean
          priority?: string
          published_at?: string | null
          title: string
          updated_at?: string
          version?: number
        }
        Update: {
          audience?: string
          body?: string
          commission_id?: string | null
          event_id?: string
          expires_at?: string | null
          id?: string
          is_published?: boolean
          priority?: string
          published_at?: string | null
          title?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "notices_event_id_commission_id_fkey"
            columns: ["event_id", "commission_id"]
            isOneToOne: false
            referencedRelation: "commissions"
            referencedColumns: ["event_id", "id"]
          },
          {
            foreignKeyName: "notices_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      participant_private: {
        Row: {
          event_id: string
          participant_id: string
          whatsapp: string
        }
        Insert: {
          event_id: string
          participant_id: string
          whatsapp: string
        }
        Update: {
          event_id?: string
          participant_id?: string
          whatsapp?: string
        }
        Relationships: [
          {
            foreignKeyName: "participant_private_event_id_participant_id_fkey"
            columns: ["event_id", "participant_id"]
            isOneToOne: false
            referencedRelation: "participants"
            referencedColumns: ["event_id", "id"]
          },
        ]
      }
      participant_types: {
        Row: {
          code: string
          event_id: string
          label: string
          self_selectable: boolean
          wristband_color: string
          wristband_label: string
        }
        Insert: {
          code: string
          event_id: string
          label: string
          self_selectable?: boolean
          wristband_color: string
          wristband_label: string
        }
        Update: {
          code?: string
          event_id?: string
          label?: string
          self_selectable?: boolean
          wristband_color?: string
          wristband_label?: string
        }
        Relationships: [
          {
            foreignKeyName: "participant_types_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      participants: {
        Row: {
          approved_type: string
          church: string
          consent_at: string
          consent_version: string
          created_at: string
          event_id: string
          full_name: string
          id: string
          province: string
          qr_token: string
          registration_number: number
          requested_type: string
          status: string
          updated_at: string
          user_id: string
          version: number
        }
        Insert: {
          approved_type: string
          church: string
          consent_at?: string
          consent_version: string
          created_at?: string
          event_id: string
          full_name: string
          id?: string
          province: string
          qr_token?: string
          registration_number?: never
          requested_type: string
          status?: string
          updated_at?: string
          user_id: string
          version?: number
        }
        Update: {
          approved_type?: string
          church?: string
          consent_at?: string
          consent_version?: string
          created_at?: string
          event_id?: string
          full_name?: string
          id?: string
          province?: string
          qr_token?: string
          registration_number?: never
          requested_type?: string
          status?: string
          updated_at?: string
          user_id?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "participants_event_id_approved_type_fkey"
            columns: ["event_id", "approved_type"]
            isOneToOne: false
            referencedRelation: "participant_types"
            referencedColumns: ["event_id", "code"]
          },
          {
            foreignKeyName: "participants_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "participants_event_id_requested_type_fkey"
            columns: ["event_id", "requested_type"]
            isOneToOne: false
            referencedRelation: "participant_types"
            referencedColumns: ["event_id", "code"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string
          id: string
        }
        Insert: {
          created_at?: string
          display_name: string
          id: string
        }
        Update: {
          created_at?: string
          display_name?: string
          id?: string
        }
        Relationships: []
      }
      schedule_releases: {
        Row: {
          created_at: string
          event_id: string
          id: string
          label: string
          published_at: string | null
          state: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          label: string
          published_at?: string | null
          state?: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          label?: string
          published_at?: string | null
          state?: string
        }
        Relationships: [
          {
            foreignKeyName: "schedule_releases_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          ends_at: string
          event_id: string
          id: string
          logical_session_id: string
          release_id: string
          sort_order: number
          speaker_name: string | null
          starts_at: string
          status: string
          title: string
          venue_id: string | null
        }
        Insert: {
          ends_at: string
          event_id: string
          id?: string
          logical_session_id?: string
          release_id: string
          sort_order: number
          speaker_name?: string | null
          starts_at: string
          status?: string
          title: string
          venue_id?: string | null
        }
        Update: {
          ends_at?: string
          event_id?: string
          id?: string
          logical_session_id?: string
          release_id?: string
          sort_order?: number
          speaker_name?: string | null
          starts_at?: string
          status?: string
          title?: string
          venue_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sessions_event_id_release_id_fkey"
            columns: ["event_id", "release_id"]
            isOneToOne: false
            referencedRelation: "schedule_releases"
            referencedColumns: ["event_id", "id"]
          },
          {
            foreignKeyName: "sessions_event_id_venue_id_fkey"
            columns: ["event_id", "venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["event_id", "id"]
          },
        ]
      }
      shift_assignments: {
        Row: {
          commission_id: string
          shift_id: string
          user_id: string
        }
        Insert: {
          commission_id: string
          shift_id: string
          user_id: string
        }
        Update: {
          commission_id?: string
          shift_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shift_assignments_commission_id_shift_id_fkey"
            columns: ["commission_id", "shift_id"]
            isOneToOne: false
            referencedRelation: "commission_shifts"
            referencedColumns: ["commission_id", "id"]
          },
          {
            foreignKeyName: "shift_assignments_commission_id_user_id_fkey"
            columns: ["commission_id", "user_id"]
            isOneToOne: false
            referencedRelation: "commission_members"
            referencedColumns: ["commission_id", "user_id"]
          },
        ]
      }
      transport_routes: {
        Row: {
          commission_id: string
          destination: string
          event_id: string
          id: string
          instructions: string
          is_published: boolean
          origin: string
          public_contact: string
          schedule_text: string
          title: string
          updated_at: string
          version: number
        }
        Insert: {
          commission_id: string
          destination: string
          event_id: string
          id?: string
          instructions?: string
          is_published?: boolean
          origin: string
          public_contact: string
          schedule_text: string
          title: string
          updated_at?: string
          version?: number
        }
        Update: {
          commission_id?: string
          destination?: string
          event_id?: string
          id?: string
          instructions?: string
          is_published?: boolean
          origin?: string
          public_contact?: string
          schedule_text?: string
          title?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "transport_routes_event_id_commission_id_fkey"
            columns: ["event_id", "commission_id"]
            isOneToOne: false
            referencedRelation: "commissions"
            referencedColumns: ["event_id", "id"]
          },
        ]
      }
      venues: {
        Row: {
          address: string
          event_id: string
          id: string
          instructions: string
          name: string
        }
        Insert: {
          address?: string
          event_id: string
          id?: string
          instructions?: string
          name: string
        }
        Update: {
          address?: string
          event_id?: string
          id?: string
          instructions?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "venues_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_checkin_manifest: { Args: { p_event: string }; Returns: Json }
      get_commission_roster: {
        Args: { p_commission: string; p_event: string }
        Returns: Json
      }
      publish_schedule: {
        Args: { p_event: string; p_expected_active: string; p_release: string }
        Returns: undefined
      }
      register_participant: {
        Args: {
          p_church: string
          p_consent_version: string
          p_event: string
          p_name: string
          p_province: string
          p_requested_type: string
          p_whatsapp: string
        }
        Returns: Json
      }
      submit_checkin: {
        Args: {
          p_device: string
          p_event: string
          p_operation: string
          p_scanned_at: string
          p_token: string
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
