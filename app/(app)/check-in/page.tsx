import Link from "next/link"
import { QuickCheckInForm } from "@/components/baseline/quick-check-in-form"
import { BASELINE_ROUTES } from "@/lib/baseline/routes"

export default function CheckInPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link
        href={BASELINE_ROUTES.today}
        className="mb-6 inline-block text-sm text-ocean-deep hover:underline"
      >
        ← Back to today
      </Link>
      <QuickCheckInForm />
    </div>
  )
}
