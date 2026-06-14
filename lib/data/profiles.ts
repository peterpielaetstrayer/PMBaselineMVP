import type { Database } from '@/lib/supabase/database.types'
import { requireAuthenticatedUserId, type AuthenticatedSupabaseClient } from './session'
import { dataError, type DataResult } from './types'

export type Profile = Database['public']['Tables']['profiles']['Row']

export type ProfileUpdateInput = Pick<
  Database['public']['Tables']['profiles']['Update'],
  'display_name' | 'timezone' | 'onboarding_status' | 'coaching_tone' | 'memory_consent'
>

function pickProfileUpdates(input: ProfileUpdateInput): ProfileUpdateInput {
  const updates: ProfileUpdateInput = {}

  if (input.display_name !== undefined) updates.display_name = input.display_name
  if (input.timezone !== undefined) updates.timezone = input.timezone
  if (input.onboarding_status !== undefined) updates.onboarding_status = input.onboarding_status
  if (input.coaching_tone !== undefined) updates.coaching_tone = input.coaching_tone
  if (input.memory_consent !== undefined) updates.memory_consent = input.memory_consent

  return updates
}

export async function getProfile(
  client: AuthenticatedSupabaseClient
): Promise<DataResult<Profile>> {
  const authResult = await requireAuthenticatedUserId(client)
  if (!authResult.ok) {
    return authResult
  }

  const { data, error } = await client
    .from('profiles')
    .select('*')
    .eq('id', authResult.data)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return dataError('NOT_FOUND', 'Profile not found')
    }
    return dataError('DATABASE_ERROR', error.message)
  }

  return { ok: true, data }
}

export async function updateProfile(
  client: AuthenticatedSupabaseClient,
  input: ProfileUpdateInput
): Promise<DataResult<Profile>> {
  const authResult = await requireAuthenticatedUserId(client)
  if (!authResult.ok) {
    return authResult
  }

  const updates = pickProfileUpdates(input)
  if (Object.keys(updates).length === 0) {
    return dataError('VALIDATION_ERROR', 'No allowed profile fields provided')
  }

  const { data, error } = await client
    .from('profiles')
    .update(updates)
    .eq('id', authResult.data)
    .select('*')
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return dataError('NOT_FOUND', 'Profile not found')
    }
    return dataError('DATABASE_ERROR', error.message)
  }

  return { ok: true, data }
}
