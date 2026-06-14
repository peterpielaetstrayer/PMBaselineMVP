import { describe, expect, it } from 'vitest'
import { canShrinkAction, shrinkAction } from '@/lib/baseline/action-shrinker'
import type { BaselineAction } from '@/lib/baseline/types'

describe('shrinkAction', () => {
  const sample: BaselineAction = {
    id: 'rebuild-walk-stretch',
    title: 'Short walk or stretch',
    description: 'Five to ten minutes of gentle movement to reconnect body and mind.',
    estimatedMinutes: 10,
    domain: 'movement',
  }

  it('reduces estimated minutes while preserving domain', () => {
    const shrunk = shrinkAction(sample)
    expect(shrunk.domain).toBe('movement')
    expect(shrunk.estimatedMinutes).toBeLessThan(sample.estimatedMinutes!)
    expect(shrunk.estimatedMinutes).toBeGreaterThanOrEqual(2)
  })

  it('prefixes title and adds smallest-version language', () => {
    const shrunk = shrinkAction(sample)
    expect(shrunk.title).toMatch(/^Minimum:/)
    expect(shrunk.description.toLowerCase()).toContain('smallest version')
  })

  it('does not shrink safety actions', () => {
    const safety: BaselineAction = {
      id: 'urgent-seek-support',
      title: 'Seek immediate human support',
      description: 'Contact emergency services if you may be in danger.',
      estimatedMinutes: null,
      domain: 'safety',
    }
    expect(canShrinkAction(safety)).toBe(false)
  })
})
