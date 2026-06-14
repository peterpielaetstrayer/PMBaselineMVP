import type { AuthenticatedSupabaseClient } from '@/lib/data/session'

type MockQueryResult = {
  data: unknown
  error: { code?: string; message: string } | null
}

type QueryHandler = (
  table: string,
  operation: 'select' | 'update',
  filters: Record<string, unknown>
) => MockQueryResult

export function createMockSupabaseClient(options: {
  user?: { id: string } | null
  authError?: { message: string }
  onQuery?: QueryHandler
}): AuthenticatedSupabaseClient {
  const { user = null, authError, onQuery } = options

  const client = {
    auth: {
      getUser: async () => {
        if (authError) {
          return { data: { user: null }, error: authError }
        }
        return { data: { user }, error: null }
      },
    },
    from: (table: string) => {
      const filters: Record<string, unknown> = {}
      let operation: 'select' | 'update' = 'select'

      const chain = {
        select: () => chain,
        update: (updates: unknown) => {
          operation = 'update'
          filters._updates = updates
          return chain
        },
        eq: (column: string, value: unknown) => {
          filters[column] = value
          return chain
        },
        single: async () => {
          if (!onQuery) {
            return {
              data: null,
              error: { code: 'PGRST116', message: 'not found' },
            }
          }
          return onQuery(table, operation, filters)
        },
      }

      return chain
    },
  }

  return client as unknown as AuthenticatedSupabaseClient
}

export const sampleProfile = {
  id: 'user-123',
  display_name: 'Alex',
  timezone: 'America/New_York',
  onboarding_status: 'not_started',
  coaching_tone: 'warm_direct',
  memory_consent: false,
  created_at: '2026-06-13T00:00:00.000Z',
  updated_at: '2026-06-13T00:00:00.000Z',
}

export const sampleBaselineProfile = {
  id: 'baseline-456',
  user_id: 'user-123',
  known_stabilizers: ['walk'],
  known_destabilizers: ['late caffeine'],
  current_priorities: ['sleep'],
  constraints: ['early meetings'],
  preferred_minimum_actions: [],
  user_defined_baseline: null,
  created_at: '2026-06-13T00:00:00.000Z',
  updated_at: '2026-06-13T00:00:00.000Z',
}
