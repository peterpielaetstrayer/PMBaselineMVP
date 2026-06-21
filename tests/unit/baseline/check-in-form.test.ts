import { describe, expect, it } from 'vitest'
import {
  buildQuickCheckInPayload,
  createCheckInSubmissionId,
  DEFAULT_CHECK_IN_FORM_STATE,
  parseContextTagsInput,
  resolveCheckInResultPath,
} from '@/lib/baseline/check-in-form'
import { QuickCheckInInputSchema } from '@/lib/validation/check-in'

describe('check-in form payload mapping', () => {
  const submissionId = '550e8400-e29b-41d4-a716-446655440000'

  it('maps core scores and safety signals into QuickCheckInInput', () => {
    const payload = buildQuickCheckInPayload(submissionId, {
      ...DEFAULT_CHECK_IN_FORM_STATE,
      physical: 4,
      mental: 5,
      energy: 3,
      stress: 8,
      reportsNeedForSupport: true,
      optionalNote: '  Rough morning  ',
    })

    expect(() => QuickCheckInInputSchema.parse(payload)).not.toThrow()
    expect(payload).toMatchObject({
      submissionId,
      physical: 4,
      mental: 5,
      energy: 3,
      stress: 8,
      optionalNote: 'Rough morning',
      safetySignals: {
        reportsUrgentRisk: false,
        reportsNeedForSupport: true,
      },
    })
  })

  it('parses context tags and trims empty optional strings to null', () => {
    const payload = buildQuickCheckInPayload(submissionId, {
      ...DEFAULT_CHECK_IN_FORM_STATE,
      contextTags: parseContextTagsInput('work, travel, '),
      foodStatus: '   ',
      hydrationStatus: 'low',
    })

    expect(payload.contextTags).toEqual(['work', 'travel'])
    expect(payload.foodStatus).toBeNull()
    expect(payload.hydrationStatus).toBe('low')
  })

  it('generates a uuid submission id', () => {
    const id = createCheckInSubmissionId()
    expect(id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    )
  })

  it('reuses one submission id for navigation path resolution', () => {
    const checkInId = '770e8400-e29b-41d4-a716-446655440002'
    expect(resolveCheckInResultPath(checkInId)).toBe(
      '/result/770e8400-e29b-41d4-a716-446655440002'
    )
  })
})
