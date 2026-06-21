import { describe, expect, it } from 'vitest'
import {
  buildReflectionInput,
  DEFAULT_REFLECTION_FORM_STATE,
} from '@/lib/baseline/reflection-form'
import { ReflectionInputSchema } from '@/lib/validation/reflection'

describe('buildReflectionInput', () => {
  const checkInId = '770e8400-e29b-41d4-a716-446655440002'
  const actionRecordId = '990e8400-e29b-41d4-a716-446655440004'

  it('maps reflection form state into ReflectionInput', () => {
    const payload = buildReflectionInput(checkInId, actionRecordId, {
      ...DEFAULT_REFLECTION_FORM_STATE,
      effect: 'helped',
      whatChanged: 'Felt less scattered',
      whatWasProtected: 'Energy',
      lesson: 'Smaller moves count',
      finalBaselineScore: 7,
    })

    expect(() => ReflectionInputSchema.parse(payload)).not.toThrow()
    expect(payload).toMatchObject({
      checkInId,
      actionRecordId,
      effect: 'helped',
      whatChanged: 'Felt less scattered',
      whatWasProtected: 'Energy',
      lesson: 'Smaller moves count',
      finalBaselineScore: 7,
    })
  })

  it('trims optional text fields to null when blank', () => {
    const payload = buildReflectionInput(checkInId, actionRecordId, {
      ...DEFAULT_REFLECTION_FORM_STATE,
      effect: 'neutral',
      whatChanged: '   ',
      whatWasProtected: '',
      lesson: '  ',
    })

    expect(payload.whatChanged).toBeNull()
    expect(payload.whatWasProtected).toBeNull()
    expect(payload.lesson).toBeNull()
  })
})
