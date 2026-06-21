import type { CheckIn } from './check-ins'
import { requireAuthenticatedUserId, type AuthenticatedSupabaseClient } from './session'
import { dataError, type DataResult } from './types'

export const DEFAULT_RECENT_CHECK_INS_LIMIT = 20

export async function getRecentCheckInsForUser(
  client: AuthenticatedSupabaseClient,
  limit = DEFAULT_RECENT_CHECK_INS_LIMIT
): Promise<DataResult<CheckIn[]>> {
  const authResult = await requireAuthenticatedUserId(client)
  if (!authResult.ok) {
    return authResult
  }

  const { data, error } = await client
    .from('check_ins')
    .select('*')
    .eq('user_id', authResult.data)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    return dataError('DATABASE_ERROR', error.message)
  }

  return { ok: true, data: data ?? [] }
}

export async function getInterpretationsForCheckInIds(
  client: AuthenticatedSupabaseClient,
  checkInIds: string[]
): Promise<DataResult<import('./interpretations').Interpretation[]>> {
  const authResult = await requireAuthenticatedUserId(client)
  if (!authResult.ok) {
    return authResult
  }

  if (checkInIds.length === 0) {
    return { ok: true, data: [] }
  }

  const { data, error } = await client
    .from('interpretations')
    .select('*')
    .eq('user_id', authResult.data)
    .in('check_in_id', checkInIds)

  if (error) {
    return dataError('DATABASE_ERROR', error.message)
  }

  return { ok: true, data: data ?? [] }
}

export async function getActionRecordsForCheckInIds(
  client: AuthenticatedSupabaseClient,
  checkInIds: string[]
): Promise<DataResult<import('./action-records').ActionRecord[]>> {
  const authResult = await requireAuthenticatedUserId(client)
  if (!authResult.ok) {
    return authResult
  }

  if (checkInIds.length === 0) {
    return { ok: true, data: [] }
  }

  const { data, error } = await client
    .from('action_records')
    .select('*')
    .eq('user_id', authResult.data)
    .in('check_in_id', checkInIds)
    .in('status', ['accepted', 'modified', 'completed'])
    .order('created_at', { ascending: false })

  if (error) {
    return dataError('DATABASE_ERROR', error.message)
  }

  return { ok: true, data: data ?? [] }
}

export async function getReflectionsForCheckInIds(
  client: AuthenticatedSupabaseClient,
  checkInIds: string[]
): Promise<DataResult<import('./reflections').Reflection[]>> {
  const authResult = await requireAuthenticatedUserId(client)
  if (!authResult.ok) {
    return authResult
  }

  if (checkInIds.length === 0) {
    return { ok: true, data: [] }
  }

  const { data, error } = await client
    .from('reflections')
    .select('*')
    .eq('user_id', authResult.data)
    .in('check_in_id', checkInIds)
    .order('created_at', { ascending: false })

  if (error) {
    return dataError('DATABASE_ERROR', error.message)
  }

  return { ok: true, data: data ?? [] }
}
