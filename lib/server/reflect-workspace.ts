import { actionRecordToBaselineAction } from '@/lib/baseline/action-record-view'
import { reflectionRowToStored } from '@/lib/baseline/reflection-form'
import { getActionRecordForCheckIn } from '@/lib/data/action-records'
import { getCheckInById } from '@/lib/data/check-ins'
import { getInterpretationForCheckIn } from '@/lib/data/interpretations'
import { getReflectionForCheckIn } from '@/lib/data/reflections'
import { rowToStoredInterpretation } from '@/lib/data/submit-check-in'
import type { AuthenticatedSupabaseClient } from '@/lib/data/session'
import type { BaselineActionDTO } from '@/lib/validation/action'
import type { StoredInterpretation } from '@/lib/validation/interpretation'
import type { StoredReflection } from '@/lib/validation/reflection'
import { createClient } from '@/lib/supabase/server'

export interface ReflectWorkspaceView {
  checkInId: string
  interpretation: StoredInterpretation
  acceptedAction: BaselineActionDTO
  actionRecordId: string
  reflection: StoredReflection | null
}

export async function loadReflectWorkspaceWithClient(
  client: AuthenticatedSupabaseClient,
  checkInId: string
): Promise<ReflectWorkspaceView | null> {
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

  if (!actionRecordResult.ok) {
    return null
  }

  const reflectionResult = await getReflectionForCheckIn(client, checkInId)
  const reflection = reflectionResult.ok
    ? reflectionRowToStored(reflectionResult.data)
    : null

  return {
    checkInId,
    interpretation,
    acceptedAction: actionRecordToBaselineAction(actionRecordResult.data),
    actionRecordId: actionRecordResult.data.id,
    reflection,
  }
}

export async function loadReflectWorkspace(
  checkInId: string
): Promise<ReflectWorkspaceView | null> {
  const supabase = await createClient()
  return loadReflectWorkspaceWithClient(supabase, checkInId)
}
