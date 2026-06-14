import { describe, expect, it } from 'vitest'
import { QuickCheckInInputSchema } from '@/lib/validation/check-in'

describe('QuickCheckInInputSchema', () => {
  const valid = {
    submissionId: '550e8400-e29b-41d4-a716-446655440000',
    physical: 6,
    mental: 5,
    energy: 4,
    stress: 7,
    sleep: 6,
  }

  it('accepts valid quick check-in input', () => {
    const parsed = QuickCheckInInputSchema.parse(valid)
    expect(parsed.submissionId).toBe(valid.submissionId)
    expect(parsed.safetySignals.reportsUrgentRisk).toBe(false)
  })

  it('rejects scores outside 0-10', () => {
    expect(() => QuickCheckInInputSchema.parse({ ...valid, stress: 11 })).toThrow()
    expect(() => QuickCheckInInputSchema.parse({ ...valid, energy: -1 })).toThrow()
  })

  it('rejects invalid submission id', () => {
    expect(() =>
      QuickCheckInInputSchema.parse({ ...valid, submissionId: 'not-a-uuid' })
    ).toThrow()
  })

  it('does not accept client safety_level field', () => {
    expect(() =>
      QuickCheckInInputSchema.parse({ ...valid, safetyLevel: 'urgent' })
    ).toThrow()
  })
})
