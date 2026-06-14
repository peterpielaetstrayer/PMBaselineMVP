import { describe, expect, it } from 'vitest'
import { requireAuthenticatedUserId } from '@/lib/data/session'
import { createMockSupabaseClient } from '../../helpers/mock-supabase'

describe('auth session boundaries', () => {
  it('derives identity from auth.getUser rather than caller-supplied ids', async () => {
    const client = createMockSupabaseClient({
      user: { id: 'session-user-id' },
    })

    const result = await requireAuthenticatedUserId(client)
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data).toBe('session-user-id')
    }
  })

  it('does not authenticate when auth.getUser returns no user', async () => {
    const client = createMockSupabaseClient({ user: null })
    const result = await requireAuthenticatedUserId(client)

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe('NOT_AUTHENTICATED')
    }
  })
})

describe('supabase client configuration', () => {
  it('reports missing env vars as not configured', async () => {
    const { isSupabaseConfigured } = await import('@/lib/supabase/client')
    const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const originalKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    delete process.env.NEXT_PUBLIC_SUPABASE_URL
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    expect(isSupabaseConfigured()).toBe(false)

    process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = originalKey
  })
})
