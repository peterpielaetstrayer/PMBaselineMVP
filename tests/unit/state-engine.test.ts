import { describe, expect, it } from 'vitest'
import { BASELINE_ENGINE_VERSION } from '@/lib/baseline/modes'
import {
  canExpand,
  classifyMode,
  interpretCheckIn,
  isContradictory,
} from '@/lib/baseline/state-engine'
import type { CheckInInput, ReasonCode } from '@/lib/baseline/types'
function baseInput(overrides: Partial<CheckInInput> = {}): CheckInInput {
  return {
    physical: 6,
    mental: 6,
    energy: 6,
    stress: 4,
    sleep: 7,
    contextTags: [],
    hasUrgentObligation: false,
    basicNeeds: {
      food: 'met',
      hydration: 'met',
      sleep: 'met',
    },
    safetyLevel: 'standard',
    ...overrides,
  }
}

describe('classifyMode', () => {
  it('classifies high stress and low energy as stabilize', () => {
    const result = classifyMode(
      baseInput({ stress: 8, energy: 3, physical: 4, mental: 4 })
    )
    expect(result.mode).toBe('stabilize')
    expect(result.factors.join(' ')).toMatch(/stress|energy/i)
  })

  it('classifies moderate distress as rebuild', () => {
    const result = classifyMode(
      baseInput({ stress: 6, energy: 5, physical: 5, mental: 5, sleep: 4 })
    )
    expect(result.mode).toBe('rebuild')
  })

  it('classifies stable moderate capacity as maintain', () => {
    const result = classifyMode(
      baseInput({ stress: 3, energy: 6, physical: 6, mental: 6, sleep: 7 })
    )
    expect(result.mode).toBe('maintain')
  })

  it('classifies strong balanced capacity as expand', () => {
    const result = classifyMode(
      baseInput({ stress: 2, energy: 8, physical: 8, mental: 8, sleep: 8 })
    )
    expect(result.mode).toBe('expand')
  })
})

describe('missing data', () => {
  it('reduces confidence and flags more information needed', () => {
    const result = classifyMode(
      baseInput({ physical: null, mental: null, energy: 5, stress: 5, sleep: null })
    )
    expect(result.confidence).toBeLessThan(0.75)
    expect(result.needsMoreInformation).toBe(true)
  })
})

describe('contradictory data', () => {
  it('detects contradictory high energy and high stress', () => {
    expect(isContradictory(baseInput({ energy: 9, stress: 9 }))).toBe(true)
  })

  it('lowers confidence when signals conflict', () => {
    const stable = classifyMode(baseInput({ energy: 6, stress: 4, physical: 6, mental: 6 }))
    const conflicting = classifyMode(
      baseInput({ energy: 6, stress: 5, physical: 8, mental: 3 })
    )
    expect(conflicting.confidence).toBeLessThan(stable.confidence)
    expect(isContradictory(baseInput({ energy: 6, stress: 5, physical: 8, mental: 3 }))).toBe(
      true
    )
  })
})

describe('poor sleep prevents expand', () => {
  it('blocks expand when sleep score is very poor', () => {
    const result = classifyMode(
      baseInput({ sleep: 2, energy: 8, stress: 2, physical: 8, mental: 8 })
    )
    expect(result.mode).not.toBe('expand')
    expect(result.factors.join(' ')).toMatch(/sleep/i)
  })
})

describe('unmet basic needs', () => {
  it('prioritizes stabilize when food is unmet', () => {
    const result = classifyMode(
      baseInput({
        basicNeeds: { food: 'unmet', hydration: 'met', sleep: 'met' },
        energy: 7,
        stress: 3,
      })
    )
    expect(result.mode).toBe('stabilize')
    expect(result.factors.join(' ')).toMatch(/basic needs/i)
  })
})

describe('urgent safety handling', () => {
  it('returns safety-focused urgent interpretation without productivity coaching', () => {
    const result = interpretCheckIn(baseInput({ safetyLevel: 'urgent' }))
    expect(result.safety.level).toBe('urgent')
    expect(result.primaryAction.domain).toBe('safety')
    expect(result.avoidForNow.join(' ')).toMatch(/productivity/i)
    expect(result.explanation).toMatch(/not a diagnosis/i)
  })

  it('forces stabilize classification for urgent safety', () => {
    const result = classifyMode(baseInput({ safetyLevel: 'urgent' }))
    expect(result.mode).toBe('stabilize')
  })
})

describe('interpretCheckIn', () => {
  it('returns primary action and up to three alternatives', () => {
    const result = interpretCheckIn(baseInput({ stress: 3, energy: 6 }))
    expect(result.primaryAction.title.length).toBeGreaterThan(0)
    expect(result.alternatives.length).toBeLessThanOrEqual(3)
    expect(result.avoidForNow.length).toBeGreaterThan(0)
  })

  it('includes non-diagnostic explanation language', () => {
    const result = interpretCheckIn(baseInput())
    expect(result.explanation).toMatch(/not a diagnosis/i)
  })

  it('prioritizes nutrition when food is partially unmet', () => {
    const result = interpretCheckIn(
      baseInput({
        basicNeeds: { food: 'partial', hydration: 'met', sleep: 'met' },
        stress: 5,
        energy: 5,
      })
    )
    expect(result.proposedMode).toBe('rebuild')
    expect(
      [result.primaryAction, ...result.alternatives].some(
        (action) => action.domain === 'nutrition'
      )
    ).toBe(true)
  })
})

describe('threshold boundaries', () => {
  it('treats stress 7 with low energy differently from stress 6', () => {
    const atSeven = classifyMode(baseInput({ stress: 7, energy: 4, physical: 5, mental: 5 }))
    const atSix = classifyMode(baseInput({ stress: 6, energy: 4, physical: 5, mental: 5 }))
    expect(atSeven.reasonCodes).toContain('HIGH_STRESS_LOW_ENERGY')
    expect(atSix.reasonCodes).not.toContain('HIGH_STRESS_LOW_ENERGY')
  })

  it('treats energy 4 with high stress differently from energy 5', () => {
    const atFour = classifyMode(baseInput({ stress: 7, energy: 4, physical: 5, mental: 5 }))
    const atFive = classifyMode(baseInput({ stress: 7, energy: 5, physical: 5, mental: 5 }))
    expect(atFour.reasonCodes).toContain('HIGH_STRESS_LOW_ENERGY')
    expect(atFive.reasonCodes).not.toContain('HIGH_STRESS_LOW_ENERGY')
  })

  it('treats sleep 3 as poor but sleep 4 as not poor for expand blocking', () => {
    const expandProfile = { energy: 8, stress: 2, physical: 8, mental: 8 } as const
    const sleepThreeState = { factors: [] as string[], reasonCodes: [] as ReasonCode[] }
    const sleepFourState = { factors: [] as string[], reasonCodes: [] as ReasonCode[] }

    expect(canExpand(baseInput({ ...expandProfile, sleep: 3 }), sleepThreeState)).toBe(false)
    expect(sleepThreeState.reasonCodes).toContain('POOR_SLEEP')

    expect(canExpand(baseInput({ ...expandProfile, sleep: 4 }), sleepFourState)).toBe(false)
    expect(sleepFourState.reasonCodes).not.toContain('POOR_SLEEP')

    expect(
      classifyMode(baseInput({ ...expandProfile, sleep: 3 })).reasonCodes
    ).toContain('POOR_SLEEP')
    expect(classifyMode(baseInput({ ...expandProfile, sleep: 6 })).mode).toBe('expand')
  })
})

describe('support safety behavior', () => {
  it('blocks expand and caps maintain to rebuild without emergency wording', () => {
    const expandAttempt = interpretCheckIn(
      baseInput({ safetyLevel: 'support', stress: 2, energy: 8, physical: 8, mental: 8, sleep: 8 })
    )
    expect(expandAttempt.proposedMode).not.toBe('expand')
    expect(expandAttempt.reasonCodes).toContain('SUPPORT_LEVEL_PRESENT')
    expect(expandAttempt.explanation.toLowerCase()).not.toMatch(/emergency|immediate danger/)

    const maintainAttempt = interpretCheckIn(
      baseInput({ safetyLevel: 'support', stress: 3, energy: 6, physical: 6, mental: 6, sleep: 7 })
    )
    expect(maintainAttempt.proposedMode).toBe('rebuild')
  })

  it('includes at least one connection, regulation, or recovery action', () => {
    const result = interpretCheckIn(
      baseInput({ safetyLevel: 'support', stress: 3, energy: 6, physical: 6, mental: 6 })
    )
    const domains = [result.primaryAction, ...result.alternatives].map((action) => action.domain)
    expect(domains.some((domain) => ['connection', 'regulation', 'recovery'].includes(domain))).toBe(
      true
    )
  })
})

describe('result invariants', () => {
  it('keeps confidence between 0 and 1', () => {
    const samples = [
      baseInput(),
      baseInput({ stress: 9, energy: 2 }),
      baseInput({ physical: null, mental: null, sleep: null }),
      baseInput({ safetyLevel: 'urgent' }),
      baseInput({ safetyLevel: 'support' }),
    ]
    for (const sample of samples) {
      const result = interpretCheckIn(sample)
      expect(result.confidence).toBeGreaterThanOrEqual(0)
      expect(result.confidence).toBeLessThanOrEqual(1)
    }
  })

  it('returns at most three alternatives with unique action ids', () => {
    const result = interpretCheckIn(baseInput())
    expect(result.alternatives.length).toBeLessThanOrEqual(3)
    const ids = [result.primaryAction.id, ...result.alternatives.map((action) => action.id)]
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('includes engineVersion in every interpretation result', () => {
    const results = [
      interpretCheckIn(baseInput()),
      interpretCheckIn(baseInput({ safetyLevel: 'urgent' })),
      interpretCheckIn(baseInput({ safetyLevel: 'support' })),
    ]
    for (const result of results) {
      expect(result.engineVersion).toBe(BASELINE_ENGINE_VERSION)
    }
  })
})
