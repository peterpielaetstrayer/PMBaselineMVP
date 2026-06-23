import { TodayCommandCenter } from "@/components/baseline/today-command-center"
import { getTodayWorkspace, resolveTodayGreeting } from "@/lib/server/today-workspace"

export default async function TodayPage() {
  const workspace = await getTodayWorkspace()
  const greeting = resolveTodayGreeting(
    workspace?.displayName,
    workspace?.email ?? "there"
  )

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <TodayCommandCenter
        greeting={greeting}
        latestLoop={workspace?.latestLoop ?? null}
      />

      {(workspace?.profileMissing || workspace?.baselineProfileMissing) && (
        <p className="mt-6 rounded-lg border border-sand-neutral bg-sand-neutral/40 px-4 py-3 text-sm text-navy-text/80">
          Your profile is still settling in. A quick check-in works anytime.
        </p>
      )}
    </div>
  )
}
