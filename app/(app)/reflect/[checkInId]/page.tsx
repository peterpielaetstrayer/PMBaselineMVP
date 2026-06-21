import Link from "next/link"
import { notFound } from "next/navigation"
import { ReflectionCompleteCard } from "@/components/baseline/reflection-complete-card"
import { ReflectionForm } from "@/components/baseline/reflection-form"
import { AcceptedActionCard } from "@/components/baseline/accepted-action-card"
import { PageBackLink } from "@/components/baseline/page-back-link"
import { BASELINE_ROUTES } from "@/lib/baseline/routes"
import { resolveResultReflectionFollowUp } from "@/lib/baseline/result-reflection-section"
import { loadReflectWorkspace } from "@/lib/server/reflect-workspace"

interface ReflectPageProps {
  params: Promise<{ checkInId: string }>
}

export default async function ReflectPage({ params }: ReflectPageProps) {
  const { checkInId } = await params
  const workspace = await loadReflectWorkspace(checkInId)

  if (!workspace) {
    notFound()
  }

  const reflectionFollowUp = resolveResultReflectionFollowUp({
    hasAcceptedAction: true,
    reflectionComplete: Boolean(workspace.reflection),
    checkInId,
  })

  return (
    <div className="mx-auto max-w-2xl space-y-8 px-4 py-8">
      <PageBackLink
        href={BASELINE_ROUTES.result(checkInId)}
        label="Back to result"
      />

      <AcceptedActionCard
        action={workspace.acceptedAction}
        reflectionFollowUp={reflectionFollowUp}
      />

      {workspace.reflection ? (
        <ReflectionCompleteCard reflection={workspace.reflection} />
      ) : (
        <ReflectionForm
          checkInId={workspace.checkInId}
          actionRecordId={workspace.actionRecordId}
          reflectionPrompt={workspace.interpretation.reflectionPrompt}
        />
      )}
    </div>
  )
}
