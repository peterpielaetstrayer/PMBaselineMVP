/** Authenticated users visiting /login should go to the workspace. */
export function resolveAuthenticatedLoginRedirect(
  isAuthenticated: boolean
): '/today' | null {
  return isAuthenticated ? '/today' : null
}

/** Unauthenticated users visiting protected app routes should sign in. */
export function resolveUnauthenticatedAppRedirect(
  isAuthenticated: boolean
): '/login' | null {
  return isAuthenticated ? null : '/login'
}
