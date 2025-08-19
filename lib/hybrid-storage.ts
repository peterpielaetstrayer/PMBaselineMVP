import { supabase, TABLES } from './supabase'
import type { User, CheckIn, Milestone } from './types'
import { storage as localStorage } from './storage'

export class HybridStorage {
  private isAuthenticated = false
  private currentUserId: string | null = null

  constructor() {
    // Only check auth status on client side
    if (typeof window !== 'undefined') {
      this.checkAuthStatus()
    }
  }

  private async checkAuthStatus() {
    if (!supabase) return
    
    const { data: { session } } = await supabase.auth.getSession()
    this.isAuthenticated = !!session
    this.currentUserId = session?.user?.id || null
  }

  // User Management
  async getUser(): Promise<User | null> {
    if (this.isAuthenticated && this.currentUserId) {
      try {
        const { data, error } = await supabase
          .from(TABLES.USERS)
          .select('*')
          .eq('id', this.currentUserId)
          .single()

        if (error) throw error
        return this.mapDbUserToUser(data)
      } catch (error) {
        console.warn('Failed to get user from Supabase, falling back to localStorage:', error)
      }
    }
    
    // Fallback to localStorage
    return localStorage.getUser()
  }

  async setUser(user: User): Promise<void> {
    if (this.isAuthenticated && this.currentUserId) {
      try {
        const { error } = await supabase
          .from(TABLES.USERS)
          .upsert({
            id: this.currentUserId,
            email: user.email,
            name: user.name,
            timezone: user.timezone,
            created_at: user.created_at.toISOString(),
            updated_at: new Date().toISOString(),
          })

        if (error) throw error
      } catch (error) {
        console.warn('Failed to save user to Supabase, falling back to localStorage:', error)
      }
    }
    
    // Always save to localStorage as backup
    localStorage.setUser(user)
  }

  // Check-ins Management
  async getCheckins(): Promise<CheckIn[]> {
    if (this.isAuthenticated && this.currentUserId) {
      try {
        const { data, error } = await supabase
          .from(TABLES.CHECKINS)
          .select('*')
          .eq('user_id', this.currentUserId)
          .order('date', { ascending: false })

        if (error) throw error
        return data.map(this.mapDbCheckinToCheckin)
      } catch (error) {
        console.warn('Failed to get checkins from Supabase, falling back to localStorage:', error)
      }
    }
    
    return localStorage.getCheckins()
  }

  async addCheckin(checkin: CheckIn): Promise<void> {
    if (this.isAuthenticated && this.currentUserId) {
      try {
        const { error } = await supabase
          .from(TABLES.CHECKINS)
          .upsert({
            id: checkin.id,
            user_id: this.currentUserId,
            date: checkin.date,
            physical_score: checkin.physical_score,
            mental_score: checkin.mental_score,
            minimums_met: checkin.minimums_met,
            notes: checkin.notes,
            created_at: checkin.created_at.toISOString(),
            updated_at: new Date().toISOString(),
          })

        if (error) throw error
      } catch (error) {
        console.warn('Failed to save checkin to Supabase, falling back to localStorage:', error)
      }
    }
    
    // Always save to localStorage as backup
    localStorage.addCheckin(checkin)
  }

  // Milestone Management
  async getMilestone(): Promise<Milestone | null> {
    if (this.isAuthenticated && this.currentUserId) {
      try {
        const { data, error } = await supabase
          .from(TABLES.MILESTONES)
          .select('*')
          .eq('user_id', this.currentUserId)
          .single()

        if (error && error.code !== 'PGRST116') throw error // PGRST116 = no rows returned
        if (data) return this.mapDbMilestoneToMilestone(data)
      } catch (error) {
        console.warn('Failed to get milestone from Supabase, falling back to localStorage:', error)
      }
    }
    
    return localStorage.getMilestone()
  }

  async setMilestone(milestone: Milestone): Promise<void> {
    if (this.isAuthenticated && this.currentUserId) {
      try {
        const { error } = await supabase
          .from(TABLES.MILESTONES)
          .upsert({
            user_id: this.currentUserId,
            fifty_day_achieved: milestone.fifty_day_achieved?.toISOString() || null,
            funding_tier: milestone.funding_tier,
            funding_choice: milestone.funding_choice,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })

        if (error) throw error
      } catch (error) {
        console.warn('Failed to save milestone to Supabase, falling back to localStorage:', error)
      }
    }
    
    localStorage.setMilestone(milestone)
  }

  // Utility methods
  async getTodayCheckin(): Promise<CheckIn | null> {
    const checkins = await this.getCheckins()
    const today = new Date().toISOString().split('T')[0]
    return checkins.find((c) => c.date === today) || null
  }

  // Mapping functions
  private mapDbUserToUser(dbUser: any): User {
    return {
      id: dbUser.id,
      name: dbUser.name || 'User',
      email: dbUser.email,
      timezone: dbUser.timezone || 'UTC',
      created_at: new Date(dbUser.created_at),
      selected_minimums: [], // Will be populated from user_minimums table
      reminder_time: '', // Will be added later
      streak_count: 0, // Will be calculated
      total_checkins: 0, // Will be calculated
      is_certified: false, // Will be added later
    }
  }

  private mapDbCheckinToCheckin(dbCheckin: any): CheckIn {
    return {
      id: dbCheckin.id,
      user_id: dbCheckin.user_id,
      date: dbCheckin.date,
      physical_score: dbCheckin.physical_score,
      mental_score: dbCheckin.mental_score,
      minimums_met: dbCheckin.minimums_met,
      notes: dbCheckin.notes,
      created_at: new Date(dbCheckin.created_at),
    }
  }

  private mapDbMilestoneToMilestone(dbMilestone: any): Milestone {
    return {
      user_id: dbMilestone.user_id,
      fifty_day_achieved: dbMilestone.fifty_day_achieved ? new Date(dbMilestone.fifty_day_achieved) : undefined,
      funding_tier: dbMilestone.funding_tier,
      funding_choice: dbMilestone.funding_choice,
    }
  }

  // Migration helper
  async migrateFromLocalStorage(): Promise<void> {
    if (!this.isAuthenticated || !this.currentUserId) return

    try {
      // Migrate user data
      const localUser = localStorage.getUser()
      if (localUser) {
        await this.setUser(localUser)
      }

      // Migrate checkins
      const localCheckins = localStorage.getCheckins()
      for (const checkin of localCheckins) {
        await this.addCheckin(checkin)
      }

      // Migrate milestone
      const localMilestone = localStorage.getMilestone()
      if (localMilestone) {
        await this.setMilestone(localMilestone)
      }

      console.log('Migration completed successfully')
    } catch (error) {
      console.error('Migration failed:', error)
    }
  }
}

export const hybridStorage = new HybridStorage()
