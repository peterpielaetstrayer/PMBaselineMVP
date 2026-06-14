import { describe, expect, it } from 'vitest'
import { DeterministicInterpretationProvider } from '@/lib/interpretation/deterministic-provider'
import { mapEngineResultToInterpretationPayload } from '@/lib/interpretation/mappers'
import { interpretCheckIn } from '@/lib/baseline/state-engine'
import { InterpretationPayloadSchema } from '@/lib/validation/interpretation'

describe('DeterministicInterpretationProvider', () => {
  const provider = new DeterministicInterpretationProvider()

  it('maps engine output to interpretation payload contract', async () => {
    const result = await provider.interpret({
      physical: 6,
      mental: 6,
      energy: 6,
      stress: 4,
      sleep: 7,
    })

    expect(result.source).toBe('fallback')
    expect(result.engineVersion).toBe('baseline-engine-v0.1')
    expect(result.alternatives.length).toBeLessThanOrEqual(3)
    expect(() => InterpretationPayloadSchema.parse(result)).not.toThrow()
  })

  it('returns urgent safety through provider for urgent input', async () => {
    const result = await provider.interpret({
      physical: 4,
      mental: 4,
      energy: 3,
      stress: 8,
      sleep: 4,
      safetyLevel: 'urgent',
    })

    expect(result.proposedMode).toBe('stabilize')
    expect(result.safety.level).toBe('urgent')
  })
})

describe('mapEngineResultToInterpretationPayload', () => {
  it('includes reason codes and factors from engine', () => {
    const engineResult = interpretCheckIn({
      physical: 4,
      mental: 4,
      energy: 4,
      stress: 7,
      sleep: 6,
    })

    const payload = mapEngineResultToInterpretationPayload(engineResult)
    expect(payload.reasonCodes.length).toBeGreaterThan(0)
    expect(payload.factors.length).toBeGreaterThan(0)
    expect(payload.reflectionPrompt.length).toBeGreaterThan(0)
  })
})
