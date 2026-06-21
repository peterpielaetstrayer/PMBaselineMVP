/** Canonical route helpers. `legacy` is for direct URL access only — not canonical nav. */
export const BASELINE_ROUTES = {
  root: '/',
  login: '/login',
  today: '/today',
  history: '/history',
  checkIn: '/check-in',
  /** Direct-access fallback only. Do not link from canonical routes. */
  legacy: '/legacy',
  result: (checkInId: string) => `/result/${checkInId}`,
  reflect: (checkInId: string) => `/reflect/${checkInId}`,
} as const
