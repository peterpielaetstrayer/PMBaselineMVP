import {
  composeHistoryItems,
  type HistoryItem,
} from '@/lib/baseline/history-item'
import {
  getActionRecordsForCheckInIds,
  getInterpretationsForCheckInIds,
  getRecentCheckInsForUser,
  getReflectionsForCheckInIds,
} from '@/lib/data/history'
import type { AuthenticatedSupabaseClient } from '@/lib/data/session'
import { createClient } from '@/lib/supabase/server'

export interface HistoryWorkspace {
  items: HistoryItem[]
}

export async function loadHistoryWorkspaceWithClient(
  client: AuthenticatedSupabaseClient,
  limit = 20
): Promise<HistoryWorkspace> {
  const checkInsResult = await getRecentCheckInsForUser(client, limit)
  if (!checkInsResult.ok) {
    return { items: [] }
  }

  const checkInIds = checkInsResult.data.map((row) => row.id)

  const [interpretationsResult, actionsResult, reflectionsResult] =
    await Promise.all([
      getInterpretationsForCheckInIds(client, checkInIds),
      getActionRecordsForCheckInIds(client, checkInIds),
      getReflectionsForCheckInIds(client, checkInIds),
    ])

  const items = composeHistoryItems({
    checkIns: checkInsResult.data,
    interpretations: interpretationsResult.ok ? interpretationsResult.data : [],
    actionRecords: actionsResult.ok ? actionsResult.data : [],
    reflections: reflectionsResult.ok ? reflectionsResult.data : [],
  })

  return { items }
}

export async function loadHistoryWorkspace(limit = 20): Promise<HistoryWorkspace> {
  const supabase = await createClient()
  return loadHistoryWorkspaceWithClient(supabase, limit)
}

export async function loadLatestHistoryItem(
  client: AuthenticatedSupabaseClient
): Promise<HistoryItem | null> {
  const workspace = await loadHistoryWorkspaceWithClient(client, 1)
  return workspace.items[0] ?? null
}
