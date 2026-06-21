import { describe, expect, it } from 'vitest'
import {
  resolveResultReflectionFollowUp,
  shouldShowReflectCTA,
  shouldShowReflectionSaved,
} from '@/lib/baseline/result-reflection-section'
import { BASELINE_ROUTES } from '@/lib/baseline/routes'

const checkInId = '770e8400-e29b-41d4-a716-446655440002'

describe('resolveResultReflectionFollowUp', () => {
  it('shows reflect CTA when action exists and reflection is missing', () => {
    const followUp = resolveResultReflectionFollowUp({
      hasAcceptedAction: true,
      reflectionComplete: false,
      checkInId,
    })

    expect(followUp).toEqual({
      kind: 'reflect',
      reflectPath: BASELINE_ROUTES.reflect(checkInId),
    })
    expect(shouldShowReflectCTA(followUp)).toBe(true)
    expect(shouldShowReflectionSaved(followUp)).toBe(false)
  })

  it('shows completed state when reflection exists', () => {
    const followUp = resolveResultReflectionFollowUp({
      hasAcceptedAction: true,
      reflectionComplete: true,
      checkInId,
    })

    expect(followUp).toEqual({
      kind: 'complete',
      todayPath: BASELINE_ROUTES.today,
    })
    expect(shouldShowReflectionSaved(followUp)).toBe(true)
    expect(shouldShowReflectCTA(followUp)).toBe(false)
  })

  it('shows none when no accepted action exists', () => {
    const followUp = resolveResultReflectionFollowUp({
      hasAcceptedAction: false,
      reflectionComplete: false,
      checkInId,
    })

    expect(followUp).toEqual({ kind: 'none' })
  })
})
