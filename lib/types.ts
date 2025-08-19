export interface User {
  id: string
  name: string
  email: string
  timezone: string
  created_at: Date
  selected_minimums: string[]
  reminder_time: string
  streak_count: number
  total_checkins: number
  is_certified: boolean
}

export interface CheckIn {
  id: string
  user_id: string
  date: string // ISO date string
  physical_score: number // 1-5
  mental_score: number // 1-5
  minimums_met: string[]
  notes?: string
  created_at: Date
}

export interface Milestone {
  user_id: string
  fifty_day_achieved?: Date
  funding_tier: "none" | "tier1" | "tier2"
  funding_choice?: "$50_gift" | "$100_reimbursement" | "$500_seed"
}

export type AppScreen =
  | "welcome"
  | "baseline-setup"
  | "reminder-setup"
  | "daily-checkin"
  | "home"
  | "progress"
  | "milestone"
  | "uvc-dashboard"

export interface AppState {
  currentScreen: AppScreen
  user: User | null
  todayCheckin: CheckIn | null
  checkins: CheckIn[]
  milestone: Milestone | null
}

export const PHYSICAL_MINIMUMS = [
  { id: "walk", label: "Walk (5 min)", icon: "🚶" },
  { id: "movement", label: "Movement (1 push-up)", icon: "💪" },
  { id: "sunlight", label: "Sunlight (10 min)", icon: "☀️" },
  { id: "hydration", label: "Hydration", icon: "💧" },
] as const

export const MENTAL_MINIMUMS = [
  { id: "breathe", label: "Breathe (2 min)", icon: "🫁" },
  { id: "reflect", label: "Reflect (1 sentence)", icon: "💭" },
  { id: "pause", label: "Pause (before phone)", icon: "⏸️" },
  { id: "gratitude", label: "Gratitude", icon: "🙏" },
] as const
