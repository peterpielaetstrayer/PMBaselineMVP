import Link from "next/link"
import { LegacyApp } from "@/components/legacy/legacy-app"
import { BASELINE_ROUTES } from "@/lib/baseline/routes"

export default function LegacyPage() {
  return (
    <>
      <div
        role="status"
        className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-sm text-amber-950"
      >
        Legacy app — this is the old habit/minimum experience and will be retired.
        Use{" "}
        <Link href={BASELINE_ROUTES.today} className="font-medium underline">
          Today
        </Link>{" "}
        for the canonical PMBaseline loop.
      </div>
      <LegacyApp />
    </>
  )
}
