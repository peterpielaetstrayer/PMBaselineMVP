import Link from "next/link"
import {
  isPathEmpty,
  type PersonalPath,
} from "@/lib/baseline/personal-path"
import { BASELINE_ROUTES } from "@/lib/baseline/routes"

interface PersonalPathSnapshotProps {
  path: PersonalPath
}

export function PersonalPathSnapshot({ path }: PersonalPathSnapshotProps) {
  const empty = isPathEmpty(path)

  return (
    <section aria-labelledby="personal-path-heading" className="mt-6 rounded-2xl border border-ocean-light/50 bg-white/85 p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-ocean-deep/80">
            My path
          </p>
          <h2 id="personal-path-heading" className="mt-1 text-xl font-semibold text-navy-text">
            {empty ? "Start with what matters" : "The direction you've chosen"}
          </h2>
        </div>
        <Link
          className="rounded-md px-2 py-1 text-sm font-semibold text-ocean-deep underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean-deep/50"
          href={BASELINE_ROUTES.myPath}
        >
          {empty ? "Set my path" : "Edit my path"}
        </Link>
      </div>

      {empty ? (
        <p className="mt-3 text-sm leading-relaxed text-navy-text/70">
          A few words about what you care about can help shape this space over time.
        </p>
      ) : (
        <div className="mt-3 space-y-3">
          {path.baseline ? (
            <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-navy-text/80">
              {path.baseline}
            </p>
          ) : null}
          {path.priorities.length > 0 ? (
            <ul className="list-inside list-disc space-y-1 text-sm text-navy-text/80">
              {path.priorities.slice(0, 3).map((priority, index) => (
                <li key={index} className="break-words">{priority}</li>
              ))}
            </ul>
          ) : null}
        </div>
      )}
      <p className="mt-4 text-xs leading-relaxed text-navy-text/55">
        Your saved direction is visible here. Tailoring next moves to it is still in development.
      </p>
    </section>
  )
}
