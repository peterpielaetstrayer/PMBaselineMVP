"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { submitCheckIn } from "@/lib/actions/check-in"
import {
  buildQuickCheckInPayload,
  createCheckInSubmissionId,
  DEFAULT_CHECK_IN_FORM_STATE,
  parseContextTagsInput,
  resolveCheckInResultPath,
  type QuickCheckInFormState,
} from "@/lib/baseline/check-in-form"
import { formatActionErrorForUser } from "@/lib/baseline/user-messages"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { FormErrorBanner } from "./form-error-banner"
import { ScoreInput } from "./score-input"

export function QuickCheckInForm() {
  const router = useRouter()
  const submissionIdRef = useRef(createCheckInSubmissionId())
  const [state, setState] = useState<QuickCheckInFormState>(
    DEFAULT_CHECK_IN_FORM_STATE
  )
  const [contextTagsInput, setContextTagsInput] = useState("")
  const [showOptional, setShowOptional] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const update = <K extends keyof QuickCheckInFormState>(
    key: K,
    value: QuickCheckInFormState[K]
  ) => {
    setState((current) => ({ ...current, [key]: value }))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (isSubmitting) return

    setIsSubmitting(true)
    setError(null)

    const payload = buildQuickCheckInPayload(submissionIdRef.current, {
      ...state,
      contextTags: parseContextTagsInput(contextTagsInput),
    })

    const result = await submitCheckIn(payload)

    if (!result.ok) {
      setError(formatActionErrorForUser(result.error))
      setIsSubmitting(false)
      return
    }

    router.replace(resolveCheckInResultPath(result.data.checkInId))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" aria-busy={isSubmitting}>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-navy-text">Quick pulse</h1>
        <p className="text-sm leading-relaxed text-navy-text/70">
          Give the app just enough signal. This is not a scorecard — slide to
          what feels true enough for right now.
        </p>
      </div>

      <section
        aria-labelledby="quick-pulse-heading"
        className="space-y-5 rounded-2xl border border-ocean-light/60 bg-white/90 p-5 shadow-sm"
      >
        <h2 id="quick-pulse-heading" className="text-sm font-semibold text-ocean-deep">
          Quick pulse
        </h2>
        <ScoreInput
          id="physical"
          label="Physical"
          hint="Body comfort and capacity"
          value={state.physical}
          onChange={(value) => update("physical", value)}
          lowLabel="Depleted"
          highLabel="Strong"
        />
        <ScoreInput
          id="mental"
          label="Mental"
          hint="Clarity and focus"
          value={state.mental}
          onChange={(value) => update("mental", value)}
          lowLabel="Foggy"
          highLabel="Clear"
        />
        <ScoreInput
          id="energy"
          label="Energy"
          value={state.energy}
          onChange={(value) => update("energy", value)}
          lowLabel="Empty"
          highLabel="Steady"
        />
        <ScoreInput
          id="stress"
          label="Stress"
          value={state.stress}
          onChange={(value) => update("stress", value)}
          lowLabel="Calm"
          highLabel="Overwhelmed"
        />
      </section>

      {error ? <FormErrorBanner message={error} /> : null}

      <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
        {isSubmitting ? "Finding your next move..." : "See my right-sized move"}
      </Button>

      <div className="border-t border-ocean-light/30 pt-4">
        <Button
          type="button"
          variant="ghost"
          className="h-auto px-0 py-1 text-sm text-navy-text/60 hover:text-ocean-deep focus-visible:ring-2 focus-visible:ring-ocean-deep/40"
          onClick={() => setShowOptional((current) => !current)}
          aria-expanded={showOptional}
        >
          {showOptional
            ? "Hide optional context"
            : "Add context (optional) — sleep, food, safety, notes"}
        </Button>
        <p className="mt-1 text-xs text-navy-text/50">
          You can add context, but you do not have to.
        </p>

        {showOptional ? (
          <div className="mt-4 space-y-5 rounded-xl border border-dashed border-ocean-light/50 bg-sand-neutral/10 p-4">
            <fieldset className="space-y-3">
              <legend className="text-sm font-medium text-navy-text/80">
                Safety &amp; support
              </legend>
              <div className="flex items-start gap-3">
                <Checkbox
                  id="urgent-risk"
                  checked={state.reportsUrgentRisk}
                  onCheckedChange={(checked) =>
                    update("reportsUrgentRisk", checked === true)
                  }
                />
                <Label
                  htmlFor="urgent-risk"
                  className="text-sm font-normal leading-snug text-navy-text/75"
                >
                  I need immediate help or feel at urgent risk of harm
                </Label>
              </div>
              <div className="flex items-start gap-3">
                <Checkbox
                  id="need-support"
                  checked={state.reportsNeedForSupport}
                  onCheckedChange={(checked) =>
                    update("reportsNeedForSupport", checked === true)
                  }
                />
                <Label
                  htmlFor="need-support"
                  className="text-sm font-normal leading-snug text-navy-text/75"
                >
                  I could use extra support today (not an emergency)
                </Label>
              </div>
            </fieldset>

            <ScoreInput
              id="sleep"
              label="Sleep"
              value={state.sleep ?? 5}
              onChange={(value) => update("sleep", value)}
              lowLabel="Poor"
              highLabel="Rested"
            />
            <div className="space-y-2">
              <Label htmlFor="food">Food</Label>
              <Input
                id="food"
                value={state.foodStatus ?? ""}
                onChange={(e) => update("foodStatus", e.target.value || null)}
                placeholder="e.g. met, partial, skipped"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hydration">Hydration</Label>
              <Input
                id="hydration"
                value={state.hydrationStatus ?? ""}
                onChange={(e) => update("hydrationStatus", e.target.value || null)}
                placeholder="e.g. low, okay"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="movement">Movement</Label>
              <Input
                id="movement"
                value={state.movementStatus ?? ""}
                onChange={(e) => update("movementStatus", e.target.value || null)}
                placeholder="e.g. none yet, light walk"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="context-tags">Context tags</Label>
              <Input
                id="context-tags"
                value={contextTagsInput}
                onChange={(e) => setContextTagsInput(e.target.value)}
                placeholder="work deadline, travel (comma-separated)"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="heavy">Anything heavy today?</Label>
              <Textarea
                id="heavy"
                value={state.heavyOrImportantText ?? ""}
                onChange={(e) =>
                  update("heavyOrImportantText", e.target.value || null)
                }
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="substance">Alcohol or substance context</Label>
              <Textarea
                id="substance"
                value={state.alcoholOrSubstanceContext ?? ""}
                onChange={(e) =>
                  update("alcoholOrSubstanceContext", e.target.value || null)
                }
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="note">Short note</Label>
              <Textarea
                id="note"
                value={state.optionalNote ?? ""}
                onChange={(e) => update("optionalNote", e.target.value || null)}
                rows={2}
              />
            </div>
          </div>
        ) : null}
      </div>
    </form>
  )
}
