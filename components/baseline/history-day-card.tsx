import Link from "next/link"
import type { HistoryItem } from "@/lib/baseline/history-item"
import { formatHistoryItemDate } from "@/lib/baseline/history-item"
import {
  historyContinueLabel,
  historyEffectLabel,
} from "@/lib/baseline/loop-step"
import { formatBaselineMode } from "@/lib/baseline/display"
import type { BaselineMode } from "@/lib/baseline/types"

interface HistoryDayCardProps {
  item: HistoryItem
}

export function HistoryDayCard({ item }: HistoryDayCardProps) {
  const modeLabel =
    item.proposedMode != null
      ? formatBaselineMode(item.proposedMode as BaselineMode)
      : null
  const effect = historyEffectLabel(item.reflectionEffect)

  return (
    <article className="rounded-xl border border-ocean-light/50 bg-white/90 p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-xs text-navy-text/55">
          {formatHistoryItemDate(item.createdAt)}
        </p>
        {modeLabel ? (
          <span className="text-sm font-semibold text-navy-text">
            {modeLabel.title}
          </span>
        ) : null}
      </div>

      {item.acceptedActionTitle ? (
        <p className="mt-2 text-sm text-navy-text">
          <span className="text-navy-text/55">Move:</span> {item.acceptedActionTitle}
          {effect ? (
            <span className="text-navy-text/65">
              {" "}
              · <span className="capitalize">{effect}</span>
            </span>
          ) : null}
        </p>
      ) : item.summary ? (
        <p className="mt-2 text-sm leading-snug text-navy-text/75 line-clamp-2">
          {item.summary}
        </p>
      ) : null}

      <Link
        href={item.linkPath}
        className="mt-3 inline-block text-sm font-medium text-ocean-deep hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean-deep/40 rounded-sm"
      >
        {historyContinueLabel(item.status)} →
      </Link>
    </article>
  )
}
