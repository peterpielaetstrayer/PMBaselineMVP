import { describe, expect, it, vi } from 'vitest'
import { createActionRecord } from '@/lib/data/action-records'
import { createReflection } from '@/lib/data/reflections'
import type { AuthenticatedSupabaseClient } from '@/lib/data/session'

function authClient(tableHandlers: Record<string, () => Promise<{ data: unknown; error: unknown }>>) {
  return {
    auth: {
      getUser: async () => ({
        data: { user: { id: 'user-123' } },
        error: null,
      }),
    },
    from: (table: string) => {
      const run = tableHandlers[table]
      if (!run) {
        throw new Error(`No handler for ${table}`)
      }

      const chain: Record<string, unknown> = {}
      const terminal = async () => run()

      chain.select = () => chain
      chain.eq = () => chain
      chain.order = () => chain
      chain.limit = () => chain
      chain.maybeSingle = terminal
      chain.single = terminal
      chain.insert = () => ({
        select: () => ({
          single: terminal,
        }),
      })

      return chain
    },
  } as unknown as AuthenticatedSupabaseClient
}

describe('createActionRecord', () => {
  it('rejects when interpretation is not owned by user/check-in', async () => {
    const client = authClient({
      interpretations: async () => ({
        data: null,
        error: { code: 'PGRST116', message: 'not found' },
      }),
    })

    const result = await createActionRecord(client, {
      checkInId: '770e8400-e29b-41d4-a716-446655440002',
      interpretationId: '880e8400-e29b-41d4-a716-446655440003',
      actionSource: 'primary',
      actionText: 'Walk: Five minutes',
      actionDomain: 'movement',
    })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe('NOT_FOUND')
    }
  })

  it('creates action record when ownership checks pass', async () => {
    const client = authClient({
      interpretations: async () => ({
        data: { id: '880e8400-e29b-41d4-a716-446655440003' },
        error: null,
      }),
      action_records: async () => ({
        data: {
          id: '990e8400-e29b-41d4-a716-446655440004',
          user_id: 'user-123',
          check_in_id: '770e8400-e29b-41d4-a716-446655440002',
          interpretation_id: '880e8400-e29b-41d4-a716-446655440003',
          action_text: 'Walk: Five minutes',
          action_domain: 'movement',
          action_source: 'primary',
          status: 'accepted',
        },
        error: null,
      }),
    })

    const result = await createActionRecord(client, {
      checkInId: '770e8400-e29b-41d4-a716-446655440002',
      interpretationId: '880e8400-e29b-41d4-a716-446655440003',
      actionSource: 'primary',
      actionText: 'Walk: Five minutes',
      actionDomain: 'movement',
    })

    expect(result.ok).toBe(true)
  })
})

describe('createReflection', () => {
  it('requires owned check-in', async () => {
    const client = authClient({
      check_ins: async () => ({
        data: null,
        error: { code: 'PGRST116', message: 'not found' },
      }),
    })

    const result = await createReflection(client, {
      checkInId: '770e8400-e29b-41d4-a716-446655440002',
      effect: 'helped',
    })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe('NOT_FOUND')
    }
  })

  it('creates reflection for owned check-in', async () => {
    const client = authClient({
      check_ins: async () => ({
        data: { id: '770e8400-e29b-41d4-a716-446655440002' },
        error: null,
      }),
      reflections: async () => ({
        data: {
          id: 'aa0e8400-e29b-41d4-a716-446655440005',
          user_id: 'user-123',
          check_in_id: '770e8400-e29b-41d4-a716-446655440002',
          effect: 'helped',
        },
        error: null,
      }),
    })

    const result = await createReflection(client, {
      checkInId: '770e8400-e29b-41d4-a716-446655440002',
      effect: 'helped',
    })

    expect(result.ok).toBe(true)
  })
})
