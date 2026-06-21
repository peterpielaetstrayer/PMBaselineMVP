import Link from "next/link"
import { BASELINE_ROUTES } from "@/lib/baseline/routes"

export default function CheckInResultNotFound() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center">
      <h1 className="text-2xl font-bold text-navy-text">Result not available</h1>
      <p className="mt-3 text-sm leading-relaxed text-navy-text/70">
        This check-in may have been removed, is still loading, or belongs to
        another account. Start a fresh check-in when you are ready.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link
          href={BASELINE_ROUTES.checkIn}
          className="inline-block rounded-md bg-ocean-deep px-4 py-2 text-sm font-medium text-white hover:bg-ocean-deep/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean-deep/40"
        >
          Check in
        </Link>
        <Link
          href={BASELINE_ROUTES.today}
          className="inline-block text-sm font-medium text-ocean-deep hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean-deep/40 rounded-sm"
        >
          Back to today
        </Link>
      </div>
    </div>
  )
}
