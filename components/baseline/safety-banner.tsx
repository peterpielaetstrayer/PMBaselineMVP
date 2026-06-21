import {
  formatSafetyBannerCopy,
  shouldShowSafetyBanner,
} from "@/lib/baseline/display"
import type { SafetyResult } from "@/lib/validation/safety"

interface SafetyBannerProps {
  safety: SafetyResult
}

export function SafetyBanner({ safety }: SafetyBannerProps) {
  if (!shouldShowSafetyBanner(safety)) {
    return null
  }

  const copy = formatSafetyBannerCopy(safety)
  const tone =
    safety.level === "urgent"
      ? "border-warning-orange/40 bg-warning-orange/10"
      : safety.level === "support"
        ? "border-ocean-light bg-ocean-light/30"
        : "border-sand-neutral bg-sand-neutral/40"

  return (
    <div className={`rounded-xl border px-4 py-3 ${tone}`}>
      <p className="text-sm font-semibold text-navy-text">{copy.title}</p>
      <p className="mt-1 text-sm leading-relaxed text-navy-text/80">{copy.body}</p>
    </div>
  )
}
