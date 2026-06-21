import Link from "next/link"
import type { HistoryItem } from "@/lib/baseline/history-item"
import {
  formatHistoryItemDate,
  historyItemStatusLabel,
} from "@/lib/baseline/history-item"
import { formatBaselineMode } from "@/lib/baseline/display"
import type { BaselineMode } from "@/lib/baseline/types"

interface HistoryDayCardProps {
  item: HistoryItem
}

function formatReflectionEffect(effect: string): string {
  return effect.replace(/_/g, " ")
}

export function HistoryDayCard({ item }: HistoryDayCardProps) {
  const modeLabel =
    item.proposedMode != null
      ? formatBaselineMode(item.proposedMode as BaselineMode)
      : null

  return (
    <article className="rounded-2xl border border-ocean-light/60 bg-white/90 p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-ocean-deep/80">
            {formatHistoryItemDate(item.createdAt)}
          </p>
          {modeLabel ? (
            <h2 className="mt-1 text-lg font-semibold text-navy-text">
              {modeLabel.title}
            </h2>
          ) : (
            <h2 className="mt-1 text-lg font-semibold text-navy-text">
              Check-in saved
            </h2>
          )}
        </div>
        <span className="rounded-full bg-ocean-light/30 px-3 py-1 text-xs font-medium text-ocean-deep">
          {historyItemStatusLabel(item.status)}
        </span>
      </div>

      {item.summary ? (
        <p className="mt-3 text-sm leading-relaxed text-navy-text/80">
          {item.summary}
        </p>
      ) : null}

      {item.acceptedActionTitle ? (
        <p className="mt-3 text-sm text-navy-text/80">
          <span className="font-medium">Action:</span> {item.acceptedActionTitle}
        </p>
      ) : null}

      {item.reflectionEffect ? (
        <p className="mt-2 text-sm text-navy-text/80">
          <span className="font-medium">Effect:</span>{" "}
          <span className="capitalize">
            {formatReflectionEffect(item.reflectionEffect)}
          </span>
        </p>
      ) : null}

      {item.finalBaselineScore != null ? (
        <p className="mt-2 text-sm text-navy-text/70">
          Final baseline score: {item.finalBaselineScore}/10
        </p>
      ) : null}

      <Link
        href={item.linkPath}
        className="mt-4 inline-block text-sm font-medium text-ocean-deep hover:underline"
      >
        {item.status === "complete"
          ? "View result"
          : item.status === "reflection_pending"
            ? "Continue to reflection"
            : "Continue loop"}
      </Link>
    </article>
  )
}
