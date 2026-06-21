import type { BaselineMode } from '@/lib/baseline/types'
import type { SafetyResult } from '@/lib/validation/safety'

const MODE_LABELS: Record<BaselineMode, { title: string; subtitle: string }> = {
  stabilize: {
    title: 'Stabilize',
    subtitle: 'Protect baseline and reduce load',
  },
  rebuild: {
    title: 'Rebuild',
    subtitle: 'Restore baseline with gentle structure',
  },
  maintain: {
    title: 'Maintain',
    subtitle: 'Keep what is already supporting you',
  },
  expand: {
    title: 'Expand',
    subtitle: 'Room for a stretch when baseline is steady',
  },
}

export function formatBaselineMode(mode: BaselineMode) {
  return MODE_LABELS[mode]
}

export function formatConfidenceLanguage(confidence: number): string {
  if (confidence < 0.4) {
    return 'A tentative read — we may need more context over time.'
  }
  if (confidence < 0.7) {
    return 'A reasonable read based on what you shared.'
  }
  return 'A fairly clear picture from your check-in.'
}

export function shouldShowSafetyBanner(safety: SafetyResult): boolean {
  return safety.level !== 'standard' || Boolean(safety.message)
}

export function formatSafetyBannerCopy(safety: SafetyResult): {
  title: string
  body: string
} {
  if (safety.level === 'urgent') {
    return {
      title: 'Take immediate support seriously',
      body:
        safety.message ??
        'If you are at risk of harm, reach out to someone you trust or local emergency services now. PMBaseline can suggest a right-sized next move, but it is not crisis care.',
    }
  }

  if (safety.level === 'support') {
    return {
      title: 'Extra support may help today',
      body:
        safety.message ??
        'Consider lowering expectations and choosing moves that protect baseline. A trusted person or professional support can help too.',
    }
  }

  return {
    title: 'Notice',
    body: safety.message ?? '',
  }
}
