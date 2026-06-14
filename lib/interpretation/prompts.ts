import type { BaselineMode } from '@/lib/baseline/types'
import type { InterpretationPayload } from '@/lib/validation/interpretation'

const REFLECTION_PROMPTS: Record<BaselineMode, string> = {
  stabilize:
    'What would help you feel slightly safer or more steady in the next hour?',
  rebuild: 'What is one small thing that could make the rest of today easier?',
  maintain: 'What anchor would you like to protect today?',
  expand: 'What meaningful stretch still fits your current capacity?',
}

export function reflectionPromptForMode(mode: BaselineMode): string {
  return REFLECTION_PROMPTS[mode]
}
