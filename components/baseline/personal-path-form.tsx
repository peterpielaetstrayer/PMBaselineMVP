"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { savePersonalPath } from "@/lib/actions/personal-path"
import {
  MAX_PATH_PRIORITIES,
  type PersonalPath,
} from "@/lib/baseline/personal-path"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface PersonalPathFormProps {
  initial: PersonalPath
}

export function PersonalPathForm({ initial }: PersonalPathFormProps) {
  const router = useRouter()
  const [baseline, setBaseline] = useState(initial.baseline)
  const [priorities, setPriorities] = useState<string[]>(() =>
    Array.from(
      { length: MAX_PATH_PRIORITIES },
      (_, index) => initial.priorities[index] ?? ""
    )
  )
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")
  const [isError, setIsError] = useState(false)

  const updatePriority = (index: number, value: string) => {
    setPriorities((current) =>
      current.map((item, itemIndex) => itemIndex === index ? value : item)
    )
    setMessage("")
  }

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (saving) return

    setSaving(true)
    setMessage("")
    setIsError(false)

    try {
      const result = await savePersonalPath({ baseline, priorities })
      if (!result.ok) {
        setMessage(result.error.message)
        setIsError(true)
        return
      }

      setBaseline(result.data.baseline)
      setPriorities(
        Array.from(
          { length: MAX_PATH_PRIORITIES },
          (_, index) => result.data.priorities[index] ?? ""
        )
      )
      setMessage("Your path is saved. You can change it anytime.")
      router.refresh()
    } catch {
      setMessage("We couldn't save your path right now. Please try again.")
      setIsError(true)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <section className="space-y-3 rounded-2xl border border-ocean-light/50 bg-white/90 p-5 shadow-sm">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-navy-text">Your baseline, in your words</h2>
          <p className="text-sm text-navy-text/70" id="baseline-help">
            What does a reasonably good, workable day look like for you? Keep it simple.
          </p>
        </div>
        <Label htmlFor="personal-baseline">My baseline</Label>
        <Textarea
          id="personal-baseline"
          aria-describedby="baseline-help"
          value={baseline}
          onChange={(event) => { setBaseline(event.target.value); setMessage("") }}
          placeholder="I have enough energy for what matters, and I leave room to recover."
          maxLength={600}
          rows={3}
          disabled={saving}
        />
      </section>

      <section className="space-y-4 rounded-2xl border border-ocean-light/50 bg-white/90 p-5 shadow-sm">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-navy-text">What matters right now?</h2>
          <p className="text-sm text-navy-text/70">
            Up to three priorities for this season. Not a task list or a promise to do it all.
          </p>
        </div>
        {priorities.map((priority, index) => (
          <div key={index} className="space-y-2">
            <Label htmlFor={"path-priority-" + index}>Priority {index + 1}</Label>
            <Input
              id={"path-priority-" + index}
              type="text"
              maxLength={120}
              value={priority}
              onChange={(event) => updatePriority(index, event.target.value)}
              placeholder={
                index === 0 ? "Build a steady routine" :
                index === 1 ? "Make room for meaningful work" :
                "Protect recovery and relationships"
              }
              disabled={saving}
            />
          </div>
        ))}
      </section>

      <div className="space-y-3">
        <Button type="submit" disabled={saving} className="w-full sm:w-auto">
          {saving ? "Saving..." : "Save my path"}
        </Button>
        <p
          role="status"
          aria-live="polite"
          className={isError ? "text-sm text-destructive" : "text-sm text-ocean-deep"}
        >
          {message}
        </p>
        <p className="text-xs leading-relaxed text-navy-text/60">
          This first version remembers your own words. It does not yet use them to
          generate personalized suggestions. That's the next capability to test.
        </p>
      </div>
    </form>
  )
}
