import { describe, expect, it } from 'vitest'
import { loadReflectWorkspaceWithClient } from '@/lib/server/reflect-workspace'

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
  avoid_for_now: [],
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
  action_text: 'One small anchor',
  action_domain: 'recovery',
  action_source: 'primary',
  status: 'accepted',
}

const storedReflection = {
  id: 'aa0e8400-e29b-41d4-a716-446655440005',
  user_id: 'user-123',
  check_in_id: checkInId,
  action_record_id: storedAction.id,
  effect: 'helped',
  what_changed: 'Less scattered',
  what_was_protected: 'Energy',
  lesson: null,
  final_baseline_score: 7,
}

function createClient(options: {
  checkInFound?: boolean
  interpretationFound?: boolean
  actionRecord?: typeof storedAction | null
  reflection?: typeof storedReflection | null
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
          return { data: options.actionRecord ?? null, error: null }
        }

        if (table === 'reflections') {
          return { data: options.reflection ?? null, error: null }
        }

        return { data: null, error: null }
      }
      return chain
    },
  } as never
}

describe('loadReflectWorkspaceWithClient', () => {
  it('returns null when check-in is missing', async () => {
    const result = await loadReflectWorkspaceWithClient(
      createClient({ checkInFound: false }),
      checkInId
    )

    expect(result).toBeNull()
  })

  it('returns null when accepted action is missing', async () => {
    const result = await loadReflectWorkspaceWithClient(
      createClient({
        checkInFound: true,
        interpretationFound: true,
        actionRecord: null,
      }),
      checkInId
    )

    expect(result).toBeNull()
  })

  it('returns workspace without reflection when none exists yet', async () => {
    const result = await loadReflectWorkspaceWithClient(
      createClient({
        checkInFound: true,
        interpretationFound: true,
        actionRecord: storedAction,
        reflection: null,
      }),
      checkInId
    )

    expect(result?.actionRecordId).toBe(storedAction.id)
    expect(result?.reflection).toBeNull()
  })

  it('returns existing reflection when present', async () => {
    const result = await loadReflectWorkspaceWithClient(
      createClient({
        checkInFound: true,
        interpretationFound: true,
        actionRecord: storedAction,
        reflection: storedReflection,
      }),
      checkInId
    )

    expect(result?.reflection?.effect).toBe('helped')
    expect(result?.reflection?.reflectionId).toBe(storedReflection.id)
  })
})
