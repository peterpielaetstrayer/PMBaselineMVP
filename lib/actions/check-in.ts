'use server'

import { createClient } from '@/lib/supabase/server'
import { deterministicInterpretationProvider } from '@/lib/interpretation/deterministic-provider'
import {
  deriveSafetyLevel,
  quickCheckInToEngineInput,
} from '@/lib/interpretation/safety'
import { submitCheckInWithInterpretation } from '@/lib/data/submit-check-in'
import {
  QuickCheckInInputSchema,
  StoredInterpretationSchema,
  actionError,
  actionSuccess,
  fromDataError,
  type ActionResult,
} from '@/lib/validation'
import type { StoredInterpretation } from '@/lib/validation/interpretation'

export async function submitCheckIn(
  input: unknown
): Promise<ActionResult<StoredInterpretation>> {
  const parsed = QuickCheckInInputSchema.safeParse(input)
  if (!parsed.success) {
    return actionError('VALIDATION_ERROR', parsed.error.message)
  }

  let client
  try {
    client = await createClient()
  } catch {
    return actionError('NOT_CONFIGURED', 'Supabase is not configured')
  }

  const safetyLevel = deriveSafetyLevel(parsed.data.safetySignals)
  const engineInput = quickCheckInToEngineInput(parsed.data, safetyLevel)

  const interpretation = await deterministicInterpretationProvider.interpret(engineInput)

  const result = await submitCheckInWithInterpretation(client, {
    checkIn: parsed.data,
    interpretation,
  })

  if (!result.ok) {
    return { ok: false, error: fromDataError(result.error) }
  }

  return actionSuccess(StoredInterpretationSchema.parse(result.data))
}
