import { BASELINE_ROUTES } from '@/lib/baseline/routes'

export type ResultReflectionFollowUp =
  | { kind: 'none' }
  | { kind: 'reflect'; reflectPath: string }
  | { kind: 'complete'; todayPath: string }

export function resolveResultReflectionFollowUp(input: {
  hasAcceptedAction: boolean
  reflectionComplete: boolean
  checkInId: string
}): ResultReflectionFollowUp {
  if (!input.hasAcceptedAction) {
    return { kind: 'none' }
  }

  if (input.reflectionComplete) {
    return { kind: 'complete', todayPath: BASELINE_ROUTES.today }
  }

  return { kind: 'reflect', reflectPath: BASELINE_ROUTES.reflect(input.checkInId) }
}

export function shouldShowReflectCTA(followUp: ResultReflectionFollowUp): boolean {
  return followUp.kind === 'reflect'
}

export function shouldShowReflectionSaved(followUp: ResultReflectionFollowUp): boolean {
  return followUp.kind === 'complete'
}
