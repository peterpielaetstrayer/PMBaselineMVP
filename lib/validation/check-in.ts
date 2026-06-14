import { z } from 'zod'
import {
  ActionDomainSchema,
  BasicNeedStatusSchema,
  ScoreSchema,
  SleepScoreSchema,
} from './enums'

/** Client-submitted safety signals — never a final safety_level. */
export const SafetySignalsSchema = z.object({
  reportsUrgentRisk: z.boolean().optional().default(false),
  reportsNeedForSupport: z.boolean().optional().default(false),
})

export type SafetySignals = z.infer<typeof SafetySignalsSchema>

export const BasicNeedsInputSchema = z.object({
  food: BasicNeedStatusSchema.optional(),
  hydration: BasicNeedStatusSchema.optional(),
  sleep: BasicNeedStatusSchema.optional(),
})

/**
 * Quick check-in payload from the client.
 * Does not include safety_level — derived server-side.
 */
export const QuickCheckInInputSchema = z.object({
  submissionId: z.string().uuid(),
  physical: ScoreSchema,
  mental: ScoreSchema,
  energy: ScoreSchema,
  stress: ScoreSchema,
  sleep: SleepScoreSchema,
  contextTags: z.array(z.string().max(80)).max(12).optional().default([]),
  heavyOrImportantText: z.string().max(2000).optional().nullable(),
  optionalNote: z.string().max(4000).optional().nullable(),
  hasUrgentObligation: z.boolean().optional().default(false),
  basicNeeds: BasicNeedsInputSchema.optional(),
  foodStatus: z.string().max(40).optional().nullable(),
  hydrationStatus: z.string().max(40).optional().nullable(),
  movementStatus: z.string().max(40).optional().nullable(),
  alcoholOrSubstanceContext: z.string().max(2000).optional().nullable(),
  safetySignals: SafetySignalsSchema.optional().default({}),
}).strict()

export type QuickCheckInInput = z.infer<typeof QuickCheckInInputSchema>
