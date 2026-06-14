import { z } from 'zod'
import { ActionDomainSchema } from './enums'

export const BaselineActionSchema = z.object({
  id: z.string().min(1).max(120),
  title: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  estimatedMinutes: z.number().int().min(1).max(180).nullable(),
  domain: ActionDomainSchema,
})

export type BaselineActionDTO = z.infer<typeof BaselineActionSchema>
