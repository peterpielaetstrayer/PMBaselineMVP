import Link from "next/link"
import { BASELINE_ROUTES } from "@/lib/baseline/routes"
import { Button } from "@/components/ui/button"

interface UnavailableStateProps {
  title: string
  description: string
  actionLabel?: string
  actionHref?: string
}

export function UnavailableState({
  title,
  description,
  actionLabel = "Back to today",
  actionHref = BASELINE_ROUTES.today,
}: UnavailableStateProps) {
  return (
    <section className="rounded-2xl border border-ocean-light/60 bg-white/90 p-8 text-center shadow-sm">
      <h2 className="text-xl font-semibold text-navy-text">{title}</h2>
      <p className="mt-3 text-sm leading-relaxed text-navy-text/70">{description}</p>
      <Button asChild className="mt-6" variant="outline">
        <Link href={actionHref}>{actionLabel}</Link>
      </Button>
    </section>
  )
}
