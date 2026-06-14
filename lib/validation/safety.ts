import { z } from 'zod'
import { SafetyLevelSchema } from './enums'

/** Server-derived safety result stored on check_ins and interpretations. */
export const SafetyResultSchema = z.object({
  level: SafetyLevelSchema,
  message: z.string().max(1000).nullable(),
})

export type SafetyResult = z.infer<typeof SafetyResultSchema>
