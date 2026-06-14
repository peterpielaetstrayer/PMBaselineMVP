import { describe, expect, it, vi } from 'vitest'
import { submitCheckInWithInterpretation } from '@/lib/data/submit-check-in'
import { InterpretationPayloadSchema } from '@/lib/validation/interpretation'
import { QuickCheckInInputSchema } from '@/lib/validation/check-in'
import type { AuthenticatedSupabaseClient } from '@/lib/data/session'

const submissionId = '550e8400-e29b-41d4-a716-446655440000'

const checkIn = QuickCheckInInputSchema.parse({
  submissionId,
  physical: 6,
  mental: 6,
  energy: 6,
  stress: 4,
  sleep: 7,
})

const interpretation = InterpretationPayloadSchema.parse({
  proposedMode: 'maintain',
  confidence: 0.7,
  summary: 'Moderate capacity today.',
  primaryAction: {
    id: 'maintain-one-anchor',
    title: 'Keep one anchor',
    description: 'Complete one familiar routine.',
    estimatedMinutes: 20,
    domain: 'recovery',
  },
  alternatives: [],
  avoidForNow: ['Extra goals'],
  reflectionPrompt: 'What anchor would you like to protect today?',
  safety: { level: 'standard', message: null },
  source: 'fallback',
  engineVersion: 'baseline-engine-v0.1',
  reasonCodes: ['MODERATE_STABLE_CAPACITY'],
  factors: ['Moderate, relatively stable capacity'],
  needsMoreInformation: false,
})

function createRpcClient(options: {
  rpcResult?: unknown
  rpcError?: { message: string }
  interpretationRow?: Record<string, unknown>
}) {
  const client = {
    auth: {
      getUser: async () => ({
        data: { user: { id: 'user-123' } },
        error: null,
      }),
    },
    rpc: vi.fn(async () => ({
      data: options.rpcResult ?? null,
      error: options.rpcError ?? null,
    })),
    from: (table: string) => {
      if (table !== 'interpretations') {
        throw new Error(`Unexpected table ${table}`)
      }

      return {
        select: () => ({
          eq: () => ({
            eq: () => ({
              single: async () => ({
                data: options.interpretationRow ?? null,
                error: options.interpretationRow ? null : { code: 'PGRST116' },
              }),
            }),
          }),
        }),
      }
    },
  }

  return client as unknown as AuthenticatedSupabaseClient
}

describe('submitCheckInWithInterpretation', () => {
  it('returns stored interpretation on successful RPC', async () => {
    const client = createRpcClient({
      rpcResult: {
        check_in_id: '770e8400-e29b-41d4-a716-446655440002',
        interpretation_id: '880e8400-e29b-41d4-a716-446655440003',
        idempotent_replay: false,
      },
    })

    const result = await submitCheckInWithInterpretation(client, {
      checkIn,
      interpretation,
    })

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.checkInId).toBe('770e8400-e29b-41d4-a716-446655440002')
      expect(result.data.idempotentReplay).toBe(false)
    }

    expect(client.rpc).toHaveBeenCalledWith(
      'submit_check_in_with_interpretation',
      expect.objectContaining({
        p_submission_id: submissionId,
      })
    )
  })

  it('returns original stored interpretation on duplicate submission replay', async () => {
    const client = createRpcClient({
      rpcResult: {
        check_in_id: '770e8400-e29b-41d4-a716-446655440002',
        interpretation_id: '880e8400-e29b-41d4-a716-446655440003',
        idempotent_replay: true,
      },
      interpretationRow: {
        id: '880e8400-e29b-41d4-a716-446655440003',
        proposed_mode: 'maintain',
        confidence: 0.7,
        summary: 'Original stored summary',
        primary_action: interpretation.primaryAction,
        alternative_actions: [],
        avoid_for_now: ['Extra goals'],
        reflection_prompt: 'Stored prompt',
        safety: { level: 'standard', message: null },
        source: 'fallback',
        engine_version: 'baseline-engine-v0.1',
        reason_codes: ['MODERATE_STABLE_CAPACITY'],
        factors: ['Stored factor'],
      },
    })

    const result = await submitCheckInWithInterpretation(client, {
      checkIn,
      interpretation: {
        ...interpretation,
        summary: 'Would-be recomputed summary',
      },
    })

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.idempotentReplay).toBe(true)
      expect(result.data.summary).toBe('Original stored summary')
      expect(result.data.interpretationId).toBe('880e8400-e29b-41d4-a716-446655440003')
    }
  })

  it('maps missing submission_id RPC errors to RPC_ERROR', async () => {
    const client = createRpcClient({
      rpcError: { message: 'submission_id is required' },
    })

    const result = await submitCheckInWithInterpretation(client, {
      checkIn,
      interpretation,
    })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe('RPC_ERROR')
      expect(result.error.message).toContain('submission_id is required')
    }
  })

  it('maps RPC errors to RPC_ERROR', async () => {
    const client = createRpcClient({
      rpcError: { message: 'function does not exist' },
    })

    const result = await submitCheckInWithInterpretation(client, {
      checkIn,
      interpretation,
    })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe('RPC_ERROR')
    }
  })

  it('requires authenticated session', async () => {
    const client = {
      auth: {
        getUser: async () => ({ data: { user: null }, error: null }),
      },
      rpc: vi.fn(),
    } as unknown as AuthenticatedSupabaseClient

    const result = await submitCheckInWithInterpretation(client, {
      checkIn,
      interpretation,
    })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe('NOT_AUTHENTICATED')
    }
  })
})
