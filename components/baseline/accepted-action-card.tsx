import Link from "next/link"
import type { BaselineActionDTO } from "@/lib/validation/action"
import type { ResultReflectionFollowUp } from "@/lib/baseline/result-reflection-section"
import {
  shouldShowReflectCTA,
  shouldShowReflectionSaved,
} from "@/lib/baseline/result-reflection-section"
import { Button } from "@/components/ui/button"

interface AcceptedActionCardProps {
  action: BaselineActionDTO
  reflectionFollowUp: ResultReflectionFollowUp
}

export function AcceptedActionCard({
  action,
  reflectionFollowUp,
}: AcceptedActionCardProps) {
  return (
    <section className="rounded-2xl border border-success-green/30 bg-success-green/10 p-6">
      <p className="text-xs font-semibold uppercase tracking-wide text-success-green">
        Accepted next move
      </p>
      <h3 className="mt-2 text-xl font-semibold text-navy-text">{action.title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-navy-text/80">
        {action.description}
      </p>
      {action.estimatedMinutes ? (
        <p className="mt-3 text-xs text-navy-text/60">
          About {action.estimatedMinutes} minutes
        </p>
      ) : null}

      {shouldShowReflectCTA(reflectionFollowUp) &&
      reflectionFollowUp.kind === "reflect" ? (
        <div className="mt-5 space-y-2">
          <p className="text-sm text-navy-text/70">
            Do this next, then come back and reflect on what it protected.
          </p>
          <Button asChild className="w-full sm:w-auto">
            <Link href={reflectionFollowUp.reflectPath}>Reflect on this</Link>
          </Button>
        </div>
      ) : null}

      {shouldShowReflectionSaved(reflectionFollowUp) &&
      reflectionFollowUp.kind === "complete" ? (
        <div className="mt-5 space-y-2">
          <p className="text-sm font-medium text-success-green">Reflection saved</p>
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href={reflectionFollowUp.todayPath}>Back to today</Link>
          </Button>
        </div>
      ) : null}
    </section>
  )
}
