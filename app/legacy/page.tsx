import { LegacyApp } from "@/components/legacy/legacy-app"

export default function LegacyPage() {
  return (
    <>
      <div
        role="status"
        className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-sm text-amber-950"
      >
        Legacy app — this is the old habit/minimum experience and will be retired.
        Use{" "}
        <a href="/today" className="font-medium underline">
          /today
        </a>{" "}
        for the canonical PMBaseline loop.
      </div>
      <LegacyApp />
    </>
  )
}
