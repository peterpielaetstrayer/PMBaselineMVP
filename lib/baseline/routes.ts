export const BASELINE_ROUTES = {
  today: '/today',
  checkIn: '/check-in',
  result: (checkInId: string) => `/result/${checkInId}`,
} as const
