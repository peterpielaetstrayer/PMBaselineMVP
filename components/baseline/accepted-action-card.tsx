import type { BaselineActionDTO } from "@/lib/validation/action"

interface AcceptedActionCardProps {
  action: BaselineActionDTO
}

export function AcceptedActionCard({ action }: AcceptedActionCardProps) {
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
      <p className="mt-4 text-sm text-navy-text/70">
        Do this next. Reflection comes next in Phase 2.3.
      </p>
    </section>
  )
}
