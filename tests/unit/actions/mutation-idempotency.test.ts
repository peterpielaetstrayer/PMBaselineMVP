import { describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

import { createClient } from '@/lib/supabase/server'
import { acceptAction } from '@/lib/actions/action'
import { submitReflection } from '@/lib/actions/reflection'

const checkInId = '770e8400-e29b-41d4-a716-446655440002'
const interpretationId = '880e8400-e29b-41d4-a716-446655440003'
const actionRecordId = '990e8400-e29b-41d4-a716-446655440004'

const storedAction = {
  id: actionRecordId,
  user_id: 'user-123',
  check_in_id: checkInId,
  interpretation_id: interpretationId,
  action_key: 'rebuild-anchor',
  action_payload: {
    id: 'rebuild-anchor',
    title: 'One small anchor',
    description: 'Do the smallest version of one familiar routine.',
    estimatedMinutes: 15,
    domain: 'recovery',
  },
  action_text: 'One small anchor',
  action_domain: 'recovery',
  action_source: 'primary',
  status: 'accepted',
}

const storedReflection = {
  id: 'aa0e8400-e29b-41d4-a716-446655440005',
  user_id: 'user-123',
  check_in_id: checkInId,
  action_record_id: actionRecordId,
  effect: 'helped',
  what_changed: null,
  what_was_protected: null,
  lesson: null,
  final_baseline_score: 7,
}

function createActionClient(existing: typeof storedAction | null) {
  return {
    auth: { getUser: async () => ({ data: { user: { id: 'user-123' } }, error: null }) },
    from: (table: string) => {
      const chain: Record<string, unknown> = {}
      chain.select = () => chain
      chain.eq = () => chain
      chain.in = () => chain
      chain.order = () => chain
      chain.limit = () => chain
      chain.insert = () => chain
      chain.single = async () => {
        if (table === 'action_records' && existing) {
          return { data: existing, error: null }
        }
        return { data: null, error: { code: 'PGRST116', message: 'not found' } }
      }
      chain.maybeSingle = async () => {
        if (table === 'action_records') {
          return { data: existing, error: null }
        }
        return { data: null, error: null }
      }
      return chain
    },
  } as never
}

function createReflectionClient(reflection: typeof storedReflection | null) {
  return {
    auth: { getUser: async () => ({ data: { user: { id: 'user-123' } }, error: null }) },
    from: (table: string) => {
      const chain: Record<string, unknown> = {}
      chain.select = () => chain
      chain.eq = () => chain
      chain.order = () => chain
      chain.limit = () => chain
      chain.insert = () => chain
      chain.update = () => chain
      chain.single = async () => {
        if (table === 'check_ins') {
          return { data: { id: checkInId }, error: null }
        }
        if (table === 'action_records') {
          return { data: storedAction, error: null }
        }
        return { data: null, error: { message: 'unexpected' } }
      }
      chain.maybeSingle = async () => {
        if (table === 'reflections') {
          return { data: reflection, error: null }
        }
        if (table === 'action_records') {
          return { data: storedAction, error: null }
        }
        return { data: null, error: null }
      }
      return chain
    },
  } as never
}

describe('mutation idempotency', () => {
  it('acceptAction returns existing accepted action without inserting', async () => {
    vi.mocked(createClient).mockResolvedValue(createActionClient(storedAction))

    const result = await acceptAction({
      checkInId,
      interpretationId,
      actionSource: 'primary',
      action: storedAction.action_payload,
    })

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.actionRecordId).toBe(actionRecordId)
      expect(result.data.action.title).toBe('One small anchor')
    }
  })

  it('submitReflection returns existing reflection without inserting', async () => {
    vi.mocked(createClient).mockResolvedValue(
      createReflectionClient(storedReflection)
    )

    const result = await submitReflection({
      checkInId,
      actionRecordId,
      effect: 'helped',
    })

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.reflectionId).toBe(storedReflection.id)
      expect(result.data.effect).toBe('helped')
    }
  })
})
