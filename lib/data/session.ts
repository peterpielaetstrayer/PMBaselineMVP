import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/database.types'
import { dataError, type DataResult } from './types'

export type AuthenticatedSupabaseClient = SupabaseClient<Database>

export async function requireAuthenticatedUserId(
  client: AuthenticatedSupabaseClient
): Promise<DataResult<string>> {
  const {
    data: { user },
    error,
  } = await client.auth.getUser()

  if (error) {
    return dataError('AUTH_ERROR', error.message)
  }

  if (!user) {
    return dataError('NOT_AUTHENTICATED', 'No authenticated session')
  }

  return { ok: true, data: user.id }
}
