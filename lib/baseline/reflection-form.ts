import type { Reflection } from '@/lib/data/reflections'
import { StoredReflectionSchema, type StoredReflection } from '@/lib/validation/reflection'
import { ReflectionEffectSchema } from '@/lib/validation/enums'

export interface ReflectionFormState {
  effect: StoredReflection['effect']
  finalBaselineScore: number | null
  whatChanged: string
  whatWasProtected: string
  lesson: string
}

export const DEFAULT_REFLECTION_FORM_STATE: ReflectionFormState = {
  effect: 'unknown',
  finalBaselineScore: null,
  whatChanged: '',
  whatWasProtected: '',
  lesson: '',
}

export function buildReflectionInput(
  checkInId: string,
  actionRecordId: string,
  state: ReflectionFormState
) {
  return {
    checkInId,
    actionRecordId,
    effect: state.effect,
    finalBaselineScore: state.finalBaselineScore,
    whatChanged: emptyToNull(state.whatChanged),
    whatWasProtected: emptyToNull(state.whatWasProtected),
    lesson: emptyToNull(state.lesson),
  }
}

export function reflectionRowToStored(row: Reflection): StoredReflection {
  return StoredReflectionSchema.parse({
    reflectionId: row.id,
    checkInId: row.check_in_id ?? '',
    actionRecordId: row.action_record_id,
    effect: ReflectionEffectSchema.parse(row.effect ?? 'unknown'),
    whatChanged: row.what_changed,
    whatWasProtected: row.what_was_protected,
    lesson: row.lesson,
    finalBaselineScore: row.final_baseline_score,
  })
}

function emptyToNull(value: string): string | null {
  const trimmed = value.trim()
  return trimmed ? trimmed : null
}
