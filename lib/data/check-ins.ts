import type { Database } from '@/lib/supabase/database.types'
import { requireAuthenticatedUserId, type AuthenticatedSupabaseClient } from './session'
import { dataError, type DataResult } from './types'

export type CheckIn = Database['public']['Tables']['check_ins']['Row']

export async function getCheckInById(
  client: AuthenticatedSupabaseClient,
  checkInId: string
): Promise<DataResult<CheckIn>> {
  const authResult = await requireAuthenticatedUserId(client)
  if (!authResult.ok) {
    return authResult
  }

  const { data, error } = await client
    .from('check_ins')
    .select('*')
    .eq('id', checkInId)
    .eq('user_id', authResult.data)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return dataError('NOT_FOUND', 'Check-in not found')
    }
    return dataError('DATABASE_ERROR', error.message)
  }

  return { ok: true, data }
}
