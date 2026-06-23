"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { submitReflection } from "@/lib/actions/reflection"
import {
  buildReflectionInput,
  DEFAULT_REFLECTION_FORM_STATE,
  type ReflectionFormState,
} from "@/lib/baseline/reflection-form"
import { BASELINE_ROUTES } from "@/lib/baseline/routes"
import {
  formatActionErrorForUser,
  isDuplicateReflectionError,
} from "@/lib/baseline/user-messages"
import { ReflectionEffectSchema } from "@/lib/validation/enums"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { FormErrorBanner } from "./form-error-banner"
import { ScoreInput } from "./score-input"

interface ReflectionFormProps {
  checkInId: string
  actionRecordId: string
  reflectionPrompt?: string
}

const EFFECT_OPTIONS = ReflectionEffectSchema.options

function formatEffectLabel(effect: string): string {
  return effect.replace(/_/g, " ")
}

export function ReflectionForm({
  checkInId,
  actionRecordId,
  reflectionPrompt,
}: ReflectionFormProps) {
  const router = useRouter()
  const [state, setState] = useState<ReflectionFormState>(
    DEFAULT_REFLECTION_FORM_STATE
  )
  const [includeScore, setIncludeScore] = useState(false)
  const [showNotes, setShowNotes] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const update = <K extends keyof ReflectionFormState>(
    key: K,
    value: ReflectionFormState[K]
  ) => {
    setState((current) => ({ ...current, [key]: value }))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (isSubmitting) return

    setIsSubmitting(true)
    setError(null)

    const payload = buildReflectionInput(checkInId, actionRecordId, {
      ...state,
      finalBaselineScore: includeScore ? state.finalBaselineScore : null,
    })

    const result = await submitReflection(payload)

    if (!result.ok) {
      if (isDuplicateReflectionError(result.error)) {
        router.replace(BASELINE_ROUTES.today)
        router.refresh()
        return
      }

      setError(formatActionErrorForUser(result.error))
      setIsSubmitting(false)
      return
    }

    router.replace(BASELINE_ROUTES.today)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" aria-busy={isSubmitting}>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-navy-text">Did the move help?</h1>
        <p className="text-sm leading-relaxed text-navy-text/70">
          A quick close-the-loop note — imperfect is fine. This helps PMBaseline
          learn what supports your baseline. You are not being graded.
        </p>
        {reflectionPrompt ? (
          <p className="text-xs text-navy-text/55">{reflectionPrompt}</p>
        ) : null}
      </div>

      <fieldset className="space-y-3">
        <legend className="text-sm font-medium text-navy-text">
          Did the move help?
        </legend>
        <div
          className="grid grid-cols-2 gap-2 sm:grid-cols-4"
          role="radiogroup"
          aria-label="Did the move help?"
        >
          {EFFECT_OPTIONS.map((effect) => (
            <Button
              key={effect}
              type="button"
              role="radio"
              aria-checked={state.effect === effect}
              variant={state.effect === effect ? "default" : "outline"}
              className="capitalize focus-visible:ring-2 focus-visible:ring-ocean-deep/40"
              disabled={isSubmitting}
              onClick={() => update("effect", effect)}
            >
              {formatEffectLabel(effect)}
            </Button>
          ))}
        </div>
      </fieldset>

      <div className="space-y-2">
        <Label htmlFor="what-changed" className="text-navy-text/80">
          What changed? <span className="font-normal text-navy-text/50">(optional)</span>
        </Label>
        <Textarea
          id="what-changed"
          value={state.whatChanged}
          onChange={(e) => update("whatChanged", e.target.value)}
          placeholder="Even a small shift counts."
          rows={2}
          disabled={isSubmitting}
        />
      </div>

      <div className="space-y-3 rounded-xl border border-ocean-light/30 bg-white/60 p-4">
        <div className="flex items-start gap-3">
          <Checkbox
            id="include-score"
            checked={includeScore}
            disabled={isSubmitting}
            onCheckedChange={(checked) => setIncludeScore(checked === true)}
          />
          <Label
            htmlFor="include-score"
            className="text-sm font-normal leading-snug text-navy-text/80"
          >
            Add a final baseline score (optional)
          </Label>
        </div>
        {includeScore ? (
          <ScoreInput
            id="final-baseline-score"
            label="How close to baseline now?"
            value={state.finalBaselineScore ?? 5}
            onChange={(value) => update("finalBaselineScore", value)}
            lowLabel="Far off"
            highLabel="Near baseline"
          />
        ) : null}
      </div>

      <Button
        type="button"
        variant="ghost"
        className="h-auto px-0 text-sm text-navy-text/55 hover:text-ocean-deep"
        onClick={() => setShowNotes((v) => !v)}
        aria-expanded={showNotes}
      >
        {showNotes ? "Hide extra notes" : "Add extra notes (optional)"}
      </Button>

      {showNotes ? (
        <div className="space-y-3 rounded-xl border border-dashed border-ocean-light/40 p-4">
          <div className="space-y-2">
            <Label htmlFor="what-protected">What did this protect?</Label>
            <Textarea
              id="what-protected"
              value={state.whatWasProtected}
              onChange={(e) => update("whatWasProtected", e.target.value)}
              placeholder="Energy, mood, baseline..."
              rows={2}
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lesson">What did you learn?</Label>
            <Textarea
              id="lesson"
              value={state.lesson}
              onChange={(e) => update("lesson", e.target.value)}
              placeholder="Optional."
              rows={2}
              disabled={isSubmitting}
            />
          </div>
        </div>
      ) : null}

      {error ? <FormErrorBanner message={error} /> : null}

      <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : "Save reflection"}
      </Button>
    </form>
  )
}
