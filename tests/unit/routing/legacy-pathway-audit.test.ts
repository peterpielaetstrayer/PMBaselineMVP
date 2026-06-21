import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  resolveAuthenticatedLoginRedirect,
  resolveRootRedirect,
  resolveUnauthenticatedAppRedirect,
} from '@/lib/auth/routing'
import { BASELINE_ROUTES } from '@/lib/baseline/routes'

const projectRoot = join(process.cwd())

const CANONICAL_ROUTE_FILES = [
  'app/page.tsx',
  'app/(auth)/login/page.tsx',
  'app/(auth)/login/login-page-client.tsx',
  'app/(app)/layout.tsx',
  'app/(app)/today/page.tsx',
  'app/(app)/check-in/page.tsx',
  'app/(app)/history/page.tsx',
  'app/(app)/result/[checkInId]/page.tsx',
  'app/(app)/result/[checkInId]/not-found.tsx',
  'app/(app)/reflect/[checkInId]/page.tsx',
  'app/(app)/reflect/[checkInId]/not-found.tsx',
]

const CANONICAL_COMPONENT_DIRS = [
  'components/app',
  'components/auth',
  'components/baseline',
]

const CANONICAL_SERVER_DIRS = ['lib/server', 'lib/actions']

const LEGACY_IMPORT_PATTERNS =
  /hybridStorage|reminderService|@\/lib\/storage|@\/components\/screens|@\/components\/legacy|components\/legacy/

const LEGACY_NAV_PATTERNS =
  /\/legacy|BASELINE_ROUTES\.legacy|Continue without account|guest mode|Continue without/i

function readSource(relativePath: string): string {
  return readFileSync(join(projectRoot, relativePath), 'utf8')
}

function collectSourceFiles(dir: string): string[] {
  const absoluteDir = join(projectRoot, dir)
  const entries = readdirSync(absoluteDir)
  const files: string[] = []

  for (const entry of entries) {
    const relativePath = join(dir, entry)
    const absolutePath = join(projectRoot, relativePath)
    const stats = statSync(absolutePath)

    if (stats.isDirectory()) {
      files.push(...collectSourceFiles(relativePath))
      continue
    }

    if (/\.(tsx|ts)$/.test(entry)) {
      files.push(relativePath)
    }
  }

  return files
}

describe('legacy pathway audit', () => {
  it('root redirect sends authenticated users to /today and others to /login', () => {
    expect(resolveRootRedirect(true)).toBe('/today')
    expect(resolveRootRedirect(false)).toBe('/login')
    expect(resolveAuthenticatedLoginRedirect(true)).toBe('/today')
    expect(resolveUnauthenticatedAppRedirect(false)).toBe('/login')
  })

  it('auth routing never targets /legacy', () => {
    expect(resolveRootRedirect(true)).not.toBe('/legacy')
    expect(resolveRootRedirect(false)).not.toBe('/legacy')
    expect(resolveAuthenticatedLoginRedirect(true)).not.toBe('/legacy')
    expect(resolveUnauthenticatedAppRedirect(false)).not.toBe('/legacy')
  })

  it('canonical /login has no legacy guest pathway', () => {
    const loginPage = readSource('app/(auth)/login/page.tsx')
    const loginClient = readSource('app/(auth)/login/login-page-client.tsx')
    const authForm = readSource('components/auth/auth-form.tsx')

    for (const source of [loginPage, loginClient, authForm]) {
      expect(source).not.toContain('login-screen')
      expect(source).not.toContain('LoginScreen')
      expect(source).not.toMatch(LEGACY_NAV_PATTERNS)
    }

    expect(loginClient).toContain('AuthForm')
  })

  it('app header only navigates to today and history', () => {
    const source = readSource('components/app/app-header.tsx')

    expect(source).toContain('BASELINE_ROUTES.today')
    expect(source).toContain('BASELINE_ROUTES.history')
    expect(source).not.toMatch(/BASELINE_ROUTES\.legacy|href=["']\/legacy/)
    expect(source).not.toMatch(/Continue without account|guest mode/i)
  })

  it('canonical route pages do not link to /legacy', () => {
    for (const file of CANONICAL_ROUTE_FILES) {
      const source = readSource(file)
      expect(source, file).not.toMatch(/\/legacy|BASELINE_ROUTES\.legacy/)
    }
  })

  it('canonical components do not import legacy storage or screens', () => {
    const files = CANONICAL_COMPONENT_DIRS.flatMap(collectSourceFiles)

    for (const file of files) {
      const source = readSource(file)
      expect(source, file).not.toMatch(LEGACY_IMPORT_PATTERNS)
      expect(source, file).not.toMatch(/\/legacy|BASELINE_ROUTES\.legacy/)
    }
  })

  it('canonical server loaders and actions stay legacy-free', () => {
    const files = CANONICAL_SERVER_DIRS.flatMap(collectSourceFiles)

    for (const file of files) {
      const source = readSource(file)
      expect(source, file).not.toMatch(LEGACY_IMPORT_PATTERNS)
    }
  })

  it('BASELINE_ROUTES exposes legacy only as a direct-access constant', () => {
    expect(BASELINE_ROUTES.legacy).toBe('/legacy')

    const routesSource = readSource('lib/baseline/routes.ts')
    expect(routesSource).toContain('legacy')
    expect(routesSource).toMatch(/direct-access|Do not link from canonical/i)
  })

  it('/legacy remains available with retirement banner and link to today', () => {
    const source = readSource('app/legacy/page.tsx')

    expect(source).toContain('LegacyApp')
    expect(source).toMatch(/legacy|will be retired/i)
    expect(source).toContain('BASELINE_ROUTES.today')
    expect(source).not.toContain('BASELINE_ROUTES.legacy')
  })

  it('legacy guest login wrapper is not used by canonical login route', () => {
    const loginClient = readSource('app/(auth)/login/login-page-client.tsx')
    const loginScreen = readSource('components/screens/login-screen.tsx')

    expect(loginClient).not.toContain('login-screen')
    expect(loginScreen).toContain('Continue without account')
    expect(readSource('components/legacy/legacy-app.tsx')).toContain('LoginScreen')
  })
})
