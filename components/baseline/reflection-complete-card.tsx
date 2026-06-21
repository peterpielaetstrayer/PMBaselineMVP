import Link from "next/link"
import type { StoredReflection } from "@/lib/validation/reflection"
import { BASELINE_ROUTES } from "@/lib/baseline/routes"
import { Button } from "@/components/ui/button"

interface ReflectionCompleteCardProps {
  reflection: StoredReflection
}

export function ReflectionCompleteCard({ reflection }: ReflectionCompleteCardProps) {
  return (
    <section className="rounded-2xl border border-ocean-light/60 bg-white/90 p-6 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-ocean-deep">
        Reflection saved
      </p>
      <p className="mt-2 text-lg font-semibold capitalize text-navy-text">
        Effect: {reflection.effect}
      </p>
      {reflection.whatChanged ? (
        <p className="mt-3 text-sm text-navy-text/80">
          <span className="font-medium">What changed:</span> {reflection.whatChanged}
        </p>
      ) : null}
      {reflection.whatWasProtected ? (
        <p className="mt-2 text-sm text-navy-text/80">
          <span className="font-medium">Protected:</span> {reflection.whatWasProtected}
        </p>
      ) : null}
      {reflection.lesson ? (
        <p className="mt-2 text-sm text-navy-text/80">
          <span className="font-medium">Learned:</span> {reflection.lesson}
        </p>
      ) : null}
      {reflection.finalBaselineScore != null ? (
        <p className="mt-2 text-sm text-navy-text/70">
          Final baseline score: {reflection.finalBaselineScore}/10
        </p>
      ) : null}
      <Button asChild className="mt-6 w-full sm:w-auto">
        <Link href={BASELINE_ROUTES.today}>Back to today</Link>
      </Button>
    </section>
  )
}
