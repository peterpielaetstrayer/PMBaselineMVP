import Link from "next/link"
import { BASELINE_ROUTES } from "@/lib/baseline/routes"

export default function ReflectNotFound() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center">
      <h1 className="text-2xl font-bold text-navy-text">Reflection not ready yet</h1>
      <p className="mt-3 text-sm leading-relaxed text-navy-text/70">
        Accept a right-sized next move on the result page first, then come back
        here to reflect on what it protected.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link
          href={BASELINE_ROUTES.today}
          className="inline-block text-sm font-medium text-ocean-deep hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean-deep/40 rounded-sm"
        >
          Back to today
        </Link>
        <Link
          href={BASELINE_ROUTES.history}
          className="inline-block text-sm font-medium text-ocean-deep hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean-deep/40 rounded-sm"
        >
          View history
        </Link>
      </div>
    </div>
  )
}
