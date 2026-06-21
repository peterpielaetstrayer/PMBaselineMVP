import { describe, expect, it } from 'vitest'
import {
  formatActionErrorForUser,
  isDuplicateReflectionError,
} from '@/lib/baseline/user-messages'

describe('formatActionErrorForUser', () => {
  it('maps validation errors to friendly copy', () => {
    expect(
      formatActionErrorForUser({
        code: 'VALIDATION_ERROR',
        message: 'Required',
      })
    ).toContain('Review the form')
  })

  it('maps database errors without exposing raw text by default', () => {
    expect(
      formatActionErrorForUser({
        code: 'DATABASE_ERROR',
        message: 'connection refused on port 5432',
      })
    ).toBe('Something went wrong saving your data. Please try again.')
  })

  it('uses message override for duplicate reflection', () => {
    expect(
      formatActionErrorForUser({
        code: 'FORBIDDEN',
        message: 'Reflection already exists for this check-in',
      })
    ).toBe('You already saved a reflection for this check-in.')
  })
})

describe('isDuplicateReflectionError', () => {
  it('detects duplicate reflection guard', () => {
    expect(
      isDuplicateReflectionError({
        code: 'FORBIDDEN',
        message: 'Reflection already exists for this check-in',
      })
    ).toBe(true)
  })
})
