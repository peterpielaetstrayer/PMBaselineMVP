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
    <form onSubmit={handleSubmit} className="space-y-6" aria-busy={isSubmitting}>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-navy-text">
          What happened after the move?
        </h1>
        <p className="text-sm leading-relaxed text-navy-text/70">
          A quick note — not a grade. This helps you notice what protects your
          baseline over time.
        </p>
        {reflectionPrompt ? (
          <p className="rounded-lg border border-ocean-light/50 bg-ocean-light/15 px-3 py-2 text-sm text-navy-text/80">
            {reflectionPrompt}
          </p>
        ) : null}
      </div>

      <fieldset className="space-y-3">
        <legend className="text-sm font-medium text-navy-text">
          How did it land?
        </legend>
        <div
          className="grid grid-cols-2 gap-2 sm:grid-cols-4"
          role="radiogroup"
          aria-label="How did it land?"
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
        <Label htmlFor="what-changed">What changed?</Label>
        <Textarea
          id="what-changed"
          value={state.whatChanged}
          onChange={(e) => update("whatChanged", e.target.value)}
          placeholder="Even a small shift counts."
          rows={2}
          disabled={isSubmitting}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="what-protected">What did this protect?</Label>
        <Textarea
          id="what-protected"
          value={state.whatWasProtected}
          onChange={(e) => update("whatWasProtected", e.target.value)}
          placeholder="Energy, mood, relationships, baseline..."
          rows={2}
          disabled={isSubmitting}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="lesson">What did you learn about your baseline?</Label>
        <Textarea
          id="lesson"
          value={state.lesson}
          onChange={(e) => update("lesson", e.target.value)}
          placeholder="Optional note for future you."
          rows={2}
          disabled={isSubmitting}
        />
      </div>

      <div className="space-y-3 rounded-xl border border-ocean-light/40 bg-white/70 p-4">
        <div className="flex items-start gap-3">
          <Checkbox
            id="include-score"
            checked={includeScore}
            disabled={isSubmitting}
            onCheckedChange={(checked) => setIncludeScore(checked === true)}
          />
          <Label
            htmlFor="include-score"
            className="text-sm font-normal leading-snug text-navy-text"
          >
            Add a final baseline score for today (optional)
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

      {error ? <FormErrorBanner message={error} /> : null}

      <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
        {isSubmitting ? "Saving reflection..." : "Save reflection"}
      </Button>
      <p className="text-center text-xs text-navy-text/55">
        You can reflect later from history if you need to step away first.
      </p>
    </form>
  )
}
