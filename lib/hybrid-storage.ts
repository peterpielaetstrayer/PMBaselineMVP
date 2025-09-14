import { supabase, TABLES } from './supabase'
import type { User, CheckIn, Milestone } from './types'
import { storage as localStorage } from './storage'

export class HybridStorage {
  private isAuthenticated = false
  private currentUserId: string | null = null

  constructor() {
    // Initialize with default values - auth state will be updated by auth context
    this.isAuthenticated = false
    this.currentUserId = null
  }

  // Method to update auth state from auth context
  async updateAuthState(isAuthenticated: boolean, userId: string | null) {
    this.isAuthenticated = isAuthenticated
    this.currentUserId = userId
    console.log('Auth state updated:', { isAuthenticated: this.isAuthenticated, userId: this.currentUserId })
  }

  // User Management
  async getUser(): Promise<User | null> {
    console.log('getUser called:', { isAuthenticated: this.isAuthenticated, currentUserId: this.currentUserId })
    
    if (this.isAuthenticated && this.currentUserId) {
      try {
        console.log('Attempting to get user from Supabase...')
        
        // Get user basic info
        const { data: userData, error: userError } = await supabase
          .from(TABLES.USERS)
          .select('*')
          .eq('id', this.currentUserId)
          .single()

        if (userError) {
          console.error('Supabase user error:', userError)
          throw userError
        }
        
        // Get user's selected minimums
        const { data: minimumsData, error: minimumsError } = await supabase
          .from(TABLES.USER_MINIMUMS)
          .select('minimum_id')
          .eq('user_id', this.currentUserId)

        if (minimumsError) {
          console.error('Supabase minimums error:', minimumsError)
          // Don't throw here, just use empty array
        }

        // Get user's checkins for streak calculation
        const { data: checkinsData, error: checkinsError } = await supabase
          .from(TABLES.CHECKINS)
          .select('date, created_at')
          .eq('user_id', this.currentUserId)
          .order('date', { ascending: false })

        if (checkinsError) {
          console.error('Supabase checkins error:', checkinsError)
          // Don't throw here, just use empty array
        }

        console.log('User data from Supabase:', { userData, minimumsData, checkinsData })
        
        const user = this.mapDbUserToUser(userData, minimumsData || [], checkinsData || [])
        console.log('Mapped user:', user)
        return user
      } catch (error) {
        console.warn('Failed to get user from Supabase, falling back to localStorage:', error)
      }
    }
    
    console.log('Falling back to localStorage...')
    // Fallback to localStorage
    return localStorage.getUser()
  }

  async setUser(user: User): Promise<void> {
    if (this.isAuthenticated && this.currentUserId) {
      try {
        // Save user basic info
        const { error: userError } = await supabase
          .from(TABLES.USERS)
          .upsert({
            id: this.currentUserId,
            email: user.email,
            name: user.name,
            timezone: user.timezone,
            reminder_time: user.reminder_time,
            is_certified: user.is_certified,
            created_at: user.created_at.toISOString(),
            updated_at: new Date().toISOString(),
          })

        if (userError) throw userError

        // Save user's selected minimums
        if (user.selected_minimums.length > 0) {
          // First, delete existing minimums
          const { error: deleteError } = await supabase
            .from(TABLES.USER_MINIMUMS)
            .delete()
            .eq('user_id', this.currentUserId)

          if (deleteError) {
            console.warn('Failed to delete existing minimums:', deleteError)
          }

          // Then insert new minimums
          const minimumsToInsert = user.selected_minimums.map(minimumId => ({
            user_id: this.currentUserId,
            minimum_id: minimumId,
            minimum_type: minimumId.includes('walk') || minimumId.includes('movement') || minimumId.includes('sunlight') || minimumId.includes('hydration') ? 'physical' : 'mental',
            created_at: new Date().toISOString()
          }))

          const { error: minimumsError } = await supabase
            .from(TABLES.USER_MINIMUMS)
            .insert(minimumsToInsert)

          if (minimumsError) {
            console.warn('Failed to save user minimums:', minimumsError)
          }
        }
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
  private mapDbUserToUser(dbUser: any, minimumsData: any[] = [], checkinsData: any[] = []): User {
    // Calculate streak from checkins data
    const streakCount = this.calculateStreakFromCheckins(checkinsData)
    
    return {
      id: dbUser.id,
      name: dbUser.name || 'User',
      email: dbUser.email,
      timezone: dbUser.timezone || 'UTC',
      created_at: new Date(dbUser.created_at),
      selected_minimums: minimumsData.map(m => m.minimum_id),
      reminder_time: dbUser.reminder_time || '',
      streak_count: streakCount,
      total_checkins: checkinsData.length,
      is_certified: dbUser.is_certified || false,
    }
  }

  private calculateStreakFromCheckins(checkinsData: any[]): number {
    if (checkinsData.length === 0) return 0
    
    // Sort checkins by date (most recent first)
    const sortedCheckins = checkinsData.sort((a, b) => b.date.localeCompare(a.date))
    
    let streak = 0
    const today = new Date().toISOString().split('T')[0]
    let currentDate = new Date(today)
    
    for (const checkin of sortedCheckins) {
      const checkinDate = new Date(checkin.date)
      const daysDiff = Math.floor((currentDate.getTime() - checkinDate.getTime()) / (1000 * 60 * 60 * 24))
      
      if (daysDiff === streak) {
        streak++
        currentDate.setDate(currentDate.getDate() - 1)
      } else {
        break
      }
    }
    
    return streak
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
