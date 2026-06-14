import type { ModeInterpretationResult } from '@/lib/baseline/types'
import {
  InterpretationPayloadSchema,
  type InterpretationPayload,
} from '@/lib/validation/interpretation'
import { reflectionPromptForMode } from './prompts'

export function mapEngineResultToInterpretationPayload(
  result: ModeInterpretationResult
): InterpretationPayload {
  const payload: InterpretationPayload = {
    proposedMode: result.proposedMode,
    confidence: result.confidence,
    summary: result.explanation,
    primaryAction: result.primaryAction,
    alternatives: result.alternatives,
    avoidForNow: result.avoidForNow,
    reflectionPrompt: reflectionPromptForMode(result.proposedMode),
    safety: result.safety,
    source: 'fallback',
    engineVersion: result.engineVersion,
    reasonCodes: result.reasonCodes,
    factors: result.factors,
    needsMoreInformation: result.needsMoreInformation,
  }

  return InterpretationPayloadSchema.parse(payload)
}

export function interpretationPayloadToRpcParams(payload: InterpretationPayload) {
  return {
    p_proposed_mode: payload.proposedMode,
    p_confidence: payload.confidence,
    p_summary: payload.summary,
    p_primary_action: payload.primaryAction,
    p_alternative_actions: payload.alternatives,
    p_avoid_for_now: payload.avoidForNow,
    p_reflection_prompt: payload.reflectionPrompt,
    p_safety: payload.safety,
    p_source: payload.source,
    p_engine_version: payload.engineVersion,
    p_reason_codes: payload.reasonCodes,
    p_factors: payload.factors,
  }
}
