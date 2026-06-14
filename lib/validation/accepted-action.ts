import { z } from 'zod'
import { ActionSourceSchema } from './enums'
import { BaselineActionSchema } from './action'

export const AcceptActionInputSchema = z.object({
  checkInId: z.string().uuid(),
  interpretationId: z.string().uuid(),
  actionSource: ActionSourceSchema,
  action: BaselineActionSchema,
  modifiedFrom: z.string().max(500).optional().nullable(),
})

export type AcceptActionInput = z.infer<typeof AcceptActionInputSchema>

export const AcceptedActionSchema = z.object({
  actionRecordId: z.string().uuid(),
  checkInId: z.string().uuid(),
  interpretationId: z.string().uuid(),
  actionSource: ActionSourceSchema,
  action: BaselineActionSchema,
  status: z.literal('accepted'),
})

export type AcceptedAction = z.infer<typeof AcceptedActionSchema>
