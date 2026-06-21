import { describe, expect, it } from 'vitest'
import {
  loadTodayWorkspace,
  resolveTodayGreeting,
} from '@/lib/server/today-workspace'
import {
  createMockSupabaseClient,
  sampleBaselineProfile,
  sampleProfile,
} from '../../helpers/mock-supabase'

describe('resolveTodayGreeting', () => {
  it('prefers display name over email', () => {
    expect(resolveTodayGreeting('Alex', 'alex@example.com')).toBe('Alex')
  })

  it('falls back to email when display name is missing', () => {
    expect(resolveTodayGreeting(null, 'alex@example.com')).toBe('alex@example.com')
  })

  it('falls back to email when display name is blank', () => {
    expect(resolveTodayGreeting('   ', 'alex@example.com')).toBe('alex@example.com')
  })
})

describe('loadTodayWorkspace', () => {
  it('loads profile and baseline profile for authenticated user', async () => {
    const client = createMockSupabaseClient({
      user: { id: 'user-123' },
      onQuery: (table) => {
        if (table === 'profiles') {
          return { data: sampleProfile, error: null }
        }
        if (table === 'baseline_profiles') {
          return { data: sampleBaselineProfile, error: null }
        }
        return { data: null, error: { code: 'PGRST116', message: 'not found' } }
      },
    })

    const workspace = await loadTodayWorkspace(client, {
      email: 'alex@example.com',
    })

    expect(workspace.displayName).toBe('Alex')
    expect(workspace.profile?.id).toBe('user-123')
    expect(workspace.baselineProfile?.user_id).toBe('user-123')
    expect(workspace.profileMissing).toBe(false)
    expect(workspace.baselineProfileMissing).toBe(false)
    expect(workspace.hasSavedReflection).toBe(false)
    expect(workspace.latestLoop).toBeNull()
  })

  it('reports saved reflection when latest reflection exists', async () => {
    const client = createMockSupabaseClient({
      user: { id: 'user-123' },
      onQuery: (table) => {
        if (table === 'profiles') {
          return { data: sampleProfile, error: null }
        }
        if (table === 'baseline_profiles') {
          return { data: sampleBaselineProfile, error: null }
        }
        if (table === 'reflections') {
          return {
            data: {
              id: 'aa0e8400-e29b-41d4-a716-446655440005',
              user_id: 'user-123',
              check_in_id: '770e8400-e29b-41d4-a716-446655440002',
              effect: 'helped',
            },
            error: null,
          }
        }
        if (table === 'check_ins') {
          return { data: [], error: null }
        }
        return { data: null, error: { code: 'PGRST116', message: 'not found' } }
      },
    })

    const workspace = await loadTodayWorkspace(client, {
      email: 'alex@example.com',
    })

    expect(workspace.hasSavedReflection).toBe(true)
  })

  it('handles missing profile rows gracefully', async () => {
    const client = createMockSupabaseClient({
      user: { id: 'user-123' },
      onQuery: () => ({
        data: null,
        error: { code: 'PGRST116', message: 'not found' },
      }),
    })

    const workspace = await loadTodayWorkspace(client, {
      email: 'alex@example.com',
    })

    expect(workspace.profile).toBeNull()
    expect(workspace.baselineProfile).toBeNull()
    expect(workspace.profileMissing).toBe(true)
    expect(workspace.baselineProfileMissing).toBe(true)
    expect(workspace.hasSavedReflection).toBe(false)
    expect(workspace.latestLoop).toBeNull()
    expect(resolveTodayGreeting(workspace.displayName, workspace.email)).toBe(
      'alex@example.com'
    )
  })
})
