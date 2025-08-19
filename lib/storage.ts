import type { User, CheckIn, Milestone } from "./types"

const STORAGE_KEYS = {
  USER: "pmbaseline_user",
  CHECKINS: "pmbaseline_checkins",
  MILESTONE: "pmbaseline_milestone",
  APP_STATE: "pmbaseline_app_state",
  PARTIAL_CHECKIN: "pmbaseline_partial_checkin",
} as const

export const storage = {
  // User management
  getUser: (): User | null => {
    if (typeof window === "undefined") return null
    const stored = localStorage.getItem(STORAGE_KEYS.USER)
    return stored ? JSON.parse(stored) : null
  },

  setUser: (user: User): void => {
    if (typeof window === "undefined") return
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user))
  },

  // Check-ins management
  getCheckins: (): CheckIn[] => {
    if (typeof window === "undefined") return []
    const stored = localStorage.getItem(STORAGE_KEYS.CHECKINS)
    return stored ? JSON.parse(stored) : []
  },

  setCheckins: (checkins: CheckIn[]): void => {
    if (typeof window === "undefined") return
    localStorage.setItem(STORAGE_KEYS.CHECKINS, JSON.stringify(checkins))
  },

  addCheckin: (checkin: CheckIn): void => {
    const checkins = storage.getCheckins()
    const existingIndex = checkins.findIndex((c) => c.date === checkin.date)

    if (existingIndex >= 0) {
      checkins[existingIndex] = checkin
    } else {
      checkins.push(checkin)
    }

    storage.setCheckins(checkins)
  },

  getTodayCheckin: (): CheckIn | null => {
    const today = new Date().toISOString().split("T")[0]
    const checkins = storage.getCheckins()
    return checkins.find((c) => c.date === today) || null
  },

  // Milestone management
  getMilestone: (): Milestone | null => {
    if (typeof window === "undefined") return null
    const stored = localStorage.getItem(STORAGE_KEYS.MILESTONE)
    return stored ? JSON.parse(stored) : null
  },

  setMilestone: (milestone: Milestone): void => {
    if (typeof window === "undefined") return
    localStorage.setItem(STORAGE_KEYS.MILESTONE, JSON.stringify(milestone))
  },

  // Utility functions
  calculateStreak: (): number => {
    const checkins = storage.getCheckins()
    if (checkins.length === 0) return 0

    // Sort checkins by date (most recent first)
    const sortedCheckins = checkins.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    let streak = 0
    const today = new Date()
    let gracePeriodUsed = 0
    const MAX_GRACE_DAYS = 2

    for (let i = 0; i < sortedCheckins.length; i++) {
      const checkinDate = new Date(sortedCheckins[i].date)
      const expectedDate = new Date(today)
      expectedDate.setDate(today.getDate() - i)

      // Check if this checkin is for the expected date
      if (checkinDate.toDateString() === expectedDate.toDateString()) {
        streak++
      } else {
        // Check if we can use grace period
        const daysDiff = Math.abs((checkinDate.getTime() - expectedDate.getTime()) / (1000 * 60 * 60 * 24))
        if (daysDiff <= MAX_GRACE_DAYS && gracePeriodUsed < MAX_GRACE_DAYS) {
          gracePeriodUsed++
          streak++
        } else {
          break
        }
      }
    }

    return streak
  },

  // Get streak info with grace period details
  getStreakInfo: (): { currentStreak: number; gracePeriodUsed: number; maxGraceDays: number } => {
    const checkins = storage.getCheckins()
    if (checkins.length === 0) return { currentStreak: 0, gracePeriodUsed: 0, maxGraceDays: 2 }

    const sortedCheckins = checkins.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    let streak = 0
    const today = new Date()
    let gracePeriodUsed = 0
    const MAX_GRACE_DAYS = 2

    for (let i = 0; i < sortedCheckins.length; i++) {
      const checkinDate = new Date(sortedCheckins[i].date)
      const expectedDate = new Date(today)
      expectedDate.setDate(today.getDate() - i)

      if (checkinDate.toDateString() === expectedDate.toDateString()) {
        streak++
      } else {
        const daysDiff = Math.abs((checkinDate.getTime() - expectedDate.getTime()) / (1000 * 60 * 60 * 24))
        if (daysDiff <= MAX_GRACE_DAYS && gracePeriodUsed < MAX_GRACE_DAYS) {
          gracePeriodUsed++
          streak++
        } else {
          break
        }
      }
    }

    return { currentStreak: streak, gracePeriodUsed, maxGraceDays: MAX_GRACE_DAYS }
  },

  hasAchievedMilestone: (): boolean => {
    const streak = storage.calculateStreak()
    const milestone = storage.getMilestone()
    return streak >= 50 || milestone?.fifty_day_achieved !== undefined
  },

  // Partial check-in management
  savePartialCheckin: (partial: {
    physical_score: number
    mental_score: number
    minimums_met: string[]
    notes: string
    timestamp: number
  }): void => {
    if (typeof window === "undefined") return
    localStorage.setItem(STORAGE_KEYS.PARTIAL_CHECKIN, JSON.stringify(partial))
  },

  getPartialCheckin: (): {
    physical_score: number
    mental_score: number
    minimumsMet: string[]
    notes: string
    timestamp: number
  } | null => {
    if (typeof window === "undefined") return null
    const stored = localStorage.getItem(STORAGE_KEYS.PARTIAL_CHECKIN)
    if (!stored) return null
    
    const partial = JSON.parse(stored)
    // Only return if partial is from today (within 24 hours)
    if (Date.now() - partial.timestamp > 24 * 60 * 60 * 1000) {
      storage.clearPartialCheckin()
      return null
    }
    
    return partial
  },

  clearPartialCheckin: (): void => {
    if (typeof window === "undefined") return
    localStorage.removeItem(STORAGE_KEYS.PARTIAL_CHECKIN)
  },

  clearAll: (): void => {
    if (typeof window === "undefined") return
    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key)
    })
  },
}
