import { describe, expect, it } from 'vitest'
import {
  resolveAuthenticatedLoginRedirect,
  resolveRootRedirect,
  resolveUnauthenticatedAppRedirect,
} from '@/lib/auth/routing'

describe('auth routing decisions', () => {
  it('redirects authenticated users away from /login to /today', () => {
    expect(resolveAuthenticatedLoginRedirect(true)).toBe('/today')
    expect(resolveAuthenticatedLoginRedirect(false)).toBeNull()
  })

  it('redirects unauthenticated users away from app routes to /login', () => {
    expect(resolveUnauthenticatedAppRedirect(false)).toBe('/login')
    expect(resolveUnauthenticatedAppRedirect(true)).toBeNull()
  })

  it('redirects root based on auth state', () => {
    expect(resolveRootRedirect(true)).toBe('/today')
    expect(resolveRootRedirect(false)).toBe('/login')
  })
})
