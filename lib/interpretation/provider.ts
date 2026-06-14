import type { CheckInInput } from '@/lib/baseline/types'
import type { InterpretationPayload } from '@/lib/validation/interpretation'

export interface InterpretationProvider {
  readonly name: string
  interpret(input: CheckInInput): Promise<InterpretationPayload>
}
