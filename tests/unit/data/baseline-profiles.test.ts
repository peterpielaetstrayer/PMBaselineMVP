import { describe, expect, it } from 'vitest'
import {
  getBaselineProfile,
  updateBaselineProfile,
} from '@/lib/data/baseline-profiles'
import {
  createMockSupabaseClient,
  sampleBaselineProfile,
} from '../../helpers/mock-supabase'

describe('baseline_profiles data access', () => {
  it('returns AUTH_ERROR when session lookup fails', async () => {
    const client = createMockSupabaseClient({
      authError: { message: 'JWT expired' },
    })

    const result = await getBaselineProfile(client)
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe('AUTH_ERROR')
    }
  })

  it('reads baseline profile scoped to the authenticated user', async () => {
    const client = createMockSupabaseClient({
      user: { id: 'user-123' },
      onQuery: (table, operation, filters) => {
        expect(table).toBe('baseline_profiles')
        expect(operation).toBe('select')
        expect(filters.user_id).toBe('user-123')
        return { data: sampleBaselineProfile, error: null }
      },
    })

    const result = await getBaselineProfile(client)
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.known_stabilizers).toContain('walk')
    }
  })

  it('updates allowed baseline profile fields for the authenticated user', async () => {
    const client = createMockSupabaseClient({
      user: { id: 'user-123' },
      onQuery: (table, operation, filters) => {
        expect(table).toBe('baseline_profiles')
        expect(operation).toBe('update')
        expect(filters.user_id).toBe('user-123')
        expect(filters._updates).toEqual({
          known_stabilizers: ['meditation', 'walk'],
        })

        return {
          data: {
            ...sampleBaselineProfile,
            known_stabilizers: ['meditation', 'walk'],
          },
          error: null,
        }
      },
    })

    const result = await updateBaselineProfile(client, {
      known_stabilizers: ['meditation', 'walk'],
    })

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.known_stabilizers).toEqual(['meditation', 'walk'])
    }
  })

  it('rejects baseline profile updates with no allowed fields', async () => {
    const client = createMockSupabaseClient({ user: { id: 'user-123' } })
    const result = await updateBaselineProfile(client, {})

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe('VALIDATION_ERROR')
    }
  })
})
