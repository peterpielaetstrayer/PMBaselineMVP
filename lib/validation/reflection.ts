import { z } from 'zod'
import { ReflectionEffectSchema, ScoreSchema } from './enums'

export const ReflectionInputSchema = z.object({
  checkInId: z.string().uuid(),
  actionRecordId: z.string().uuid().optional().nullable(),
  effect: ReflectionEffectSchema,
  whatChanged: z.string().max(2000).optional().nullable(),
  whatWasProtected: z.string().max(2000).optional().nullable(),
  lesson: z.string().max(2000).optional().nullable(),
  finalBaselineScore: ScoreSchema.optional().nullable(),
})

export type ReflectionInput = z.infer<typeof ReflectionInputSchema>

export const StoredReflectionSchema = ReflectionInputSchema.extend({
  reflectionId: z.string().uuid(),
})

export type StoredReflection = z.infer<typeof StoredReflectionSchema>
