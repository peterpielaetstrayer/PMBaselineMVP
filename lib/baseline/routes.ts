export const BASELINE_ROUTES = {
  today: '/today',
  checkIn: '/check-in',
  result: (checkInId: string) => `/result/${checkInId}`,
  reflect: (checkInId: string) => `/reflect/${checkInId}`,
} as const
