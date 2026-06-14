import {
  getAvoidForNow,
  getSupportDomainActions,
  getUrgentSafetyActions,
  selectActionsForMode,
  SUPPORT_ACTION_DOMAINS,
} from './choice-menus'
import { BASELINE_ENGINE_VERSION, MODE_SUMMARIES, NON_DIAGNOSTIC_DISCLAIMER } from './modes'
import type {
  BasicNeedStatus,
  BasicNeedsStatus,
  BaselineAction,
  BaselineMode,
  CheckInInput,
  ModeClassification,
  ModeInterpretationResult,
  ReasonCode,
  SafetyLevel,
  Score,
} from './types'

// ---------------------------------------------------------------------------
// Thresholds — priority rules, not a weighted wellness score.
// ---------------------------------------------------------------------------

const STRESS_HIGH = 7
const STRESS_MODERATE = 5
const ENERGY_LOW = 4
const ENERGY_MODERATE_LOW = 5
const ENERGY_STRONG = 7
const SLEEP_POOR = 3
const SLEEP_ADEQUATE = 6
const SCORE_LOW = 3
const SCORE_STRONG = 6

interface ClassificationState {
  factors: string[]
  reasonCodes: ReasonCode[]
}

function isKnown(value: Score | null | undefined): value is Score {
  return value !== null && value !== undefined
}

function countMissingScores(input: CheckInInput): number {
  return [input.physical, input.mental, input.energy, input.stress].filter(
    (value) => !isKnown(value)
  ).length
}

function getBasicNeedStatuses(basicNeeds?: BasicNeedsStatus): BasicNeedStatus[] {
  if (!basicNeeds) return []
  return [basicNeeds.food, basicNeeds.hydration, basicNeeds.sleep].filter(
    (status): status is BasicNeedStatus => status !== undefined
  )
}

function hasUnmetBasicNeeds(basicNeeds?: BasicNeedsStatus): boolean {
  return getBasicNeedStatuses(basicNeeds).some((status) => status === 'unmet')
}

function hasPartialBasicNeeds(basicNeeds?: BasicNeedsStatus): boolean {
  return getBasicNeedStatuses(basicNeeds).some((status) => status === 'partial')
}

function countUnknownBasicNeeds(basicNeeds?: BasicNeedsStatus): number {
  return getBasicNeedStatuses(basicNeeds).filter((status) => status === 'unknown').length
}

function isPoorSleep(input: CheckInInput): boolean {
  return isKnown(input.sleep) && input.sleep <= SLEEP_POOR
}

function isContradictory(input: CheckInInput): boolean {
  const { physical, mental, energy, stress } = input
  if (isKnown(energy) && isKnown(stress) && energy >= 8 && stress >= 8) return true
  if (isKnown(physical) && isKnown(mental) && physical >= 8 && mental <= 3) return true
  if (isKnown(physical) && isKnown(mental) && physical <= 3 && mental >= 8) return true
  if (isKnown(energy) && isKnown(physical) && energy <= 3 && physical >= 8) return true
  return false
}

function resolveSafetyLevel(input: CheckInInput): SafetyLevel {
  return input.safetyLevel ?? 'standard'
}

function pushReason(state: ClassificationState, code: ReasonCode, factor: string): void {
  if (!state.reasonCodes.includes(code)) {
    state.reasonCodes.push(code)
  }
  state.factors.push(factor)
}

function buildConfidencePenalty(input: CheckInInput): number {
  let penalty = 0
  penalty += countMissingScores(input) * 0.08
  penalty += countUnknownBasicNeeds(input.basicNeeds) * 0.05
  if (input.sleep === null) penalty += 0.05
  if (isContradictory(input)) penalty += 0.12
  return Math.min(penalty, 0.45)
}

function needsMoreInformation(input: CheckInInput): boolean {
  return (
    countMissingScores(input) >= 2 ||
    (input.sleep === null && countMissingScores(input) >= 1) ||
    countUnknownBasicNeeds(input.basicNeeds) >= 2
  )
}

function capModeForSupport(mode: BaselineMode, safetyLevel: SafetyLevel): BaselineMode {
  if (safetyLevel === 'support' && mode === 'maintain') {
    return 'rebuild'
  }
  return mode
}

function canExpand(input: CheckInInput, state: ClassificationState): boolean {
  if (hasUnmetBasicNeeds(input.basicNeeds)) {
    pushReason(state, 'UNMET_BASIC_NEEDS', 'Unmet basic needs block expansion for now')
    return false
  }
  if (isPoorSleep(input)) {
    pushReason(state, 'POOR_SLEEP', 'Poor sleep makes expansion unwise today')
    return false
  }
  if (resolveSafetyLevel(input) !== 'standard') {
    pushReason(state, 'SUPPORT_LEVEL_PRESENT', 'Current safety level suggests against expansion')
    return false
  }

  const required = [input.energy, input.stress, input.physical, input.mental]
  if (required.some((value) => !isKnown(value))) {
    pushReason(state, 'INSUFFICIENT_INFORMATION', 'Incomplete scores prevent a confident expand recommendation')
    return false
  }

  const energy = input.energy!
  const stress = input.stress!
  const physical = input.physical!
  const mental = input.mental!

  if (
    energy >= ENERGY_STRONG &&
    stress <= STRESS_MODERATE - 2 &&
    physical >= SCORE_STRONG &&
    mental >= SCORE_STRONG &&
    (!isKnown(input.sleep) || input.sleep! >= SLEEP_ADEQUATE)
  ) {
    pushReason(state, 'STRONG_STABLE_CAPACITY', 'Strong, balanced capacity across multiple signals')
    return true
  }

  state.factors.push('Capacity is not consistently strong enough for expansion')
  return false
}

/**
 * Classify check-in into a baseline mode using transparent priority rules.
 */
export function classifyMode(input: CheckInInput): ModeClassification {
  const state: ClassificationState = { factors: [], reasonCodes: [] }
  const safetyLevel = resolveSafetyLevel(input)

  if (safetyLevel === 'urgent') {
    return {
      mode: 'stabilize',
      confidence: 0.95,
      factors: ['Urgent safety level requires stabilization, not ordinary coaching'],
      reasonCodes: ['URGENT_SAFETY_OVERRIDE'],
      needsMoreInformation: false,
    }
  }

  if (safetyLevel === 'support') {
    pushReason(state, 'SUPPORT_LEVEL_PRESENT', 'Support-level safety routing favors gentle rebuilding')
  }

  if (hasUnmetBasicNeeds(input.basicNeeds)) {
    pushReason(state, 'UNMET_BASIC_NEEDS', 'Unmet basic needs take priority over optimization')
    return finalizeClassification('stabilize', input, state)
  }

  const stress = input.stress
  const energy = input.energy

  if (isKnown(stress) && isKnown(energy) && stress >= STRESS_HIGH && energy <= ENERGY_LOW) {
    if (stress >= 8 || energy <= 2) {
      pushReason(state, 'HIGH_STRESS_LOW_ENERGY', 'High stress with very low energy')
      return finalizeClassification('stabilize', input, state)
    }
    pushReason(state, 'HIGH_STRESS_LOW_ENERGY', 'High stress with limited energy')
    return finalizeClassification('rebuild', input, state)
  }

  if (isKnown(stress) && stress >= 8) {
    pushReason(state, 'VERY_HIGH_STRESS', 'Very high stress')
    return finalizeClassification('stabilize', input, state)
  }

  if (isKnown(energy) && energy <= 2) {
    pushReason(state, 'VERY_LOW_ENERGY', 'Very low energy')
    return finalizeClassification('stabilize', input, state)
  }

  if (
    isKnown(input.physical) &&
    isKnown(input.mental) &&
    input.physical <= SCORE_LOW &&
    input.mental <= SCORE_LOW
  ) {
    pushReason(state, 'LOW_PHYSICAL_AND_MENTAL', 'Both physical and mental scores are very low')
    return finalizeClassification('stabilize', input, state)
  }

  if (isPoorSleep(input)) {
    pushReason(state, 'POOR_SLEEP', 'Poor sleep quality')
    if (isKnown(energy) && energy <= ENERGY_MODERATE_LOW) {
      return finalizeClassification('rebuild', input, state)
    }
  }

  if (input.hasUrgentObligation) {
    if (isKnown(energy) && energy <= ENERGY_MODERATE_LOW) {
      pushReason(state, 'URGENT_OBLIGATION_LOW_CAPACITY', 'An urgent obligation is present with limited energy')
      return finalizeClassification('rebuild', input, state)
    }
    state.factors.push('An urgent obligation is present')
  }

  if (hasPartialBasicNeeds(input.basicNeeds)) {
    pushReason(state, 'PARTIAL_BASIC_NEEDS', 'Some basic needs are only partially met')
    return finalizeClassification('rebuild', input, state)
  }

  if (canExpand(input, state)) {
    return finalizeClassification('expand', input, state)
  }

  if (
    isKnown(energy) &&
    isKnown(stress) &&
    energy >= ENERGY_MODERATE_LOW &&
    energy <= ENERGY_STRONG &&
    stress <= STRESS_MODERATE &&
    (!isKnown(input.physical) || input.physical! >= 4) &&
    (!isKnown(input.mental) || input.mental! >= 4)
  ) {
    pushReason(state, 'MODERATE_STABLE_CAPACITY', 'Moderate, relatively stable capacity')
    return finalizeClassification('maintain', input, state)
  }

  if (
    isKnown(energy) &&
    energy <= ENERGY_MODERATE_LOW + 1 &&
    isKnown(stress) &&
    stress >= STRESS_MODERATE
  ) {
    pushReason(state, 'DEFAULT_REBUILD', 'Limited energy with elevated stress')
    return finalizeClassification('rebuild', input, state)
  }

  pushReason(state, 'DEFAULT_REBUILD', 'Mixed or moderate signals favor gentle rebuilding')
  return finalizeClassification('rebuild', input, state)
}

function finalizeClassification(
  mode: BaselineMode,
  input: CheckInInput,
  state: ClassificationState
): ModeClassification {
  const safetyLevel = resolveSafetyLevel(input)
  const cappedMode = capModeForSupport(mode, safetyLevel)

  if (isContradictory(input)) {
    pushReason(state, 'CONTRADICTORY_SIGNALS', 'Some check-in signals point in different directions')
  }

  const needsInfo = needsMoreInformation(input)
  if (needsInfo) {
    pushReason(state, 'INSUFFICIENT_INFORMATION', 'More check-in information would improve this interpretation')
  }

  const baseConfidence: Record<BaselineMode, number> = {
    stabilize: 0.82,
    rebuild: 0.74,
    maintain: 0.7,
    expand: 0.68,
  }

  let confidence = baseConfidence[cappedMode] - buildConfidencePenalty(input)
  confidence = Math.max(0.35, Math.min(0.95, confidence))

  return {
    mode: cappedMode,
    confidence: roundConfidence(confidence),
    factors: state.factors,
    reasonCodes: state.reasonCodes,
    needsMoreInformation: needsInfo,
  }
}

function roundConfidence(value: number): number {
  return Math.round(value * 100) / 100
}

function buildExplanation(mode: BaselineMode, factors: string[]): string {
  const factorText =
    factors.length > 0
      ? ` Key factors: ${factors.slice(0, 3).join('; ')}.`
      : ''
  return `${MODE_SUMMARIES[mode]}${factorText} ${NON_DIAGNOSTIC_DISCLAIMER}`
}

function buildUrgentResult(): ModeInterpretationResult {
  const actions = getUrgentSafetyActions()
  return {
    proposedMode: 'stabilize',
    engineVersion: BASELINE_ENGINE_VERSION,
    confidence: 0.98,
    explanation:
      'Your check-in suggests a situation that needs immediate human support rather than ordinary self-coaching. This is not a diagnosis — please reach out for help now.',
    factors: ['Urgent safety level detected'],
    reasonCodes: ['URGENT_SAFETY_OVERRIDE'],
    primaryAction: actions[0],
    alternatives: actions.slice(1, 3),
    avoidForNow: [
      'Ordinary productivity or habit coaching',
      'Trying to handle a possible emergency alone through the app',
    ],
    needsMoreInformation: false,
    safety: {
      level: 'urgent',
      message:
        'If you may be in immediate danger, contact local emergency services or a trusted person right now.',
    },
  }
}

function prioritizedDomains(input: CheckInInput, safetyLevel: SafetyLevel): BaselineAction['domain'][] {
  const domains: BaselineAction['domain'][] = []
  const basic = input.basicNeeds

  if (safetyLevel === 'support') {
    domains.push(...SUPPORT_ACTION_DOMAINS)
  }

  if (basic?.food === 'unmet' || basic?.food === 'partial') domains.push('nutrition')
  if (basic?.hydration === 'unmet' || basic?.hydration === 'partial') domains.push('hydration')
  if (basic?.sleep === 'unmet' || basic?.sleep === 'partial' || isPoorSleep(input)) {
    domains.push('recovery')
  }
  if (input.hasUrgentObligation) domains.push('work')
  if (input.stress !== null && input.stress !== undefined && input.stress >= STRESS_HIGH) {
    domains.push('regulation')
  }

  return domains
}

function hasSupportDomainAction(actions: BaselineAction[]): boolean {
  return actions.some((action) => SUPPORT_ACTION_DOMAINS.includes(action.domain))
}

function ensureSupportDomainAction(
  mode: BaselineMode,
  primaryAction: BaselineAction,
  alternatives: BaselineAction[]
): { primaryAction: BaselineAction; alternatives: BaselineAction[] } {
  const combined = [primaryAction, ...alternatives]
  if (hasSupportDomainAction(combined)) {
    return { primaryAction, alternatives }
  }

  const supportAction = getSupportDomainActions()[0]
  if (!supportAction) {
    return { primaryAction, alternatives }
  }

  const usedIds = new Set(combined.map((action) => action.id))
  if (usedIds.has(supportAction.id)) {
    return { primaryAction, alternatives }
  }

  return {
    primaryAction: supportAction,
    alternatives: [primaryAction, ...alternatives.filter((action) => action.id !== supportAction.id)].slice(0, 3),
  }
}

/**
 * Full deterministic interpretation: mode + menu-backed actions + guidance.
 */
export function interpretCheckIn(input: CheckInInput): ModeInterpretationResult {
  if (resolveSafetyLevel(input) === 'urgent') {
    return buildUrgentResult()
  }

  const classification = classifyMode(input)
  const safetyLevel = resolveSafetyLevel(input)
  const domains = prioritizedDomains(input, safetyLevel)
  const selected = selectActionsForMode(classification.mode, 4, {
    prioritizeDomains: domains,
  })

  let primaryAction = selected[0]
  let alternatives = selected.slice(1, 4)

  if (safetyLevel === 'support') {
    ;({ primaryAction, alternatives } = ensureSupportDomainAction(
      classification.mode,
      primaryAction,
      alternatives
    ))
  }

  const safetyMessage =
    safetyLevel === 'support'
      ? 'Consider additional human support alongside these suggestions.'
      : null

  return {
    proposedMode: classification.mode,
    engineVersion: BASELINE_ENGINE_VERSION,
    confidence: classification.confidence,
    explanation: buildExplanation(classification.mode, classification.factors),
    factors: classification.factors,
    reasonCodes: classification.reasonCodes,
    primaryAction,
    alternatives,
    avoidForNow: getAvoidForNow(classification.mode),
    needsMoreInformation: classification.needsMoreInformation,
    safety: {
      level: safetyLevel,
      message: safetyMessage,
    },
  }
}

export { isContradictory, hasUnmetBasicNeeds, canExpand, needsMoreInformation }
