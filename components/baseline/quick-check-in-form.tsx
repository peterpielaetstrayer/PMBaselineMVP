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
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
    setIsSubmitting(true)
    setError(null)

    const payload = buildQuickCheckInPayload(submissionIdRef.current, {
      ...state,
      contextTags: parseContextTagsInput(contextTagsInput),
    })

    const result = await submitCheckIn(payload)

    setIsSubmitting(false)

    if (!result.ok) {
      setError(result.error.message)
      return
    }

    router.replace(resolveCheckInResultPath(result.data.checkInId))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-navy-text">Where are you right now?</h1>
        <p className="text-sm leading-relaxed text-navy-text/70">
          A quick read on your state — not a medical form. Slide to what feels
          true enough for today.
        </p>
      </div>

      <div className="space-y-6 rounded-2xl border border-ocean-light/60 bg-white/90 p-5 shadow-sm">
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
      </div>

      <div className="space-y-3 rounded-xl border border-sand-neutral/60 bg-sand-neutral/20 p-4">
        <p className="text-sm font-medium text-navy-text">Safety check</p>
        <label className="flex items-start gap-3 text-sm text-navy-text/80">
          <Checkbox
            checked={state.reportsUrgentRisk}
            onCheckedChange={(checked) =>
              update("reportsUrgentRisk", checked === true)
            }
          />
          <span>I need immediate help or feel at urgent risk of harm</span>
        </label>
        <label className="flex items-start gap-3 text-sm text-navy-text/80">
          <Checkbox
            checked={state.reportsNeedForSupport}
            onCheckedChange={(checked) =>
              update("reportsNeedForSupport", checked === true)
            }
          />
          <span>I could use extra support today (not an emergency)</span>
        </label>
      </div>

      <Button
        type="button"
        variant="ghost"
        className="px-0 text-ocean-deep"
        onClick={() => setShowOptional((current) => !current)}
      >
        {showOptional ? "Hide optional details" : "Add optional details"}
      </Button>

      {showOptional ? (
        <div className="space-y-4 rounded-xl border border-ocean-light/40 bg-white/70 p-4">
          <ScoreInput
            id="sleep"
            label="Sleep (optional)"
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
              placeholder="work deadline, travel, social (comma-separated)"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="heavy">Anything heavy or important today?</Label>
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
            <Label htmlFor="note">Anything else?</Label>
            <Textarea
              id="note"
              value={state.optionalNote ?? ""}
              onChange={(e) => update("optionalNote", e.target.value || null)}
              rows={2}
            />
          </div>
        </div>
      ) : null}

      {error ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
        {isSubmitting ? "Finding your next move..." : "See my right-sized move"}
      </Button>
    </form>
  )
}
