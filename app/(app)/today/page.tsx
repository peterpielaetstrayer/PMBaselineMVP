import { getTodayWorkspace, resolveTodayGreeting } from "@/lib/server/today-workspace"

export default async function TodayPage() {
  const workspace = await getTodayWorkspace()
  const greeting = resolveTodayGreeting(
    workspace?.displayName,
    workspace?.email ?? "there"
  )

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <section className="space-y-6">
        <div className="space-y-2">
          <p className="text-sm font-medium uppercase tracking-wide text-ocean-deep/80">
            Baseline workspace
          </p>
          <h1 className="text-3xl font-bold text-navy-text">Hi, {greeting}</h1>
        </div>

        <div className="rounded-2xl border border-ocean-light/60 bg-white/90 p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-navy-text">
            Where are you right now?
          </h2>
          <p className="mt-3 text-navy-text/70 leading-relaxed">
            PMBaseline helps you notice your current state and choose a
            right-sized next move — not the ideal plan, but what actually fits
            today.
          </p>
        </div>

        {(workspace?.profileMissing || workspace?.baselineProfileMissing) && (
          <p className="rounded-lg border border-sand-neutral bg-sand-neutral/40 px-4 py-3 text-sm text-navy-text/80">
            Your profile is still settling in. You can start a check-in anytime;
            we&apos;ll learn more about your baseline as you go.
          </p>
        )}

        <div
          aria-label="Check-in flow coming soon"
          className="rounded-2xl border border-dashed border-ocean-deep/25 bg-ocean-light/10 px-6 py-10 text-center"
        >
          <p className="text-sm font-medium text-ocean-deep">
            Quick check-in
          </p>
          <p className="mt-2 text-sm text-navy-text/60">
            Coming in the next release — score how you are, get a realistic next
            action, and reflect on what helped.
          </p>
        </div>
      </section>
    </div>
  )
}
