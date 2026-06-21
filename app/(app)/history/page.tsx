import { HistoryDayCard } from "@/components/baseline/history-day-card"
import { HistoryEmptyState } from "@/components/baseline/history-empty-state"
import { PageBackLink } from "@/components/baseline/page-back-link"
import { UnavailableState } from "@/components/baseline/unavailable-state"
import { BASELINE_ROUTES } from "@/lib/baseline/routes"
import { loadHistoryWorkspace } from "@/lib/server/history-workspace"

export default async function HistoryPage() {
  const { items, loadUnavailable } = await loadHistoryWorkspace()

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-ocean-deep/80">
            Your loops
          </p>
          <h1 className="text-3xl font-bold text-navy-text">History</h1>
          <p className="mt-2 text-sm text-navy-text/70">
            Recent check-ins and how each loop ended — no recomputing, just what
            you saved.
          </p>
        </div>
        <PageBackLink
          href={BASELINE_ROUTES.today}
          label="Back to today"
          className="mb-0 shrink-0"
        />
      </div>

      {loadUnavailable ? (
        <UnavailableState
          title="History unavailable right now"
          description="We could not load your recent loops. Your data should still be safe — try again in a moment."
          actionLabel="Back to today"
          actionHref={BASELINE_ROUTES.today}
        />
      ) : items.length === 0 ? (
        <HistoryEmptyState />
      ) : (
        <ul className="space-y-4">
          {items.map((item) => (
            <li key={item.checkInId}>
              <HistoryDayCard item={item} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
