import { describe, expect, it } from 'vitest'
import {
  resolveResultActionSectionView,
  shouldRenderActionChoiceList,
} from '@/lib/baseline/result-action-section'

const acceptedAction = {
  id: 'maintain-one-anchor',
  title: 'Keep one anchor',
  description: 'Complete one familiar routine.',
  estimatedMinutes: 20,
  domain: 'recovery' as const,
}

describe('resolveResultActionSectionView', () => {
  it('shows accepted state when an action record exists', () => {
    const view = resolveResultActionSectionView(acceptedAction)

    expect(view.kind).toBe('accepted')
    if (view.kind === 'accepted') {
      expect(view.action).toEqual(acceptedAction)
    }
  })

  it('shows choice list when no accepted action exists', () => {
    expect(resolveResultActionSectionView(null)).toEqual({ kind: 'choice' })
    expect(resolveResultActionSectionView(undefined)).toEqual({ kind: 'choice' })
  })

  it('does not render active accept buttons when accepted action exists', () => {
    expect(shouldRenderActionChoiceList(acceptedAction)).toBe(false)
    expect(shouldRenderActionChoiceList(null)).toBe(true)
  })
})
