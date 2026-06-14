import type { CheckInInput, SafetyLevel } from '@/lib/baseline/types'
import type { QuickCheckInInput, SafetySignals } from '@/lib/validation/check-in'
import type { SafetyResult } from '@/lib/validation/safety'

/**
 * Derive final safety level server-side.
 * Client may submit explicit safety-related answers; never trust client safety_level.
 */
export function deriveSafetyLevel(signals: SafetySignals): SafetyLevel {
  if (signals.reportsUrgentRisk) {
    return 'urgent'
  }
  if (signals.reportsNeedForSupport) {
    return 'support'
  }
  return 'standard'
}

export function toSafetyResult(level: SafetyLevel, message: string | null): SafetyResult {
  return { level, message }
}

export function quickCheckInToEngineInput(
  input: QuickCheckInInput,
  safetyLevel: SafetyLevel
): CheckInInput {
  return {
    physical: input.physical,
    mental: input.mental,
    energy: input.energy,
    stress: input.stress,
    sleep: input.sleep,
    contextTags: input.contextTags,
    hasUrgentObligation: input.hasUrgentObligation,
    basicNeeds: input.basicNeeds,
    safetyLevel,
  }
}

export function quickCheckInToCheckInRow(
  input: QuickCheckInInput,
  safetyLevel: SafetyLevel
) {
  return {
    submission_id: input.submissionId,
    physical_score: input.physical,
    mental_score: input.mental,
    energy_score: input.energy,
    stress_score: input.stress,
    sleep_score: input.sleep,
    food_status: input.foodStatus ?? input.basicNeeds?.food ?? null,
    hydration_status: input.hydrationStatus ?? input.basicNeeds?.hydration ?? null,
    movement_status: input.movementStatus ?? null,
    alcohol_or_substance_context: input.alcoholOrSubstanceContext ?? null,
    context_tags: input.contextTags,
    heavy_or_important_text: input.heavyOrImportantText ?? null,
    optional_note: input.optionalNote ?? null,
    safety_level: safetyLevel,
  }
}
