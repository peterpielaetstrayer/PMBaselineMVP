export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          display_name: string | null
          timezone: string
          onboarding_status: string
          coaching_tone: string
          memory_consent: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          display_name?: string | null
          timezone?: string
          onboarding_status?: string
          coaching_tone?: string
          memory_consent?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          display_name?: string | null
          timezone?: string
          onboarding_status?: string
          coaching_tone?: string
          memory_consent?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      baseline_profiles: {
        Row: {
          id: string
          user_id: string
          known_stabilizers: string[]
          known_destabilizers: string[]
          current_priorities: string[]
          constraints: string[]
          preferred_minimum_actions: Json
          user_defined_baseline: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          known_stabilizers?: string[]
          known_destabilizers?: string[]
          current_priorities?: string[]
          constraints?: string[]
          preferred_minimum_actions?: Json
          user_defined_baseline?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          known_stabilizers?: string[]
          known_destabilizers?: string[]
          current_priorities?: string[]
          constraints?: string[]
          preferred_minimum_actions?: Json
          user_defined_baseline?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'baseline_profiles_user_id_fkey'
            columns: ['user_id']
            isOneToOne: true
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      check_ins: {
        Row: {
          id: string
          user_id: string
          physical_score: number | null
          mental_score: number | null
          energy_score: number | null
          stress_score: number | null
          sleep_score: number | null
          food_status: string | null
          hydration_status: string | null
          movement_status: string | null
          alcohol_or_substance_context: string | null
          context_tags: string[]
          heavy_or_important_text: string | null
          optional_note: string | null
          safety_level: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          physical_score?: number | null
          mental_score?: number | null
          energy_score?: number | null
          stress_score?: number | null
          sleep_score?: number | null
          food_status?: string | null
          hydration_status?: string | null
          movement_status?: string | null
          alcohol_or_substance_context?: string | null
          context_tags?: string[]
          heavy_or_important_text?: string | null
          optional_note?: string | null
          safety_level?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          physical_score?: number | null
          mental_score?: number | null
          energy_score?: number | null
          stress_score?: number | null
          sleep_score?: number | null
          food_status?: string | null
          hydration_status?: string | null
          movement_status?: string | null
          alcohol_or_substance_context?: string | null
          context_tags?: string[]
          heavy_or_important_text?: string | null
          optional_note?: string | null
          safety_level?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'check_ins_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      interpretations: {
        Row: {
          id: string
          user_id: string
          check_in_id: string
          proposed_mode: string
          confidence: number | null
          summary: string
          primary_action: Json
          alternative_actions: Json
          avoid_for_now: string[]
          reflection_prompt: string | null
          safety: Json
          source: string
          model_id: string | null
          prompt_version: string | null
          retrieved_context: Json
          user_disposition: string | null
          user_corrected_mode: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          check_in_id: string
          proposed_mode: string
          confidence?: number | null
          summary: string
          primary_action: Json
          alternative_actions?: Json
          avoid_for_now?: string[]
          reflection_prompt?: string | null
          safety?: Json
          source?: string
          model_id?: string | null
          prompt_version?: string | null
          retrieved_context?: Json
          user_disposition?: string | null
          user_corrected_mode?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          check_in_id?: string
          proposed_mode?: string
          confidence?: number | null
          summary?: string
          primary_action?: Json
          alternative_actions?: Json
          avoid_for_now?: string[]
          reflection_prompt?: string | null
          safety?: Json
          source?: string
          model_id?: string | null
          prompt_version?: string | null
          retrieved_context?: Json
          user_disposition?: string | null
          user_corrected_mode?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'interpretations_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'interpretations_check_in_id_fkey'
            columns: ['check_in_id']
            isOneToOne: false
            referencedRelation: 'check_ins'
            referencedColumns: ['id']
          },
        ]
      }
      action_records: {
        Row: {
          id: string
          user_id: string
          check_in_id: string | null
          interpretation_id: string | null
          action_text: string
          action_domain: string
          action_source: string
          status: string
          modified_from: string | null
          scheduled_for: string | null
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          check_in_id?: string | null
          interpretation_id?: string | null
          action_text: string
          action_domain?: string
          action_source?: string
          status?: string
          modified_from?: string | null
          scheduled_for?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          check_in_id?: string | null
          interpretation_id?: string | null
          action_text?: string
          action_domain?: string
          action_source?: string
          status?: string
          modified_from?: string | null
          scheduled_for?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'action_records_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'action_records_check_in_id_fkey'
            columns: ['check_in_id']
            isOneToOne: false
            referencedRelation: 'check_ins'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'action_records_interpretation_id_fkey'
            columns: ['interpretation_id']
            isOneToOne: false
            referencedRelation: 'interpretations'
            referencedColumns: ['id']
          },
        ]
      }
      reflections: {
        Row: {
          id: string
          user_id: string
          check_in_id: string | null
          action_record_id: string | null
          effect: string | null
          what_changed: string | null
          what_was_protected: string | null
          lesson: string | null
          final_baseline_score: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          check_in_id?: string | null
          action_record_id?: string | null
          effect?: string | null
          what_changed?: string | null
          what_was_protected?: string | null
          lesson?: string | null
          final_baseline_score?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          check_in_id?: string | null
          action_record_id?: string | null
          effect?: string | null
          what_changed?: string | null
          what_was_protected?: string | null
          lesson?: string | null
          final_baseline_score?: number | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'reflections_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'reflections_check_in_id_fkey'
            columns: ['check_in_id']
            isOneToOne: false
            referencedRelation: 'check_ins'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'reflections_action_record_id_fkey'
            columns: ['action_record_id']
            isOneToOne: false
            referencedRelation: 'action_records'
            referencedColumns: ['id']
          },
        ]
      }
      memories: {
        Row: {
          id: string
          user_id: string
          memory_type: string
          statement: string
          source_record_ids: string[]
          status: string
          confidence: number | null
          last_used_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          memory_type: string
          statement: string
          source_record_ids?: string[]
          status?: string
          confidence?: number | null
          last_used_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          memory_type?: string
          statement?: string
          source_record_ids?: string[]
          status?: string
          confidence?: number | null
          last_used_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'memories_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      weekly_summaries: {
        Row: {
          id: string
          user_id: string
          week_start: string
          week_end: string
          what_supported_baseline: string | null
          what_disrupted_baseline: string | null
          what_was_protected: string | null
          next_week_experiment: string | null
          confidence: number | null
          evidence_references: Json
          proposed_memories: Json
          summary: Json
          source: string
          model_id: string | null
          prompt_version: string | null
          user_disposition: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          week_start: string
          week_end: string
          what_supported_baseline?: string | null
          what_disrupted_baseline?: string | null
          what_was_protected?: string | null
          next_week_experiment?: string | null
          confidence?: number | null
          evidence_references?: Json
          proposed_memories?: Json
          summary?: Json
          source?: string
          model_id?: string | null
          prompt_version?: string | null
          user_disposition?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          week_start?: string
          week_end?: string
          what_supported_baseline?: string | null
          what_disrupted_baseline?: string | null
          what_was_protected?: string | null
          next_week_experiment?: string | null
          confidence?: number | null
          evidence_references?: Json
          proposed_memories?: Json
          summary?: Json
          source?: string
          model_id?: string | null
          prompt_version?: string | null
          user_disposition?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'weekly_summaries_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      ai_runs: {
        Row: {
          id: string
          user_id: string
          feature_name: string
          related_record_type: string | null
          related_record_id: string | null
          model_id: string | null
          prompt_version: string | null
          input_context: Json
          output: Json | null
          status: string
          error_message: string | null
          latency_ms: number | null
          input_tokens: number | null
          output_tokens: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          feature_name: string
          related_record_type?: string | null
          related_record_id?: string | null
          model_id?: string | null
          prompt_version?: string | null
          input_context?: Json
          output?: Json | null
          status?: string
          error_message?: string | null
          latency_ms?: number | null
          input_tokens?: number | null
          output_tokens?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          feature_name?: string
          related_record_type?: string | null
          related_record_id?: string | null
          model_id?: string | null
          prompt_version?: string | null
          input_context?: Json
          output?: Json | null
          status?: string
          error_message?: string | null
          latency_ms?: number | null
          input_tokens?: number | null
          output_tokens?: number | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'ai_runs_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']

export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']
