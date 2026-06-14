import type { Database } from '@/lib/supabase/database.types'
import { requireAuthenticatedUserId, type AuthenticatedSupabaseClient } from './session'
import { dataError, type DataResult } from './types'

export type BaselineProfile = Database['public']['Tables']['baseline_profiles']['Row']

export type BaselineProfileUpdateInput = Pick<
  Database['public']['Tables']['baseline_profiles']['Update'],
  | 'known_stabilizers'
  | 'known_destabilizers'
  | 'current_priorities'
  | 'constraints'
  | 'preferred_minimum_actions'
  | 'user_defined_baseline'
>

function pickBaselineProfileUpdates(
  input: BaselineProfileUpdateInput
): BaselineProfileUpdateInput {
  const updates: BaselineProfileUpdateInput = {}

  if (input.known_stabilizers !== undefined) {
    updates.known_stabilizers = input.known_stabilizers
  }
  if (input.known_destabilizers !== undefined) {
    updates.known_destabilizers = input.known_destabilizers
  }
  if (input.current_priorities !== undefined) {
    updates.current_priorities = input.current_priorities
  }
  if (input.constraints !== undefined) updates.constraints = input.constraints
  if (input.preferred_minimum_actions !== undefined) {
    updates.preferred_minimum_actions = input.preferred_minimum_actions
  }
  if (input.user_defined_baseline !== undefined) {
    updates.user_defined_baseline = input.user_defined_baseline
  }

  return updates
}

export async function getBaselineProfile(
  client: AuthenticatedSupabaseClient
): Promise<DataResult<BaselineProfile>> {
  const authResult = await requireAuthenticatedUserId(client)
  if (!authResult.ok) {
    return authResult
  }

  const { data, error } = await client
    .from('baseline_profiles')
    .select('*')
    .eq('user_id', authResult.data)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return dataError('NOT_FOUND', 'Baseline profile not found')
    }
    return dataError('DATABASE_ERROR', error.message)
  }

  return { ok: true, data }
}

export async function updateBaselineProfile(
  client: AuthenticatedSupabaseClient,
  input: BaselineProfileUpdateInput
): Promise<DataResult<BaselineProfile>> {
  const authResult = await requireAuthenticatedUserId(client)
  if (!authResult.ok) {
    return authResult
  }

  const updates = pickBaselineProfileUpdates(input)
  if (Object.keys(updates).length === 0) {
    return dataError('VALIDATION_ERROR', 'No allowed baseline profile fields provided')
  }

  const { data, error } = await client
    .from('baseline_profiles')
    .update(updates)
    .eq('user_id', authResult.data)
    .select('*')
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return dataError('NOT_FOUND', 'Baseline profile not found')
    }
    return dataError('DATABASE_ERROR', error.message)
  }

  return { ok: true, data }
}
