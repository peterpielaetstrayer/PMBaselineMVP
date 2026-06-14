import type { BaselineAction } from './types'

const MINUTES_FLOOR = 2

const SHRINK_PATTERNS: Array<{
  pattern: RegExp
  replacement: string
}> = [
  { pattern: /\b(\d+)\s*-\s*(\d+)\s*minutes?\b/i, replacement: '$1 minutes' },
  { pattern: /\b(\d+)\s*minutes?\b/i, replacement: `${MINUTES_FLOOR} minutes` },
  { pattern: /\blong(er)?\b/i, replacement: 'brief' },
  { pattern: /\bworkout\b/i, replacement: 'mobility break' },
  { pattern: /\bwalk\b/i, replacement: 'short walk' },
  { pattern: /\bcomplete one small, clearly defined obligation or work block\b/i, replacement: 'open the task and do the first two-minute step' },
  { pattern: /\bcomplete one familiar routine\b/i, replacement: 'do the smallest version of one familiar routine' },
  { pattern: /\bfocused time on study, skill-building, or creative work\b/i, replacement: 'ten focused minutes on one topic' },
]

/**
 * Converts an action into a smaller realistic version while preserving its purpose.
 */
export function shrinkAction(action: BaselineAction): BaselineAction {
  let description = action.description
  for (const { pattern, replacement } of SHRINK_PATTERNS) {
    description = description.replace(pattern, replacement)
  }

  if (!description.toLowerCase().includes('smallest') && !description.toLowerCase().includes('first')) {
    description = `Smallest version: ${description.charAt(0).toLowerCase()}${description.slice(1)}`
  }

  let estimatedMinutes = action.estimatedMinutes
  if (estimatedMinutes !== null) {
    estimatedMinutes = Math.max(MINUTES_FLOOR, Math.ceil(estimatedMinutes / 2))
  }

  const title = action.title.startsWith('Minimum:')
    ? action.title
    : `Minimum: ${action.title.charAt(0).toLowerCase()}${action.title.slice(1)}`

  return {
    id: action.id,
    title,
    description,
    estimatedMinutes,
    domain: action.domain,
  }
}

export function canShrinkAction(action: BaselineAction): boolean {
  return action.domain !== 'safety'
}
