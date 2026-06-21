import Link from "next/link"
import { HistoryDayCard } from "@/components/baseline/history-day-card"
import { HistoryEmptyState } from "@/components/baseline/history-empty-state"
import { BASELINE_ROUTES } from "@/lib/baseline/routes"
import { loadHistoryWorkspace } from "@/lib/server/history-workspace"

export default async function HistoryPage() {
  const { items } = await loadHistoryWorkspace()

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-ocean-deep/80">
            Your loops
          </p>
          <h1 className="text-3xl font-bold text-navy-text">History</h1>
        </div>
        <Link
          href={BASELINE_ROUTES.today}
          className="text-sm text-ocean-deep hover:underline"
        >
          Back to today
        </Link>
      </div>

      {items.length === 0 ? (
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
