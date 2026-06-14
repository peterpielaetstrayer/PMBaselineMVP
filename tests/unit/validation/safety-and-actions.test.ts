import { describe, expect, it } from 'vitest'
import { deriveSafetyLevel } from '@/lib/interpretation/safety'
import { AcceptActionInputSchema } from '@/lib/validation/accepted-action'
import { ReflectionInputSchema } from '@/lib/validation/reflection'

describe('deriveSafetyLevel', () => {
  it('returns urgent when urgent risk is reported', () => {
    expect(
      deriveSafetyLevel({ reportsUrgentRisk: true, reportsNeedForSupport: false })
    ).toBe('urgent')
  })

  it('returns support when support is reported without urgent risk', () => {
    expect(
      deriveSafetyLevel({ reportsUrgentRisk: false, reportsNeedForSupport: true })
    ).toBe('support')
  })

  it('returns standard when no safety signals are reported', () => {
    expect(
      deriveSafetyLevel({ reportsUrgentRisk: false, reportsNeedForSupport: false })
    ).toBe('standard')
  })

  it('prioritizes urgent over support', () => {
    expect(
      deriveSafetyLevel({ reportsUrgentRisk: true, reportsNeedForSupport: true })
    ).toBe('urgent')
  })
})

describe('AcceptActionInputSchema', () => {
  it('rejects invalid action source', () => {
    expect(() =>
      AcceptActionInputSchema.parse({
        checkInId: '550e8400-e29b-41d4-a716-446655440000',
        interpretationId: '660e8400-e29b-41d4-a716-446655440001',
        actionSource: 'invalid',
        action: {
          id: 'a1',
          title: 'Walk',
          description: 'Five minute walk',
          estimatedMinutes: 5,
          domain: 'movement',
        },
      })
    ).toThrow()
  })
})

describe('ReflectionInputSchema', () => {
  it('rejects invalid reflection effect', () => {
    expect(() =>
      ReflectionInputSchema.parse({
        checkInId: '550e8400-e29b-41d4-a716-446655440000',
        effect: 'bad',
      })
    ).toThrow()
  })

  it('accepts valid reflection input', () => {
    const parsed = ReflectionInputSchema.parse({
      checkInId: '550e8400-e29b-41d4-a716-446655440000',
      effect: 'helped',
      finalBaselineScore: 7,
    })
    expect(parsed.effect).toBe('helped')
  })
})
