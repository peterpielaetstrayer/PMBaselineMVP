/** Score on a 0–10 scale. Higher is better except for stress (higher = more strain). */
export type Score = number

export type SleepQuality = Score | null

export type SafetyLevel = 'standard' | 'support' | 'urgent'

export type BasicNeedStatus = 'met' | 'partial' | 'unmet' | 'unknown'

export type BaselineMode = 'stabilize' | 'rebuild' | 'maintain' | 'expand'

export type ActionDomain =
  | 'safety'
  | 'recovery'
  | 'nutrition'
  | 'hydration'
  | 'movement'
  | 'regulation'
  | 'work'
  | 'environment'
  | 'connection'
  | 'custom'

export interface BasicNeedsStatus {
  food?: BasicNeedStatus
  hydration?: BasicNeedStatus
  sleep?: BasicNeedStatus
}

export interface CheckInInput {
  physical: Score | null
  mental: Score | null
  energy: Score | null
  stress: Score | null
  sleep: SleepQuality
  contextTags?: string[]
  hasUrgentObligation?: boolean
  basicNeeds?: BasicNeedsStatus
  safetyLevel?: SafetyLevel
}

export interface BaselineAction {
  id: string
  title: string
  description: string
  estimatedMinutes: number | null
  domain: ActionDomain
}

export type ReasonCode =
  | 'URGENT_SAFETY_OVERRIDE'
  | 'SUPPORT_LEVEL_PRESENT'
  | 'UNMET_BASIC_NEEDS'
  | 'PARTIAL_BASIC_NEEDS'
  | 'HIGH_STRESS_LOW_ENERGY'
  | 'VERY_HIGH_STRESS'
  | 'VERY_LOW_ENERGY'
  | 'LOW_PHYSICAL_AND_MENTAL'
  | 'POOR_SLEEP'
  | 'URGENT_OBLIGATION_LOW_CAPACITY'
  | 'STRONG_STABLE_CAPACITY'
  | 'MODERATE_STABLE_CAPACITY'
  | 'CONTRADICTORY_SIGNALS'
  | 'INSUFFICIENT_INFORMATION'
  | 'DEFAULT_REBUILD'

export interface ModeInterpretationResult {
  /** Working interpretation — not a clinical diagnosis. */
  proposedMode: BaselineMode
  engineVersion: string
  confidence: number
  explanation: string
  factors: string[]
  reasonCodes: ReasonCode[]
  primaryAction: BaselineAction
  alternatives: BaselineAction[]
  avoidForNow: string[]
  needsMoreInformation: boolean
  safety: {
    level: SafetyLevel
    message: string | null
  }
}

export interface ModeClassification {
  mode: BaselineMode
  confidence: number
  factors: string[]
  reasonCodes: ReasonCode[]
  needsMoreInformation: boolean
}
