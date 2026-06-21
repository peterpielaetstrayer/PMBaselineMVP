"use client"

import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"

interface ScoreInputProps {
  id: string
  label: string
  hint?: string
  value: number
  onChange: (value: number) => void
  lowLabel?: string
  highLabel?: string
}

export function ScoreInput({
  id,
  label,
  hint,
  value,
  onChange,
  lowLabel = "Low",
  highLabel = "High",
}: ScoreInputProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between gap-3">
        <div>
          <Label htmlFor={id} className="text-navy-text">
            {label}
          </Label>
          {hint ? <p className="text-xs text-navy-text/60 mt-0.5">{hint}</p> : null}
        </div>
        <span className="text-sm font-semibold tabular-nums text-ocean-deep">
          {value}
        </span>
      </div>
      <Slider
        id={id}
        min={0}
        max={10}
        step={1}
        value={[value]}
        onValueChange={(values) => onChange(values[0] ?? 0)}
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={10}
        aria-valuenow={value}
        aria-valuetext={`${value} out of 10`}
        className="touch-none"
      />
      <div className="flex justify-between text-[11px] text-navy-text/50">
        <span>{lowLabel}</span>
        <span>{highLabel}</span>
      </div>
    </div>
  )
}
