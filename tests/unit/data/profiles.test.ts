import { describe, expect, it } from 'vitest'
import { getProfile, updateProfile } from '@/lib/data/profiles'
import {
  createMockSupabaseClient,
  sampleProfile,
} from '../../helpers/mock-supabase'

describe('profiles data access', () => {
  it('returns NOT_AUTHENTICATED when there is no session', async () => {
    const client = createMockSupabaseClient({ user: null })
    const result = await getProfile(client)

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe('NOT_AUTHENTICATED')
    }
  })

  it('reads profile using the authenticated session user id', async () => {
    const client = createMockSupabaseClient({
      user: { id: 'user-123' },
      onQuery: (table, operation, filters) => {
        expect(table).toBe('profiles')
        expect(operation).toBe('select')
        expect(filters.id).toBe('user-123')
        return { data: sampleProfile, error: null }
      },
    })

    const result = await getProfile(client)
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.display_name).toBe('Alex')
    }
  })

  it('returns NOT_FOUND when profile row is missing', async () => {
    const client = createMockSupabaseClient({
      user: { id: 'user-123' },
      onQuery: () => ({
        data: null,
        error: { code: 'PGRST116', message: 'not found' },
      }),
    })

    const result = await getProfile(client)
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe('NOT_FOUND')
    }
  })

  it('rejects updates with no allowed fields', async () => {
    const client = createMockSupabaseClient({ user: { id: 'user-123' } })
    const result = await updateProfile(client, {})

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe('VALIDATION_ERROR')
    }
  })

  it('updates only allowed profile fields for the authenticated user', async () => {
    const client = createMockSupabaseClient({
      user: { id: 'user-123' },
      onQuery: (table, operation, filters) => {
        expect(table).toBe('profiles')
        expect(operation).toBe('update')
        expect(filters.id).toBe('user-123')
        expect(filters._updates).toEqual({
          display_name: 'Jordan',
          coaching_tone: 'gentle',
        })
        expect(filters._updates).not.toHaveProperty('id')

        return {
          data: { ...sampleProfile, display_name: 'Jordan', coaching_tone: 'gentle' },
          error: null,
        }
      },
    })

    const result = await updateProfile(client, {
      display_name: 'Jordan',
      coaching_tone: 'gentle',
    })

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.display_name).toBe('Jordan')
    }
  })
})
