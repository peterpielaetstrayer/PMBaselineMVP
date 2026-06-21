import Link from "next/link"
import { notFound } from "next/navigation"
import { AcceptedActionCard } from "@/components/baseline/accepted-action-card"
import { ActionChoiceList } from "@/components/baseline/action-choice-list"
import { ModeResultCard } from "@/components/baseline/mode-result-card"
import { PageBackLink } from "@/components/baseline/page-back-link"
import { resolveResultActionSectionView } from "@/lib/baseline/result-action-section"
import { resolveResultReflectionFollowUp } from "@/lib/baseline/result-reflection-section"
import { BASELINE_ROUTES } from "@/lib/baseline/routes"
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
  const reflectionFollowUp = resolveResultReflectionFollowUp({
    hasAcceptedAction: Boolean(result.acceptedAction),
    reflectionComplete: Boolean(result.reflection),
    checkInId,
  })

  return (
    <div className="mx-auto max-w-2xl space-y-8 px-4 py-8">
      <PageBackLink href={BASELINE_ROUTES.today} label="Back to today" />

      <ModeResultCard interpretation={result.interpretation} />

      {actionSection.kind === "accepted" ? (
        <AcceptedActionCard
          action={actionSection.action}
          reflectionFollowUp={reflectionFollowUp}
        />
      ) : (
        <ActionChoiceList interpretation={result.interpretation} />
      )}
    </div>
  )
}
