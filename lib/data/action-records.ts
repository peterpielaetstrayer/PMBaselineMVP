import type { Database } from '@/lib/supabase/database.types'
import type { AcceptActionInput } from '@/lib/validation/accepted-action'
import type { BaselineActionDTO } from '@/lib/validation/action'
import { requireAuthenticatedUserId, type AuthenticatedSupabaseClient } from './session'
import { verifyInterpretationOwnership } from './interpretations'
import { dataError, type DataResult } from './types'

export type ActionRecord = Database['public']['Tables']['action_records']['Row']

const ACCEPTED_ACTION_STATUSES = ['accepted', 'modified', 'completed'] as const

export interface GetActionRecordForCheckInInput {
  checkInId: string
  interpretationId?: string
}

export interface CreateActionRecordInput {
  checkInId: string
  interpretationId: string
  actionSource: AcceptActionInput['actionSource']
  actionKey: string
  actionPayload: BaselineActionDTO
  actionText: string
  actionDomain: AcceptActionInput['action']['domain']
  modifiedFrom?: string | null
}

export async function createActionRecord(
  client: AuthenticatedSupabaseClient,
  input: CreateActionRecordInput
): Promise<DataResult<ActionRecord>> {
  const authResult = await requireAuthenticatedUserId(client)
  if (!authResult.ok) {
    return authResult
  }

  const ownership = await verifyInterpretationOwnership(
    client,
    input.interpretationId,
    input.checkInId
  )
  if (!ownership.ok) {
    return ownership
  }

  const { data, error } = await client
    .from('action_records')
    .insert({
      user_id: authResult.data,
      check_in_id: input.checkInId,
      interpretation_id: input.interpretationId,
      action_key: input.actionKey,
      action_payload: input.actionPayload,
      action_text: input.actionText,
      action_domain: input.actionDomain,
      action_source: input.actionSource,
      status: 'accepted',
      modified_from: input.modifiedFrom ?? null,
    })
    .select('*')
    .single()

  if (error) {
    return dataError('DATABASE_ERROR', error.message)
  }

  return { ok: true, data }
}

export async function getActionRecordForCheckIn(
  client: AuthenticatedSupabaseClient,
  input: GetActionRecordForCheckInInput
): Promise<DataResult<ActionRecord>> {
  const authResult = await requireAuthenticatedUserId(client)
  if (!authResult.ok) {
    return authResult
  }

  let query = client
    .from('action_records')
    .select('*')
    .eq('user_id', authResult.data)
    .eq('check_in_id', input.checkInId)
    .in('status', [...ACCEPTED_ACTION_STATUSES])
    .order('created_at', { ascending: false })
    .limit(1)

  if (input.interpretationId) {
    query = query.eq('interpretation_id', input.interpretationId)
  }

  const { data, error } = await query.maybeSingle()

  if (error) {
    return dataError('DATABASE_ERROR', error.message)
  }

  if (!data) {
    return dataError('NOT_FOUND', 'Action record not found for check-in')
  }

  return { ok: true, data }
}

export async function getActionRecordById(
  client: AuthenticatedSupabaseClient,
  actionRecordId: string
): Promise<DataResult<ActionRecord>> {
  const authResult = await requireAuthenticatedUserId(client)
  if (!authResult.ok) {
    return authResult
  }

  const { data, error } = await client
    .from('action_records')
    .select('*')
    .eq('id', actionRecordId)
    .eq('user_id', authResult.data)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return dataError('NOT_FOUND', 'Action record not found')
    }
    return dataError('DATABASE_ERROR', error.message)
  }

  return { ok: true, data }
}
