import { describe, expect, it } from 'vitest'
import type { HistoryItem } from '@/lib/baseline/history-item'
import { BASELINE_ROUTES } from '@/lib/baseline/routes'
import {
  historyContinueLabel,
  historyEffectLabel,
  isUnfinishedLoopStatus,
  resolveTodayNextStep,
} from '@/lib/baseline/loop-step'

const checkInId = '770e8400-e29b-41d4-a716-446655440002'

function makeItem(
  overrides: Partial<HistoryItem> & Pick<HistoryItem, 'status'>
): HistoryItem {
  return {
    checkInId,
    createdAt: '2026-06-14T12:00:00.000Z',
    proposedMode: 'rebuild',
    summary: 'Gentle structure may help today.',
    acceptedActionTitle: null,
    reflectionEffect: null,
    finalBaselineScore: null,
    linkPath: BASELINE_ROUTES.result(checkInId),
    ...overrides,
  }
}

describe('resolveTodayNextStep', () => {
  it('prompts quick check-in when there is no history', () => {
    const step = resolveTodayNextStep(null)

    expect(step.focus).toBe('ready')
    expect(step.headline).toBe('Where are you right now?')
    expect(step.primaryHref).toBe(BASELINE_ROUTES.checkIn)
    expect(step.showQuickCheckIn).toBe(true)
  })

  it('surfaces unfinished action step before new check-in', () => {
    const step = resolveTodayNextStep(
      makeItem({
        status: 'action_pending',
        linkPath: BASELINE_ROUTES.result(checkInId),
      })
    )

    expect(step.focus).toBe('unfinished')
    expect(step.headline).toBe('Choose your next move')
    expect(step.primaryHref).toBe(BASELINE_ROUTES.result(checkInId))
    expect(step.showQuickCheckIn).toBe(false)
  })

  it('surfaces reflection when action accepted but not reflected', () => {
    const reflectPath = BASELINE_ROUTES.reflect(checkInId)
    const step = resolveTodayNextStep(
      makeItem({
        status: 'reflection_pending',
        acceptedActionTitle: 'One small anchor',
        linkPath: reflectPath,
      })
    )

    expect(step.focus).toBe('unfinished')
    expect(step.headline).toBe('Reflect when ready')
    expect(step.primaryLabel).toBe('Reflect now')
    expect(step.primaryHref).toBe(reflectPath)
    expect(step.description).toContain('One small anchor')
  })

  it('invites new check-in when last loop is complete', () => {
    const step = resolveTodayNextStep(
      makeItem({
        status: 'complete',
        acceptedActionTitle: 'Walk',
        reflectionEffect: 'helped',
      })
    )

    expect(step.focus).toBe('ready')
    expect(step.headline).toBe('Ready for your next check-in')
    expect(step.showQuickCheckIn).toBe(true)
    expect(step.ignoreHint).toContain('Nothing else required')
  })
})

describe('loop step helpers', () => {
  it('identifies unfinished statuses', () => {
    expect(isUnfinishedLoopStatus('action_pending')).toBe(true)
    expect(isUnfinishedLoopStatus('reflection_pending')).toBe(true)
    expect(isUnfinishedLoopStatus('complete')).toBe(false)
  })

  it('formats history continue labels', () => {
    expect(historyContinueLabel('reflection_pending')).toBe('Reflect')
    expect(historyContinueLabel('action_pending')).toBe('Continue')
    expect(historyContinueLabel('complete')).toBe('View')
  })

  it('formats reflection effect for display', () => {
    expect(historyEffectLabel('helped')).toBe('helped')
    expect(historyEffectLabel(null)).toBeNull()
  })
})
