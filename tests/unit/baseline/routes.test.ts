import { describe, expect, it } from 'vitest'
import { BASELINE_ROUTES } from '@/lib/baseline/routes'

describe('baseline routes', () => {
  it('points today CTA to /check-in', () => {
    expect(BASELINE_ROUTES.checkIn).toBe('/check-in')
    expect(BASELINE_ROUTES.today).toBe('/today')
  })

  it('builds result route from check-in id', () => {
    expect(BASELINE_ROUTES.result('770e8400-e29b-41d4-a716-446655440002')).toBe(
      '/result/770e8400-e29b-41d4-a716-446655440002'
    )
  })
})
