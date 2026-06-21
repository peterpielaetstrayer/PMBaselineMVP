import type { CheckIn } from '@/lib/data/check-ins'
import type { ActionRecord } from '@/lib/data/action-records'
import type { Interpretation } from '@/lib/data/interpretations'
import type { Reflection } from '@/lib/data/reflections'
import type { BaselineMode } from '@/lib/baseline/types'
import { BASELINE_ROUTES } from '@/lib/baseline/routes'

export const DEFAULT_HISTORY_LIMIT = 20

export type HistoryItemStatus =
  | 'check_in_only'
  | 'action_pending'
  | 'reflection_pending'
  | 'complete'

export interface HistoryItem {
  checkInId: string
  createdAt: string
  proposedMode: BaselineMode | null
  summary: string | null
  acceptedActionTitle: string | null
  reflectionEffect: string | null
  finalBaselineScore: number | null
  status: HistoryItemStatus
  linkPath: string
}

export function resolveHistoryItemStatus(input: {
  hasInterpretation: boolean
  hasAction: boolean
  hasReflection: boolean
}): HistoryItemStatus {
  if (!input.hasInterpretation) {
    return 'check_in_only'
  }

  if (!input.hasAction) {
    return 'action_pending'
  }

  if (!input.hasReflection) {
    return 'reflection_pending'
  }

  return 'complete'
}

export function resolveHistoryItemLink(
  checkInId: string,
  status: HistoryItemStatus
): string {
  switch (status) {
    case 'reflection_pending':
      return BASELINE_ROUTES.reflect(checkInId)
    case 'check_in_only':
    case 'action_pending':
    case 'complete':
    default:
      return BASELINE_ROUTES.result(checkInId)
  }
}

export function historyItemStatusLabel(status: HistoryItemStatus): string {
  switch (status) {
    case 'check_in_only':
      return 'Check-in saved'
    case 'action_pending':
      return 'Choose your next move'
    case 'reflection_pending':
      return 'Reflect on your action'
    case 'complete':
      return 'Loop complete'
  }
}

export function formatHistoryItemDate(isoDate: string): string {
  const date = new Date(isoDate)
  return date.toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function pickLatestByCheckInId<T extends { check_in_id: string | null; created_at: string }>(
  rows: T[]
): Map<string, T> {
  const map = new Map<string, T>()

  for (const row of rows) {
    if (!row.check_in_id) continue

    const existing = map.get(row.check_in_id)
    if (!existing || row.created_at > existing.created_at) {
      map.set(row.check_in_id, row)
    }
  }

  return map
}

function actionTitleFromRecord(record: ActionRecord): string {
  const payload = record.action_payload as { title?: string } | null
  if (payload?.title) {
    return payload.title
  }

  const split = record.action_text.indexOf(': ')
  if (split > 0) {
    return record.action_text.slice(0, split)
  }

  return record.action_text
}

export function composeHistoryItems(input: {
  checkIns: CheckIn[]
  interpretations: Interpretation[]
  actionRecords: ActionRecord[]
  reflections: Reflection[]
}): HistoryItem[] {
  const interpretationsByCheckIn = new Map(
    input.interpretations.map((row) => [row.check_in_id, row])
  )
  const actionsByCheckIn = pickLatestByCheckInId(input.actionRecords)
  const reflectionsByCheckIn = pickLatestByCheckInId(input.reflections)

  return input.checkIns.map((checkIn) => {
    const interpretation = interpretationsByCheckIn.get(checkIn.id)
    const action = actionsByCheckIn.get(checkIn.id)
    const reflection = reflectionsByCheckIn.get(checkIn.id)

    const status = resolveHistoryItemStatus({
      hasInterpretation: Boolean(interpretation),
      hasAction: Boolean(action),
      hasReflection: Boolean(reflection),
    })

    return {
      checkInId: checkIn.id,
      createdAt: checkIn.created_at,
      proposedMode: (interpretation?.proposed_mode as BaselineMode | undefined) ?? null,
      summary: interpretation?.summary ?? null,
      acceptedActionTitle: action ? actionTitleFromRecord(action) : null,
      reflectionEffect: reflection?.effect ?? null,
      finalBaselineScore: reflection?.final_baseline_score ?? null,
      status,
      linkPath: resolveHistoryItemLink(checkIn.id, status),
    }
  })
}
