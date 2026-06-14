import type { QuickCheckInInput } from '@/lib/validation/check-in'
import type { InterpretationPayload } from '@/lib/validation/interpretation'
import { StoredInterpretationSchema, type StoredInterpretation } from '@/lib/validation/interpretation'
import { BaselineActionSchema } from '@/lib/validation/action'
import { SafetyResultSchema } from '@/lib/validation/safety'
import { quickCheckInToCheckInRow } from '@/lib/interpretation/safety'
import { interpretationPayloadToRpcParams } from '@/lib/interpretation/mappers'
import { getInterpretationForCheckIn } from './interpretations'
import { requireAuthenticatedUserId, type AuthenticatedSupabaseClient } from './session'
import { dataError, type DataResult } from './types'

export interface SubmitCheckInWithInterpretationInput {
  checkIn: QuickCheckInInput
  interpretation: InterpretationPayload
}

export interface SubmitCheckInRpcResult {
  check_in_id: string
  interpretation_id: string
  idempotent_replay: boolean
}

function mapRpcRowToStoredInterpretation(
  rpc: SubmitCheckInRpcResult,
  interpretation: InterpretationPayload
): StoredInterpretation {
  return StoredInterpretationSchema.parse({
    checkInId: rpc.check_in_id,
    interpretationId: rpc.interpretation_id,
    idempotentReplay: rpc.idempotent_replay,
    proposedMode: interpretation.proposedMode,
    confidence: interpretation.confidence,
    summary: interpretation.summary,
    primaryAction: interpretation.primaryAction,
    alternatives: interpretation.alternatives,
    avoidForNow: interpretation.avoidForNow,
    reflectionPrompt: interpretation.reflectionPrompt,
    safety: interpretation.safety,
    source: interpretation.source,
    engineVersion: interpretation.engineVersion,
    reasonCodes: interpretation.reasonCodes,
    factors: interpretation.factors,
    needsMoreInformation: interpretation.needsMoreInformation,
  })
}

export async function submitCheckInWithInterpretation(
  client: AuthenticatedSupabaseClient,
  input: SubmitCheckInWithInterpretationInput
): Promise<DataResult<StoredInterpretation>> {
  const authResult = await requireAuthenticatedUserId(client)
  if (!authResult.ok) {
    return authResult
  }

  const checkInRow = quickCheckInToCheckInRow(
    input.checkIn,
    input.interpretation.safety.level
  )
  const interpretationParams = interpretationPayloadToRpcParams(input.interpretation)

  const { data, error } = await client.rpc('submit_check_in_with_interpretation', {
    p_submission_id: checkInRow.submission_id,
    p_physical_score: checkInRow.physical_score,
    p_mental_score: checkInRow.mental_score,
    p_energy_score: checkInRow.energy_score,
    p_stress_score: checkInRow.stress_score,
    p_sleep_score: checkInRow.sleep_score,
    p_food_status: checkInRow.food_status,
    p_hydration_status: checkInRow.hydration_status,
    p_movement_status: checkInRow.movement_status,
    p_alcohol_or_substance_context: checkInRow.alcohol_or_substance_context,
    p_context_tags: checkInRow.context_tags,
    p_heavy_or_important_text: checkInRow.heavy_or_important_text,
    p_optional_note: checkInRow.optional_note,
    p_safety_level: checkInRow.safety_level,
    ...interpretationParams,
  })

  if (error) {
    if (error.message.includes('NOT_AUTHENTICATED')) {
      return dataError('NOT_AUTHENTICATED', error.message)
    }
    return dataError('RPC_ERROR', error.message)
  }

  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return dataError('RPC_ERROR', 'Invalid RPC response')
  }

  const rpcResult = data as unknown as SubmitCheckInRpcResult
  if (!rpcResult.check_in_id || !rpcResult.interpretation_id) {
    return dataError('RPC_ERROR', 'RPC response missing identifiers')
  }

  if (rpcResult.idempotent_replay) {
    const stored = await getInterpretationForCheckIn(client, rpcResult.check_in_id)
    if (!stored.ok) {
      return stored
    }

    return {
      ok: true,
      data: rowToStoredInterpretation(
        rpcResult.check_in_id,
        stored.data.id,
        true,
        stored.data
      ),
    }
  }

  return {
    ok: true,
    data: mapRpcRowToStoredInterpretation(rpcResult, input.interpretation),
  }
}

export function rowToStoredInterpretation(
  checkInId: string,
  interpretationId: string,
  idempotentReplay: boolean,
  row: {
    proposed_mode: string
    confidence: number | null
    summary: string
    primary_action: unknown
    alternative_actions: unknown
    avoid_for_now: string[]
    reflection_prompt: string | null
    safety: unknown
    source: string
    engine_version: string | null
    reason_codes: string[]
    factors: string[]
  }
): StoredInterpretation {
  return StoredInterpretationSchema.parse({
    checkInId,
    interpretationId,
    idempotentReplay,
    proposedMode: row.proposed_mode,
    confidence: row.confidence ?? 0,
    summary: row.summary,
    primaryAction: BaselineActionSchema.parse(row.primary_action),
    alternatives: Array.isArray(row.alternative_actions)
      ? row.alternative_actions.map((item) => BaselineActionSchema.parse(item))
      : [],
    avoidForNow: row.avoid_for_now,
    reflectionPrompt: row.reflection_prompt ?? '',
    safety: SafetyResultSchema.parse(row.safety),
    source: row.source,
    engineVersion: row.engine_version ?? 'unknown',
    reasonCodes: row.reason_codes,
    factors: row.factors,
    needsMoreInformation: false,
  })
}
