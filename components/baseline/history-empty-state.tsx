import Link from "next/link"
import { BASELINE_ROUTES } from "@/lib/baseline/routes"
import { Button } from "@/components/ui/button"

export function HistoryEmptyState() {
  return (
    <section className="rounded-2xl border border-ocean-light/60 bg-white/90 p-8 text-center shadow-sm">
      <h2 className="text-xl font-semibold text-navy-text">No check-ins yet</h2>
      <p className="mt-3 text-sm leading-relaxed text-navy-text/70">
        Your recent baseline loops will show up here after you check in.
      </p>
      <Button asChild className="mt-6">
        <Link href={BASELINE_ROUTES.checkIn}>Check in</Link>
      </Button>
    </section>
  )
}
