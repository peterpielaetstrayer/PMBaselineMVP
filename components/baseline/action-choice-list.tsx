"use client"

import { useState } from "react"
import { acceptAction } from "@/lib/actions/action"
import {
  buildAcceptActionInput,
  buildCustomActionInput,
} from "@/lib/baseline/action-selection"
import type { BaselineActionDTO } from "@/lib/validation/action"
import type { StoredInterpretation } from "@/lib/validation/interpretation"
import type { AcceptedAction } from "@/lib/validation/accepted-action"
import { ActionDomainSchema } from "@/lib/validation/enums"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AcceptedActionCard } from "./accepted-action-card"

interface ActionChoiceListProps {
  interpretation: StoredInterpretation
}

const DOMAIN_OPTIONS = ActionDomainSchema.options

export function ActionChoiceList({ interpretation }: ActionChoiceListProps) {
  const [accepted, setAccepted] = useState<AcceptedAction | null>(null)
  const [pendingKey, setPendingKey] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showCustom, setShowCustom] = useState(false)
  const [customTitle, setCustomTitle] = useState("")
  const [customDescription, setCustomDescription] = useState("")
  const [customDomain, setCustomDomain] =
    useState<BaselineActionDTO["domain"]>("custom")

  const accept = async (
    actionSource: "primary" | "alternative" | "user",
    action: BaselineActionDTO
  ) => {
    setPendingKey(action.id)
    setError(null)

    const result = await acceptAction(
      buildAcceptActionInput(
        interpretation.checkInId,
        interpretation.interpretationId,
        actionSource,
        action
      )
    )

    setPendingKey(null)

    if (!result.ok) {
      setError(result.error.message)
      return
    }

    setAccepted(result.data)
  }

  const acceptCustom = async () => {
    if (!customTitle.trim() || !customDescription.trim()) {
      setError("Add a short title and description for your custom move.")
      return
    }

    const customId = `custom-${crypto.randomUUID()}`
    const action = buildCustomActionInput(
      customTitle,
      customDescription,
      customDomain,
      customId
    )

    await accept("user", action)
  }

  if (accepted) {
    return <AcceptedActionCard action={accepted.action} />
  }

  return (
    <section className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-navy-text">
          Choose a right-sized next move
        </h3>
        <p className="mt-1 text-sm text-navy-text/70">
          Pick what fits today. You can always choose something smaller than the
          original plan.
        </p>
      </div>

      {error ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <ActionOptionCard
        label="Suggested next move"
        action={interpretation.primaryAction}
        pending={pendingKey === interpretation.primaryAction.id}
        onAccept={() => accept("primary", interpretation.primaryAction)}
      />

      {interpretation.alternatives.map((action) => (
        <ActionOptionCard
          key={action.id}
          label="Alternative"
          action={action}
          pending={pendingKey === action.id}
          onAccept={() => accept("alternative", action)}
        />
      ))}

      {!showCustom ? (
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => setShowCustom(true)}
        >
          Choose a different move
        </Button>
      ) : (
        <div className="space-y-3 rounded-xl border border-ocean-light/60 bg-white/80 p-4">
          <p className="text-sm font-medium text-navy-text">Your own next move</p>
          <div className="space-y-2">
            <Label htmlFor="custom-title">Title</Label>
            <Input
              id="custom-title"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              placeholder="e.g. Drink water"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="custom-description">What will you do?</Label>
            <Textarea
              id="custom-description"
              value={customDescription}
              onChange={(e) => setCustomDescription(e.target.value)}
              placeholder="Keep it small and specific."
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label>Domain</Label>
            <Select
              value={customDomain}
              onValueChange={(value) =>
                setCustomDomain(value as BaselineActionDTO["domain"])
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a domain" />
              </SelectTrigger>
              <SelectContent>
                {DOMAIN_OPTIONS.map((domain) => (
                  <SelectItem key={domain} value={domain}>
                    {domain}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            type="button"
            className="w-full"
            disabled={Boolean(pendingKey)}
            onClick={acceptCustom}
          >
            {pendingKey ? "Saving..." : "Accept this move"}
          </Button>
        </div>
      )}
    </section>
  )
}

function ActionOptionCard({
  label,
  action,
  pending,
  onAccept,
}: {
  label: string
  action: BaselineActionDTO
  pending: boolean
  onAccept: () => void
}) {
  return (
    <div className="rounded-xl border border-ocean-light/50 bg-white/90 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-ocean-deep/80">
        {label}
      </p>
      <h4 className="mt-2 font-semibold text-navy-text">{action.title}</h4>
      <p className="mt-1 text-sm leading-relaxed text-navy-text/75">
        {action.description}
      </p>
      {action.estimatedMinutes ? (
        <p className="mt-2 text-xs text-navy-text/55">
          About {action.estimatedMinutes} minutes
        </p>
      ) : null}
      <Button
        type="button"
        className="mt-4 w-full"
        disabled={pending}
        onClick={onAccept}
      >
        {pending ? "Saving..." : "Accept this move"}
      </Button>
    </div>
  )
}
