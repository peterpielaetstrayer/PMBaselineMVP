import { describe, expect, it } from 'vitest'
import { deriveSignUpResult } from '@/lib/auth/sign-up-result'

describe('deriveSignUpResult', () => {
  it('returns failure when signup errors', () => {
    const result = deriveSignUpResult(
      'user@example.com',
      { message: 'User already registered' },
      null
    )

    expect(result).toEqual({
      ok: false,
      error: { message: 'User already registered' },
    })
  })

  it('returns confirmation_required when signup succeeds without a session', () => {
    const result = deriveSignUpResult('user@example.com', null, null)

    expect(result).toEqual({
      ok: true,
      status: 'confirmation_required',
      email: 'user@example.com',
    })
  })

  it('returns session_created when signup returns an immediate session', () => {
    const result = deriveSignUpResult(
      'user@example.com',
      null,
      { user: { id: 'user-123' } }
    )

    expect(result).toEqual({
      ok: true,
      status: 'session_created',
    })
  })
})
