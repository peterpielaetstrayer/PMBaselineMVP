export const BASELINE_ROUTES = {
  root: '/',
  login: '/login',
  today: '/today',
  history: '/history',
  checkIn: '/check-in',
  legacy: '/legacy',
  result: (checkInId: string) => `/result/${checkInId}`,
  reflect: (checkInId: string) => `/reflect/${checkInId}`,
} as const
