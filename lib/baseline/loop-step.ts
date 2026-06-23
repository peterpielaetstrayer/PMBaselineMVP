import type { HistoryItem, HistoryItemStatus } from '@/lib/baseline/history-item'
import { BASELINE_ROUTES } from '@/lib/baseline/routes'

export type TodayLoopFocus = 'unfinished' | 'ready'

export interface TodayNextStep {
  focus: TodayLoopFocus
  headline: string
  description: string
  primaryLabel: string
  primaryHref: string
  showQuickCheckIn: boolean
  quickCheckInLabel: string
  ignoreHint: string | null
}

export function isUnfinishedLoopStatus(status: HistoryItemStatus): boolean {
  return status !== 'complete'
}

export function resolveTodayNextStep(
  latestLoop: HistoryItem | null
): TodayNextStep {
  if (!latestLoop) {
    return {
      focus: 'ready',
      headline: 'Where are you right now?',
      description:
        'A quick pulse is enough. PMBaseline will suggest a right-sized next move.',
      primaryLabel: 'Quick check-in',
      primaryHref: BASELINE_ROUTES.checkIn,
      showQuickCheckIn: true,
      quickCheckInLabel: 'Quick check-in',
      ignoreHint: null,
    }
  }

  if (isUnfinishedLoopStatus(latestLoop.status)) {
    return unfinishedStepFromHistoryItem(latestLoop)
  }

  return {
    focus: 'ready',
    headline: 'Ready for your next check-in',
    description:
      'Your last loop is complete. Start a new quick pulse whenever you want a read on today.',
    primaryLabel: 'Quick check-in',
    primaryHref: BASELINE_ROUTES.checkIn,
    showQuickCheckIn: true,
    quickCheckInLabel: 'Quick check-in',
    ignoreHint: 'Nothing else required from your last loop.',
  }
}

function unfinishedStepFromHistoryItem(item: HistoryItem): TodayNextStep {
  switch (item.status) {
    case 'reflection_pending':
      return {
        focus: 'unfinished',
        headline: 'Reflect when ready',
        description:
          item.acceptedActionTitle
            ? `You chose “${item.acceptedActionTitle}.” A short reflection closes the loop — whenever you are ready.`
            : 'A short reflection closes the loop — whenever you are ready.',
        primaryLabel: 'Reflect now',
        primaryHref: item.linkPath,
        showQuickCheckIn: false,
        quickCheckInLabel: 'Quick check-in',
        ignoreHint: 'You can start a new check-in after you finish this loop.',
      }
    case 'check_in_only':
    case 'action_pending':
    default:
      return {
        focus: 'unfinished',
        headline: 'Choose your next move',
        description:
          item.summary ??
          'Your check-in is saved. Pick the right-sized move that fits how you feel right now.',
        primaryLabel: 'Choose your next move',
        primaryHref: item.linkPath,
        showQuickCheckIn: false,
        quickCheckInLabel: 'Quick check-in',
        ignoreHint: 'Finish this loop before starting a new check-in.',
      }
  }
}

export function historyContinueLabel(status: HistoryItemStatus): string {
  switch (status) {
    case 'reflection_pending':
      return 'Reflect'
    case 'action_pending':
    case 'check_in_only':
      return 'Continue'
    case 'complete':
      return 'View'
  }
}

export function historyEffectLabel(effect: string | null): string | null {
  if (!effect) return null
  return effect.replace(/_/g, ' ')
}
