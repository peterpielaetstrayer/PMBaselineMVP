import type { BaselineAction, BaselineMode } from './types'

const STABILIZE_MENU: BaselineAction[] = [
  {
    id: 'stabilize-basic-need',
    title: 'Meet a basic need now',
    description: 'Eat something, drink water, or use the restroom before doing anything else.',
    estimatedMinutes: 10,
    domain: 'nutrition',
  },
  {
    id: 'stabilize-reset',
    title: 'Five-minute reset',
    description: 'Sit, breathe slowly, and reduce stimulation for five minutes.',
    estimatedMinutes: 5,
    domain: 'regulation',
  },
  {
    id: 'stabilize-protect-hour',
    title: 'Protect the next hour',
    description: 'Cancel or defer non-essential tasks and focus on safety, food, and calm.',
    estimatedMinutes: 15,
    domain: 'recovery',
  },
  {
    id: 'stabilize-reach-support',
    title: 'Reach for support',
    description: 'Text or call someone safe who can help you get through the next step.',
    estimatedMinutes: 10,
    domain: 'connection',
  },
]

const REBUILD_MENU: BaselineAction[] = [
  {
    id: 'rebuild-walk-stretch',
    title: 'Short walk or stretch',
    description: 'Five to ten minutes of gentle movement to reconnect body and mind.',
    estimatedMinutes: 10,
    domain: 'movement',
  },
  {
    id: 'rebuild-essential-block',
    title: 'One essential block',
    description: 'Complete one small, clearly defined obligation or work block.',
    estimatedMinutes: 25,
    domain: 'work',
  },
  {
    id: 'rebuild-simple-meal',
    title: 'Simple meal or snack',
    description: 'Prepare or eat something with protein to support steady energy.',
    estimatedMinutes: 15,
    domain: 'nutrition',
  },
  {
    id: 'rebuild-tidy-surface',
    title: 'Tidy one surface',
    description: 'Clear or reset one small area to create a little external order.',
    estimatedMinutes: 10,
    domain: 'environment',
  },
]

const MAINTAIN_MENU: BaselineAction[] = [
  {
    id: 'maintain-one-anchor',
    title: 'Keep one anchor',
    description: 'Complete one familiar routine that usually supports your baseline.',
    estimatedMinutes: 20,
    domain: 'recovery',
  },
  {
    id: 'maintain-next-obligation',
    title: 'Handle the next obligation',
    description: 'Move one planned task forward without adding extra goals.',
    estimatedMinutes: 30,
    domain: 'work',
  },
  {
    id: 'maintain-recovery-time',
    title: 'Protect recovery time',
    description: 'Schedule a short break, meal, or wind-down you would normally want today.',
    estimatedMinutes: 15,
    domain: 'recovery',
  },
  {
    id: 'maintain-check-in',
    title: 'Brief check-in with someone',
    description: 'Send a short message or have a quick conversation that keeps connection steady.',
    estimatedMinutes: 10,
    domain: 'connection',
  },
]

const EXPAND_MENU: BaselineAction[] = [
  {
    id: 'expand-stretch-goal',
    title: 'Take on one stretch goal',
    description: 'Choose one meaningful challenge that fits your current capacity.',
    estimatedMinutes: 45,
    domain: 'work',
  },
  {
    id: 'expand-movement',
    title: 'Longer movement session',
    description: 'A walk, workout, or active session you have been postponing.',
    estimatedMinutes: 30,
    domain: 'movement',
  },
  {
    id: 'expand-learning',
    title: 'Deep learning block',
    description: 'Focused time on study, skill-building, or creative work.',
    estimatedMinutes: 40,
    domain: 'work',
  },
  {
    id: 'expand-experiment',
    title: 'Plan a deliberate experiment',
    description: 'Design one small test for the week that could improve your baseline.',
    estimatedMinutes: 20,
    domain: 'custom',
  },
]

const URGENT_SAFETY_MENU: BaselineAction[] = [
  {
    id: 'urgent-seek-support',
    title: 'Seek immediate human support',
    description:
      'Contact someone you trust, a local crisis line, or emergency services if you may be in danger.',
    estimatedMinutes: null,
    domain: 'safety',
  },
  {
    id: 'urgent-safer-place',
    title: 'Move to a safer place',
    description: 'Reduce immediate risk by changing your environment or removing harmful access.',
    estimatedMinutes: null,
    domain: 'safety',
  },
]

const MODE_MENUS: Record<BaselineMode, BaselineAction[]> = {
  stabilize: STABILIZE_MENU,
  rebuild: REBUILD_MENU,
  maintain: MAINTAIN_MENU,
  expand: EXPAND_MENU,
}

export const SUPPORT_ACTION_DOMAINS: BaselineAction['domain'][] = [
  'connection',
  'regulation',
  'recovery',
]

export function getSupportDomainActions(): BaselineAction[] {
  const sources = [...STABILIZE_MENU, ...MAINTAIN_MENU]
  const unique: BaselineAction[] = []
  const seen = new Set<string>()

  for (const action of sources) {
    if (!SUPPORT_ACTION_DOMAINS.includes(action.domain) || seen.has(action.id)) {
      continue
    }
    seen.add(action.id)
    unique.push({ ...action })
  }

  return unique
}

export function getChoiceMenuForMode(mode: BaselineMode): BaselineAction[] {
  return MODE_MENUS[mode].map((action) => ({ ...action }))
}

export function getUrgentSafetyActions(): BaselineAction[] {
  return URGENT_SAFETY_MENU.map((action) => ({ ...action }))
}

export function selectActionsForMode(
  mode: BaselineMode,
  count: number,
  options?: { prioritizeDomains?: BaselineAction['domain'][] }
): BaselineAction[] {
  const menu = getChoiceMenuForMode(mode)
  let ordered = menu

  if (options?.prioritizeDomains?.length) {
    ordered = [
      ...menu.filter((action) => options.prioritizeDomains!.includes(action.domain)),
      ...menu.filter((action) => !options.prioritizeDomains!.includes(action.domain)),
    ]
  }

  const unique: BaselineAction[] = []
  const seen = new Set<string>()
  for (const action of ordered) {
    if (seen.has(action.id)) continue
    seen.add(action.id)
    unique.push(action)
    if (unique.length >= count) break
  }

  return unique
}

export function getAvoidForNow(mode: BaselineMode): string[] {
  switch (mode) {
    case 'stabilize':
      return [
        'Adding multiple new goals',
        'Treating missed habits as failure',
        'Major life optimization plans',
      ]
    case 'rebuild':
      return [
        'Aggressive performance targets',
        'Overhauling your entire routine at once',
        'Comparing today to your best-ever day',
      ]
    case 'maintain':
      return [
        'Unnecessary extra commitments',
        'Skipping recovery to squeeze in more',
      ]
    case 'expand':
      return [
        'Sacrificing sleep or recovery for output',
        'Stacking several ambitious changes at once',
      ]
  }
}
