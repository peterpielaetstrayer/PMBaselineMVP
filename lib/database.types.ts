export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string | null
          timezone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name?: string | null
          timezone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          timezone?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_minimums: {
        Row: {
          id: string
          user_id: string
          minimum_id: string
          minimum_type: 'physical' | 'mental'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          minimum_id: string
          minimum_type: 'physical' | 'mental'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          minimum_id?: string
          minimum_type?: 'physical' | 'mental'
          created_at?: string
        }
      }
      checkins: {
        Row: {
          id: string
          user_id: string
          date: string
          physical_score: number
          mental_score: number
          minimums_met: string[]
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          physical_score: number
          mental_score: number
          minimums_met: string[]
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          physical_score?: number
          mental_score?: number
          minimums_met?: string[]
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      milestones: {
        Row: {
          id: string
          user_id: string
          fifty_day_achieved: string | null
          funding_tier: 'none' | 'tier1' | 'tier2'
          funding_choice: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          fifty_day_achieved?: string | null
          funding_tier?: 'none' | 'tier1' | 'tier2'
          funding_choice?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          fifty_day_achieved?: string | null
          funding_tier?: 'none' | 'tier1' | 'tier2'
          funding_choice?: string | null
          created_at?: string
          updated_at?: string
        }
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
  }
}
