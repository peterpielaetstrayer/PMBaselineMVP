'use server'

import { createClient } from '@/lib/supabase/server'
import { createActionRecord } from '@/lib/data/action-records'
import {
  AcceptActionInputSchema,
  AcceptedActionSchema,
  actionError,
  actionSuccess,
  fromDataError,
  type ActionResult,
} from '@/lib/validation'
import type { AcceptedAction } from '@/lib/validation/accepted-action'

export async function acceptAction(
  input: unknown
): Promise<ActionResult<AcceptedAction>> {
  const parsed = AcceptActionInputSchema.safeParse(input)
  if (!parsed.success) {
    return actionError('VALIDATION_ERROR', parsed.error.message)
  }

  let client
  try {
    client = await createClient()
  } catch {
    return actionError('NOT_CONFIGURED', 'Supabase is not configured')
  }

  const actionText = `${parsed.data.action.title}: ${parsed.data.action.description}`

  const result = await createActionRecord(client, {
    checkInId: parsed.data.checkInId,
    interpretationId: parsed.data.interpretationId,
    actionSource: parsed.data.actionSource,
    actionText,
    actionDomain: parsed.data.action.domain,
    modifiedFrom: parsed.data.modifiedFrom,
  })

  if (!result.ok) {
    return { ok: false, error: fromDataError(result.error) }
  }

  return actionSuccess(
    AcceptedActionSchema.parse({
      actionRecordId: result.data.id,
      checkInId: parsed.data.checkInId,
      interpretationId: parsed.data.interpretationId,
      actionSource: parsed.data.actionSource,
      action: parsed.data.action,
      status: 'accepted',
    })
  )
}
