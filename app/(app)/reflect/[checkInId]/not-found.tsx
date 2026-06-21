import Link from "next/link"
import { BASELINE_ROUTES } from "@/lib/baseline/routes"

export default function ReflectNotFound() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center">
      <h1 className="text-2xl font-bold text-navy-text">Reflection unavailable</h1>
      <p className="mt-3 text-sm text-navy-text/70">
        Accept a next move first, then return here to reflect on what it
        protected.
      </p>
      <Link
        href={BASELINE_ROUTES.today}
        className="mt-6 inline-block text-sm font-medium text-ocean-deep hover:underline"
      >
        Back to today
      </Link>
    </div>
  )
}
