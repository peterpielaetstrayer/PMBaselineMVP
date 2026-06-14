import type { Database } from '@/lib/supabase/database.types'
import type { ReflectionInput } from '@/lib/validation/reflection'
import { getCheckInById } from './check-ins'
import { getActionRecordById } from './action-records'
import { requireAuthenticatedUserId, type AuthenticatedSupabaseClient } from './session'
import { dataError, type DataResult } from './types'

export type Reflection = Database['public']['Tables']['reflections']['Row']

export async function createReflection(
  client: AuthenticatedSupabaseClient,
  input: ReflectionInput
): Promise<DataResult<Reflection>> {
  const authResult = await requireAuthenticatedUserId(client)
  if (!authResult.ok) {
    return authResult
  }

  const checkInResult = await getCheckInById(client, input.checkInId)
  if (!checkInResult.ok) {
    return checkInResult
  }

  if (input.actionRecordId) {
    const actionResult = await getActionRecordById(client, input.actionRecordId)
    if (!actionResult.ok) {
      return actionResult
    }
    if (actionResult.data.check_in_id && actionResult.data.check_in_id !== input.checkInId) {
      return dataError('FORBIDDEN', 'Action record does not belong to this check-in')
    }
  }

  const { data, error } = await client
    .from('reflections')
    .insert({
      user_id: authResult.data,
      check_in_id: input.checkInId,
      action_record_id: input.actionRecordId ?? null,
      effect: input.effect,
      what_changed: input.whatChanged ?? null,
      what_was_protected: input.whatWasProtected ?? null,
      lesson: input.lesson ?? null,
      final_baseline_score: input.finalBaselineScore ?? null,
    })
    .select('*')
    .single()

  if (error) {
    return dataError('DATABASE_ERROR', error.message)
  }

  return { ok: true, data }
}
