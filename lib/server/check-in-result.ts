import { actionRecordToBaselineAction } from '@/lib/baseline/action-record-view'
import { getActionRecordForCheckIn } from '@/lib/data/action-records'
import { getCheckInById } from '@/lib/data/check-ins'
import { getInterpretationForCheckIn } from '@/lib/data/interpretations'
import { rowToStoredInterpretation } from '@/lib/data/submit-check-in'
import type { AuthenticatedSupabaseClient } from '@/lib/data/session'
import type { BaselineActionDTO } from '@/lib/validation/action'
import type { StoredInterpretation } from '@/lib/validation/interpretation'
import { createClient } from '@/lib/supabase/server'

export interface CheckInResultView {
  interpretation: StoredInterpretation
  acceptedAction: BaselineActionDTO | null
}

export async function loadStoredCheckInResultWithClient(
  client: AuthenticatedSupabaseClient,
  checkInId: string
): Promise<CheckInResultView | null> {
  const checkInResult = await getCheckInById(client, checkInId)

  if (!checkInResult.ok) {
    return null
  }

  const interpretationResult = await getInterpretationForCheckIn(client, checkInId)

  if (!interpretationResult.ok) {
    return null
  }

  const interpretation = rowToStoredInterpretation(
    checkInId,
    interpretationResult.data.id,
    false,
    interpretationResult.data
  )

  const actionRecordResult = await getActionRecordForCheckIn(client, {
    checkInId,
    interpretationId: interpretation.interpretationId,
  })

  const acceptedAction =
    actionRecordResult.ok
      ? actionRecordToBaselineAction(actionRecordResult.data)
      : null

  return {
    interpretation,
    acceptedAction,
  }
}

export async function loadStoredCheckInResult(
  checkInId: string
): Promise<CheckInResultView | null> {
  const supabase = await createClient()
  return loadStoredCheckInResultWithClient(supabase, checkInId)
}
