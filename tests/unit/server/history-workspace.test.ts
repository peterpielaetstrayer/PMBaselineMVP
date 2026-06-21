import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { loadHistoryWorkspaceWithClient } from '@/lib/server/history-workspace'

const checkInId = '770e8400-e29b-41d4-a716-446655440002'

function createHistoryClient(options: {
  checkIns?: Array<{ id: string; created_at: string }>
  interpretations?: Array<Record<string, unknown>>
  actionRecords?: Array<Record<string, unknown>>
  reflections?: Array<Record<string, unknown>>
}) {
  const {
    checkIns = [],
    interpretations = [],
    actionRecords = [],
    reflections = [],
  } = options

  return {
    auth: {
      getUser: async () => ({
        data: { user: { id: 'user-123' } },
        error: null,
      }),
    },
    from: (table: string) => {
      const chain: Record<string, unknown> = {}
      chain.select = () => chain
      chain.eq = () => chain
      chain.in = () => chain
      chain.order = () => chain
      chain.limit = () => chain
      chain.then = (resolve: (value: unknown) => void) => {
        if (table === 'check_ins') {
          resolve({ data: checkIns, error: null })
          return
        }
        if (table === 'interpretations') {
          resolve({ data: interpretations, error: null })
          return
        }
        if (table === 'action_records') {
          resolve({ data: actionRecords, error: null })
          return
        }
        if (table === 'reflections') {
          resolve({ data: reflections, error: null })
          return
        }
        resolve({ data: [], error: null })
      }
      return chain
    },
  } as never
}

describe('loadHistoryWorkspaceWithClient', () => {
  it('returns empty items when user has no check-ins', async () => {
    const workspace = await loadHistoryWorkspaceWithClient(
      createHistoryClient({ checkIns: [] })
    )

    expect(workspace.items).toEqual([])
  })

  it('composes stored records without recomputing interpretation', async () => {
    const workspace = await loadHistoryWorkspaceWithClient(
      createHistoryClient({
        checkIns: [{ id: checkInId, created_at: '2026-06-14T12:00:00.000Z' }],
        interpretations: [
          {
            check_in_id: checkInId,
            proposed_mode: 'maintain',
            summary: 'Keep what is working.',
            created_at: '2026-06-14T12:00:01.000Z',
          },
        ],
        actionRecords: [
          {
            check_in_id: checkInId,
            action_payload: { title: 'Protect sleep window' },
            action_text: 'Protect sleep window',
            status: 'accepted',
            created_at: '2026-06-14T12:05:00.000Z',
          },
        ],
        reflections: [
          {
            check_in_id: checkInId,
            effect: 'helped',
            final_baseline_score: 8,
            created_at: '2026-06-14T13:00:00.000Z',
          },
        ],
      })
    )

    expect(workspace.items).toHaveLength(1)
    expect(workspace.items[0]?.status).toBe('complete')
    expect(workspace.items[0]?.summary).toBe('Keep what is working.')
    expect(workspace.items[0]?.acceptedActionTitle).toBe('Protect sleep window')
  })
})

describe('history canonical isolation', () => {
  const projectRoot = join(process.cwd())

  it('history loader modules do not import legacy storage', () => {
    const files = [
      'lib/server/history-workspace.ts',
      'lib/data/history.ts',
      'lib/baseline/history-item.ts',
    ]

    for (const file of files) {
      const source = readFileSync(join(projectRoot, file), 'utf8')
      expect(source).not.toMatch(/hybridStorage|lib\/storage|reminderService/)
    }
  })
})
