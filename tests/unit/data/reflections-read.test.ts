import { describe, expect, it } from 'vitest'
import { createReflection, getReflectionForCheckIn } from '@/lib/data/reflections'
import type { AuthenticatedSupabaseClient } from '@/lib/data/session'

const checkInId = '770e8400-e29b-41d4-a716-446655440002'

function createClient(options: {
  existingReflection?: Record<string, unknown> | null
  checkIn?: Record<string, unknown> | null
  insertReflection?: Record<string, unknown> | null
}) {
  return {
    auth: {
      getUser: async () => ({
        data: { user: { id: 'user-123' } },
        error: null,
      }),
    },
    from: (table: string) => {
      const chain: Record<string, unknown> = {}
      chain.select = () => chain
      chain.eq = () => chain
      chain.order = () => chain
      chain.limit = () => chain
      chain.single = async () => {
        if (table === 'check_ins') {
          return {
            data: options.checkIn ?? null,
            error: options.checkIn ? null : { code: 'PGRST116', message: 'not found' },
          }
        }

        if (table === 'reflections') {
          return {
            data: options.insertReflection ?? null,
            error: options.insertReflection ? null : { message: 'insert failed' },
          }
        }

        return { data: null, error: { message: 'unexpected' } }
      }
      chain.maybeSingle = async () => {
        if (table === 'reflections') {
          return {
            data: options.existingReflection ?? null,
            error: null,
          }
        }

        return { data: null, error: null }
      }
      chain.insert = () => ({
        select: () => ({
          single: chain.single,
        }),
      })

      return chain
    },
  } as unknown as AuthenticatedSupabaseClient
}

describe('getReflectionForCheckIn', () => {
  it('returns reflection when present', async () => {
    const result = await getReflectionForCheckIn(
      createClient({
        existingReflection: {
          id: 'aa0e8400-e29b-41d4-a716-446655440005',
          user_id: 'user-123',
          check_in_id: checkInId,
          effect: 'helped',
        },
      }),
      checkInId
    )

    expect(result.ok).toBe(true)
  })

  it('returns NOT_FOUND when no reflection exists', async () => {
    const result = await getReflectionForCheckIn(
      createClient({ existingReflection: null }),
      checkInId
    )

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe('NOT_FOUND')
    }
  })
})

describe('createReflection duplicate guard', () => {
  it('rejects when reflection already exists for check-in', async () => {
    const result = await createReflection(
      createClient({
        existingReflection: {
          id: 'aa0e8400-e29b-41d4-a716-446655440005',
          check_in_id: checkInId,
          effect: 'helped',
        },
      }),
      {
        checkInId,
        effect: 'neutral',
      }
    )

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe('FORBIDDEN')
    }
  })

  it('creates reflection when none exists yet', async () => {
    const result = await createReflection(
      createClient({
        existingReflection: null,
        checkIn: { id: checkInId },
        insertReflection: {
          id: 'aa0e8400-e29b-41d4-a716-446655440005',
          user_id: 'user-123',
          check_in_id: checkInId,
          effect: 'helped',
        },
      }),
      {
        checkInId,
        effect: 'helped',
      }
    )

    expect(result.ok).toBe(true)
  })
})
