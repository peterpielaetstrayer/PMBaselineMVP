import { describe, expect, it } from 'vitest'
import { getActionRecordForCheckIn } from '@/lib/data/action-records'
import type { AuthenticatedSupabaseClient } from '@/lib/data/session'

const checkInId = '770e8400-e29b-41d4-a716-446655440002'
const interpretationId = '880e8400-e29b-41d4-a716-446655440003'

const storedAction = {
  id: '990e8400-e29b-41d4-a716-446655440004',
  user_id: 'user-123',
  check_in_id: checkInId,
  interpretation_id: interpretationId,
  action_key: 'maintain-one-anchor',
  action_payload: {
    id: 'maintain-one-anchor',
    title: 'Keep one anchor',
    description: 'Complete one familiar routine.',
    estimatedMinutes: 20,
    domain: 'recovery',
  },
  action_text: 'Keep one anchor: Complete one familiar routine.',
  action_domain: 'recovery',
  action_source: 'primary',
  status: 'accepted',
}

function createClient(options: { actionRecord?: typeof storedAction | null }) {
  return {
    auth: {
      getUser: async () => ({
        data: { user: { id: 'user-123' } },
        error: null,
      }),
    },
    from: (table: string) => {
      if (table !== 'action_records') {
        throw new Error(`Unexpected table ${table}`)
      }

      const filters: Record<string, unknown> = {}

      const chain: Record<string, unknown> = {}
      chain.select = () => chain
      chain.eq = (column: string, value: unknown) => {
        filters[column] = value
        return chain
      }
      chain.in = (column: string, values: unknown[]) => {
        filters[column] = values
        return chain
      }
      chain.order = () => chain
      chain.limit = () => chain
      chain.maybeSingle = async () => ({
        data: options.actionRecord ?? null,
        error: null,
      })

      return chain
    },
  } as unknown as AuthenticatedSupabaseClient
}

describe('getActionRecordForCheckIn', () => {
  it('returns the most recent accepted action record for the check-in', async () => {
    const result = await getActionRecordForCheckIn(createClient({ actionRecord: storedAction }), {
      checkInId,
      interpretationId,
    })

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.action_key).toBe('maintain-one-anchor')
      expect(result.data.status).toBe('accepted')
    }
  })

  it('returns NOT_FOUND when no action record exists', async () => {
    const result = await getActionRecordForCheckIn(createClient({ actionRecord: null }), {
      checkInId,
      interpretationId,
    })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe('NOT_FOUND')
    }
  })
})
