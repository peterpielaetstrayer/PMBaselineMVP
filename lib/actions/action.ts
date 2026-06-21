'use server'

import { createClient } from '@/lib/supabase/server'
import {
  createActionRecord,
  getActionRecordForCheckIn,
} from '@/lib/data/action-records'
import { actionRecordToBaselineAction } from '@/lib/baseline/action-record-view'
import {
  AcceptActionInputSchema,
  AcceptedActionSchema,
  actionError,
  actionSuccess,
  buildActionPersistenceFields,
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

  const existing = await getActionRecordForCheckIn(client, {
    checkInId: parsed.data.checkInId,
    interpretationId: parsed.data.interpretationId,
  })

  if (existing.ok) {
    return actionSuccess(
      AcceptedActionSchema.parse({
        actionRecordId: existing.data.id,
        actionKey: existing.data.action_key,
        checkInId: parsed.data.checkInId,
        interpretationId: parsed.data.interpretationId,
        actionSource: existing.data.action_source,
        action: actionRecordToBaselineAction(existing.data),
        status: 'accepted',
      })
    )
  }

  const persistence = buildActionPersistenceFields(
    parsed.data.action,
    parsed.data.actionSource
  )

  const result = await createActionRecord(client, {
    checkInId: parsed.data.checkInId,
    interpretationId: parsed.data.interpretationId,
    actionSource: parsed.data.actionSource,
    actionKey: persistence.actionKey,
    actionPayload: persistence.actionPayload,
    actionText: persistence.actionText,
    actionDomain: persistence.actionDomain,
    modifiedFrom: parsed.data.modifiedFrom,
  })

  if (!result.ok) {
    return { ok: false, error: fromDataError(result.error) }
  }

  return actionSuccess(
    AcceptedActionSchema.parse({
      actionRecordId: result.data.id,
      actionKey: persistence.actionKey,
      checkInId: parsed.data.checkInId,
      interpretationId: parsed.data.interpretationId,
      actionSource: parsed.data.actionSource,
      action: persistence.actionPayload,
      status: 'accepted',
    })
  )
}
