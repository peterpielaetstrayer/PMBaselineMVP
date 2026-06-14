import { interpretCheckIn } from '@/lib/baseline/state-engine'
import type { CheckInInput } from '@/lib/baseline/types'
import type { InterpretationPayload } from '@/lib/validation/interpretation'
import { mapEngineResultToInterpretationPayload } from './mappers'
import type { InterpretationProvider } from './provider'

export class DeterministicInterpretationProvider implements InterpretationProvider {
  readonly name = 'deterministic-fallback'

  async interpret(input: CheckInInput): Promise<InterpretationPayload> {
    const engineResult = interpretCheckIn(input)
    return mapEngineResultToInterpretationPayload(engineResult)
  }
}

export const deterministicInterpretationProvider =
  new DeterministicInterpretationProvider()
