import { randomUUID } from 'crypto'
import { BaselineActionSchema, type BaselineActionDTO } from './action'
import type { ActionSourceSchema } from './enums'
import type { z } from 'zod'

export type ActionSource = z.infer<typeof ActionSourceSchema>

export interface ActionPersistenceFields {
  actionKey: string
  actionPayload: BaselineActionDTO
  actionText: string
  actionDomain: BaselineActionDTO['domain']
}

/**
 * Resolve stable action_key and canonical JSON payload for persistence.
 * Custom (user) actions receive a generated custom-* id when none is supplied.
 */
export function buildActionPersistenceFields(
  action: BaselineActionDTO,
  actionSource: ActionSource
): ActionPersistenceFields {
  const validated = BaselineActionSchema.parse(action)

  const actionKey =
    actionSource === 'user' && !validated.id.startsWith('custom-')
      ? `custom-${randomUUID()}`
      : validated.id

  const actionPayload = BaselineActionSchema.parse({
    ...validated,
    id: actionKey,
  })

  return {
    actionKey,
    actionPayload,
    actionText: `${actionPayload.title}: ${actionPayload.description}`,
    actionDomain: actionPayload.domain,
  }
}
