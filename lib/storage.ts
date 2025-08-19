import type { User, CheckIn, Milestone } from "./types"

const STORAGE_KEYS = {
  USER: "pmbaseline_user",
  CHECKINS: "pmbaseline_checkins",
  MILESTONE: "pmbaseline_milestone",
  APP_STATE: "pmbaseline_app_state",
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

    for (let i = 0; i < sortedCheckins.length; i++) {
      const checkinDate = new Date(sortedCheckins[i].date)
      const expectedDate = new Date(today)
      expectedDate.setDate(today.getDate() - i)

      // Check if this checkin is for the expected date
      if (checkinDate.toDateString() === expectedDate.toDateString()) {
        streak++
      } else {
        break
      }
    }

    return streak
  },

  hasAchievedMilestone: (): boolean => {
    const streak = storage.calculateStreak()
    const milestone = storage.getMilestone()
    return streak >= 50 || milestone?.fifty_day_achieved !== undefined
  },

  clearAll: (): void => {
    if (typeof window === "undefined") return
    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key)
    })
  },
}
