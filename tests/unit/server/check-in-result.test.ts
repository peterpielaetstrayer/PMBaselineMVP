import { describe, expect, it } from 'vitest'
import { loadStoredCheckInResultWithClient } from '@/lib/server/check-in-result'

const checkInId = '770e8400-e29b-41d4-a716-446655440002'
const interpretationId = '880e8400-e29b-41d4-a716-446655440003'

const storedRow = {
  proposed_mode: 'rebuild',
  confidence: 0.55,
  summary: 'Stored summary from database.',
  primary_action: {
    id: 'rebuild-anchor',
    title: 'One small anchor',
    description: 'Do the smallest version of one familiar routine.',
    estimatedMinutes: 15,
    domain: 'recovery',
  },
  alternative_actions: [],
  avoid_for_now: ['Extra goals'],
  reflection_prompt: 'What felt manageable today?',
  safety: { level: 'standard', message: null },
  source: 'fallback',
  engine_version: 'baseline-engine-v0.1',
  reason_codes: ['MODERATE_STABLE_CAPACITY'],
  factors: ['Stored factor'],
}

const storedAction = {
  id: '990e8400-e29b-41d4-a716-446655440004',
  user_id: 'user-123',
  check_in_id: checkInId,
  interpretation_id: interpretationId,
  action_key: 'rebuild-anchor',
  action_payload: storedRow.primary_action,
  action_text: 'One small anchor: Do the smallest version of one familiar routine.',
  action_domain: 'recovery',
  action_source: 'primary',
  status: 'accepted',
}

function createClient(options: {
  checkInFound?: boolean
  interpretationFound?: boolean
  actionRecord?: typeof storedAction | null
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
      chain.in = () => chain
      chain.order = () => chain
      chain.limit = () => chain
      chain.single = async () => {
        if (table === 'check_ins') {
          if (!options.checkInFound) {
            return { data: null, error: { code: 'PGRST116', message: 'not found' } }
          }
          return { data: { id: checkInId }, error: null }
        }

        if (table === 'interpretations') {
          if (!options.interpretationFound) {
            return { data: null, error: { code: 'PGRST116', message: 'not found' } }
          }
          return {
            data: { id: interpretationId, ...storedRow },
            error: null,
          }
        }

        return { data: null, error: { message: 'unexpected table' } }
      }
      chain.maybeSingle = async () => {
        if (table === 'action_records') {
          return {
            data: options.actionRecord ?? null,
            error: null,
          }
        }

        return { data: null, error: { message: 'unexpected table' } }
      }
      return chain
    },
  } as never
}

describe('loadStoredCheckInResultWithClient', () => {
  it('returns stored interpretation without recomputing engine output', async () => {
    const result = await loadStoredCheckInResultWithClient(
      createClient({
        checkInFound: true,
        interpretationFound: true,
        actionRecord: null,
      }),
      checkInId
    )

    expect(result).not.toBeNull()
    expect(result?.interpretation.summary).toBe('Stored summary from database.')
    expect(result?.interpretation.proposedMode).toBe('rebuild')
    expect(result?.interpretation.interpretationId).toBe(interpretationId)
    expect(result?.acceptedAction).toBeNull()
  })

  it('returns existing accepted action when present', async () => {
    const result = await loadStoredCheckInResultWithClient(
      createClient({
        checkInFound: true,
        interpretationFound: true,
        actionRecord: storedAction,
      }),
      checkInId
    )

    expect(result?.acceptedAction).toEqual(storedRow.primary_action)
  })

  it('returns null when check-in is not owned or missing', async () => {
    const result = await loadStoredCheckInResultWithClient(
      createClient({ checkInFound: false, interpretationFound: true }),
      checkInId
    )

    expect(result).toBeNull()
  })

  it('returns null when interpretation is missing', async () => {
    const result = await loadStoredCheckInResultWithClient(
      createClient({ checkInFound: true, interpretationFound: false }),
      checkInId
    )

    expect(result).toBeNull()
  })
})
