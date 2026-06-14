import type { Database } from '@/lib/supabase/database.types'
import { requireAuthenticatedUserId, type AuthenticatedSupabaseClient } from './session'
import { dataError, type DataResult } from './types'

export type Interpretation = Database['public']['Tables']['interpretations']['Row']

export async function getInterpretationById(
  client: AuthenticatedSupabaseClient,
  interpretationId: string
): Promise<DataResult<Interpretation>> {
  const authResult = await requireAuthenticatedUserId(client)
  if (!authResult.ok) {
    return authResult
  }

  const { data, error } = await client
    .from('interpretations')
    .select('*')
    .eq('id', interpretationId)
    .eq('user_id', authResult.data)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return dataError('NOT_FOUND', 'Interpretation not found')
    }
    return dataError('DATABASE_ERROR', error.message)
  }

  return { ok: true, data }
}

export async function getInterpretationForCheckIn(
  client: AuthenticatedSupabaseClient,
  checkInId: string
): Promise<DataResult<Interpretation>> {
  const authResult = await requireAuthenticatedUserId(client)
  if (!authResult.ok) {
    return authResult
  }

  const { data, error } = await client
    .from('interpretations')
    .select('*')
    .eq('check_in_id', checkInId)
    .eq('user_id', authResult.data)
    .single()

  if (error) {
    return dataError('DATABASE_ERROR', error.message)
  }

  if (!data) {
    return dataError('NOT_FOUND', 'Interpretation not found for check-in')
  }

  return { ok: true, data }
}

export async function verifyInterpretationOwnership(
  client: AuthenticatedSupabaseClient,
  interpretationId: string,
  checkInId: string
): Promise<DataResult<Interpretation>> {
  const authResult = await requireAuthenticatedUserId(client)
  if (!authResult.ok) {
    return authResult
  }

  const { data, error } = await client
    .from('interpretations')
    .select('*')
    .eq('id', interpretationId)
    .eq('check_in_id', checkInId)
    .eq('user_id', authResult.data)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return dataError('NOT_FOUND', 'Interpretation not found for check-in')
    }
    return dataError('DATABASE_ERROR', error.message)
  }

  return { ok: true, data }
}
