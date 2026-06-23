import Link from "next/link"
import type { HistoryItem } from "@/lib/baseline/history-item"
import { formatHistoryItemDate } from "@/lib/baseline/history-item"
import { resolveTodayNextStep } from "@/lib/baseline/loop-step"
import { formatBaselineMode } from "@/lib/baseline/display"
import { BASELINE_ROUTES } from "@/lib/baseline/routes"
import type { BaselineMode } from "@/lib/baseline/types"
import { Button } from "@/components/ui/button"

interface TodayCommandCenterProps {
  greeting: string
  latestLoop: HistoryItem | null
}

export function TodayCommandCenter({
  greeting,
  latestLoop,
}: TodayCommandCenterProps) {
  const nextStep = resolveTodayNextStep(latestLoop)
  const modeLabel =
    latestLoop?.proposedMode != null
      ? formatBaselineMode(latestLoop.proposedMode as BaselineMode)
      : null

  return (
    <section className="space-y-5">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-navy-text sm:text-3xl">
          Hi, {greeting}
        </h1>
        <p className="text-sm text-navy-text/65">
          One useful step at a time — not a scorecard.
        </p>
      </div>

      {nextStep.focus === "unfinished" && latestLoop ? (
        <div className="rounded-2xl border-2 border-ocean-deep/25 bg-ocean-light/15 p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-ocean-deep">
            Pick up where you left off
          </p>
          <h2 className="mt-2 text-xl font-semibold text-navy-text">
            {nextStep.headline}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-navy-text/75">
            {nextStep.description}
          </p>
          {modeLabel ? (
            <p className="mt-2 text-xs text-navy-text/55">
              {formatHistoryItemDate(latestLoop.createdAt)} · {modeLabel.title}
            </p>
          ) : null}
          <Button asChild className="mt-5 w-full sm:w-auto" size="lg">
            <Link href={nextStep.primaryHref}>{nextStep.primaryLabel}</Link>
          </Button>
          {nextStep.ignoreHint ? (
            <p className="mt-3 text-xs text-navy-text/55">{nextStep.ignoreHint}</p>
          ) : null}
        </div>
      ) : null}

      <div
        className={`rounded-2xl border bg-white/90 p-5 shadow-sm ${
          nextStep.focus === "unfinished"
            ? "border-ocean-light/40"
            : "border-ocean-light/60"
        }`}
      >
        <h2 className="text-lg font-semibold text-navy-text">
          {nextStep.focus === "ready" ? nextStep.headline : "Or start fresh"}
        </h2>
        {nextStep.focus === "ready" ? (
          <p className="mt-2 text-sm leading-relaxed text-navy-text/70">
            {nextStep.description}
          </p>
        ) : (
          <p className="mt-2 text-sm text-navy-text/65">
            When this loop is done, a new quick pulse takes about a minute.
          </p>
        )}

        {nextStep.showQuickCheckIn ? (
          <div className="mt-5 flex flex-wrap gap-3">
            <Button asChild className="w-full sm:w-auto" size="lg">
              <Link href={BASELINE_ROUTES.checkIn}>
                {nextStep.quickCheckInLabel}
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full sm:w-auto" size="lg">
              <Link href={BASELINE_ROUTES.history}>View history</Link>
            </Button>
          </div>
        ) : (
          <Button
            asChild
            variant="outline"
            className="mt-5 w-full sm:w-auto"
            size="lg"
          >
            <Link href={BASELINE_ROUTES.history}>View history</Link>
          </Button>
        )}

        {nextStep.ignoreHint && nextStep.focus === "ready" ? (
          <p className="mt-3 text-xs text-navy-text/55">{nextStep.ignoreHint}</p>
        ) : null}
      </div>
    </section>
  )
}
