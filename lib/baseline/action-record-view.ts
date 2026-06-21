import { BaselineActionSchema, type BaselineActionDTO } from '@/lib/validation/action'
import type { ActionRecord } from '@/lib/data/action-records'

const ACCEPTED_ACTION_STATUSES = ['accepted', 'modified', 'completed'] as const

export function actionRecordToBaselineAction(record: ActionRecord): BaselineActionDTO {
  return BaselineActionSchema.parse(record.action_payload)
}

export function isAcceptedActionStatus(status: string): boolean {
  return ACCEPTED_ACTION_STATUSES.includes(
    status as (typeof ACCEPTED_ACTION_STATUSES)[number]
  )
}
