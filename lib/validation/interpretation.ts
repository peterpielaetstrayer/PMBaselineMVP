import { z } from 'zod'
import {
  ActionSourceSchema,
  BaselineModeSchema,
  InterpretationSourceSchema,
  ReasonCodeSchema,
} from './enums'
import { BaselineActionSchema } from './action'
import { SafetyResultSchema } from './safety'

/** Interpretation payload produced by a provider before persistence. */
export const InterpretationPayloadSchema = z.object({
  proposedMode: BaselineModeSchema,
  confidence: z.number().min(0).max(1),
  summary: z.string().min(1).max(2000),
  primaryAction: BaselineActionSchema,
  alternatives: z.array(BaselineActionSchema).max(3),
  avoidForNow: z.array(z.string().max(160)).max(3),
  reflectionPrompt: z.string().min(1).max(240),
  safety: SafetyResultSchema,
  source: InterpretationSourceSchema,
  engineVersion: z.string().min(1).max(80),
  reasonCodes: z.array(ReasonCodeSchema),
  factors: z.array(z.string().max(500)),
  needsMoreInformation: z.boolean(),
})

export type InterpretationPayload = z.infer<typeof InterpretationPayloadSchema>

/** Persisted interpretation returned to callers after submit. */
export const StoredInterpretationSchema = InterpretationPayloadSchema.extend({
  checkInId: z.string().uuid(),
  interpretationId: z.string().uuid(),
  idempotentReplay: z.boolean(),
})

export type StoredInterpretation = z.infer<typeof StoredInterpretationSchema>
