export type ResultActionSectionView =
  | { kind: 'accepted'; action: import('@/lib/validation/action').BaselineActionDTO }
  | { kind: 'choice' }

export function resolveResultActionSectionView(
  acceptedAction: import('@/lib/validation/action').BaselineActionDTO | null | undefined
): ResultActionSectionView {
  if (acceptedAction) {
    return { kind: 'accepted', action: acceptedAction }
  }

  return { kind: 'choice' }
}

export function shouldRenderActionChoiceList(
  acceptedAction: import('@/lib/validation/action').BaselineActionDTO | null | undefined
): boolean {
  return resolveResultActionSectionView(acceptedAction).kind === 'choice'
}
