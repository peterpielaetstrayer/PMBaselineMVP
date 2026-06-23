import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { resolveRootRedirect } from '@/lib/auth/routing'
import { BASELINE_ROUTES } from '@/lib/baseline/routes'

const projectRoot = join(process.cwd())

describe('root and legacy routing', () => {
  it('redirects authenticated users from / to /today', () => {
    expect(resolveRootRedirect(true)).toBe('/today')
  })

  it('redirects unauthenticated users from / to /login', () => {
    expect(resolveRootRedirect(false)).toBe('/login')
  })

  it('root page uses resolveRootRedirect', () => {
    const source = readFileSync(join(projectRoot, 'app/page.tsx'), 'utf8')
    expect(source).toContain('resolveRootRedirect')
    expect(source).toContain('redirect(')
  })

  it('legacy route renders LegacyApp with retirement banner', () => {
    const source = readFileSync(join(projectRoot, 'app/legacy/page.tsx'), 'utf8')
    expect(source).toContain('LegacyApp')
    expect(source).toContain('will be retired')
    expect(BASELINE_ROUTES.legacy).toBe('/legacy')
  })

  it('today page uses command center', () => {
    const source = readFileSync(
      join(projectRoot, 'app/(app)/today/page.tsx'),
      'utf8'
    )
    expect(source).toContain('TodayCommandCenter')
    expect(source).not.toContain('BASELINE_ROUTES.checkIn')
  })

  it('app header includes today and history navigation', () => {
    const source = readFileSync(
      join(projectRoot, 'components/app/app-header.tsx'),
      'utf8'
    )
    expect(source).toContain('BASELINE_ROUTES.today')
    expect(source).toContain('BASELINE_ROUTES.history')
    expect(source).toContain('BASELINE_ROUTES.login')
  })

  it('canonical forms use user-facing error formatting', () => {
    const files = [
      'components/baseline/quick-check-in-form.tsx',
      'components/baseline/reflection-form.tsx',
      'components/baseline/action-choice-list.tsx',
    ]

    for (const file of files) {
      const source = readFileSync(join(projectRoot, file), 'utf8')
      expect(source).toContain('formatActionErrorForUser')
    }
  })
})
