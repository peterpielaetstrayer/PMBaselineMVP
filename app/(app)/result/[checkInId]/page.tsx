import Link from "next/link"
import { notFound } from "next/navigation"
import { AcceptedActionCard } from "@/components/baseline/accepted-action-card"
import { ActionChoiceList } from "@/components/baseline/action-choice-list"
import { ModeResultCard } from "@/components/baseline/mode-result-card"
import { resolveResultActionSectionView } from "@/lib/baseline/result-action-section"
import { loadStoredCheckInResult } from "@/lib/server/check-in-result"

interface ResultPageProps {
  params: Promise<{ checkInId: string }>
}

export default async function ResultPage({ params }: ResultPageProps) {
  const { checkInId } = await params
  const result = await loadStoredCheckInResult(checkInId)

  if (!result) {
    notFound()
  }

  const actionSection = resolveResultActionSectionView(result.acceptedAction)

  return (
    <div className="mx-auto max-w-2xl space-y-8 px-4 py-8">
      <Link
        href="/today"
        className="inline-block text-sm text-ocean-deep hover:underline"
      >
        ← Back to today
      </Link>

      <ModeResultCard interpretation={result.interpretation} />

      {actionSection.kind === "accepted" ? (
        <AcceptedActionCard action={actionSection.action} />
      ) : (
        <ActionChoiceList interpretation={result.interpretation} />
      )}
    </div>
  )
}
