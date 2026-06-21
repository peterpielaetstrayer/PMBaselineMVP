import { describe, expect, it } from 'vitest'
import type { ActionRecord } from '@/lib/data/action-records'
import type { CheckIn } from '@/lib/data/check-ins'
import type { Interpretation } from '@/lib/data/interpretations'
import type { Reflection } from '@/lib/data/reflections'
import {
  composeHistoryItems,
  resolveHistoryItemLink,
  resolveHistoryItemStatus,
} from '@/lib/baseline/history-item'
import { BASELINE_ROUTES } from '@/lib/baseline/routes'

const checkInId = '770e8400-e29b-41d4-a716-446655440002'
const interpretationId = '880e8400-e29b-41d4-a716-446655440003'
const actionId = '990e8400-e29b-41d4-a716-446655440004'
const reflectionId = 'aa0e8400-e29b-41d4-a716-446655440005'

const baseCheckIn = {
  id: checkInId,
  created_at: '2026-06-14T12:00:00.000Z',
} as CheckIn

const baseInterpretation = {
  id: interpretationId,
  user_id: 'user-123',
  check_in_id: checkInId,
  proposed_mode: 'rebuild',
  confidence: 0.55,
  summary: 'Stored summary from database.',
  primary_action: {},
  alternative_actions: [],
  avoid_for_now: [],
  reflection_prompt: 'What felt manageable today?',
  safety: { level: 'standard', message: null },
  source: 'fallback',
  engine_version: 'baseline-engine-v0.1',
  reason_codes: [],
  factors: [],
  created_at: '2026-06-14T12:00:01.000Z',
} as unknown as Interpretation

const baseAction = {
  id: actionId,
  user_id: 'user-123',
  check_in_id: checkInId,
  interpretation_id: interpretationId,
  action_key: 'rebuild-anchor',
  action_payload: { title: 'One small anchor' },
  action_text: 'One small anchor: Do the smallest version.',
  action_domain: 'recovery',
  action_source: 'primary',
  status: 'accepted',
  created_at: '2026-06-14T12:05:00.000Z',
} as unknown as ActionRecord

const baseReflection = {
  id: reflectionId,
  user_id: 'user-123',
  check_in_id: checkInId,
  action_record_id: actionId,
  effect: 'helped',
  what_changed: null,
  what_was_protected: null,
  lesson: null,
  final_baseline_score: 7,
  created_at: '2026-06-14T13:00:00.000Z',
} as Reflection

describe('resolveHistoryItemStatus', () => {
  it('marks complete loop when reflection exists', () => {
    expect(
      resolveHistoryItemStatus({
        hasInterpretation: true,
        hasAction: true,
        hasReflection: true,
      })
    ).toBe('complete')
  })

  it('marks reflection pending when action exists without reflection', () => {
    expect(
      resolveHistoryItemStatus({
        hasInterpretation: true,
        hasAction: true,
        hasReflection: false,
      })
    ).toBe('reflection_pending')
  })

  it('marks action pending when interpretation exists without action', () => {
    expect(
      resolveHistoryItemStatus({
        hasInterpretation: true,
        hasAction: false,
        hasReflection: false,
      })
    ).toBe('action_pending')
  })

  it('marks check-in only when interpretation is missing', () => {
    expect(
      resolveHistoryItemStatus({
        hasInterpretation: false,
        hasAction: false,
        hasReflection: false,
      })
    ).toBe('check_in_only')
  })
})

describe('composeHistoryItems', () => {
  it('composes a complete loop', () => {
    const [item] = composeHistoryItems({
      checkIns: [baseCheckIn],
      interpretations: [baseInterpretation],
      actionRecords: [baseAction],
      reflections: [baseReflection],
    })

    expect(item.status).toBe('complete')
    expect(item.proposedMode).toBe('rebuild')
    expect(item.summary).toBe('Stored summary from database.')
    expect(item.acceptedActionTitle).toBe('One small anchor')
    expect(item.reflectionEffect).toBe('helped')
    expect(item.finalBaselineScore).toBe(7)
    expect(item.linkPath).toBe(BASELINE_ROUTES.result(checkInId))
  })

  it('composes check-in only state', () => {
    const [item] = composeHistoryItems({
      checkIns: [baseCheckIn],
      interpretations: [],
      actionRecords: [],
      reflections: [],
    })

    expect(item.status).toBe('check_in_only')
    expect(item.proposedMode).toBeNull()
    expect(item.acceptedActionTitle).toBeNull()
    expect(item.linkPath).toBe(BASELINE_ROUTES.result(checkInId))
  })

  it('composes action accepted without reflection', () => {
    const [item] = composeHistoryItems({
      checkIns: [baseCheckIn],
      interpretations: [baseInterpretation],
      actionRecords: [baseAction],
      reflections: [],
    })

    expect(item.status).toBe('reflection_pending')
    expect(item.reflectionEffect).toBeNull()
    expect(item.linkPath).toBe(BASELINE_ROUTES.reflect(checkInId))
  })

  it('returns empty list for no check-ins', () => {
    expect(
      composeHistoryItems({
        checkIns: [],
        interpretations: [],
        actionRecords: [],
        reflections: [],
      })
    ).toEqual([])
  })
})

describe('resolveHistoryItemLink', () => {
  it('links reflection pending items to reflect route', () => {
    expect(resolveHistoryItemLink(checkInId, 'reflection_pending')).toBe(
      BASELINE_ROUTES.reflect(checkInId)
    )
  })
})
