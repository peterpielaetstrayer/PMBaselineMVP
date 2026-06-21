import type { QuickCheckInInput } from '@/lib/validation/check-in'

export interface QuickCheckInFormState {
  physical: number
  mental: number
  energy: number
  stress: number
  sleep: number | null
  foodStatus: string | null
  hydrationStatus: string | null
  movementStatus: string | null
  alcoholOrSubstanceContext: string | null
  contextTags: string[]
  heavyOrImportantText: string | null
  optionalNote: string | null
  reportsUrgentRisk: boolean
  reportsNeedForSupport: boolean
}

export const DEFAULT_CHECK_IN_FORM_STATE: QuickCheckInFormState = {
  physical: 5,
  mental: 5,
  energy: 5,
  stress: 5,
  sleep: null,
  foodStatus: null,
  hydrationStatus: null,
  movementStatus: null,
  alcoholOrSubstanceContext: null,
  contextTags: [],
  heavyOrImportantText: null,
  optionalNote: null,
  reportsUrgentRisk: false,
  reportsNeedForSupport: false,
}

export function createCheckInSubmissionId(): string {
  return crypto.randomUUID()
}

export function parseContextTagsInput(input: string): string[] {
  return input
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 12)
}

export function buildQuickCheckInPayload(
  submissionId: string,
  state: QuickCheckInFormState
): QuickCheckInInput {
  return {
    submissionId,
    physical: state.physical,
    mental: state.mental,
    energy: state.energy,
    stress: state.stress,
    sleep: state.sleep,
    foodStatus: emptyToNull(state.foodStatus),
    hydrationStatus: emptyToNull(state.hydrationStatus),
    movementStatus: emptyToNull(state.movementStatus),
    alcoholOrSubstanceContext: emptyToNull(state.alcoholOrSubstanceContext),
    contextTags: state.contextTags,
    heavyOrImportantText: emptyToNull(state.heavyOrImportantText),
    optionalNote: emptyToNull(state.optionalNote),
    hasUrgentObligation: false,
    safetySignals: {
      reportsUrgentRisk: state.reportsUrgentRisk,
      reportsNeedForSupport: state.reportsNeedForSupport,
    },
  }
}

export function resolveCheckInResultPath(checkInId: string): string {
  return `/result/${checkInId}`
}

function emptyToNull(value: string | null | undefined): string | null {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}
