'use server'

import { createClient } from '@/lib/supabase/server'
import { markActionRecordCompleted } from '@/lib/data/action-records'
import { createReflection } from '@/lib/data/reflections'
import {
  ReflectionInputSchema,
  StoredReflectionSchema,
  actionError,
  actionSuccess,
  fromDataError,
  type ActionResult,
} from '@/lib/validation'
import type { StoredReflection } from '@/lib/validation/reflection'

export async function submitReflection(
  input: unknown
): Promise<ActionResult<StoredReflection>> {
  const parsed = ReflectionInputSchema.safeParse(input)
  if (!parsed.success) {
    return actionError('VALIDATION_ERROR', parsed.error.message)
  }

  let client
  try {
    client = await createClient()
  } catch {
    return actionError('NOT_CONFIGURED', 'Supabase is not configured')
  }

  const result = await createReflection(client, parsed.data)
  if (!result.ok) {
    return { ok: false, error: fromDataError(result.error) }
  }

  if (parsed.data.actionRecordId) {
    const completionResult = await markActionRecordCompleted(
      client,
      parsed.data.actionRecordId
    )
    if (!completionResult.ok) {
      return { ok: false, error: fromDataError(completionResult.error) }
    }
  }

  return actionSuccess(
    StoredReflectionSchema.parse({
      reflectionId: result.data.id,
      checkInId: parsed.data.checkInId,
      actionRecordId: parsed.data.actionRecordId ?? null,
      effect: parsed.data.effect,
      whatChanged: parsed.data.whatChanged ?? null,
      whatWasProtected: parsed.data.whatWasProtected ?? null,
      lesson: parsed.data.lesson ?? null,
      finalBaselineScore: parsed.data.finalBaselineScore ?? null,
    })
  )
}
