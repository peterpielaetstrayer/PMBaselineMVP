"use client"

import { useState } from "react"
import { acceptAction } from "@/lib/actions/action"
import {
  buildAcceptActionInput,
  buildCustomActionInput,
} from "@/lib/baseline/action-selection"
import { BASELINE_ROUTES } from "@/lib/baseline/routes"
import { formatActionErrorForUser } from "@/lib/baseline/user-messages"
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
import { FormErrorBanner } from "./form-error-banner"

interface ActionChoiceListProps {
  interpretation: StoredInterpretation
}

const DOMAIN_OPTIONS = ActionDomainSchema.options

export function ActionChoiceList({ interpretation }: ActionChoiceListProps) {
  const [accepted, setAccepted] = useState<AcceptedAction | null>(null)
  const [pendingKey, setPendingKey] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showAlternatives, setShowAlternatives] = useState(false)
  const [showCustom, setShowCustom] = useState(false)
  const [customTitle, setCustomTitle] = useState("")
  const [customDescription, setCustomDescription] = useState("")
  const [customDomain, setCustomDomain] =
    useState<BaselineActionDTO["domain"]>("custom")

  const isBusy = pendingKey !== null

  const accept = async (
    actionSource: "primary" | "alternative" | "user",
    action: BaselineActionDTO
  ) => {
    if (isBusy) return

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
      setError(formatActionErrorForUser(result.error))
      return
    }

    setAccepted(result.data)
  }

  const acceptCustom = async () => {
    if (isBusy) return

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
    return (
      <AcceptedActionCard
        action={accepted.action}
        reflectionFollowUp={{
          kind: "reflect",
          reflectPath: BASELINE_ROUTES.reflect(interpretation.checkInId),
        }}
      />
    )
  }

  const primary = interpretation.primaryAction
  const alternatives = interpretation.alternatives

  return (
    <section className="space-y-4" aria-busy={isBusy}>
      <div>
        <h3 className="text-lg font-semibold text-navy-text">
          Right-sized next move
        </h3>
        <p className="mt-1 text-sm text-navy-text/65">
          Here is the move that fits your current state. Accept it, or pick
          something smaller.
        </p>
      </div>

      {error ? <FormErrorBanner message={error} /> : null}

      <div className="rounded-xl border-2 border-ocean-deep/20 bg-white p-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-ocean-deep">
          Do this next
        </p>
        <h4 className="mt-2 text-lg font-semibold text-navy-text">{primary.title}</h4>
        <p className="mt-1 text-sm leading-relaxed text-navy-text/75">
          {primary.description}
        </p>
        {primary.estimatedMinutes ? (
          <p className="mt-2 text-xs text-navy-text/50">
            About {primary.estimatedMinutes} min
          </p>
        ) : null}
        <Button
          type="button"
          className="mt-4 w-full"
          size="lg"
          disabled={isBusy}
          aria-busy={pendingKey === primary.id}
          onClick={() => accept("primary", primary)}
        >
          {pendingKey === primary.id ? "Saving..." : "Accept this move"}
        </Button>
      </div>

      {alternatives.length > 0 ? (
        <div className="rounded-xl border border-ocean-light/40 bg-white/60">
          <button
            type="button"
            className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-navy-text/70 hover:text-navy-text"
            onClick={() => setShowAlternatives((v) => !v)}
            aria-expanded={showAlternatives}
          >
            <span>Other options ({alternatives.length})</span>
            <span className="text-xs text-navy-text/45">
              {showAlternatives ? "Hide" : "Show"}
            </span>
          </button>
          {showAlternatives ? (
            <div className="space-y-3 border-t border-ocean-light/30 px-4 pb-4 pt-3">
              {alternatives.map((action) => (
                <ActionOptionCard
                  key={action.id}
                  action={action}
                  pending={pendingKey === action.id}
                  disabled={isBusy}
                  onAccept={() => accept("alternative", action)}
                />
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      {!showCustom ? (
        <Button
          type="button"
          variant="ghost"
          className="w-full text-sm text-navy-text/60"
          disabled={isBusy}
          onClick={() => setShowCustom(true)}
        >
          Choose your own move
        </Button>
      ) : (
        <div className="space-y-3 rounded-xl border border-dashed border-ocean-light/50 bg-white/70 p-4">
          <p className="text-sm font-medium text-navy-text">Your own move</p>
          <div className="space-y-2">
            <Label htmlFor="custom-title">Title</Label>
            <Input
              id="custom-title"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              placeholder="e.g. Drink water"
              disabled={isBusy}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="custom-description">What will you do?</Label>
            <Textarea
              id="custom-description"
              value={customDescription}
              onChange={(e) => setCustomDescription(e.target.value)}
              placeholder="Keep it small."
              rows={2}
              disabled={isBusy}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="custom-domain">Domain</Label>
            <Select
              value={customDomain}
              disabled={isBusy}
              onValueChange={(value) =>
                setCustomDomain(value as BaselineActionDTO["domain"])
              }
            >
              <SelectTrigger id="custom-domain">
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
            disabled={isBusy}
            onClick={acceptCustom}
          >
            {isBusy ? "Saving..." : "Accept this move"}
          </Button>
        </div>
      )}
    </section>
  )
}

function ActionOptionCard({
  action,
  pending,
  disabled,
  onAccept,
}: {
  action: BaselineActionDTO
  pending: boolean
  disabled: boolean
  onAccept: () => void
}) {
  return (
    <div className="rounded-lg border border-ocean-light/40 bg-white/90 p-3">
      <h4 className="font-medium text-navy-text">{action.title}</h4>
      <p className="mt-1 text-sm text-navy-text/70">{action.description}</p>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-3 w-full"
        disabled={disabled}
        aria-busy={pending}
        onClick={onAccept}
      >
        {pending ? "Saving..." : "Accept"}
      </Button>
    </div>
  )
}
