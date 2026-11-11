import Link from "next/link"
import { PersonalPathForm } from "@/components/baseline/personal-path-form"
import { getBaselineProfile } from "@/lib/data/baseline-profiles"
import {
  EMPTY_PERSONAL_PATH,
  personalPathFromProfile,
  MAX_PATH_PRIORITIES,
} from "@/lib/baseline/personal-path"
import { BASELINE_ROUTES } from "@/lib/baseline/routes"
import { createClient } from "@/lib/supabase/server"

export default async function MyPathPage() {
  const client = await createClient()
  const profile = await getBaselineProfile(client)
  const unavailable = !profile.ok && profile.error.code !== "NOT_FOUND"
  const path = profile.ok
    ? personalPathFromProfile(profile.data)
    : EMPTY_PERSONAL_PATH
  const needsLegacyReview = path.priorities.length > MAX_PATH_PRIORITIES

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-8">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-wide text-ocean-deep/80">
          My path
        </p>
        <h1 className="font-serif text-3xl font-normal text-navy-text sm:text-4xl">
          Your direction, your terms.
        </h1>
        <p className="max-w-xl text-sm leading-relaxed text-navy-text/70">
          Start with what matters, not an idealized checklist. Your direction can
          change as you learn more about yourself.
        </p>
        <Link
          href={BASELINE_ROUTES.today}
          className="inline-block rounded-md text-sm font-semibold text-ocean-deep underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean-deep/50"
        >
          Back to today
        </Link>
      </div>

      {unavailable ? (
        <div role="status" className="rounded-xl border border-ocean-light/50 bg-white p-5 text-sm text-navy-text/80">
          We couldn't load your path right now. Your existing information has not been changed.
        </div>
      ) : needsLegacyReview ? (
        <div role="status" className="rounded-xl border border-ocean-light/50 bg-white p-5 text-sm text-navy-text/80">
          This account already has more than three saved priorities. The first
          editor won't silently replace them. We'll need a fuller editing view
          before changing this list.
        </div>
      ) : (
        <PersonalPathForm initial={path} />
      )}
    </div>
  )
}
