import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { buildActionPersistenceFields } from '@/lib/validation/action-persistence'
import { shrinkAction } from '@/lib/baseline/action-shrinker'
import type { BaselineAction } from '@/lib/baseline/types'

const migrationPath = join(
  process.cwd(),
  'supabase/migrations/20260614130000_phase2_hardening.sql'
)
const migrationSql = readFileSync(migrationPath, 'utf8')

const primaryAction: BaselineAction = {
  id: 'maintain-one-anchor',
  title: 'Keep one anchor',
  description: 'Complete one familiar routine.',
  estimatedMinutes: 20,
  domain: 'recovery',
}

describe('phase2 hardening migration SQL', () => {
  it('backfills null submission_id before NOT NULL', () => {
    expect(migrationSql).toMatch(
      /update public\.check_ins[\s\S]*set submission_id = gen_random_uuid\(\)[\s\S]*where submission_id is null/i
    )
    expect(migrationSql).toMatch(
      /alter table public\.check_ins[\s\S]*alter column submission_id set not null/i
    )
  })

  it('replaces partial unique index with full unique index on user_id and submission_id', () => {
    expect(migrationSql).toMatch(/drop index if exists public\.check_ins_user_submission_id_unique/i)
    expect(migrationSql).toMatch(
      /create unique index check_ins_user_submission_id_unique[\s\S]*on public\.check_ins \(user_id, submission_id\)/i
    )
    expect(migrationSql).not.toMatch(/where submission_id is not null/i)
  })

  it('fails migration when duplicate interpretations exist instead of deleting rows', () => {
    expect(migrationSql).toMatch(/having count\(\*\) > 1/i)
    expect(migrationSql).toMatch(/raise exception[\s\S]*interpretations_check_in_id_unique/i)
    expect(migrationSql).not.toMatch(/delete from public\.interpretations/i)
  })

  it('adds one interpretation per check-in unique index with Phase 3 comment', () => {
    expect(migrationSql).toMatch(
      /create unique index if not exists interpretations_check_in_id_unique[\s\S]*on public\.interpretations \(check_in_id\)/i
    )
    expect(migrationSql).toMatch(/Phase 3 may introduce explicit interpretation versioning/i)
  })

  it('backfills action_key and action_payload before NOT NULL', () => {
    expect(migrationSql).toMatch(/add column if not exists action_key text/i)
    expect(migrationSql).toMatch(/add column if not exists action_payload jsonb/i)
    expect(migrationSql).toMatch(/jsonb_build_object\(/i)
    expect(migrationSql).toMatch(/alter column action_payload set not null/i)
  })

  it('restricts RPC execute to authenticated only', () => {
    expect(migrationSql).toMatch(
      /revoke all on function public\.submit_check_in_with_interpretation\([\s\S]*\) from public;/i
    )
    expect(migrationSql).toMatch(
      /revoke all on function public\.submit_check_in_with_interpretation\([\s\S]*\) from anon;/i
    )
    expect(migrationSql).toMatch(
      /grant execute on function public\.submit_check_in_with_interpretation\([\s\S]*\) to authenticated;/i
    )
  })

  it('uses deterministic single-interpretation replay without order/limit', () => {
    expect(migrationSql).toMatch(
      /from public\.interpretations i[\s\S]*where i\.check_in_id = v_check_in_id[\s\S]*and i\.user_id = v_user_id;/i
    )
    expect(migrationSql).not.toMatch(/order by i\.created_at desc/)
  })

  it('rejects null submission_id in RPC', () => {
    expect(migrationSql).toMatch(/if p_submission_id is null then[\s\S]*submission_id is required/i)
  })
})

describe('buildActionPersistenceFields', () => {
  it('preserves primary action key and full payload', () => {
    const fields = buildActionPersistenceFields(primaryAction, 'primary')
    expect(fields.actionKey).toBe('maintain-one-anchor')
    expect(fields.actionPayload).toEqual(primaryAction)
    expect(fields.actionText).toBe('Keep one anchor: Complete one familiar routine.')
    expect(fields.actionDomain).toBe('recovery')
  })

  it('preserves alternative action key and payload', () => {
    const alternative: BaselineAction = {
      id: 'alt-hydrate',
      title: 'Drink water',
      description: 'Have one glass of water.',
      estimatedMinutes: 2,
      domain: 'hydration',
    }

    const fields = buildActionPersistenceFields(alternative, 'alternative')
    expect(fields.actionKey).toBe('alt-hydrate')
    expect(fields.actionPayload).toEqual(alternative)
  })

  it('preserves shrunk action payload with same action key', () => {
    const shrunk = shrinkAction(primaryAction)
    const fields = buildActionPersistenceFields(shrunk, 'primary')

    expect(fields.actionKey).toBe(primaryAction.id)
    expect(fields.actionPayload.title).toMatch(/^Minimum:/)
    expect(fields.actionPayload.description.toLowerCase()).toContain('smallest version')
    expect(fields.actionPayload.estimatedMinutes).toBeLessThan(primaryAction.estimatedMinutes!)
  })

  it('generates stable custom action key and payload for user actions', () => {
    const customAction: BaselineAction = {
      id: 'my-note',
      title: 'Send one message',
      description: 'Text a friend.',
      estimatedMinutes: 5,
      domain: 'connection',
    }

    const fields = buildActionPersistenceFields(customAction, 'user')
    expect(fields.actionKey).toMatch(/^custom-[0-9a-f-]{36}$/i)
    expect(fields.actionPayload.id).toBe(fields.actionKey)
    expect(fields.actionPayload.title).toBe(customAction.title)
  })

  it('keeps provided custom-* id for user actions', () => {
    const customAction: BaselineAction = {
      id: 'custom-abc123',
      title: 'Stretch',
      description: 'Two minute stretch.',
      estimatedMinutes: 2,
      domain: 'movement',
    }

    const fields = buildActionPersistenceFields(customAction, 'user')
    expect(fields.actionKey).toBe('custom-abc123')
    expect(fields.actionPayload).toEqual(customAction)
  })
})
