import { QuickCheckInForm } from "@/components/baseline/quick-check-in-form"
import { PageBackLink } from "@/components/baseline/page-back-link"
import { BASELINE_ROUTES } from "@/lib/baseline/routes"

export default function CheckInPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <PageBackLink href={BASELINE_ROUTES.today} label="Back to today" />
      <QuickCheckInForm />
    </div>
  )
}
