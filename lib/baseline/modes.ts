import type { BaselineMode } from './types'

export const BASELINE_ENGINE_VERSION = 'baseline-engine-v0.1'

export const BASELINE_MODES: readonly BaselineMode[] = [  'stabilize',
  'rebuild',
  'maintain',
  'expand',
] as const

export const MODE_LABELS: Record<BaselineMode, string> = {
  stabilize: 'Stabilize',
  rebuild: 'Rebuild',
  maintain: 'Maintain',
  expand: 'Expand',
}

export const MODE_SUMMARIES: Record<BaselineMode, string> = {
  stabilize:
    'Protection and immediate stabilization come first — food, water, rest, safety, and only essential obligations.',
  rebuild:
    'Gentle structure and minimum viable actions can rebuild momentum without pushing for optimization.',
  maintain:
    'You appear near a functional baseline — consistency across anchors and recovery matters more than adding pressure.',
  expand:
    'Capacity looks strong enough for deliberate growth, as long as baseline conditions stay protected.',
}

/** Appended to explanations so outputs are never framed as diagnoses. */
export const NON_DIAGNOSTIC_DISCLAIMER =
  'This is a working interpretation of your check-in, not a diagnosis or label.'

export function isBaselineMode(value: string): value is BaselineMode {
  return (BASELINE_MODES as readonly string[]).includes(value)
}
