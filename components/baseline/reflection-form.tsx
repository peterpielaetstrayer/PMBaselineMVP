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
import { ReflectionEffectSchema } from "@/lib/validation/enums"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ScoreInput } from "./score-input"

interface ReflectionFormProps {
  checkInId: string
  actionRecordId: string
  reflectionPrompt?: string
}

const EFFECT_OPTIONS = ReflectionEffectSchema.options

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
    setIsSubmitting(true)
    setError(null)

    const payload = buildReflectionInput(checkInId, actionRecordId, {
      ...state,
      finalBaselineScore: includeScore ? state.finalBaselineScore : null,
    })

    const result = await submitReflection(payload)

    setIsSubmitting(false)

    if (!result.ok) {
      setError(result.error.message)
      return
    }

    router.replace(BASELINE_ROUTES.today)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-navy-text">
          What happened after the action?
        </h1>
        <p className="text-sm leading-relaxed text-navy-text/70">
          A quick note — not a grade. This helps PMBaseline learn what supports
          your baseline over time.
        </p>
        {reflectionPrompt ? (
          <p className="rounded-lg border border-ocean-light/50 bg-ocean-light/15 px-3 py-2 text-sm text-navy-text/80">
            {reflectionPrompt}
          </p>
        ) : null}
      </div>

      <div className="space-y-3">
        <Label className="text-navy-text">How did it land?</Label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {EFFECT_OPTIONS.map((effect) => (
            <Button
              key={effect}
              type="button"
              variant={state.effect === effect ? "default" : "outline"}
              className="capitalize"
              onClick={() => update("effect", effect)}
            >
              {effect}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="what-changed">What changed?</Label>
        <Textarea
          id="what-changed"
          value={state.whatChanged}
          onChange={(e) => update("whatChanged", e.target.value)}
          placeholder="Even a small shift counts."
          rows={2}
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
        />
      </div>

      <div className="space-y-3 rounded-xl border border-ocean-light/40 bg-white/70 p-4">
        <label className="flex items-center gap-2 text-sm text-navy-text">
          <input
            type="checkbox"
            checked={includeScore}
            onChange={(e) => setIncludeScore(e.target.checked)}
          />
          Add a final baseline score for today (optional)
        </label>
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

      {error ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
        {isSubmitting ? "Saving reflection..." : "Save reflection"}
      </Button>
    </form>
  )
}
