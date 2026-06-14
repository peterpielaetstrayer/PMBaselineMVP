import { describe, expect, it } from 'vitest'
import { createActionRecord } from '@/lib/data/action-records'
import { buildActionPersistenceFields } from '@/lib/validation/action-persistence'
import { getInterpretationForCheckIn } from '@/lib/data/interpretations'
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

const primaryAction = {
  id: 'maintain-one-anchor',
  title: 'Keep one anchor',
  description: 'Complete one familiar routine.',
  estimatedMinutes: 20,
  domain: 'recovery' as const,
}

describe('createActionRecord', () => {
  it('rejects when interpretation is not owned by user/check-in', async () => {
    const client = authClient({
      interpretations: async () => ({
        data: null,
        error: { code: 'PGRST116', message: 'not found' },
      }),
    })

    const persistence = buildActionPersistenceFields(primaryAction, 'primary')
    const result = await createActionRecord(client, {
      checkInId: '770e8400-e29b-41d4-a716-446655440002',
      interpretationId: '880e8400-e29b-41d4-a716-446655440003',
      actionSource: 'primary',
      actionKey: persistence.actionKey,
      actionPayload: persistence.actionPayload,
      actionText: persistence.actionText,
      actionDomain: persistence.actionDomain,
    })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe('NOT_FOUND')
    }
  })

  it('creates action record with action_key and action_payload', async () => {
    const persistence = buildActionPersistenceFields(primaryAction, 'primary')

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
          action_key: persistence.actionKey,
          action_payload: persistence.actionPayload,
          action_text: persistence.actionText,
          action_domain: persistence.actionDomain,
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
      actionKey: persistence.actionKey,
      actionPayload: persistence.actionPayload,
      actionText: persistence.actionText,
      actionDomain: persistence.actionDomain,
    })

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.action_key).toBe('maintain-one-anchor')
      expect(result.data.action_payload).toEqual(primaryAction)
    }
  })
})

describe('getInterpretationForCheckIn', () => {
  it('loads the single interpretation for a check-in', async () => {
    const client = authClient({
      interpretations: async () => ({
        data: {
          id: '880e8400-e29b-41d4-a716-446655440003',
          check_in_id: '770e8400-e29b-41d4-a716-446655440002',
        },
        error: null,
      }),
    })

    const result = await getInterpretationForCheckIn(
      client,
      '770e8400-e29b-41d4-a716-446655440002'
    )

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
