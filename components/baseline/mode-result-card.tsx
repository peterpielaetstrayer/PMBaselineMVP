import {
  formatBaselineMode,
  formatConfidenceLanguage,
} from "@/lib/baseline/display"
import type { StoredInterpretation } from "@/lib/validation/interpretation"
import { SafetyBanner } from "./safety-banner"

interface ModeResultCardProps {
  interpretation: StoredInterpretation
}

export function ModeResultCard({ interpretation }: ModeResultCardProps) {
  const mode = formatBaselineMode(interpretation.proposedMode)

  return (
    <section className="space-y-4 rounded-2xl border border-ocean-light/60 bg-white/90 p-6 shadow-sm">
      <div className="space-y-1">
        <p className="text-xs font-medium uppercase tracking-wide text-ocean-deep/80">
          Your mode today
        </p>
        <h2 className="text-2xl font-bold text-navy-text">{mode.title}</h2>
        <p className="text-sm text-navy-text/70">{mode.subtitle}</p>
      </div>

      <p className="text-sm text-navy-text/60">
        {formatConfidenceLanguage(interpretation.confidence)}
      </p>

      <p className="text-base leading-relaxed text-navy-text">{interpretation.summary}</p>

      <SafetyBanner safety={interpretation.safety} />

      {interpretation.avoidForNow.length > 0 ? (
        <div className="rounded-lg bg-sand-neutral/30 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-navy-text/70">
            Avoid for now
          </p>
          <ul className="mt-2 space-y-1 text-sm text-navy-text/80">
            {interpretation.avoidForNow.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {interpretation.reflectionPrompt ? (
        <p className="text-sm italic text-navy-text/65">
          Later, reflect on: {interpretation.reflectionPrompt}
        </p>
      ) : null}
    </section>
  )
}
