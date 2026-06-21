import type { AcceptActionInput } from '@/lib/validation/accepted-action'
import type { BaselineActionDTO } from '@/lib/validation/action'
import type { ActionSourceSchema } from '@/lib/validation/enums'
import type { z } from 'zod'

export type ActionSource = z.infer<typeof ActionSourceSchema>

export function buildAcceptActionInput(
  checkInId: string,
  interpretationId: string,
  actionSource: ActionSource,
  action: BaselineActionDTO
): AcceptActionInput {
  return {
    checkInId,
    interpretationId,
    actionSource,
    action,
    modifiedFrom: null,
  }
}

export function buildCustomActionInput(
  title: string,
  description: string,
  domain: BaselineActionDTO['domain'],
  customId: string
): BaselineActionDTO {
  return {
    id: customId,
    title: title.trim(),
    description: description.trim(),
    estimatedMinutes: null,
    domain,
  }
}
