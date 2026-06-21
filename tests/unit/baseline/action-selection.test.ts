import { describe, expect, it } from 'vitest'
import {
  buildAcceptActionInput,
  buildCustomActionInput,
} from '@/lib/baseline/action-selection'
import { AcceptActionInputSchema } from '@/lib/validation/accepted-action'

const primaryAction = {
  id: 'maintain-one-anchor',
  title: 'Keep one anchor',
  description: 'Complete one familiar routine.',
  estimatedMinutes: 20,
  domain: 'recovery' as const,
}

describe('action selection payloads', () => {
  const checkInId = '770e8400-e29b-41d4-a716-446655440002'
  const interpretationId = '880e8400-e29b-41d4-a716-446655440003'

  it('builds primary acceptAction input', () => {
    const input = buildAcceptActionInput(
      checkInId,
      interpretationId,
      'primary',
      primaryAction
    )

    expect(() => AcceptActionInputSchema.parse(input)).not.toThrow()
    expect(input.actionSource).toBe('primary')
    expect(input.action).toEqual(primaryAction)
  })

  it('builds alternative acceptAction input', () => {
    const alternative = {
      ...primaryAction,
      id: 'alt-hydrate',
      title: 'Drink water',
      domain: 'hydration' as const,
    }

    const input = buildAcceptActionInput(
      checkInId,
      interpretationId,
      'alternative',
      alternative
    )

    expect(input.actionSource).toBe('alternative')
    expect(input.action.id).toBe('alt-hydrate')
  })

  it('builds valid custom action payload', () => {
    const action = buildCustomActionInput(
      'Text a friend',
      'Send one supportive message.',
      'connection',
      'custom-abc123'
    )

    expect(action.id).toBe('custom-abc123')
    expect(() =>
      AcceptActionInputSchema.parse(
        buildAcceptActionInput(checkInId, interpretationId, 'user', action)
      )
    ).not.toThrow()
  })
})
